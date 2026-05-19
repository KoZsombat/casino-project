import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import transactionRouter from "./routes/transactions.js";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import gamesRouter from "./routes/games.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());
app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later." },
});

app.use(generalLimiter);

const router = express.Router();
app.use("/api", router);

router.use("/transactions", transactionRouter);
router.use("/user", userRouter);
router.use("/auth", authLimiter, authRouter);
router.use("/games", gamesRouter);

app.listen(port, () => {
  console.log("Running on port: " + port);
});
