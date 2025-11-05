import express, { type Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "./jobs/cleanupRevokedTokens.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: "Too many requests, please try again later."
    })
);
app.set("trust proxy", true)

app.get("/", (req, res: Response) => {
    return res.status(200).send("Alright!");
});

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log("Server running on PORT", PORT);
    });
}

export default app;