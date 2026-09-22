"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export default function NavbarSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [query, setQuery] = useState(searchParams.get("title") || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("title", query);
        } else {
            params.delete("title");
        }
        
        if (pathname !== "/") {
            router.push(`/?${params.toString()}`);
        } else {
            router.push(`?${params.toString()}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center w-full max-w-sm mx-4">
            <Input 
                type="search" 
                placeholder="Search properties by title..." 
                className="bg-muted" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    );
}
