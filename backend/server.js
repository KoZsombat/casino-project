import express from "express";

const port = process.env.PORT;
const app = express();

app.use(express.json());

const router = express.Router();
app.use("/api", router);

app.listen(port, () => {
  console.log("Running on port: " + port);
});
