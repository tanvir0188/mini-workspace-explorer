"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { getPaymentDetails } from "@/service/paymentActions";
import { DollarSign, Calendar, MapPin, User, Hash } from "lucide-react";

export interface PaymentDetailsModalProps {
    paymentId: string | null;
    initialData?: any;
    onClose: () => void;
}

export function PaymentDetailsModal({
    paymentId,
    initialData,
    onClose,
}: PaymentDetailsModalProps) {
    const [details, setDetails] = useState<any>(initialData || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!paymentId) return;

        let isMounted = true;
        setLoading(true);

        getPaymentDetails(paymentId)
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setDetails(res.data);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        console.log("Payment", details)

        return () => {
            isMounted = false;
        };
    }, [paymentId]);

    const isOpen = Boolean(paymentId);

    const amount = details?.amount || initialData?.amount;
    const status = details?.status || initialData?.status;
    const stripePaymentIntentId = details?.stripePaymentIntentId || initialData?.stripePaymentIntentId || "N/A";
    const paymentMethod = details?.paymentMethod || initialData?.paymentMethod || "Stripe";
    const createdAt = details?.createdAt || initialData?.createdAt;
    const rentalRequest = details?.rentalRequest || initialData?.rentalRequest;
    const tenant = rentalRequest?.user;
    const property = rentalRequest?.property;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-white/95 backdrop-blur-md">
                <DialogHeader className="space-y-2 text-left">
                    <div className="flex items-center justify-between gap-4">
                        <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
                            Payment Details
                        </DialogTitle>
                        {status && <StatusBadge status={status} />}
                    </div>
                    <DialogDescription className="text-zinc-500 text-xs">
                        View detailed information about this transaction.
                    </DialogDescription>
                </DialogHeader>

                {loading && !details ? (
                    <div className="space-y-4 py-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-10 w-1/2" />
                    </div>
                ) : (
                    <div className="space-y-5 py-2">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                    <DollarSign className="w-3.5 h-3.5 text-zinc-500" /> Amount
                                </span>
                                <p className="text-base font-bold text-zinc-900">
                                    BDT {amount?.toLocaleString() || 0}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Date
                                </span>
                                <p className="text-xs font-semibold text-zinc-800 pt-1">
                                    {createdAt ? new Date(createdAt).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short"
                                    }) : "N/A"}
                                </p>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-zinc-200/60">
                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                    <Hash className="w-3.5 h-3.5 text-zinc-500" /> Transaction ID
                                </span>
                                <p className="text-xs font-semibold text-zinc-700 font-mono">
                                    {stripePaymentIntentId}
                                </p>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-zinc-200/60">
                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                    <DollarSign className="w-3.5 h-3.5 text-zinc-500" /> Method
                                </span>
                                <p className="text-xs font-semibold text-zinc-700 capitalize">
                                    {paymentMethod}
                                </p>
                            </div>
                        </div>

                        {/* Property Info */}
                        {property && (
                            <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                                <h4 className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Related Property
                                </h4>
                                <div className="text-xs space-y-1 text-zinc-600">
                                    <p className="font-medium text-zinc-900">{property.title || "Property"}</p>
                                    <p>{property.location || "Location not specified"}</p>
                                </div>
                            </div>
                        )}

                        {/* Tenant Info */}
                        {tenant && (
                            <div className="space-y-2 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                                <h4 className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-purple-600" /> Tenant Details
                                </h4>
                                <div className="text-xs space-y-1 text-purple-800">
                                    <p className="font-medium">{tenant.name || "Tenant"}</p>
                                    <p>{tenant.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="sm:justify-end pt-2">
                    <Button variant="outline" onClick={onClose} className="rounded-2xl">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
