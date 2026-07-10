import {Request, Response, NextFunction} from "express";
import { prisma } from "../config/db";
import { hashApiKey } from "../utils/crypto";

export const apiKeyMiddleware = async ( 
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const apiKey = req.header("x-api-key");

        if(!apiKey) {
            return res.status(401).json({
                message: "API key missing",
            });
        }

        const hashedKey = hashApiKey(apiKey);

        const keyRecord = await prisma.aPIKey.findUnique({
            where: {
                key_hash: hashedKey,
            },
        });

        if(!keyRecord){
            return res.status(401).json({
                message: "Invalid API key",
            });
        }

        await prisma.aPIKey.update({
            where: {
                id: keyRecord.id,
            },

            data: {
                last_used: new Date(),
            },
        });

        (req as any).userId = keyRecord.user_id;

        next();
    } catch(err: any){
        res.status(500).json({
            message: err.message,
        });
    }
};