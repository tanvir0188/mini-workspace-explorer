import Link from "next/link";
import { Suspense } from "react";
import NavbarAuth from "./NavbarAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Compass, FolderOpen } from "lucide-react";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3.5">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-foreground hover:opacity-90 transition-opacity">
                        <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                            <FolderOpen className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-xl">File<span className="text-emerald-600">Explorer</span></span>
                    </Link>

                </div>

                <div className="flex gap-3 items-center">
                    <Suspense fallback={
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-20 rounded-lg" />
                            <Skeleton className="h-9 w-20 rounded-lg" />
                        </div>
                    }>
                        <NavbarAuth />
                    </Suspense>
                </div>
            </nav>
        </header>
    );
}

