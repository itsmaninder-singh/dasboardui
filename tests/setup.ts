import dotenv from "dotenv";
dotenv.config();

// Tests expect DATABASE_URL to point at a disposable test database.
// Run `npm run prisma:migrate:deploy` against it before running tests.
