"use client"

import { User } from "@/lib/storedDataTypes/user"


type LoginState = {
    success: true,
    statusCode: number,
    message: string,
    data: {
        accessToken: string,
        refreshToken: string
    }
}

export const loginAction = async (redirectTo: string, user: User) => {
    localStorage.setItem(
        "auth",
        JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        })
    );

    return {
        success: true,
        statusCode: 200,
        message: "Login successful",
        data: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    };
};
