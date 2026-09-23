"use client";

import React, { useState, useEffect } from "react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";

import { ViewMode, SortOption } from "./ExplorerToolbar";
import {
    FolderOpen,
    FileText,
    Edit2,
    Trash2,
    Info,
    FolderPlus,
    FilePlus,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ExplorerMainPanelProps {
    items: WorkspaceItem[];
    currentFolderId: string | null;
    selectedIds: string[];
    viewMode: ViewMode;
    sortBy: SortOption;
    sortOrder: "asc" | "desc";
    onSelectItems: (ids: string[]) => void;
    onOpenFolder: (folderId: string) => void;
    onOpenFile: (file: WorkspaceItem) => void;
    onRenameItem: (item: WorkspaceItem) => void;
    onDeleteItem: (item: WorkspaceItem) => void;
    onCreateFolder: () => void;
    onCreateFile: () => void;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    targetItem: WorkspaceItem | null;
}

export function ExplorerMainPanel({
    items,
    currentFolderId,
    selectedIds,
    viewMode,
    sortBy,
    sortOrder,
    onSelectItems,
    onOpenFolder,
    onOpenFile,
    onRenameItem,
    onDeleteItem,
    onCreateFolder,
    onCreateFile,
}: ExplorerMainPanelProps) {
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        targetItem: null,
    });

    // Close context menu on global click
    useEffect(() => {
        const handleGlobalClick = () => {
            if (contextMenu.visible) {
                setContextMenu((prev) => ({ ...prev, visible: false }));
            }
        };
        window.addEventListener("click", handleGlobalClick);
        return () => window.removeEventListener("click", handleGlobalClick);
    }, [contextMenu.visible]);

    // Filter immediate children of currentFolderId
    const currentItems = items.filter((item) => item.parentId === currentFolderId);

    // Sort items: folders first, then files, sorted by chosen criteria
    const sortedItems = [...currentItems].sort((a, b) => {
        if (sortBy === "type" && a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }

        // Always keep folders grouped together first unless sorting specifically
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }

        let comparison = 0;
        if (sortBy === "name") {
            comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        } else if (sortBy === "updatedAt") {
            comparison = (a.updatedAt || 0) - (b.updatedAt || 0);
        } else if (sortBy === "size") {
            comparison = (a.size || 0) - (b.size || 0);
        } else {
            comparison = a.name.localeCompare(b.name);
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    const handleItemClick = (e: React.MouseEvent, item: WorkspaceItem) => {
        e.stopPropagation();
        if (e.ctrlKey || e.metaKey) {
            // Multi-selection toggle
            if (selectedIds.includes(item.id)) {
                onSelectItems(selectedIds.filter((id) => id !== item.id));
            } else {
                onSelectItems([...selectedIds, item.id]);
            }
        } else {
            onSelectItems([item.id]);
        }
    };

    const handleItemDoubleClick = (item: WorkspaceItem) => {
        if (item.type === "folder") {
            onOpenFolder(item.id);
        } else {
            onOpenFile(item);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, item: WorkspaceItem | null) => {
        e.preventDefault();
        e.stopPropagation();
        if (item) {
            onSelectItems([item.id]);
        }
        setContextMenu({
            visible: true,
            x: Math.min(e.clientX, window.innerWidth - 180),
            y: Math.min(e.clientY, window.innerHeight - 200),
            targetItem: item,
        });
    };

    const formatBytes = (bytes?: number) => {
        if (bytes === undefined || bytes === null || bytes === 0) return "--";
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "--";
        return new Date(timestamp).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            onClick={() => onSelectItems([])}
            onContextMenu={(e) => handleContextMenu(e, null)}
            className="flex-1 bg-white dark:bg-zinc-950 p-4 overflow-y-auto select-none min-h-[300px] relative"
        >
            {sortedItems.length === 0 ? (
                // Empty folder placeholder
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
                        <FolderOpen className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        This folder is empty
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mb-4">
                        Create a new folder or text file to start organizing your files in this workspace.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateFolder();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
                        >
                            <FolderPlus className="w-4 h-4 text-amber-500" />
                            <span>New folder</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateFile();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 rounded-md font-medium text-blue-700 dark:text-blue-300 transition-colors"
                        >
                            <FilePlus className="w-4 h-4 text-blue-500" />
                            <span>New text file</span>
                        </button>
                    </div>
                </div>
            ) : viewMode === "grid" ? (
                // Grid / Large Icons View (Windows Explorer Style)
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {sortedItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                onClick={(e) => handleItemClick(e, item)}
                                onDoubleClick={() => handleItemDoubleClick(item)}
                                onContextMenu={(e) => handleContextMenu(e, item)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer group ${isSelected
                                    ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-xs"
                                    : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:border-zinc-200 dark:hover:border-zinc-800"
                                    }`}
                            >
                                <div className="mb-2 shrink-0 group-hover:scale-105 transition-transform">
                                    {item.type === "folder" ? (
                                        <FolderOpen className="w-12 h-12 text-amber-500 drop-shadow-xs" />
                                    ) : (
                                        <FileText className="w-12 h-12 text-blue-500 drop-shadow-xs" />
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-medium w-full break-all line-clamp-2 px-1 rounded ${isSelected
                                        ? "text-blue-950 dark:text-blue-100 font-semibold"
                                        : "text-zinc-800 dark:text-zinc-200"
                                        }`}
                                    title={item.name}
                                >
                                    {item.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 mt-1">
                                    {item.type === "folder" ? "Folder" : formatBytes(item.size)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Details / Table View (Windows Explorer Style)
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900 select-none">
                            <TableRow className="text-xs">
                                <TableHead className="w-[50%]">Name</TableHead>
                                <TableHead>Date Modified</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Size</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedItems.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <TableRow
                                        key={item.id}
                                        onClick={(e) => handleItemClick(e, item)}
                                        onDoubleClick={() => handleItemDoubleClick(item)}
                                        onContextMenu={(e) => handleContextMenu(e, item)}
                                        className={`cursor-pointer text-xs transition-colors ${isSelected
                                            ? "bg-blue-100/70 dark:bg-blue-950/60 font-medium"
                                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                            }`}
                                    >
                                        <TableCell className="font-medium flex items-center gap-2 py-2">
                                            {item.type === "folder" ? (
                                                <FolderOpen className="w-4 h-4 shrink-0 text-amber-500" />
                                            ) : (
                                                <FileText className="w-4 h-4 shrink-0 text-blue-500" />
                                            )}
                                            <span className="truncate max-w-[280px]">{item.name}</span>
                                        </TableCell>
                                        <TableCell className="text-zinc-500 py-2">
                                            {formatDate(item.updatedAt)}
                                        </TableCell>
                                        <TableCell className="text-zinc-500 py-2">
                                            {item.type === "folder" ? "File folder" : "Text Document"}
                                        </TableCell>
                                        <TableCell className="text-right text-zinc-500 py-2">
                                            {formatBytes(item.size)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Custom Windows-style Context Menu */}
            {contextMenu.visible && (
                <div
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                    className="fixed z-50 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 text-xs select-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.targetItem ? (
                        <>
                            <button
                                onClick={() => {
                                    setContextMenu((prev) => ({ ...prev, visible: false }));
                                    handleItemDoubleClick(contextMenu.targetItem!);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-medium cursor-pointer"
                            >
                                {contextMenu.targetItem.type === "folder" ? (
                                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                                ) : (
                                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                                )}
                                <span>Open</span>
                            </button>
                            <button
                                onClick={() => {
                                    setContextMenu((prev) => ({ ...prev, visible: false }));
                                    onRenameItem(contextMenu.targetItem!);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Rename</span>
                            </button>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                            <button
                                onClick={() => {
                                    setContextMenu((prev) => ({ ...prev, visible: false }));
                                    onDeleteItem(contextMenu.targetItem!);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setContextMenu((prev) => ({ ...prev, visible: false }));
                                    onCreateFolder();
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
                                <span>New Folder</span>
                            </button>
                            <button
                                onClick={() => {
                                    setContextMenu((prev) => ({ ...prev, visible: false }));
                                    onCreateFile();
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                <FilePlus className="w-3.5 h-3.5 text-blue-500" />
                                <span>New Text Document</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
