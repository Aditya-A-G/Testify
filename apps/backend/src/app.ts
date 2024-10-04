import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import * as middlewares from "./middlewares";
import api from "./api";
import MessageResponse from "./interfaces/MessageResponse";
import { connectWithRetry } from "./config/mongoDB";
import { NODE_ENV } from "./config/config";

const app = express();

connectWithRetry();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? "https://testify.adityacodes.tech"
        : "http://localhost:300",
  })
);
app.use(express.json());

app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
