import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import fileRoutes from "./routes/fileRoutes";
import cookieParser from "cookie-parser";
import { dbConnect } from "./config/db";
import { errorHandler } from "./middleware/errorMiddleware";
import csurf from "csurf";
import helmet from "helmet";

dotenv.config();

const app: Express = express();

// Add Morgan logger before other middlewares (use 'dev' for development)
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(
  helmet({
    frameguard: { action: "sameorigin" }, // Prevent clickjacking
  })
);

app.use(express.json());
app.use(cookieParser());

// CSRF protection: Use cookie for token storage
app.use(
  csurf({
    cookie: {
      httpOnly: true, // Prevents JS access
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "strict", // Prevents cross-site sending
      maxAge: 3600, // 1 hour expiration
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running");
});

//add error handling middleware here
// Error handler (from earlier) to catch CSRF errors (403)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "invalid csrf token") {
    console.error("Error Message: ", err.message);

    res.status(403).json({ message: "Invalid CSRF token" });
  } else {
    next(err);
  }
});
app.use(errorHandler);

dbConnect();

const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
