import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  // root route
  res.send("server is ready");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
