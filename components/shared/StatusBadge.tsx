import { Badge } from "@/components/ui/badge";

export interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const formattedStatus = status?.toUpperCase() || "";

    switch (formattedStatus) {
        case "PENDING":
            return <Badge variant="secondary" className={`bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 ${className}`}>Pending</Badge>;
        case "APPROVED":
            return <Badge variant="secondary" className={`bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 ${className}`}>Approved</Badge>;
        case "REJECTED":
            return <Badge variant="secondary" className={`bg-red-100 text-red-800 hover:bg-red-100 border-red-200 ${className}`}>Rejected</Badge>;
        case "ACTIVE":
            return <Badge variant="secondary" className={`bg-green-100 text-green-800 hover:bg-green-100 border-green-200 ${className}`}>Active</Badge>;
        case "COMPLETED":
            return <Badge variant="secondary" className={`bg-zinc-100 text-zinc-800 hover:bg-zinc-100 border-zinc-200 ${className}`}>Completed</Badge>;
        default:
            return <Badge variant="outline" className={className}>{status || "Unknown"}</Badge>;
    }
}
