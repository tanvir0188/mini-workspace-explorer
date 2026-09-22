"use server"

import { cache } from "react";
import { cookies } from "next/headers";
import config from "@/config/config";
import { jwtUtils } from "@/utils/jwt";

export const getMe = cache(async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value || null;

    if (!accessToken) return { success: false, message: "User not logged in!" };

    try {
        if (config.base_url) {
            const res = await fetch(`${config.base_url}/api/users/me`, {
                headers: { Cookie: `accessToken=${accessToken}` },
                cache: "force-cache",
                next: {
                    revalidate: 60 * 60 * 24,
                    tags: ["my-profile"]
                }
            });

            const data = await res.json().catch(() => ({ success: false }));
            if (data?.success && data?.data) {
                return data;
            }
        }
    } catch (err) {
        console.log("Backend getMe failed or offline, falling back to token decode", err);
    }

    // Fallback: decode verified JWT token from accessToken cookie
    const verification = jwtUtils.verifyToken(accessToken, config.access_secret);
    if (verification.success && verification.data) {
        const decoded = verification.data as any;
        return {
            success: true,
            data: {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name || decoded.email?.split("@")[0] || "User",
                role: decoded.role,
                profile: decoded.profile || {
                    id: decoded.id,
                    email: decoded.email,
                    name: decoded.name || decoded.email?.split("@")[0] || "User",
                    role: decoded.role,
                }
            }
        };
    }

    return { success: false, message: "Error fetching user session" };
});

