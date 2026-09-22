export type FolderFile = {
    id: string;
    name: string;
    type: "folder" | "file";
    parentId: string | null;
    createdAt?: number;
    updatedAt?: number;
    size?: number;
};

export type WorkspaceItem = FolderFile;
