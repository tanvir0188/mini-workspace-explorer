"use client";

import React, { useState } from "react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { getAllDescendantIds, getAllNestedFiles } from "@/lib/utils/tree";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteConfirmationModalProps {
    itemsToDelete: WorkspaceItem[];
    allItems: WorkspaceItem[];
    isOpen: boolean;
    onClose: () => void;
    onConfirmDelete: (descendantIds: string[], diskFileIds: string[]) => Promise<void>;
}

export function DeleteConfirmationModal({
    itemsToDelete,
    allItems,
    isOpen,
    onClose,
    onConfirmDelete,
}: DeleteConfirmationModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || itemsToDelete.length === 0) return null;

    // Collect all descendant IDs and nested files to be purged from disk
    const allIdsSet = new Set<string>();
    const diskFileIdsSet = new Set<string>();

    for (const item of itemsToDelete) {
        if (item.type === "folder") {
            const descendantIds = getAllDescendantIds(allItems, item.id);
            descendantIds.forEach((id) => allIdsSet.add(id));

            const nestedFiles = getAllNestedFiles(allItems, item.id);
            nestedFiles.forEach((f) => diskFileIdsSet.add(f.id));
        } else {
            allIdsSet.add(item.id);
            diskFileIdsSet.add(item.id);
        }
    }

    const totalItemsCount = allIdsSet.size;
    const diskFilesCount = diskFileIdsSet.size;
    const isSingleItem = itemsToDelete.length === 1;
    const singleItem = itemsToDelete[0];

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onConfirmDelete(Array.from(allIdsSet), Array.from(diskFileIdsSet));
            toast.success(
                isSingleItem
                    ? `Deleted "${singleItem.name}"`
                    : `Deleted ${itemsToDelete.length} items`
            );
            onClose();
        } catch (e: any) {
            toast.error(`Delete failed: ${e.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white dark:bg-zinc-950 p-5 rounded-xl">
                <DialogHeader className="mb-2">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <DialogTitle className="text-base font-semibold">
                            Delete {isSingleItem ? (singleItem.type === "folder" ? "Folder" : "File") : "Items"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-2 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                    {isSingleItem ? (
                        <p>
                            Are you sure you want to permanently delete{" "}
                            <strong className="text-zinc-900 dark:text-zinc-100">
                                &quot;{singleItem.name}&quot;
                            </strong>
                            ?
                        </p>
                    ) : (
                        <p>
                            Are you sure you want to permanently delete these{" "}
                            <strong className="text-zinc-900 dark:text-zinc-100">
                                {itemsToDelete.length} items
                            </strong>
                            ?
                        </p>
                    )}

                    {singleItem?.type === "folder" && totalItemsCount > 1 && (
                        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                            <strong>Warning:</strong> This folder contains{" "}
                            <strong>{totalItemsCount - 1} nested sub-item(s)</strong>.
                            All contents and subfolders will be permanently removed.
                        </div>
                    )}

                    {diskFilesCount > 0 && (
                        <p className="text-xs text-zinc-400">
                            Physical text files ({diskFilesCount}) will also be deleted from disk in{" "}
                            <code>/public/workspace/</code>.
                        </p>
                    )}
                </div>

                <DialogFooter className="mt-4 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white gap-1.5"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete Permanently</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
