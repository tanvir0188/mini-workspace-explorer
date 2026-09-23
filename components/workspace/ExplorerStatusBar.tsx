"use client";

import React from "react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { CheckCircle2, HardDrive } from "lucide-react";

interface ExplorerStatusBarProps {
    totalItemsCount: number;
    selectedItems: WorkspaceItem[];
}

export function ExplorerStatusBar({
    totalItemsCount,
    selectedItems,
}: ExplorerStatusBarProps) {
    const selectedCount = selectedItems.length;
    const selectedSize = selectedItems.reduce((acc, curr) => acc + (curr.size || 0), 0);

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} bytes`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
        <div className="flex items-center justify-between px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border-t text-[11px] text-zinc-500 select-none">
            <div className="flex items-center gap-3">
                <span>
                    {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                </span>

                {selectedCount > 0 && (
                    <>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
                            {selectedSize > 0 && ` (${formatBytes(selectedSize)})`}
                        </span>
                    </>
                )}
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="hidden sm:inline">Disk Root: /public/workspace/</span>
            </div>
        </div>
    );
}
