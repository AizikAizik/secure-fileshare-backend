import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    publicKey,
  }: { email: string; password: string; publicKey: string } = req.body;

  try {
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user: IUser = new User({
      email,
      password: hashedPassword,
      publicKey,
    });
    await user.save();

    const token: string = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ token });
  } catch (error: Error | any) {
    console.error("Registration error:", error?.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token: string = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
