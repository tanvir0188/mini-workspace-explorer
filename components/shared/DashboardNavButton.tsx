"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function DashboardNavButton({ role }: { role: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = () => {
        setIsLoading(true);
        router.push(`/dashboard/${role.toLowerCase()}`);
    };

    return (
        <Button variant="outline" onClick={handleClick} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            {isLoading ? "Loading..." : "Dashboard"}
        </Button>
    );
}
