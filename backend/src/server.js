import express from "express";
import cookieParser from "cookie-parser";
import transactionRouter from "./routes/transactions.js";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());

const router = express.Router();
app.use("/api", router);

router.use("/transactions", transactionRouter);
router.use("/user", userRouter);
router.use("/auth", authRouter);

app.listen(port, () => {
  console.log("Running on port: " + port);
});
