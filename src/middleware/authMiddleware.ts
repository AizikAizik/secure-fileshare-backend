import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const protect = (
  req: Request & { user?: DecodedToken },
  res: Response,
  next: NextFunction
): void => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
