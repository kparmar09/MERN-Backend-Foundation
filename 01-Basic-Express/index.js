import express from "express";
import dotenv from "dotenv";
const app = express();
dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/login", (req, res) => {
  res.send("<h1>Please Login</h1>");
});
