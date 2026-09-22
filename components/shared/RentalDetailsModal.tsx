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
import { getRentalDetails, createCheckoutSession } from "@/app/dashboard/tenant/_actions/tenantActions";
import { MapPin, DollarSign, Calendar, Home, User, Mail, Info, Loader2, CreditCard, Star } from "lucide-react";
import { toast } from "sonner";
import { ReviewModal } from "./ReviewModal";
import { PropertyImage } from "@/components/shared/PropertyImage";

export interface RentalDetailsModalProps {
    rentalId: string | null;
    initialData?: any;
    onClose: () => void;
    fetchDetailsAction?: (rentalId: string) => Promise<{ success: boolean; data?: any }>;
    isTenant?: boolean;
}

export function RentalDetailsModal({
    rentalId,
    initialData,
    onClose,
    fetchDetailsAction = getRentalDetails,
    isTenant = false
}: RentalDetailsModalProps) {
    const [details, setDetails] = useState<any>(initialData || null);
    const [loading, setLoading] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        if (!rentalId) return;

        let isMounted = true;
        setLoading(true);

        fetchDetailsAction(rentalId)
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setDetails(res.data);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [rentalId, fetchDetailsAction]);

    const handlePayment = async () => {
        if (!rentalId) return;
        setIsCheckingOut(true);
        const res = await createCheckoutSession(rentalId);
        if (res.success && res.url) {
            window.location.href = res.url;
        } else {
            setIsCheckingOut(false);
            toast.error(res.message || "Failed to initiate payment");
        }
    };

    const isOpen = Boolean(rentalId);

    const property = details?.property || initialData?.property;
    const landlord = details?.landlord || property?.landlord;
    const tenant = details?.tenant || details?.user || initialData?.tenant || initialData?.user;
    const status = details?.status || initialData?.status;
    const createdAt = details?.createdAt || initialData?.createdAt;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-white/95 backdrop-blur-md">
                <DialogHeader className="space-y-2 text-left">
                    <div className="flex items-center justify-between gap-4">
                        <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
                            {property?.title || "Rental Request Details"}
                        </DialogTitle>
                        {status && <StatusBadge status={status} />}
                    </div>
                    <DialogDescription className="text-zinc-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {property?.location || "Location not specified"}
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
                        {property?.image && (
                            <div className="rounded-2xl overflow-hidden border border-zinc-100 h-40 w-full bg-zinc-50 relative">
                                <PropertyImage
                                    src={property.image}
                                    alt={property.title || "Property Image"}
                                    fill
                                    sizes="(max-width: 512px) 100vw, 512px"
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                    <DollarSign className="w-3.5 h-3.5 text-zinc-500" /> Rent Price
                                </span>
                                <p className="text-base font-bold text-zinc-900">
                                    BDT {property?.price?.toLocaleString() || 0} <span className="text-xs font-normal text-zinc-500">/ mo</span>
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                    <Home className="w-3.5 h-3.5 text-zinc-500" /> Property Type
                                </span>
                                <p className="text-sm font-semibold text-zinc-800 capitalize">
                                    {property?.type || "Standard"}
                                </p>
                            </div>

                            <div className="space-y-1 col-span-2 pt-2 border-t border-zinc-200/60">
                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Requested On
                                </span>
                                <p className="text-xs font-semibold text-zinc-700">
                                    {createdAt ? new Date(createdAt).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short"
                                    }) : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Property Description */}
                        {property?.description && (
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-zinc-400" /> About Property
                                </h4>
                                <p className="text-xs text-zinc-600 leading-relaxed p-3 rounded-xl bg-zinc-50/50 border border-zinc-100">
                                    {property.description}
                                </p>
                            </div>
                        )}

                        {/* Landlord Contact Info */}
                        {landlord && (
                            <div className="space-y-2 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                                <h4 className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-blue-600" /> Landlord Details
                                </h4>
                                <div className="text-xs space-y-1 text-blue-800">
                                    <p className="font-medium">{landlord.name || "Landlord"}</p>
                                    {landlord.email && (
                                        <p className="flex items-center gap-1.5 text-blue-600">
                                            <Mail className="w-3 h-3" /> {landlord.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tenant Contact Info (if present) */}
                        {tenant && (
                            <div className="space-y-2 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                                <h4 className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-purple-600" /> Tenant Details
                                </h4>
                                <div className="text-xs space-y-1 text-purple-800">
                                    <p className="font-medium">{tenant.name || "Tenant"}</p>
                                    {tenant.email && (
                                        <p className="flex items-center gap-1.5 text-purple-600">
                                            <Mail className="w-3 h-3" /> {tenant.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="sm:justify-end pt-2 gap-2">
                    <Button variant="outline" onClick={onClose} className="rounded-2xl">
                        Close
                    </Button>
                    {isTenant && status === "APPROVED" && (
                        <Button
                            onClick={handlePayment}
                            disabled={isCheckingOut}
                            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isCheckingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                            Make Payment
                        </Button>
                    )}
                    {isTenant && status === "ACTIVE" && (
                        <Button
                            onClick={() => setShowReviewModal(true)}
                            className="rounded-2xl bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Star className="w-4 h-4 mr-2" />
                            Leave Review
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
            {showReviewModal && (
                <ReviewModal
                    rentalRequestId={rentalId}
                    onClose={() => setShowReviewModal(false)}
                />
            )}
        </Dialog>
    );
}
