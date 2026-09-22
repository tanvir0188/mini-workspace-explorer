"use server"

import config from "@/config/config";
import { cookies } from "next/headers";

export const getPayments = async (page: number = 1, size: number = 10) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return { data: [], meta: null };

    try {
        const res = await fetch(`${config.base_url}/api/payments?page=${page}&size=${size}`, {
            headers: {
                "Cookie": `accessToken=${accessToken}`,
                "Authorization": `Bearer ${accessToken}`
            },
            next: { revalidate: 0 }
        });

        if (res.ok) {
            const data = await res.json();
            return {
                data: data.data || [],
                meta: data.meta || null
            };
        }
        return { data: [], meta: null };
    } catch (err) {
        console.error("Failed to fetch payments", err);
        return { data: [], meta: null };
    }
}

export const getPaymentDetails = async (paymentId: string) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return { success: false, message: "Unauthorized" };

    try {
        const res = await fetch(`${config.base_url}/api/payments/${paymentId}`, {
            headers: {
                "Cookie": `accessToken=${accessToken}`,
                "Authorization": `Bearer ${accessToken}`
            },
            next: { revalidate: 30 }
        });

        if (res.ok) {
            const data = await res.json();
            console.log("Payment details", data)
            return { success: true, data: data.data };
        }
        return { success: false, message: "Failed to fetch payment details" };
    } catch (err) {
        console.error("Failed to fetch payment details", err);
        return { success: false, message: "An unexpected error occurred" };
    }
}
