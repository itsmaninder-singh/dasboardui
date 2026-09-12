import { userRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/password";
import { ApiError } from "../utils/ApiError";
import { Prisma, Role, User } from "@prisma/client";

function sanitizeUser(user: User) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export const userService = {
  
  async createUser(input: { name: string; email: string; password: string; role: Role }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("An account with this email already exists", "EMAIL_TAKEN");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });
    return sanitizeUser(user);
  },

  async listUsers(page: number, limit: number) {
    const [users, total] = await userRepository.list((page - 1) * limit, limit);
    return { users, total, page, limit };
  },

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    return sanitizeUser(user);
  },

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    const updated = await userRepository.update(id, data);
    return sanitizeUser(updated);
  },
};
