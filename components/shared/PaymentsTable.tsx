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
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentDetailsModal } from "./PaymentDetailsModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updatePaymentStatus } from "@/app/dashboard/admin/_actions/adminActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PaymentsTable({ payments, isAdmin = false }: { payments: any[], isAdmin?: boolean }) {
    const router = useRouter();
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusUpdate = async (paymentId: string, status: "SUCCESS" | "PENDING" | "FAILED") => {
        setUpdatingId(paymentId);
        const res = await updatePaymentStatus(paymentId, status);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setUpdatingId(null);
    };

    return (
        <>
            <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/80">
                        <TableRow>
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No payments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment: any) => (
                                <TableRow key={payment.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <TableCell className="font-medium text-zinc-900">{payment.id.split("-")[0].toUpperCase()}</TableCell>
                                    <TableCell className="text-zinc-600">{payment.rentalRequest?.property?.title || "Unknown"}</TableCell>
                                    <TableCell className="font-semibold">BDT {payment.amount?.toLocaleString()}</TableCell>
                                    <TableCell><StatusBadge status={payment.status} /></TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!isAdmin ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedPayment(payment)}
                                                className="rounded-xl hover:bg-zinc-200/60 gap-1.5"
                                            >
                                                <Eye className="w-4 h-4 text-zinc-600" />
                                                <span>Details</span>
                                            </Button>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-zinc-200/60">
                                                        <span className="sr-only">Open menu</span>
                                                        {updatingId === payment.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                                                        ) : (
                                                            <MoreHorizontal className="h-4 w-4 text-zinc-600" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setSelectedPayment(payment)} className="rounded-xl cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4 text-zinc-500" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(payment.id, "SUCCESS")} className="rounded-xl cursor-pointer">
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                        Mark as Success
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(payment.id, "PENDING")} className="rounded-xl cursor-pointer">
                                                        <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(payment.id, "FAILED")} className="rounded-xl cursor-pointer">
                                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                        Mark as Failed
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaymentDetailsModal
                paymentId={selectedPayment?.id || null}
                initialData={selectedPayment}
                onClose={() => setSelectedPayment(null)}
            />
        </>
    );
}
