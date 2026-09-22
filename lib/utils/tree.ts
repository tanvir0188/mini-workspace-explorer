import { WorkspaceItem } from "../storedDataTypes/folderFile";

export interface TreeNode extends WorkspaceItem {
    children: TreeNode[];
}

/**
 * Finds a node by its ID
 */
export function findNodeById(items: WorkspaceItem[], id: string | null): WorkspaceItem | null {
    if (!id) return null;
    return items.find((item) => item.id === id) || null;
}

/**
 * Returns immediate children of a parent folder (parentId = null represents root)
 */
export function getImmediateChildren(items: WorkspaceItem[], parentId: string | null): WorkspaceItem[] {
    return items.filter((item) => item.parentId === parentId);
}

/**
 * Builds a hierarchical tree structure from flat list of workspace items
 */
export function buildHierarchyTree(items: WorkspaceItem[], rootParentId: string | null = null): TreeNode[] {
    const itemMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Initialize map with empty children
    for (const item of items) {
        itemMap.set(item.id, { ...item, children: [] });
    }

    // Connect children to parents
    for (const item of items) {
        const node = itemMap.get(item.id)!;
        if (item.parentId === rootParentId) {
            roots.push(node);
        } else if (item.parentId && itemMap.has(item.parentId)) {
            const parent = itemMap.get(item.parentId)!;
            parent.children.push(node);
        } else if (item.parentId === null && rootParentId === null) {
            roots.push(node);
        }
    }

    // Sort folders first, then files, alphabetically
    const sortTree = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
            }
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });
        for (const node of nodes) {
            if (node.children.length > 0) {
                sortTree(node.children);
            }
        }
    };

    sortTree(roots);
    return roots;
}

/**
 * Gets breadcrumbs list starting from root up to current folder
 */
export function getBreadcrumbTrail(items: WorkspaceItem[], currentFolderId: string | null): WorkspaceItem[] {
    const trail: WorkspaceItem[] = [];
    let currentId = currentFolderId;
    const visited = new Set<string>(); // guard against potential cycles

    while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const item = findNodeById(items, currentId);
        if (!item) break;
        trail.unshift(item);
        currentId = item.parentId;
    }

    return trail;
}

/**
 * Calculates human-readable path string for any item
 */
export function getItemFullPath(items: WorkspaceItem[], itemId: string): string {
    const item = findNodeById(items, itemId);
    if (!item) return "Workspace";

    const trail = getBreadcrumbTrail(items, item.parentId);
    const pathSegments = ["Workspace", ...trail.map((t) => t.name), item.name];
    return pathSegments.join(" / ");
}

/**
 * Collects all descendant IDs of a folder (including the folder itself)
 */
export function getAllDescendantIds(items: WorkspaceItem[], rootId: string): string[] {
    const ids: string[] = [rootId];
    const queue: string[] = [rootId];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = items.filter((item) => item.parentId === currentId);
        for (const child of children) {
            ids.push(child.id);
            if (child.type === "folder") {
                queue.push(child.id);
            }
        }
    }

    return ids;
}

/**
 * Returns all nested files under a given folder ID
 */
export function getAllNestedFiles(items: WorkspaceItem[], rootFolderId: string): WorkspaceItem[] {
    const descendantIds = new Set(getAllDescendantIds(items, rootFolderId));
    return items.filter((item) => item.type === "file" && descendantIds.has(item.id));
}

/**
 * Checks if a name already exists within the same parent folder
 */
export function isDuplicateName(
    items: WorkspaceItem[],
    parentId: string | null,
    name: string,
    excludeId?: string
): boolean {
    const trimmed = name.trim().toLowerCase();
    return items.some(
        (item) =>
            item.parentId === parentId &&
            item.id !== excludeId &&
            item.name.trim().toLowerCase() === trimmed
    );
}

/**
 * Performs workspace-wide search across all nested folders and files
 */
export function searchWorkspace(
    items: WorkspaceItem[],
    query: string
): Array<{ item: WorkspaceItem; path: string }> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const matches = items.filter((item) => item.name.toLowerCase().includes(trimmed));

    return matches.map((item) => ({
        item,
        path: getItemFullPath(items, item.id),
    }));
}
