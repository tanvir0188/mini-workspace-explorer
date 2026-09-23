"use client";

import { NavPathLink as Link } from "@/components/shared/NavPathLink";
import { getMe } from "@/service/getMe";
import { Home, FolderTree, User } from "lucide-react";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const session = getMe();
        if (session?.success) {
            setUser(session.data);
        }
    }, []);

    if (!mounted || !user) return null;

    const navLinks = (
        <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/workspaces" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                <FolderTree className="w-5 h-5 text-amber-500" />
                <span>My Workspaces</span>
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                <User className="w-5 h-5" />
                <span>My Profile</span>
            </Link>
        </nav>
    );

    return (
        <>
            {/* Mobile Drawer Trigger Bar */}
            <MobileSidebarDrawer>
                {navLinks}
            </MobileSidebarDrawer>

            {/* Desktop Fixed Sidebar */}
            <aside className="hidden md:flex w-64 bg-zinc-50 border-r min-h-full p-4 flex-col gap-4 shrink-0">
                <h2 className="text-lg font-bold mb-4 px-2">Workspace Hub</h2>
                {navLinks}
            </aside>
        </>
    );
}
