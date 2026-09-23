"use client";

export const getMe = () => {
    const auth = localStorage.getItem("auth");

    if (!auth) {
        return {
            success: false,
            message: "User not logged in!"
        };
    }

    try {
        const session = JSON.parse(auth);

        if (
            session.expiresAt &&
            Date.now() > session.expiresAt
        ) {
            localStorage.removeItem("auth");

            return {
                success: false,
                message: "Session expired!"
            };
        }

        return {
            success: true,
            data: session
        };
    } catch {
        localStorage.removeItem("auth");

        return {
            success: false,
            message: "Invalid session!"
        };
    }
};