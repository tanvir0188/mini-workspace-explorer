export type FolderFile = {
    id: String;
    name: String;
    type: "folder" | "file";
    parentId?: String;
}
