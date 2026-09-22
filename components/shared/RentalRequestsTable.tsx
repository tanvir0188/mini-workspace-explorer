"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";
import { RentalDetailsModal } from "./RentalDetailsModal";
import { getRentalDetails } from "@/app/dashboard/tenant/_actions/tenantActions";

export interface RentalRequestsTableProps {
    requests: any[];
    onUpdateStatus: (id: string, status: "APPROVED" | "REJECTED") => Promise<{ success: boolean; message: string }>;
    onCompleteRequest?: (id: string) => Promise<{ success: boolean; message: string }>;
    isAdmin?: boolean;
    isLandlord?: boolean;
}

export function RentalRequestsTable({
    requests = [],
    onUpdateStatus,
    onCompleteRequest,
    isAdmin = false,
    isLandlord = false
}: RentalRequestsTableProps) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);

    const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
        setProcessingId(id);
        try {
            const res = await onUpdateStatus(id, status);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to update request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleComplete = async (id: string) => {
        if (!onCompleteRequest) return;
        if (!confirm("Are you sure you want to mark this request as completed?")) return;

        setProcessingId(id);
        try {
            const res = await onCompleteRequest(id);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to mark request as complete");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Rental Requests</h2>
                    <p className="text-xs text-muted-foreground">Manage incoming rental requests.</p>
                </div>
            </div>

            <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/80">
                        <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!requests || requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No rental requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req: any) => (
                                <TableRow key={req.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <TableCell className="font-medium text-zinc-900">
                                        {req.property?.title || "Unknown Property"}
                                    </TableCell>
                                    <TableCell className="text-zinc-600">
                                        {req.property?.location || "Unknown"}
                                    </TableCell>
                                    <TableCell className="font-semibold text-zinc-900">
                                        BDT {req.property?.price?.toLocaleString() || 0}
                                    </TableCell>
                                    <TableCell className="text-zinc-600 truncate max-w-37.5">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-900">{req.user?.name || req.userId}</span>
                                            {req.user?.email && <span className="text-[11px] text-zinc-500">{req.user.email}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={req.status} />
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        {(req.status === "PENDING" || isAdmin) && (
                                            <>
                                                {req.status !== "APPROVED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Approve"
                                                        disabled={processingId === req.id}
                                                        onClick={() => handleAction(req.id, "APPROVED")}
                                                        className="rounded-xl hover:bg-green-50 text-green-600"
                                                    >
                                                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </Button>
                                                )}
                                                {req.status !== "REJECTED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Reject"
                                                        disabled={processingId === req.id}
                                                        onClick={() => handleAction(req.id, "REJECTED")}
                                                        className="rounded-xl hover:bg-red-50 text-red-600"
                                                    >
                                                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {isLandlord && req.status === "ACTIVE" && onCompleteRequest && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Mark as Completed"
                                                disabled={processingId === req.id}
                                                onClick={() => handleComplete(req.id)}
                                                className="rounded-xl hover:bg-blue-50 text-blue-600"
                                            >
                                                {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </Button>
                                        )}

                                        {!isAdmin && req.status !== "PENDING" && req.status !== "ACTIVE" && (
                                            <span className="text-xs text-muted-foreground mr-2">Actioned</span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            title="View Details"
                                            onClick={() => setSelectedRentalId(req.id)}
                                            className="rounded-xl hover:bg-blue-50 text-blue-600"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <RentalDetailsModal
                rentalId={selectedRentalId}
                onClose={() => setSelectedRentalId(null)}
                fetchDetailsAction={getRentalDetails}
            />
        </div>
    );
}
