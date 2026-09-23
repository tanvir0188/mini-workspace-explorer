import { Suspense } from "react";
import { WorkspaceExplorer } from "@/components/workspace/WorkspaceExplorer";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspacesPage() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Workspace Explorer
                    </h1>
                    <p className="text-xs text-zinc-500">
                        Hierarchical tree navigation, arbitrary nesting, and physical text file synchronization in <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[11px]">/public/workspace/</code>
                    </p>
                </div>
            </div>

            <Suspense
                fallback={
                    <div className="h-[600px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border">
                        <Skeleton className="h-10 w-48" />
                    </div>
                }
            >
                <WorkspaceExplorer />
            </Suspense>
        </div>
    );
}
