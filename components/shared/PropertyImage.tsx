"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface PropertyImageProps {
    src?: string | null;
    alt: string;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
    className?: string;
}

export function PropertyImage({ src, alt, fill, sizes, priority, className }: PropertyImageProps) {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400 gap-2">
                <Building2 className="h-10 w-10 text-zinc-400/80 stroke-[1.5]" />
                <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-400">RentNest Property</span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            sizes={sizes}
            priority={priority}
            className={className}
            onError={() => setError(true)}
        />
    );
}

