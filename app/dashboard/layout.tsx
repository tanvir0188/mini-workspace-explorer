import Navbar from "@/components/shared/Navbar";
import Sidebar from "./_components/Sidebar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingProvider } from "@/components/shared/DashboardLoadingContext";
import DashboardContentWrapper from "./_components/DashboardContentWrapper";

function SidebarSkeleton() {
    return (
        <aside className="w-64 bg-zinc-50 border-r min-h-full p-4 flex flex-col gap-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </aside>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLoadingProvider>
            <div className="min-h-screen flex flex-col">
                <div className="flex flex-1 flex-col md:flex-row">
                    <Suspense fallback={<SidebarSkeleton />}>
                        <Sidebar />
                    </Suspense>
                    <main className="flex-1 p-6">
                        <Suspense fallback={<div className="animate-pulse space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96" /></div>}>
                            <DashboardContentWrapper>
                                {children}
                            </DashboardContentWrapper>
                        </Suspense>
                    </main>
                </div>
            </div>
        </DashboardLoadingProvider>
    );
}
