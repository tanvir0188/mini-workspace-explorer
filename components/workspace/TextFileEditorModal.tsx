"use client";

import React, { useState, useEffect } from "react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { getItemFullPath } from "@/lib/utils/tree";
import {
    Save,
    X,
    FileText,
    Loader2,
    Check,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface TextFileEditorModalProps {
    file: WorkspaceItem | null;
    allItems: WorkspaceItem[];
    isOpen: boolean;
    onClose: () => void;
    onSaveFile: (fileId: string, newContent: string, newSize: number) => void;
}

export function TextFileEditorModal({
    file,
    allItems,
    isOpen,
    onClose,
    onSaveFile,
}: TextFileEditorModalProps) {
    const [content, setContent] = useState("");
    const [initialContent, setInitialContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

    const isDirty = content !== initialContent;
    const fullPath = file ? getItemFullPath(allItems, file.id) : "";

    // Load file content from disk via API whenever file changes
    useEffect(() => {
        if (!file || !isOpen) return;

        let cancelled = false;
        setIsLoading(true);

        fetch(`/api/workspace/files?id=${encodeURIComponent(file.id)}`)
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) {
                    const text = data.content ?? "";
                    setContent(text);
                    setInitialContent(text);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error("Failed to load file content from disk:", err);
                    toast.error("Failed to load file from disk");
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [file?.id, isOpen]);

    const handleSave = async () => {
        if (!file) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/workspace/files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: file.id,
                    content,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setInitialContent(content);
                onSaveFile(file.id, content, data.size || new Blob([content]).size);
                toast.success(`Saved "${file.name}" to disk successfully!`);
            } else {
                toast.error(data.error || "Failed to save file");
            }
        } catch (e: any) {
            toast.error(`Error saving file: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAttemptClose = () => {
        if (isDirty) {
            setConfirmCloseOpen(true);
        } else {
            onClose();
        }
    };

    const linesCount = content.split("\n").length;
    const charsCount = content.length;

    if (!isOpen || !file) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleAttemptClose()}>
                <DialogContent
                    showCloseButton={false}
                    className="max-w-4xl w-[94vw] h-[85vh] p-0 flex flex-col bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border shadow-2xl"
                >
                    {/* Windows Notepad Style Title Bar */}
                    <div className="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border-b select-none">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">
                                {isDirty ? `* ${file.name}` : file.name} - Text Editor
                            </span>
                            {isDirty && (
                                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                    Unsaved
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSave}
                                disabled={isSaving || !isDirty}
                                className="h-7 text-xs gap-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-none disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Save className="w-3.5 h-3.5" />
                                )}
                                <span>Save</span>
                            </Button>

                            <button
                                onClick={handleAttemptClose}
                                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Path information sub-bar */}
                    <div className="px-3 py-1 bg-zinc-50 dark:bg-zinc-900/60 border-b text-[11px] text-zinc-500 flex justify-between items-center select-none">
                        <span className="truncate">Location: {fullPath}</span>
                        <span className="shrink-0 text-zinc-400">
                            Disk: /public/workspace/{file.id}.txt
                        </span>
                    </div>

                    {/* Textarea editing area */}
                    <div className="flex-1 p-3 bg-white dark:bg-zinc-950 relative overflow-hidden flex flex-col">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                <span className="text-xs">Loading content from disk...</span>
                            </div>
                        ) : (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start typing here..."
                                autoFocus
                                className="w-full flex-1 resize-none bg-transparent outline-none font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 border-none p-1 placeholder:text-zinc-400"
                                spellCheck={false}
                            />
                        )}
                    </div>

                    {/* Notepad Status Bar */}
                    <div className="flex items-center justify-between px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border-t text-[11px] text-zinc-500 select-none">
                        <div className="flex items-center gap-4">
                            <span>
                                Lines: {linesCount}
                            </span>
                            <span>
                                Characters: {charsCount}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>UTF-8</span>
                            <span>Windows (CRLF)</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Unsaved changes confirmation dialog */}
            <Dialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-zinc-950">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <DialogTitle className="text-base">Unsaved Changes</DialogTitle>
                        </div>
                    </DialogHeader>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 py-2">
                        Do you want to save changes to &quot;{file.name}&quot; before closing?
                    </p>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setConfirmCloseOpen(false);
                                onClose();
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Don&apos;t Save
                        </Button>
                        <Button
                            onClick={async () => {
                                await handleSave();
                                setConfirmCloseOpen(false);
                                onClose();
                            }}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Save and Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
