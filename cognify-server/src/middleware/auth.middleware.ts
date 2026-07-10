import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {env} from "../config/env";

const JWT_SECRET = env.JWT_SECRET;

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({ message: "Unauthorized"});
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        (req as any).userId = decoded.userId;

        next();
    } catch {
        return res.status(401).json({ message: "Invalid token"});
    }
};