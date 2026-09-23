"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getMe } from "@/service/getMe";
import { Button } from "@/components/ui/button";
import {
    FolderTree,
    HardDrive,
    Layers,
    Search,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    CheckCircle2,
} from "lucide-react";

export default function HomePage() {
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const session = getMe();
        if (session?.success) {
            setUser(session.data);
        }
    }, []);

    // Quick demo login to make exploration completely frictionless
    const handleQuickLogin = () => {
        const demoUser = {
            id: "user_demo_1",
            name: "Demo Explorer",
            email: "demo@workspace.local",
            role: "USER",
            expiresAt: Date.now() + 86400000 * 7,
        };
        localStorage.setItem("auth", JSON.stringify(demoUser));
        window.location.href = "/dashboard/workspaces";
    };

    return (
        <main className="min-h-[calc(100vh-70px)] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col justify-between">
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hierarchical Tree Directory & Physical Disk Sync</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-tight">
                    Windows File Explorer,{" "}
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                        Reimagined for the Web.
                    </span>
                </h1>

                <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    A responsive workspace explorer featuring an upside-down tree directory algorithm, arbitrary nesting, breadcrumbs, search, and real-time physical text file synchronization in <code>/public/workspace/</code>.
                </p>

                {/* Primary Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link href="/dashboard/workspaces">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-lg gap-2 text-sm sm:text-base">
                            <span>Open Workspace Explorer</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>

                    {mounted && !user && (
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleQuickLogin}
                            className="font-semibold px-5 rounded-xl border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm"
                        >
                            Quick Demo Login
                        </Button>
                    )}

                    <Link href="/dashboard">
                        <Button size="lg" variant="ghost" className="font-semibold text-xs sm:text-sm">
                            Dashboard (Stack DS)
                        </Button>
                    </Link>
                </div>

                {/* Explorer Preview Card */}
                <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden text-left">
                    <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-3 border-b flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                        <div className="flex items-center gap-2 font-semibold">

                            <span>Workspace &gt; Projects &gt; Webbly</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Disk Synced</span>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">

                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Projects</span>
                            <span className="text-[10px] text-zinc-400">Folder</span>
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">

                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Documents</span>
                            <span className="text-[10px] text-zinc-400">Folder</span>
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">

                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">README.txt</span>
                            <span className="text-[10px] text-zinc-400">215 B</span>
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">

                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">notes.txt</span>
                            <span className="text-[10px] text-zinc-400">320 B</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur py-12">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl border bg-white dark:bg-zinc-950 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <FolderTree className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Hierarchical Tree Structure</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Organized as an upside-down tree with root at top. Arbitrary nesting levels, recursive deletions, duplicate validation, and parent pointer chains.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl border bg-white dark:bg-zinc-950 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <HardDrive className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Physical Disk Text Files</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Text documents are saved, edited, and deleted directly on the server disk in <code>/public/workspace/</code> via Next.js API endpoints.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl border bg-white dark:bg-zinc-950 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Stack DS for Recent Items</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            A custom Stack (LIFO) data structure tracks the 5 most recently visited folders and files, surfaced right on the main dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
