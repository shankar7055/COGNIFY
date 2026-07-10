import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export const featureGate = (
    allowPlans: string[]
) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const subscription = 
             await prisma.subscription.findUnique({
                where: {
                    user_id: (req as any).userId,
                },
             });

             if(!subscription){
                return res.status(403).json({
                    message: "No suscription found",
                });
             }

             if(
                !allowPlans.includes(subscription.plan)
             ) {
                return res.status(403).json({
                    message: 
                     "Upgrade your plan to access this feature",
                });
             }
             next();
        } catch(err: any){
            res.status(500).json({
                message: err.message,
            });
        }
    };
};
