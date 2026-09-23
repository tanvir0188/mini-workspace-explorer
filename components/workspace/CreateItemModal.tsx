"use client";

import React, { useState, useEffect } from "react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { isDuplicateName, findNodeById } from "@/lib/utils/tree";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, FolderOpen } from "lucide-react";

interface CreateItemModalProps {
    isOpen: boolean;
    type: "folder" | "file";
    currentFolderId: string | null;
    allItems: WorkspaceItem[];
    onClose: () => void;
    onCreateItem: (item: WorkspaceItem) => Promise<void>;
}

export function CreateItemModal({
    isOpen,
    type,
    currentFolderId,
    allItems,
    onClose,
    onCreateItem,
}: CreateItemModalProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentFolder = findNodeById(allItems, currentFolderId);
    const locationName = currentFolder ? currentFolder.name : "Workspace (Root)";

    // Suggest default names on open
    useEffect(() => {
        if (isOpen) {
            if (type === "folder") {
                // Find a default name like "New folder" or "New folder (2)"
                let suggested = "New folder";
                let count = 2;
                while (isDuplicateName(allItems, currentFolderId, suggested)) {
                    suggested = `New folder (${count++})`;
                }
                setName(suggested);
            } else {
                let suggested = "New Text Document.txt";
                let count = 2;
                while (isDuplicateName(allItems, currentFolderId, suggested)) {
                    suggested = `New Text Document (${count++}).txt`;
                }
                setName(suggested);
            }
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen, type, currentFolderId, allItems]);

    const handleValidateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();

        if (!trimmed) {
            setError("Name cannot be empty.");
            return;
        }

        // Check for invalid filesystem characters
        if (/[/\\?%*:|"<>]/g.test(trimmed)) {
            setError('A file name cannot contain any of the following characters: \\ / : * ? " < > |');
            return;
        }

        // For files, automatically add .txt if no extension provided
        let finalName = trimmed;
        if (type === "file" && !finalName.includes(".")) {
            finalName += ".txt";
        }

        // Check duplicate name within the same folder
        if (isDuplicateName(allItems, currentFolderId, finalName)) {
            setError(`An item named "${finalName}" already exists in this folder.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const newItemId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const newItem: WorkspaceItem = {
                id: newItemId,
                name: finalName,
                type,
                parentId: currentFolderId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                size: 0,
            };

            await onCreateItem(newItem);
            toast.success(`Created ${type === "folder" ? "folder" : "file"} "${finalName}"`);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create item");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white dark:bg-zinc-950 p-5 rounded-xl">
                <form onSubmit={handleValidateAndSubmit}>
                    <DialogHeader className="mb-4">
                        <div className="flex items-center gap-2.5">
                            {type === "folder" ? (
                                <FolderOpen color="#ffffff" />
                            ) : (
                                <FileText color="#ffffff" />
                            )}
                            <DialogTitle className="text-base font-semibold">
                                Create New {type === "folder" ? "Folder" : "Text Document"}
                            </DialogTitle>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Creating inside: <strong className="text-zinc-700 dark:text-zinc-300">{locationName}</strong>
                        </p>
                    </DialogHeader>

                    <div className="space-y-3 my-2">
                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                            {type === "folder" ? "Folder Name" : "File Name"}
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError(null);
                            }}
                            autoFocus
                            placeholder={type === "folder" ? "e.g. Projects" : "e.g. notes.txt"}
                            className="text-sm"
                        />
                        {error && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="mt-5 flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
