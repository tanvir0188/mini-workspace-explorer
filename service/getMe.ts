"use server"

import { cache } from "react";
import { cookies } from "next/headers";
import config from "@/config/config";

export const getMe = cache(async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value || null;

    if (!accessToken) return { success: false, message: "User not logged in!" };

    try {
        const res = await fetch(`${config.base_url}/api/users/me`, {
            headers: { Cookie: `accessToken=${accessToken}` },
            cache: "force-cache",
            next: {
                revalidate: 60 * 60 * 24,
                tags: ["my-profile"]
            }
        });

        const data = await res.json().catch(() => ({ success: false }));
        console.log(`Me: ${JSON.stringify(data)}`)
        return data;
    } catch (err) {
        console.error("Failed to fetch getMe", err);
        return { success: false, message: "Error fetching user session" };
    }
});
