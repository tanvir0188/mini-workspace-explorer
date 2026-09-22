"use client"

import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";

export const logout = async () => {
    localStorage.removeItem("auth");
    redirect("/");
}