# ---- Build stage ----
FROM node:20-alpine AS base
WORKDIR /app
# python3/make/g++ are required to build bcrypt's native addon on alpine.
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
# Reuse node_modules already built (with native bcrypt addon compiled) in the base stage
# instead of reinstalling, so we don't need build tools in the final image.
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
