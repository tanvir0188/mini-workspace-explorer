import Link from "next/link";
import { Suspense } from "react";
import NavbarAuth from "./NavbarAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Home, FolderTree, User } from "lucide-react";
import { NavPathLink } from "./NavPathLink";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-xs">
            <nav className="max-w-7xl mx-auto flex justify-between items-center px-3 sm:px-6 py-2.5 sm:py-3">
                <div className="flex items-center gap-4 sm:gap-8">
                    {/* Brand */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight text-foreground hover:opacity-90 transition-opacity shrink-0"
                    >
                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                            <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                        </div>
                        <span className="font-extrabold text-base sm:text-xl">
                            File<span className="text-emerald-600">Explorer</span>
                        </span>
                    </Link>

                    {/* Navigation links moved from sidebar to navbar */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        <NavPathLink
                            href="/dashboard"
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
                        >
                            <Home className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Dashboard</span>
                        </NavPathLink>
                    </div>
                </div>

                <div className="flex gap-2 sm:gap-3 items-center">
                    <Suspense
                        fallback={
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-16 sm:h-9 sm:w-20 rounded-lg" />
                            </div>
                        }
                    >
                        <NavbarAuth />
                    </Suspense>
                </div>
            </nav>
        </header>
    );
}
