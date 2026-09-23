"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, Search, X, Copy, Check, HardDrive, FolderOpen, FileText, PanelLeft } from "lucide-react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { getBreadcrumbTrail, searchWorkspace, findNodeById } from "@/lib/utils/tree";
import { toast } from "sonner";

interface ExplorerHeaderProps {
    items: WorkspaceItem[];
    currentFolderId: string | null;
    canGoBack: boolean;
    canGoForward: boolean;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    onGoBack: () => void;
    onGoForward: () => void;
    onGoUp: () => void;
    onNavigateFolder: (folderId: string | null) => void;
    onOpenFile: (file: WorkspaceItem) => void;
}

export function ExplorerHeader({
    items,
    currentFolderId,
    canGoBack,
    canGoForward,
    isSidebarOpen,
    onToggleSidebar,
    onGoBack,
    onGoForward,
    onGoUp,
    onNavigateFolder,
    onOpenFile,
}: ExplorerHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [copied, setCopied] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const breadcrumbs = getBreadcrumbTrail(items, currentFolderId);
    const currentFolder = findNodeById(items, currentFolderId);
    const searchResults = searchQuery.trim() ? searchWorkspace(items, searchQuery) : [];

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const copyCurrentPath = () => {
        const path = ["Workspace", ...breadcrumbs.map((b) => b.name)].join(" \\ ");
        navigator.clipboard.writeText(path);
        setCopied(true);
        toast.success("Path copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSelectSearchResult = (resultItem: WorkspaceItem) => {
        setSearchQuery("");
        setIsSearchFocused(false);
        if (resultItem.type === "folder") {
            onNavigateFolder(resultItem.id);
        } else {
            // Navigate to parent folder and open the file
            onNavigateFolder(resultItem.parentId);
            onOpenFile(resultItem);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-900 border-b select-none">
            {/* Navigation buttons: Back, Forward, Up */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={onGoBack}
                    disabled={!canGoBack}
                    title="Back (Alt + Left Arrow)"
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent transition-colors text-zinc-700 dark:text-zinc-300"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={onGoForward}
                    disabled={!canGoForward}
                    title="Forward (Alt + Right Arrow)"
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent transition-colors text-zinc-700 dark:text-zinc-300"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button
                    onClick={onGoUp}
                    disabled={currentFolderId === null}
                    title="Up to Parent Folder (Alt + Up Arrow)"
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent transition-colors text-zinc-700 dark:text-zinc-300"
                >
                    <ArrowUp className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-0.5" />
                <button
                    onClick={onToggleSidebar}
                    title={isSidebarOpen ? "Hide Navigation Pane" : "Show Navigation Pane"}
                    className={`p-1.5 rounded transition-colors ${
                        isSidebarOpen
                            ? "bg-zinc-200/90 dark:bg-zinc-800 text-blue-600 dark:text-blue-400"
                            : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                    <PanelLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Breadcrumb Address Bar */}
            <div className="flex-1 flex items-center bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md px-2 py-1 shadow-inner overflow-x-auto text-sm min-w-0">
                <div className="flex items-center gap-1.5 shrink-0 text-zinc-500 mr-1">
                    <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                </div>

                <div className="flex items-center flex-wrap gap-1 min-w-0 flex-1">
                    {/* Root segment */}
                    <button
                        onClick={() => onNavigateFolder(null)}
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${currentFolderId === null
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : "text-zinc-700 dark:text-zinc-300"
                            }`}
                    >
                        Workspace
                    </button>

                    {breadcrumbs.map((crumb, idx) => {
                        const isLast = idx === breadcrumbs.length - 1;
                        return (
                            <React.Fragment key={crumb.id}>
                                <span className="text-zinc-400 text-xs">/</span>
                                <button
                                    onClick={() => onNavigateFolder(crumb.id)}
                                    className={`px-1.5 py-0.5 rounded text-xs truncate max-w-[120px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${isLast
                                            ? "text-blue-600 dark:text-blue-400 font-bold"
                                            : "text-zinc-700 dark:text-zinc-300"
                                        }`}
                                    title={crumb.name}
                                >
                                    {crumb.name}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Copy path icon */}
                <button
                    onClick={copyCurrentPath}
                    title="Copy full path"
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0 ml-1"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Workspace-Wide Search Bar */}
            <div ref={searchRef} className="relative w-full sm:w-64 shrink-0">
                <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md px-2 py-1 shadow-inner">
                    <Search className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
                    <input
                        type="text"
                        placeholder={`Search ${currentFolder ? currentFolder.name : "Workspace"}...`}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchFocused(true);
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                        className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 outline-none placeholder:text-zinc-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {isSearchFocused && searchQuery.trim().length > 0 && (
                    <div className="absolute right-0 top-full mt-1.5 w-80 max-h-72 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-1">
                        <div className="text-[11px] font-semibold text-zinc-400 px-2.5 py-1 uppercase tracking-wider">
                            Search Results ({searchResults.length})
                        </div>
                        {searchResults.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-zinc-500">
                                No files or folders match &quot;{searchQuery}&quot;
                            </div>
                        ) : (
                            searchResults.map(({ item, path }) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectSearchResult(item)}
                                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors group cursor-pointer"
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {item.type === "folder" ? (
                                            <FolderOpen className="w-4 h-4" />
                                        ) : (
                                            <FileText className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-blue-600">
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 truncate">
                                            {path}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
