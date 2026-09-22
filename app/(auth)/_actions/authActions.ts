"use server"

import config from "@/config/config"
import { StoredUsers, User } from "@/lib/storedDataTypes/user"
import { LoginSchema, RegisterSchema } from "@/lib/types"
import { errorResponse } from "@/utils/globalErrorHandler"
import { response } from "@/utils/response"
import jwt from "jsonwebtoken"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LoginInterface } from "./interface"

type LoginState = {
    success: true,
    statusCode: number,
    message: string,
    data: {
        accessToken: string,
        refreshToken: string
    }
}




export const loginAction = async (payload: LoginInterface) => {

    const validated = LoginSchema.safeParse(payload);
    if (!validated.success) {
        return errorResponse(
            "Validation failed",
            400,
            validated.error.flatten().fieldErrors as any
        );
    }
    const users: StoredUsers = JSON.parse(
        localStorage.getItem("users") || "[]"
    );

    //check the users email and password
    const existUser = users.find(
        (user) =>
            user.email === user.email.trim().toLowerCase() &&
            user.password === user.password
    );

    if (!existUser) {
        return errorResponse(
            "Invalid email or password",
            401,
            { email: ["Invalid email or password"], password: ["Invalid email or password"] }
        )
    }

    const accessToken = jwt.sign(payload, config.access_secret, {
        expiresIn: "1d"
    });
    const refreshToken = jwt.sign(payload, config.refresh_secret, {
        expiresIn: "7d"
    });

    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        path: "/"
    });
    cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        path: "/"
    });

    revalidateTag("my-profile", "max");

    redirect("/dashboard");
};


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