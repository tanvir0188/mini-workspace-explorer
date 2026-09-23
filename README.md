# Mini Workspace Explorer

A responsive web-based file and workspace explorer modeled after the **Windows File Manager** interface, utilizing the classic **Operating System Tree Directory Structure** algorithm and a **Stack (LIFO)** data structure for recent item tracking.

---

## 📚 Algorithms & Data Structures Used

This project implements standard computer science and operating systems directory algorithms to achieve fast, scalable, and intuitive file management.

### 1. Tree Directory Structure (Hierarchical Upside-Down Tree)

As defined in operating systems design ([GeeksforGeeks Directory Structures Reference](https://www.geeksforgeeks.org/operating-systems/structures-of-directory-in-operating-system/)), the **Tree Directory Structure** is the standard model in modern personal computers. It resembles an upside-down tree with a single root directory at the top (`Workspace`) containing files and subdirectories, supporting arbitrary levels of nesting.

#### Data Model (Parent-Pointer Representation)
Rather than deeply nesting raw JSON objects in storage (which complicates updates, moves, and deletions), every entity is normalized as a flat node with a parent reference:
```typescript
interface WorkspaceItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null; // null represents the Root "Workspace"
  createdAt?: number;
  updatedAt?: number;
  size?: number;
}
```

#### Key Algorithms in `lib/utils/tree.ts`:

1. **Tree Construction**:
   - Uses a **Hash Map Adjacency List** to build the hierarchical tree from flat storage records in a single pass.
   - Traverses flat nodes, maps each node by `id`, and links children to their corresponding `parent.children` array.
   - Deterministically sorts folders first, then files, alphabetically.

2. **Breadcrumb Path Traversal**:
   - Where $H$ is the depth/height of the current directory.
   - Traces upwards from the active folder along `parentId` pointers to the root.
   - Includes a `Set<string>` cycle guard to safeguard against circular references.

3. **Cascade Recursive Deletion (Breadth-First Search / BFS)**:
   - When deleting a folder, a BFS queue traverses all nested children, grandchildren, and files.
   - Collects all descendant IDs so they can be purged from `localStorage`.
   - Collects all nested physical file IDs to trigger batch unlinks on the server disk (`/public/workspace/`).

4. **Sibling Name Collision Prevention**:
   - Enforces unique naming within the same directory level before creation or rename operations.

---

### 2. Stack Data Structure (LIFO - Last In, First Out)

To track and surface recently accessed folders and files on the Dashboard (`/dashboard`), the application implements a generic **Stack (LIFO)** data structure (`lib/utils/stack.ts`).

```typescript
export class Stack<T> {
  private items: T[] = [];
  private maxCapacity: number;

  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  toArray(): T[]; // Returns items in LIFO order (top of stack first)
}
```

- **Behavior**: When a user enters a folder or opens a text file, that item is pushed onto the top of the Stack. If it was previously present, the older entry is evicted and moved to the top.
- **Capacity**: Maintained with a sliding window to keep the 5 most recent folders and files ready for instant access.

---

## 💾 Hybrid Storage Architecture

- **Virtual Metadata in `localStorage`**:
  - Folders, directory hierarchy, and metadata are maintained on the client for zero-latency operations.
- **Physical Text Files on Server Disk (`/public/workspace/`)**:
  - Text files are created for real on the server filesystem.
  - Endpoints (`app/api/workspace/files/route.ts`):
    - `GET /api/workspace/files?id={id}`: Reads file content from disk.
    - `POST /api/workspace/files`: Writes/updates file content on disk.
    - `DELETE /api/workspace/files`: Purges file(s) from disk during single or cascade folder deletions.

---

## 🖥️ UI & User Experience

- **Navigation Pane (Unified Sidebar)**:
  - Displays the folder and nested file hierarchy with expandable/collapsible chevrons.
  - Active folder highlighted with open/closed state icons.
  - Mobile responsive with toggle button.
- **Breadcrumb Address Bar**:
  - Windows-style segment navigation (`Workspace / Projects / Webbly`).
  - History buttons: Back (`<`), Forward (`>`), Up (`^`), and Copy Path.
- **Notepad Text Editor**:
  - Monospace editing area with live line and character counters.
  - Live Save to disk with unsaved changes (`*`) protection.
- **Workspace-Wide Search**:
  - Instant recursive search across all directories with full path display.

---

## 🚀 Getting Started

### Installation

```bash
npm install
# or
pnpm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

- **Workspace Explorer**: [http://localhost:3000/dashboard/workspaces](http://localhost:3000/dashboard/workspaces)
- **Dashboard (Stack DS)**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
