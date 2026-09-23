"use client";

import React, { useState, useEffect } from "react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { isDuplicateName } from "@/lib/utils/tree";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";

interface RenameModalProps {
    item: WorkspaceItem | null;
    allItems: WorkspaceItem[];
    isOpen: boolean;
    onClose: () => void;
    onRenameItem: (itemId: string, newName: string) => void;
}

export function RenameModal({
    item,
    allItems,
    isOpen,
    onClose,
    onRenameItem,
}: RenameModalProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (item && isOpen) {
            setName(item.name);
            setError(null);
        }
    }, [item, isOpen]);

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;

        const trimmed = name.trim();
        if (!trimmed) {
            setError("Name cannot be empty.");
            return;
        }

        if (/[/\\?%*:|"<>]/g.test(trimmed)) {
            setError('A file name cannot contain any of the following characters: \\ / : * ? " < > |');
            return;
        }

        if (trimmed === item.name) {
            onClose();
            return;
        }

        if (isDuplicateName(allItems, item.parentId, trimmed, item.id)) {
            setError(`An item named "${trimmed}" already exists in this folder.`);
            return;
        }

        onRenameItem(item.id, trimmed);
        toast.success(`Renamed to "${trimmed}"`);
        onClose();
    };

    if (!isOpen || !item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white dark:bg-zinc-950 p-5 rounded-xl">
                <form onSubmit={handleRename}>
                    <DialogHeader className="mb-4">
                        <div className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-blue-500" />
                            <DialogTitle className="text-base font-semibold">
                                Rename {item.type === "folder" ? "Folder" : "File"}
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 my-2">
                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                            New Name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError(null);
                            }}
                            autoFocus
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
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Rename
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
