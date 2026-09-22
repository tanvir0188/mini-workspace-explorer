import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WORKSPACE_DIR = path.join(process.cwd(), "public", "workspace");

// Ensure the root workspace directory exists on disk
async function ensureWorkspaceDir() {
    try {
        await fs.access(WORKSPACE_DIR);
    } catch {
        await fs.mkdir(WORKSPACE_DIR, { recursive: true });
    }
}

function getFilePath(id: string): string {
    // Sanitize id to prevent directory traversal
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    return path.join(WORKSPACE_DIR, `${safeId}.txt`);
}

/**
 * GET /api/workspace/files?id={id}
 * Read physical text file content from disk in public/workspace/
 */
export async function GET(request: Request) {
    await ensureWorkspaceDir();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const filePath = getFilePath(id);

    try {
        const content = await fs.readFile(filePath, "utf-8");
        const stats = await fs.stat(filePath);
        return NextResponse.json({
            success: true,
            id,
            content,
            size: stats.size,
            updatedAt: stats.mtimeMs,
        });
    } catch (err: any) {
        if (err.code === "ENOENT") {
            // File does not exist yet on disk, return empty content
            return NextResponse.json({
                success: true,
                id,
                content: "",
                size: 0,
                updatedAt: Date.now(),
            });
        }
        return NextResponse.json(
            { error: "Failed to read file from disk", details: err.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/workspace/files
 * Write or update physical text file on disk in public/workspace/
 * Body: { id: string, content: string }
 */
export async function POST(request: Request) {
    await ensureWorkspaceDir();
    try {
        const body = await request.json();
        const { id, content = "" } = body;

        if (!id) {
            return NextResponse.json({ error: "File ID is required" }, { status: 400 });
        }

        const filePath = getFilePath(id);
        await fs.writeFile(filePath, content, "utf-8");
        const stats = await fs.stat(filePath);

        return NextResponse.json({
            success: true,
            id,
            size: stats.size,
            updatedAt: stats.mtimeMs,
            message: "File written to disk successfully",
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Failed to write file to disk", details: err.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/workspace/files?id={id} or body with { ids: string[] }
 * Delete physical text file(s) from disk in public/workspace/
 */
export async function DELETE(request: Request) {
    await ensureWorkspaceDir();
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get("id");

    let idsToDelete: string[] = [];

    if (singleId) {
        idsToDelete = [singleId];
    } else {
        try {
            const body = await request.json();
            if (Array.isArray(body.ids)) {
                idsToDelete = body.ids;
            }
        } catch {
            // No body
        }
    }

    if (idsToDelete.length === 0) {
        return NextResponse.json({ error: "No file IDs provided for deletion" }, { status: 400 });
    }

    const results: Record<string, boolean> = {};

    for (const id of idsToDelete) {
        const filePath = getFilePath(id);
        try {
            await fs.unlink(filePath);
            results[id] = true;
        } catch (err: any) {
            if (err.code === "ENOENT") {
                results[id] = true; // Already gone
            } else {
                results[id] = false;
            }
        }
    }

    return NextResponse.json({
        success: true,
        deleted: results,
        message: "File(s) deleted from disk successfully",
    });
}
