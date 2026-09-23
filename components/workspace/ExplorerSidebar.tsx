"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, HardDrive, FolderOpen, Folder, FileText, X } from "lucide-react";
import { WorkspaceItem } from "@/lib/storedDataTypes/folderFile";
import { buildHierarchyTree, TreeNode, getBreadcrumbTrail } from "@/lib/utils/tree";

interface ExplorerSidebarProps {
    items: WorkspaceItem[];
    currentFolderId: string | null;
    selectedFileId?: string | null;
    isOpen?: boolean;
    onCloseMobile?: () => void;
    onSelectFolder: (folderId: string | null) => void;
    onOpenFile?: (file: WorkspaceItem) => void;
}

export function ExplorerSidebar({
    items,
    currentFolderId,
    selectedFileId,
    isOpen = true,
    onCloseMobile,
    onSelectFolder,
    onOpenFile,
}: ExplorerSidebarProps) {
    // Build tree containing both folders and nested files
    const tree = buildHierarchyTree(items, null);

    // Track which folder nodes are expanded
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["folder_projects", "folder_webbly"]));

    // Whenever currentFolderId changes, auto-expand its parent chain
    useEffect(() => {
        if (!currentFolderId) return;
        const trail = getBreadcrumbTrail(items, currentFolderId);
        setExpandedIds((prev) => {
            const next = new Set(prev);
            for (const item of trail) {
                if (item.type === "folder") {
                    next.add(item.id);
                }
            }
            return next;
        });
    }, [currentFolderId, items]);

    if (!isOpen) return null;

    const toggleExpand = (folderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const handleFolderClick = (folderId: string | null) => {
        onSelectFolder(folderId);
        if (window.innerWidth < 768 && onCloseMobile) {
            onCloseMobile();
        }
    };

    const handleFileClick = (file: WorkspaceItem) => {
        // Also ensure the parent folder is selected so main panel context matches
        if (file.parentId !== currentFolderId) {
            onSelectFolder(file.parentId);
        }
        if (onOpenFile) {
            onOpenFile(file);
        }
        if (window.innerWidth < 768 && onCloseMobile) {
            onCloseMobile();
        }
    };

    const renderTreeNodes = (nodes: TreeNode[], depth: number = 0) => {
        return (
            <div className="flex flex-col">
                {nodes.map((node) => {
                    const isFolder = node.type === "folder";
                    const isSelected = isFolder
                        ? currentFolderId === node.id
                        : selectedFileId === node.id;
                    const isExpanded = expandedIds.has(node.id);
                    const hasChildren = node.children && node.children.length > 0;
                    const directChildrenCount = items.filter((it) => it.parentId === node.id).length;

                    return (
                        <div key={node.id} className="flex flex-col">
                            <div
                                onClick={() => (isFolder ? handleFolderClick(node.id) : handleFileClick(node))}
                                className={`flex items-center gap-1.5 py-1 px-2 rounded-md text-xs cursor-pointer select-none transition-colors group ${
                                    isSelected
                                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 font-medium"
                                        : "hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                }`}
                                style={{ paddingLeft: `${Math.max(depth * 14 + 8, 8)}px` }}
                            >
                                {/* Chevron expand/collapse toggle for folders */}
                                {isFolder ? (
                                    <button
                                        onClick={(e) => hasChildren && toggleExpand(node.id, e)}
                                        className={`p-0.5 rounded hover:bg-zinc-300/60 dark:hover:bg-zinc-700 text-zinc-400 transition-colors ${
                                            hasChildren ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
                                        }`}
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                ) : (
                                    /* Spacer placeholder to keep file indentation aligned with folders */
                                    <div className="w-4 h-4 shrink-0" />
                                )}

                                {/* Icon: Folder vs File */}
                                <div className="shrink-0">
                                    {isFolder ? (
                                        <div className="text-amber-500">
                                            {isExpanded || isSelected ? (
                                                <FolderOpen className="w-4 h-4" />
                                            ) : (
                                                <Folder className="w-4 h-4" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-blue-500">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <span className="truncate flex-1 min-w-0" title={node.name}>
                                    {node.name}
                                </span>

                                {/* Item count for folders */}
                                {isFolder && directChildrenCount > 0 && (
                                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-500 ml-1">
                                        {directChildrenCount}
                                    </span>
                                )}
                            </div>

                            {/* Render recursive nested items if expanded folder */}
                            {isFolder && hasChildren && isExpanded && (
                                <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3">
                                    {renderTreeNodes(node.children, depth + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <aside className="w-64 md:w-64 border-r bg-zinc-50/70 dark:bg-zinc-900/40 p-2 flex flex-col shrink-0 overflow-y-auto select-none transition-all">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Navigation Pane
                </span>
                {onCloseMobile && (
                    <button
                        onClick={onCloseMobile}
                        className="md:hidden p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors"
                        title="Close navigation pane"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Root "Workspace" item */}
            <div
                onClick={() => handleFolderClick(null)}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-xs cursor-pointer select-none transition-colors mb-1 ${
                    currentFolderId === null
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 font-semibold"
                        : "hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
            >
                <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="flex-1 truncate">Workspace (Root)</span>
                <span className="text-[10px] text-zinc-400">
                    {items.filter((it) => it.parentId === null).length}
                </span>
            </div>

            {/* Tree view of nested folders and files */}
            <div className="flex-1">{renderTreeNodes(tree, 0)}</div>
        </aside>
    );
}
