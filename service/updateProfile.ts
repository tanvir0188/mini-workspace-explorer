"use server"
import { StoredUsers } from "@/lib/storedDataTypes/user";

export interface ProfileUpdatePayload {
    name: string;
    email: string;
    password?: string;
}

export const updateProfile = async (
    formData: FormData
) => {
    try {
        const authData = localStorage.getItem("auth");

        if (!authData) {
            return {
                success: false,
                statusCode: 401,
                message: "Unauthorized. Please log in."
            };
        }

        const session = JSON.parse(authData);

        if (
            !session.id ||
            !session.email
        ) {
            localStorage.removeItem("auth");

            return {
                success: false,
                statusCode: 401,
                message: "Invalid user session."
            };
        }

        // Check session expiration
        if (
            session.expiresAt &&
            Date.now() > session.expiresAt
        ) {
            localStorage.removeItem("auth");

            return {
                success: false,
                statusCode: 401,
                message: "Session expired. Please log in again."
            };
        }

        const payload: ProfileUpdatePayload = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "")
                .trim()
                .toLowerCase(),
            password:
                String(formData.get("password") || "").trim() || undefined
        };

        const users: StoredUsers = JSON.parse(
            localStorage.getItem("users") || "[]"
        );

        // Find the currently logged-in user
        const currentUser = users.find(
            (user) => user.id === session.id
        );

        if (!currentUser) {
            return {
                success: false,
                statusCode: 404,
                message: "User not found."
            };
        }

        // Check if another user already uses this email
        const existingUser = users.find(
            (user) =>
                user.email === payload.email &&
                user.id !== currentUser.id
        );

        if (existingUser) {
            return {
                success: false,
                statusCode: 400,
                message: "Email already used.",
                error: {
                    email: ["Email already used."]
                }
            };
        }

        // Update user
        const updatedUsers = users.map(
            (user) => {
                if (user.id !== currentUser.id) {
                    return user;
                }

                return {
                    ...user,
                    name: payload.name,
                    email: payload.email,
                    password:
                        payload.password || user.password
                };
            }
        );

        localStorage.setItem(
            "users",
            JSON.stringify(updatedUsers)
        );

        // Update the logged-in session too
        const updatedSession = {
            ...session,
            name: payload.name,
            email: payload.email
        };

        localStorage.setItem(
            "auth",
            JSON.stringify(updatedSession)
        );

        return {
            success: true,
            statusCode: 200,
            message: "Profile updated successfully.",
            data: updatedSession
        };
    } catch (error) {
        console.error(
            "Profile update failed:",
            error
        );

        return {
            success: false,
            statusCode: 400,
            message: "Profile update failed."
        };
    }
};
