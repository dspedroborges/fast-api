import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("API running!");
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});