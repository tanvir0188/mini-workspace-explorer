"use client";

import Link from "next/link";
import { useDashboardLoading } from "@/components/shared/DashboardLoadingContext";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

export function NavPathLink({ href, onClick, children, ...props }: ComponentProps<typeof Link>) {
    const { setLoading } = useDashboardLoading();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (href.toString() !== pathname) {
            setLoading(true);
        }
        if (onClick) onClick(e);
    };

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
}
