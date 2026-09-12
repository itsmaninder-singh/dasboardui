import { v4 as uuid } from "uuid";
import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sha256Hex } from "../utils/hash";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { Role, User } from "@prisma/client";

function sanitizeUser(user: User) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

async function issueTokenPair(user: User) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });

  const jti = uuid();
  const refreshToken = signRefreshToken({ sub: user.id, jti });

  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_MS);
  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: sha256Hex(refreshToken),
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists", "EMAIL_TAKEN");
    }

    // SECURITY: self-registration is always forced to DEVELOPER, regardless of what
    // the client sends. ADMIN/PROJECT_MANAGER accounts must be created by an existing
    // ADMIN via POST /api/users — never through open self-registration.
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "DEVELOPER" as Role,
    });

    const tokens = await issueTokenPair(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const tokens = await issueTokenPair(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async refresh(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      throw ApiError.unauthorized("Refresh token required", "NO_REFRESH_TOKEN");
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
    }

    const tokenHash = sha256Hex(rawRefreshToken);
    const stored = await refreshTokenRepository.findByHash(tokenHash);

    if (!stored || stored.revoked || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
      // Reuse of a revoked/rotated token is a strong signal of theft — revoke everything.
      if (stored && stored.revoked) {
        await refreshTokenRepository.revokeAllForUser(stored.userId);
      }
      throw ApiError.unauthorized("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
    }

    const user = await userRepository.findById(stored.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Account no longer active", "INACTIVE_ACCOUNT");
    }

    // Rotation: issue a brand new pair, revoke the old one, link them for audit/theft-detection.
    const tokens = await issueTokenPair(user);
    await refreshTokenRepository.revoke(stored.id, sha256Hex(tokens.refreshToken));

    return { user: sanitizeUser(user), ...tokens };
  },

  async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) return;
    const stored = await refreshTokenRepository.findByHash(sha256Hex(rawRefreshToken));
    if (stored && !stored.revoked) {
      await refreshTokenRepository.revoke(stored.id);
    }
  },
};
