import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db";
import { RegisterInput, LoginInput } from "./auth.schema";
import {env} from "../../config/env";

const JWT_SECRET = env.JWT_SECRET;

export const authService = {
    async register(data: RegisterInput){
        const {email, password, name} = data;

        const exiting = await prisma.user.findUnique({
            where: {email},
        });

        if(exiting){
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                name,
            },
        });

        await prisma.workspace.create({
            data: {
                name: "Personal Work",
                description: "Your default workspace for AI operations and file indexation.",
                user_id: user.id,
            },
        });

        await prisma.subscription.create({
            data: {
                user_id: user.id,
                plan: "FREE",
                token_limit: 1000,
            },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });
        

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    },

    async login(data: LoginInput){
        const {email, password} = data;

        const user = await prisma.user.findUnique({
            where: {email},
        });

        if(!user){
            throw new Error("Invalid credentials");
        }

        let isMatch = false;
        if (user.password_hash.startsWith("$2a$") || user.password_hash.startsWith("$2b$") || user.password_hash.startsWith("$2y$")) {
            isMatch = await bcrypt.compare(password, user.password_hash);
        } else {
            isMatch = (password === user.password_hash);
        }

        if(!isMatch){
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({ userId: user.id}, JWT_SECRET,{
            expiresIn: "7d",
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    },

};
