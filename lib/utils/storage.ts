import { WorkspaceItem } from "../storedDataTypes/folderFile";

export const WORKSPACE_STORAGE_KEY = "workspace_items_tree_v1";

/**
 * Initial sample hierarchy matching the prompt requirements:
 * Workspace
 * ├── Projects
 * │   ├── Webbly
 * │   │   ├── notes.txt
 * │   │   └── tasks.txt
 * │   └── Personal
 * ├── Documents
 * └── README.txt
 */
export const INITIAL_WORKSPACE_ITEMS: WorkspaceItem[] = [
    // Folders
    {
        id: "folder_projects",
        name: "Projects",
        type: "folder",
        parentId: null,
        createdAt: Date.now() - 3600000 * 24,
        updatedAt: Date.now() - 3600000 * 24,
    },
    {
        id: "folder_documents",
        name: "Documents",
        type: "folder",
        parentId: null,
        createdAt: Date.now() - 3600000 * 20,
        updatedAt: Date.now() - 3600000 * 20,
    },
    {
        id: "folder_webbly",
        name: "Webbly",
        type: "folder",
        parentId: "folder_projects",
        createdAt: Date.now() - 3600000 * 15,
        updatedAt: Date.now() - 3600000 * 15,
    },
    {
        id: "folder_personal",
        name: "Personal",
        type: "folder",
        parentId: "folder_projects",
        createdAt: Date.now() - 3600000 * 10,
        updatedAt: Date.now() - 3600000 * 10,
    },
    // Files
    {
        id: "file_readme",
        name: "README.txt",
        type: "file",
        parentId: null,
        size: 215,
        createdAt: Date.now() - 3600000 * 5,
        updatedAt: Date.now() - 3600000 * 5,
    },
    {
        id: "file_notes",
        name: "notes.txt",
        type: "file",
        parentId: "folder_webbly",
        size: 320,
        createdAt: Date.now() - 3600000 * 4,
        updatedAt: Date.now() - 3600000 * 4,
    },
    {
        id: "file_tasks",
        name: "tasks.txt",
        type: "file",
        parentId: "folder_webbly",
        size: 180,
        createdAt: Date.now() - 3600000 * 2,
        updatedAt: Date.now() - 3600000 * 2,
    },
];

export const INITIAL_SAMPLE_CONTENTS: Record<string, string> = {
    file_readme: `Welcome to Mini Workspace Explorer!
===================================
A clean, responsive Windows File Manager-inspired workspace explorer.
Features:
- Tree view hierarchy with arbitrary nesting
- Full breadcrumb navigation
- Real-time disk persistence for text files in public/workspace/
- Stack data structure for recently accessed files and folders
- Instant workspace search
`,
    file_notes: `Webbly Project Notes
-------------------
1. Architecture: Next.js App Router + Tailwind CSS
2. Tree structure algorithm: Root-based hierarchy with parentId pointers
3. Disk sync: Text files physically saved in /public/workspace/
4. UI: Windows 11 Fluent style explorer layout
`,
    file_tasks: `Task List:
[x] Define hierarchical tree data structure
[x] Build Windows File Explorer UI
[x] Implement stack data structure for recent items
[x] Sync physical text files to public/workspace
[ ] Launch workspace explorer!
`,
};

export function getStoredWorkspace(): WorkspaceItem[] {
    if (typeof window === "undefined") return INITIAL_WORKSPACE_ITEMS;

    try {
        const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
        if (!raw) {
            // First time initialization
            localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(INITIAL_WORKSPACE_ITEMS));
            // Trigger background disk seed for sample files
            syncSeedFilesToDisk();
            return INITIAL_WORKSPACE_ITEMS;
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse stored workspace:", e);
        return INITIAL_WORKSPACE_ITEMS;
    }
}

export function saveStoredWorkspace(items: WorkspaceItem[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error("Failed to save workspace to localStorage:", e);
    }
}

export function resetWorkspaceToDefault(): WorkspaceItem[] {
    if (typeof window === "undefined") return INITIAL_WORKSPACE_ITEMS;
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(INITIAL_WORKSPACE_ITEMS));
    syncSeedFilesToDisk();
    return INITIAL_WORKSPACE_ITEMS;
}

/**
 * Ensures initial files exist on disk
 */
export async function syncSeedFilesToDisk(): Promise<void> {
    try {
        for (const [id, content] of Object.entries(INITIAL_SAMPLE_CONTENTS)) {
            await fetch("/api/workspace/files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, content }),
            });
        }
    } catch (e) {
        console.warn("Could not sync seed files to disk (might be running in offline/mock context):", e);
    }
}
