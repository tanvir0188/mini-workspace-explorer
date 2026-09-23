"use client";

import React from "react";
import {
    FolderPlus,
    FilePlus,
    Edit2,
    Trash2,
    LayoutGrid,
    List,
    ArrowDownAZ,
    RotateCcw,
    FolderSync,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "details";
export type SortOption = "name" | "type" | "updatedAt" | "size";

interface ExplorerToolbarProps {
    selectedCount: number;
    viewMode: ViewMode;
    sortBy: SortOption;
    sortOrder: "asc" | "desc";
    onOpenCreateFolder: () => void;
    onOpenCreateFile: () => void;
    onRenameSelected: () => void;
    onDeleteSelected: () => void;
    onChangeViewMode: (mode: ViewMode) => void;
    onChangeSort: (option: SortOption) => void;
    onResetWorkspace: () => void;
}

export function ExplorerToolbar({
    selectedCount,
    viewMode,
    sortBy,
    sortOrder,
    onOpenCreateFolder,
    onOpenCreateFile,
    onRenameSelected,
    onDeleteSelected,
    onChangeViewMode,
    onChangeSort,
    onResetWorkspace,
}: ExplorerToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border-b text-xs select-none">
            {/* Primary creation actions */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenCreateFolder}
                    className="h-8 gap-1.5 px-2.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                >
                    <FolderPlus className="w-4 h-4 text-amber-500" />
                    <span>New folder</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenCreateFile}
                    className="h-8 gap-1.5 px-2.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                >
                    <FilePlus className="w-4 h-4 text-blue-500" />
                    <span>New text document</span>
                </Button>

                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                {/* Edit actions (enabled on selection) */}
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedCount !== 1}
                    onClick={onRenameSelected}
                    className="h-8 gap-1.5 px-2.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40 text-zinc-700 dark:text-zinc-200"
                    title={selectedCount !== 1 ? "Select an item to rename" : "Rename (F2)"}
                >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                    <span>Rename</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedCount === 0}
                    onClick={onDeleteSelected}
                    className="h-8 gap-1.5 px-2.5 rounded-md hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-400 disabled:opacity-40 text-zinc-700 dark:text-zinc-200"
                    title={selectedCount === 0 ? "Select item(s) to delete" : "Delete (Del)"}
                >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                </Button>
            </div>

            {/* View, Sort, and Reset utilities */}
            <div className="flex items-center gap-1">
                {/* Sort dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        >
                            <ArrowDownAZ className="w-3.5 h-3.5" />
                            <span>Sort: {sortBy}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 text-xs">
                        <DropdownMenuItem onClick={() => onChangeSort("name")}>
                            By Name {sortBy === "name" && `(${sortOrder})`}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onChangeSort("type")}>
                            By Type {sortBy === "type" && `(${sortOrder})`}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onChangeSort("updatedAt")}>
                            By Date Modified {sortBy === "updatedAt" && `(${sortOrder})`}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onChangeSort("size")}>
                            By Size {sortBy === "size" && `(${sortOrder})`}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle: Grid vs Details */}
                <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-md">
                    <button
                        onClick={() => onChangeViewMode("grid")}
                        className={`p-1.5 rounded transition-all ${
                            viewMode === "grid"
                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                        title="Large Icons (Grid)"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onChangeViewMode("details")}
                        className={`p-1.5 rounded transition-all ${
                            viewMode === "details"
                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                        title="Details List"
                    >
                        <List className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                {/* Reset button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetWorkspace}
                    title="Reset workspace to example structure"
                    className="h-8 px-2 text-zinc-500 hover:text-amber-600 rounded-md"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}
