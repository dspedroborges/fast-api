import express from "express";
import dotenv from "dotenv";
import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import { log } from "./middleware/log";
import "./jobs/cleanupRevokedTokens.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(log);

app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API running!");
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});