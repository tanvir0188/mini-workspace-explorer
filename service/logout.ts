"use server"

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";

export const logout = async () => {
    const cookieStore = await cookies();

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    revalidateTag("my-profile", "max");
    redirect("/");
}