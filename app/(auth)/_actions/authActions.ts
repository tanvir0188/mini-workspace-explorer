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

export const loginAction = async (user: User) => {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    const accessToken = jwt.sign(
        payload,
        config.access_secret,
        {
            expiresIn: "1d"
        }
    );

    const refreshToken = jwt.sign(
        payload,
        config.refresh_secret,
        {
            expiresIn: "7d"
        }
    );

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
