"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { postReview } from "@/app/dashboard/tenant/_actions/tenantActions";
import { useRouter } from "next/navigation";

export interface ReviewModalProps {
    rentalRequestId: string | null;
    onClose: () => void;
}

export function ReviewModal({ rentalRequestId, onClose }: ReviewModalProps) {
    const router = useRouter();
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isOpen = Boolean(rentalRequestId);

    const handleSubmit = async () => {
        if (!rentalRequestId) return;
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }

        setIsSubmitting(true);
        const res = await postReview({
            rentalRequestId,
            rating,
            comment
        });
        setIsSubmitting(false);

        if (res.success) {
            toast.success("Review submitted successfully!");
            router.refresh();
            onClose();
        } else {
            toast.error(res.message || "Failed to submit review.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white/95 backdrop-blur-md">
                <DialogHeader className="space-y-2 text-left">
                    <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
                        Leave a Review
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm">
                        Share your experience about this rental property and landlord.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center space-y-2">
                        <span className="text-sm font-medium text-zinc-700">Rating</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${(hoverRating || rating) >= star
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-zinc-300"
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Comment</label>
                        <Textarea
                            placeholder="Tell us about your stay..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-25 rounded-xl resize-none bg-zinc-50 border-zinc-200"
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={onClose} className="rounded-2xl" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Review"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
