// lib/types.ts
import z from "zod";
export type UserRole = "USER" | "TENANT" | "LANDLORD" | "ADMIN";

export interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
    exp?: number;
    iat?: number;
}

export const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must be at most 50 characters long"),
    email: z.email("Invalid email address"),
    role: z.enum(["TENANT", "LANDLORD"]),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const LoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const CreatePropertySchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters long").max(100, "Title must be at most 100 characters long"),
    price: z.coerce.number().min(1, "Price must be greater than 0"),
    type: z.string().min(1, "Type is required"),
    image: z.any().optional(),
    description: z.string().optional(),
    location: z.string().min(2, "Location must be at least 2 characters long"),
    amenities: z.array(z.string()).optional(),
    categoryId: z.string().min(1, "Category is required"),
    isAvailable: z.boolean().optional().default(true),
    landLordId: z.string().optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial();