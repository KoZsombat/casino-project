import express from "express";
import transactionRouter from "./routes/transactions";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";

const port = process.env.PORT;
const app = express();

app.use(express.json());

const router = express.Router();
app.use("/api", router);

router.use("/transactions", transactionRouter);
router.use("/user", userRouter);
router.use("/auth", authRouter);

app.listen(port, () => {
  console.log("Running on port: " + port);
});
