"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentItems } from "@/lib/utils/stack";
import { getStoredWorkspace } from "@/lib/utils/storage";
import { getItemFullPath } from "@/lib/utils/tree";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { getMe } from "@/service/getMe";

import {
    FolderTree,
    Layers,
    FileText,
    ArrowRight,
    Clock,
    HardDrive,
    Sparkles,
    FolderPlus,
    FilePlus,
    FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [recentFolders, setRecentFolders] = useState<WorkspaceItem[]>([]);
    const [recentFiles, setRecentFiles] = useState<WorkspaceItem[]>([]);
    const [allItems, setAllItems] = useState<WorkspaceItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const session = getMe();
        if (session?.success) {
            setUser(session.data);
        }

        const items = getStoredWorkspace();
        setAllItems(items);

        // Fetch top 5 recent folders and top 5 recent files using the Stack DS
        const folders = getRecentItems("folder", 5);
        const files = getRecentItems("file", 5);

        // If stack is empty on first run, populate with default samples from the items
        if (folders.length === 0) {
            const defaultFolders = items.filter((it) => it.type === "folder").slice(0, 3);
            setRecentFolders(defaultFolders);
        } else {
            setRecentFolders(folders);
        }

        if (files.length === 0) {
            const defaultFiles = items.filter((it) => it.type === "file").slice(0, 3);
            setRecentFiles(defaultFiles);
        } else {
            setRecentFiles(files);
        }
    }, []);

    const formatBytes = (bytes?: number) => {
        if (!bytes) return "0 B";
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "Recently";
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const totalFolders = allItems.filter((i) => i.type === "folder").length;
    const totalFiles = allItems.filter((i) => i.type === "file").length;

    if (!mounted) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 bg-zinc-200 animate-pulse rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-zinc-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Top Welcome Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                        <span>Mini Workspace Explorer</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Welcome back{user?.name ? `, ${user.name}` : ""}!
                    </h1>
                    <p className="text-zinc-300 text-xs sm:text-sm max-w-xl">
                        Explore your hierarchical tree directory, manage virtual folders, and edit real physical text files stored on disk.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/workspaces">
                        <Button className="bg-white hover:bg-zinc-100 text-blue-950 font-bold px-5 rounded-xl shadow gap-2">
                            <span>Open File Explorer</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-xl border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-zinc-500">Total Folders</CardTitle>
                        <FolderTree className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">{totalFolders}</div>
                        <p className="text-[11px] text-zinc-400 mt-1">Hierarchical tree structure</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-zinc-500">Text Documents</CardTitle>
                        <FileText className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">{totalFiles}</div>
                        <p className="text-[11px] text-zinc-400 mt-1">Synced to /public/workspace/</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-zinc-500">Stack Cache</CardTitle>
                        <Layers className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            {recentFolders.length + recentFiles.length}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">LIFO tracked recent items</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-zinc-500">Storage Root</CardTitle>
                        <HardDrive className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">public/workspace/</div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Ready for disk IO</p>
                    </CardContent>
                </Card>
            </div>

            {/* Stack DS Explanation Badge */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg shrink-0 text-amber-800 dark:text-amber-300">
                    <Layers className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                        Stack Data Structure (LIFO) in Action:
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-300">
                        Each time you open or navigate into a folder or text file in the Workspace Explorer, it is pushed onto the top of the Stack. The 5 most recent folders and files shown below represent the top 5 elements popped in Last-In-First-Out order.
                    </p>
                </div>
            </div>

            {/* Section 1: Recently Accessed Folders (Stack DS Top 5) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FolderOpen color="#ffffff" />
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Recently Accessed Folders (Top 5)
                        </h2>
                        <Badge variant="outline" className="text-[10px] font-mono">
                            Stack LIFO
                        </Badge>
                    </div>
                    <Link
                        href="/dashboard/workspaces"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <span>View all in Explorer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentFolders.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                        <p className="text-xs text-zinc-500">No recently accessed folders recorded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {recentFolders.map((folder, index) => {
                            const fullPath = getItemFullPath(allItems, folder.id);
                            return (
                                <Link
                                    key={folder.id}
                                    href={`/dashboard/workspaces?folderId=${encodeURIComponent(folder.id)}`}
                                    className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-between"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <FolderOpen color="#ffffff" className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600">
                                                {folder.name}
                                            </div>
                                            <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                                {fullPath}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                                        <span className="font-mono">#{index + 1} on Stack</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(folder.updatedAt)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Section 2: Recently Accessed Files (Stack DS Top 5) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText color="#ffffff" />
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Recently Accessed Files (Top 5)
                        </h2>
                        <Badge variant="outline" className="text-[10px] font-mono">
                            Stack LIFO
                        </Badge>
                    </div>
                    <Link
                        href="/dashboard/workspaces"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <span>Open Explorer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentFiles.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                        <p className="text-xs text-zinc-500">No recently accessed files recorded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {recentFiles.map((file, index) => {
                            const fullPath = getItemFullPath(allItems, file.id);
                            return (
                                <Link
                                    key={file.id}
                                    href={`/dashboard/workspaces?fileId=${encodeURIComponent(file.id)}`}
                                    className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-between"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <FileText color="#ffffff" className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600">
                                                {file.name}
                                            </div>
                                            <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                                {fullPath}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                                        <span className="font-mono">
                                            #{index + 1} ({formatBytes(file.size)})
                                        </span>
                                        <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                                            Edit
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
