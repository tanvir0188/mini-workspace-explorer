"use client";

import { useDashboardLoading } from "@/components/shared/DashboardLoadingContext";
import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardContentWrapper({ children }: { children: ReactNode }) {
    const { isLoading, setLoading } = useDashboardLoading();
    const pathname = usePathname();

    // Reset loading state whenever pathname changes (navigation completed)
    useEffect(() => {
        setLoading(false);
    }, [pathname, setLoading]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="shadow-sm border">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-5 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
