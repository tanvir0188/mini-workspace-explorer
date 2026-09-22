import { WorkspaceItem } from "../storedDataTypes/folderFile";

/**
 * Generic Stack Data Structure implementation (LIFO)
 */
export class Stack<T> {
    private items: T[] = [];
    private maxCapacity: number;

    constructor(initialItems: T[] = [], maxCapacity: number = 20) {
        this.items = [...initialItems];
        this.maxCapacity = maxCapacity;
    }

    push(item: T): void {
        this.items.push(item);
        if (this.items.length > this.maxCapacity) {
            this.items.shift(); // Evict oldest item if capacity is exceeded
        }
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    /**
     * Returns items in LIFO order (top of stack / most recent first)
     */
    toArray(): T[] {
        return [...this.items].reverse();
    }

    clear(): void {
        this.items = [];
    }
}

const RECENT_FOLDERS_KEY = "workspace_recent_folders";
const RECENT_FILES_KEY = "workspace_recent_files";

/**
 * Helper to record recently accessed items using the Stack data structure
 */
export function recordRecentAccess(item: WorkspaceItem): void {
    if (typeof window === "undefined" || !item?.id) return;

    try {
        const storageKey = item.type === "folder" ? RECENT_FOLDERS_KEY : RECENT_FILES_KEY;
        const raw = localStorage.getItem(storageKey);
        let existingList: WorkspaceItem[] = [];

        if (raw) {
            try {
                existingList = JSON.parse(raw);
            } catch {
                existingList = [];
            }
        }

        // Filter out item if it already exists to bring it to the top
        const filtered = existingList.filter((existing) => existing.id !== item.id);

        // Instantiate Stack and restore previous elements
        const stack = new Stack<WorkspaceItem>(filtered, 10);
        stack.push({
            ...item,
            updatedAt: Date.now(),
        });

        // Persist underlying items in order
        const updatedList: WorkspaceItem[] = [];
        const reversedArray = stack.toArray().reverse(); // preserve bottom-to-top order
        for (const it of reversedArray) {
            updatedList.push(it);
        }

        localStorage.setItem(storageKey, JSON.stringify(updatedList));
    } catch (e) {
        console.error("Failed to record recent access:", e);
    }
}

/**
 * Returns the most recently accessed items up to limit
 */
export function getRecentItems(type: "folder" | "file", limit: number = 5): WorkspaceItem[] {
    if (typeof window === "undefined") return [];

    try {
        const storageKey = type === "folder" ? RECENT_FOLDERS_KEY : RECENT_FILES_KEY;
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];

        const list: WorkspaceItem[] = JSON.parse(raw);
        const stack = new Stack<WorkspaceItem>(list, 20);

        // toArray() returns items in LIFO order (most recent first)
        return stack.toArray().slice(0, limit);
    } catch {
        return [];
    }
}

export function clearRecentItems(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(RECENT_FOLDERS_KEY);
    localStorage.removeItem(RECENT_FILES_KEY);
}
