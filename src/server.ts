import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
//import { dbConnect } from "./config/db";
dotenv.config();

const app: Express = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running");
});

//dbConnect();

const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
