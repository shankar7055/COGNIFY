import { Router} from "express";
import { authService } from "../services/auth/auth.service";
import { validate } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { RegisterInput, LoginInput, registerSchema } from "../services/auth/auth.schema";
import { prisma } from "../config/db";


const router = Router();

router.post("/register", validate(registerSchema), async( req , res ) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (err: any ){
        res.status(400).json({ message: err.message});
    }
});

router.post("/login", async(req, res) => {
    try{
        const result = await authService.login(req.body);
        res.json(result);
    } catch(err: any){
        res.status(400).json({ message: err.message});
    }
});

router.get("/me", authMiddleware, async(req , res) => {
    try {
        const userId = ( req as any ).userId;

        const user = await prisma.user.findUnique({
            where: { id: userId},
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        res.json(user);
    } catch{
        res.status(400).json({ message: "Server error"});
    }
});

export default router;