"use server"

import config from "@/config/config"
import { LoginSchema, RegisterSchema } from "@/lib/types"
import jwt, { JwtPayload } from "jsonwebtoken"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type LoginState = {
    success: true,
    statusCode: number,
    message: string,
    data: {
        accessToken: string,
        refreshToken: string
    }
}

export const loginAction = async (redirectTo: string, prevState: LoginState, formData: FormData) => {
    const rawData = Object.fromEntries(formData);
    const validated = LoginSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            statusCode: 400,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors,
            data: rawData
        }
    }

    let redirectUrl = "";

    try {
        const res = await fetch(`${config.base_url}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(validated.data)
        })
        const result = await res.json();

        if (!result.success) {
            return { ...result, data: rawData };
        }

        const cookieStore = await cookies()
        cookieStore.set("accessToken", result.data.accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 24,
            sameSite: "lax"
        })
        cookieStore.set("refreshToken", result.data.refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax"
        })

        const decodedToken = jwt.decode(result.data.accessToken) as JwtPayload;

        revalidateTag("my-profile", "max");

        if (redirectTo && typeof redirectTo === "string" && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
            redirectUrl = redirectTo;
        } else if (decodedToken.role === "ADMIN") {
            redirectUrl = "/dashboard/admin";
        } else if (decodedToken.role === "TENANT") {
            redirectUrl = "/dashboard/tenant";
        } else if (decodedToken.role === "LANDLORD") {
            redirectUrl = "/dashboard/landlord";
        }

    } catch (error) {
        return {
            success: false,
            statusCode: 500,
            message: "Backend is sleeping or offline. Try again.",
            data: rawData
        }
    }

    if (redirectUrl) {
        redirect(redirectUrl);
    }
}

export const fastLoginDemoAction = async (role: "tenant" | "landlord" | "admin", redirectTo: string) => {
    let email = "";
    if (role === "tenant") email = "arnob0188@tenant.com";
    if (role === "landlord") email = "arnob0188@land.com";
    if (role === "admin") email = "arnob0188@admin.com";

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", "arnob0188");

    return loginAction(redirectTo, null as any, formData);
}

type RegisterState = {
    success: true,
    statusCode: number,
    message: string,
    data: any
}
export const registerAction = async (redirectTo: string, prevState: RegisterState, formData: FormData) => {
    const rawData = Object.fromEntries(formData);
    const validated = RegisterSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            statusCode: 400,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors,
            data: rawData
        }
    }

    const { email, password, name } = validated.data;
    const payload = {
        email,
        password,
        name
    }
    const res = await fetch(`${config.base_url}/api/users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    const result = await res.json();
    if (result.statusCode === 500) {
        return {
            success: false,
            statusCode: 500,
            message: "Internal server error",
            data: rawData
        }
    }
    if (!result.success && result.statusCode === 400) {
        return result
    }

    if (result.success) {
        redirect("/auth/login")

    }
    return result;

}

export const googleLoginAction = async () => {
    redirect(`${config.base_url}/api/auth/google`);
}