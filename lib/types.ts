// lib/types.ts
import z from "zod";

export interface JwtPayload {
    id: string;
    email: string;
    exp?: number;
    iat?: number;
}

export const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must be at most 50 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const LoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});