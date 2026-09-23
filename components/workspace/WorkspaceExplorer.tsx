"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import {
    getStoredWorkspace,
    saveStoredWorkspace,
    resetWorkspaceToDefault,
} from "@/lib/utils/storage";
import { recordRecentAccess } from "@/lib/utils/stack";
import { findNodeById } from "@/lib/utils/tree";
import { ExplorerHeader } from "./ExplorerHeader";
import { ExplorerToolbar, ViewMode, SortOption } from "./ExplorerToolbar";
import { ExplorerSidebar } from "./ExplorerSidebar";
import { ExplorerMainPanel } from "./ExplorerMainPanel";
import { ExplorerStatusBar } from "./ExplorerStatusBar";
import { TextFileEditorModal } from "./TextFileEditorModal";
import { CreateItemModal } from "./CreateItemModal";
import { RenameModal } from "./RenameModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export function WorkspaceExplorer() {
    const searchParams = useSearchParams();
    const initialFolderParam = searchParams.get("folderId");
    const initialFileParam = searchParams.get("fileId");

    const [items, setItems] = useState<WorkspaceItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortOption>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Navigation history for Back and Forward buttons
    const [history, setHistory] = useState<(string | null)[]>([null]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Modals state
    const [activeEditingFile, setActiveEditingFile] = useState<WorkspaceItem | null>(null);
    const [createModal, setCreateModal] = useState<{ isOpen: boolean; type: "folder" | "file" }>({
        isOpen: false,
        type: "folder",
    });
    const [renameItem, setRenameItem] = useState<WorkspaceItem | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; items: WorkspaceItem[] }>({
        isOpen: false,
        items: [],
    });

    // 1. Load initial workspace from localStorage
    useEffect(() => {
        const stored = getStoredWorkspace();
        setItems(stored);
        setIsLoaded(true);

        // Handle initial query params (e.g. from Recent Items dashboard link)
        if (initialFolderParam) {
            const folderExists = stored.some((it) => it.id === initialFolderParam && it.type === "folder");
            if (folderExists) {
                setCurrentFolderId(initialFolderParam);
                setHistory([null, initialFolderParam]);
                setHistoryIndex(1);
            }
        }

        if (initialFileParam) {
            const fileItem = stored.find((it) => it.id === initialFileParam && it.type === "file");
            if (fileItem) {
                if (fileItem.parentId) {
                    setCurrentFolderId(fileItem.parentId);
                }
                setActiveEditingFile(fileItem);
                recordRecentAccess(fileItem);
            }
        }
    }, [initialFolderParam, initialFileParam]);

    // Save items whenever items state updates
    const updateWorkspaceItems = useCallback((newItems: WorkspaceItem[]) => {
        setItems(newItems);
        saveStoredWorkspace(newItems);
    }, []);

    // 2. Folder Navigation with History Tracking & Recent Access Recording
    const navigateToFolder = useCallback(
        (folderId: string | null) => {
            if (folderId === currentFolderId) return;

            setCurrentFolderId(folderId);
            setSelectedIds([]);

            // Record recent access if it's a folder
            if (folderId) {
                const folderItem = findNodeById(items, folderId);
                if (folderItem) {
                    recordRecentAccess(folderItem);
                }
            }

            // Update history stack
            setHistory((prev) => {
                const nextHistory = prev.slice(0, historyIndex + 1);
                nextHistory.push(folderId);
                return nextHistory;
            });
            setHistoryIndex((prev) => prev + 1);
        },
        [currentFolderId, historyIndex, items]
    );

    const handleGoBack = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setCurrentFolderId(history[prevIndex]);
            setSelectedIds([]);
        }
    };

    const handleGoForward = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setCurrentFolderId(history[nextIndex]);
            setSelectedIds([]);
        }
    };

    const handleGoUp = () => {
        if (!currentFolderId) return;
        const currentFolder = findNodeById(items, currentFolderId);
        navigateToFolder(currentFolder ? currentFolder.parentId : null);
    };

    // 3. Opening Text Files
    const handleOpenFile = (file: WorkspaceItem) => {
        setActiveEditingFile(file);
        recordRecentAccess(file);
    };

    // 4. File Save Handler
    const handleSaveFileContent = (fileId: string, _content: string, newSize: number) => {
        const updated = items.map((it) => {
            if (it.id === fileId) {
                return {
                    ...it,
                    size: newSize,
                    updatedAt: Date.now(),
                };
            }
            return it;
        });
        updateWorkspaceItems(updated);
    };

    // 5. Create Item Handler
    const handleCreateItem = async (newItem: WorkspaceItem) => {
        if (newItem.type === "file") {
            // Write initial empty file on disk
            try {
                await fetch("/api/workspace/files", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: newItem.id, content: "" }),
                });
            } catch (e) {
                console.error("Failed to write new file on disk:", e);
            }
        }

        const updated = [...items, newItem];
        updateWorkspaceItems(updated);
        setSelectedIds([newItem.id]);
    };

    // 6. Rename Handler
    const handleRenameItem = (itemId: string, newName: string) => {
        const updated = items.map((it) => {
            if (it.id === itemId) {
                return {
                    ...it,
                    name: newName,
                    updatedAt: Date.now(),
                };
            }
            return it;
        });
        updateWorkspaceItems(updated);
    };

    // 7. Delete Handler (Cascade + Disk Cleanup + Parent Navigation)
    const handleConfirmDelete = async (descendantIds: string[], diskFileIds: string[]) => {
        // Delete physical files from disk
        if (diskFileIds.length > 0) {
            try {
                await fetch("/api/workspace/files", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: diskFileIds }),
                });
            } catch (e) {
                console.error("Failed to delete physical files from disk:", e);
            }
        }

        const idsSet = new Set(descendantIds);
        const filtered = items.filter((it) => !idsSet.has(it.id));
        updateWorkspaceItems(filtered);
        setSelectedIds([]);

        // If the current folder was inside or was the deleted folder, navigate to parent
        if (currentFolderId && idsSet.has(currentFolderId)) {
            const currentFolder = findNodeById(items, currentFolderId);
            setCurrentFolderId(currentFolder ? currentFolder.parentId : null);
        }
    };

    // 8. Toolbar Triggers
    const handleToolbarRename = () => {
        if (selectedIds.length !== 1) return;
        const item = findNodeById(items, selectedIds[0]);
        if (item) setRenameItem(item);
    };

    const handleToolbarDelete = () => {
        const itemsToDelete = items.filter((it) => selectedIds.includes(it.id));
        if (itemsToDelete.length > 0) {
            setDeleteModal({ isOpen: true, items: itemsToDelete });
        }
    };

    const handleSortChange = (newSort: SortOption) => {
        if (sortBy === newSort) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(newSort);
            setSortOrder("asc");
        }
    };

    const handleResetWorkspace = () => {
        if (confirm("Reset workspace to example structure (Projects/Webbly/notes.txt)?")) {
            const resetItems = resetWorkspaceToDefault();
            setItems(resetItems);
            setCurrentFolderId(null);
            setSelectedIds([]);
            toast.success("Workspace reset to default structure");
        }
    };

    // 9. Keyboard shortcuts: Delete & F2
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if active element is an input or textarea
            const tagName = document.activeElement?.tagName.toLowerCase();
            if (tagName === "input" || tagName === "textarea") return;

            if (e.key === "Delete" && selectedIds.length > 0) {
                e.preventDefault();
                handleToolbarDelete();
            } else if (e.key === "F2" && selectedIds.length === 1) {
                e.preventDefault();
                handleToolbarRename();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIds, items]);

    if (!isLoaded) {
        return (
            <div className="h-[600px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 animate-pulse">Loading Workspace...</span>
            </div>
        );
    }

    const currentFolderChildren = items.filter((it) => it.parentId === currentFolderId);
    const selectedItems = items.filter((it) => selectedIds.includes(it.id));

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-h-[900px] bg-white dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-md overflow-hidden">
            {/* Header / Address Bar / Search */}
            <ExplorerHeader
                items={items}
                currentFolderId={currentFolderId}
                canGoBack={historyIndex > 0}
                canGoForward={historyIndex < history.length - 1}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                onGoBack={handleGoBack}
                onGoForward={handleGoForward}
                onGoUp={handleGoUp}
                onNavigateFolder={navigateToFolder}
                onOpenFile={handleOpenFile}
            />

            {/* Command Toolbar */}
            <ExplorerToolbar
                selectedCount={selectedIds.length}
                viewMode={viewMode}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onOpenCreateFolder={() => setCreateModal({ isOpen: true, type: "folder" })}
                onOpenCreateFile={() => setCreateModal({ isOpen: true, type: "file" })}
                onRenameSelected={handleToolbarRename}
                onDeleteSelected={handleToolbarDelete}
                onChangeViewMode={setViewMode}
                onChangeSort={handleSortChange}
                onResetWorkspace={handleResetWorkspace}
            />

            {/* Split Pane: Sidebar (Tree View) + Main Content Panel */}
            <div className="flex-1 flex overflow-hidden relative">
                <ExplorerSidebar
                    items={items}
                    currentFolderId={currentFolderId}
                    isOpen={isSidebarOpen}
                    onCloseMobile={() => setIsSidebarOpen(false)}
                    onSelectFolder={navigateToFolder}
                />

                <ExplorerMainPanel
                    items={items}
                    currentFolderId={currentFolderId}
                    selectedIds={selectedIds}
                    viewMode={viewMode}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSelectItems={setSelectedIds}
                    onOpenFolder={navigateToFolder}
                    onOpenFile={handleOpenFile}
                    onRenameItem={(item) => setRenameItem(item)}
                    onDeleteItem={(item) => setDeleteModal({ isOpen: true, items: [item] })}
                    onCreateFolder={() => setCreateModal({ isOpen: true, type: "folder" })}
                    onCreateFile={() => setCreateModal({ isOpen: true, type: "file" })}
                />
            </div>

            {/* Bottom Status Bar */}
            <ExplorerStatusBar
                totalItemsCount={currentFolderChildren.length}
                selectedItems={selectedItems}
            />

            {/* Modals */}
            <TextFileEditorModal
                file={activeEditingFile}
                allItems={items}
                isOpen={!!activeEditingFile}
                onClose={() => setActiveEditingFile(null)}
                onSaveFile={handleSaveFileContent}
            />

            <CreateItemModal
                isOpen={createModal.isOpen}
                type={createModal.type}
                currentFolderId={currentFolderId}
                allItems={items}
                onClose={() => setCreateModal((prev) => ({ ...prev, isOpen: false }))}
                onCreateItem={handleCreateItem}
            />

            <RenameModal
                item={renameItem}
                allItems={items}
                isOpen={!!renameItem}
                onClose={() => setRenameItem(null)}
                onRenameItem={handleRenameItem}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                itemsToDelete={deleteModal.items}
                allItems={items}
                onClose={() => setDeleteModal({ isOpen: false, items: [] })}
                onConfirmDelete={handleConfirmDelete}
            />
        </div>
    );
}
