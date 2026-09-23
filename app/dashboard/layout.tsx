import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingProvider } from "@/components/shared/DashboardLoadingContext";
import DashboardContentWrapper from "./_components/DashboardContentWrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLoadingProvider>
            <div className="min-h-screen flex flex-col bg-background">
                <main className="flex-1 p-3 sm:p-6 w-full">
                    <Suspense fallback={<div className="animate-pulse space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96" /></div>}>
                        <DashboardContentWrapper>
                            {children}
                        </DashboardContentWrapper>
                    </Suspense>
                </main>
            </div>
        </DashboardLoadingProvider>
    );
}
