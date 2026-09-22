"use client"

import { useEffect } from "react";

export const useRedirectToDashboard = () => {
    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem("auth")) {
            window.location.href = "/dashboard";
        }
    }, []);
}
