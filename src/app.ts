import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { env } from "./config/env";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
