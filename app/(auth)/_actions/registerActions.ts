"use client"

import { StoredUsers, User } from "@/lib/storedDataTypes/user";
import { RegisterSchema } from "@/lib/types";
import { errorResponse } from "@/utils/globalErrorHandler";
import { response } from "@/utils/response";

export type RegisterState = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: any;
    error?: string | [];
    meta?: any;
};

export const registerAction = async (redirectTo: string, prevState: RegisterState, formData: FormData) => {
    const rawData = Object.fromEntries(formData);
    const validated = RegisterSchema.safeParse(rawData);

    if (!validated.success) {
        return errorResponse(
            "Validation failed",
            400,
            validated.error.flatten().fieldErrors as any
        );
    }

    const { email, password, name } = validated.data;
    const users: StoredUsers = JSON.parse(
        localStorage.getItem("users") || "[]"
    );
    const userExists = users.some((user: User) => user.email === email)
    if (userExists) {
        return errorResponse(
            "User already exists",
            400,
            { email: ["User already exists"] }
        )
    }

    const newUser: User = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        created_at: new Date().toISOString()
    }
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    return response(
        true,
        "Registration successful",
        newUser,
        201
    );


}