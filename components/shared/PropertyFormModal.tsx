"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createProperty, updateProperty } from "@/app/dashboard/landlord/_actions/landlordActions";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { PropertyImage } from "@/components/shared/PropertyImage";

export interface PropertyFormModalProps {
    open: boolean;
    initialData?: any | null;
    categories: any[];
    amenities: any[];
    isViewOnly?: boolean;
    onSetEditMode?: () => void;
    onClose: () => void;
    onSuccess?: () => void;
    isAdmin?: boolean;
}

export function PropertyFormModal({ open, initialData, categories, amenities: amenitiesList, isViewOnly, onSetEditMode, onClose, onSuccess, isAdmin }: PropertyFormModalProps) {
    const router = useRouter();
    const isEdit = Boolean(initialData?.id);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        price: "",
        type: "",
        location: "",
        description: "",
        categoryId: "",
        amenities: [] as string[],
        isAvailable: true,
        landLordId: "",
        image: "" as string | File
    });

    useEffect(() => {
        if (open && !isEdit && categories.length > 0 && !form.categoryId) {
            setForm(prev => ({ ...prev, categoryId: categories[0].id }));
        }
    }, [open, isEdit, categories]);

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title || "",
                price: initialData.price ? String(initialData.price) : "",
                type: initialData.type || "Apartment",
                location: initialData.location || "",
                description: initialData.description || "",
                categoryId: initialData.categoryId || "",
                amenities: initialData.amenities || [],
                isAvailable: initialData.isAvailable ?? true,
                landLordId: initialData.landLordId || "",
                image: initialData.image || ""
            });
        } else {
            setForm(prev => ({
                title: "",
                price: "",
                type: "Apartment",
                location: "",
                description: "",
                categoryId: prev.categoryId, // Keep the initially set category ID from filters if any
                amenities: [],
                isAvailable: true,
                landLordId: "",
                image: ""
            }));
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        const payloadData: any = {
            title: form.title,
            price: Number(form.price),
            type: form.type,
            location: form.location,
            description: form.description,
            categoryId: form.categoryId,
            amenities: form.amenities,
            isAvailable: form.isAvailable,
            ...(isAdmin && form.landLordId ? { landLordId: form.landLordId } : {})
        };

        if (form.image instanceof File) {
            formData.append("file", form.image);
        } else if (typeof form.image === 'string' && form.image.trim() !== "") {
            payloadData.image = form.image;
        }

        formData.append("data", JSON.stringify(payloadData));

        try {
            const res = isEdit
                ? await updateProperty(initialData.id, formData)
                : await createProperty(formData);

            if (res.success) {
                toast.success(res.message);
                router.refresh();
                onClose();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.message || "Failed to save property");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (id: string) => {
        if (isViewOnly) return;
        setForm(prev => {
            const isSelected = prev.amenities.includes(id);
            if (isSelected) {
                return { ...prev, amenities: prev.amenities.filter(a => a !== id) };
            } else {
                return { ...prev, amenities: [...prev.amenities, id] };
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white overflow-y-auto max-h-[90vh]">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl font-bold">
                        {isViewOnly ? "Property Details" : (isEdit ? "Edit Property" : "Add New Property")}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                        {isViewOnly ? "Review the details of this property." : (isEdit ? "Update your property details below." : "Fill in the property details to list it for rent.")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {form.image && (
                        <div className="rounded-2xl overflow-hidden border border-zinc-100 h-48 w-full bg-zinc-50 relative">
                            <PropertyImage
                                src={typeof form.image === 'string' ? form.image : URL.createObjectURL(form.image)}
                                alt={form.title || "Property Image"}
                                fill
                                sizes="(max-width: 448px) 100vw, 448px"
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs font-semibold">Title</Label>
                        <Input
                            id="title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Modern 2 Bedroom Apartment"
                            required
                            disabled={isViewOnly}
                            className="rounded-xl disabled:opacity-100 disabled:bg-zinc-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="price" className="text-xs font-semibold">Rent Price (BDT)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="25000"
                                required
                                disabled={isViewOnly}
                                className="rounded-xl disabled:opacity-100 disabled:bg-zinc-50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="type" className="text-xs font-semibold">Property Type</Label>
                            <Input
                                id="type"
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                placeholder="e.g. Apartment"
                                required
                                disabled={isViewOnly}
                                className="rounded-xl disabled:opacity-100 disabled:bg-zinc-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="location" className="text-xs font-semibold">Location</Label>
                            <Input
                                id="location"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                placeholder="e.g. Dhanmondi, Dhaka"
                                required
                                disabled={isViewOnly}
                                className="rounded-xl disabled:opacity-100 disabled:bg-zinc-50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="category" className="text-xs font-semibold">Category</Label>
                            <select
                                id="category"
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-100 disabled:bg-zinc-50"
                                required
                                disabled={isViewOnly}
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="image" className="text-xs font-semibold">Property Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setForm({ ...form, image: file });
                                }
                            }}
                            disabled={isViewOnly}
                            className="rounded-xl disabled:opacity-100 disabled:bg-zinc-50"
                        />
                    </div>

                    {amenitiesList.length > 0 && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Amenities</Label>
                            <div className="flex flex-wrap gap-2">
                                {amenitiesList.map(amenity => (
                                    <Badge
                                        key={amenity.id}
                                        variant={form.amenities.includes(amenity.id) ? "default" : "outline"}
                                        className={isViewOnly ? "opacity-90" : "cursor-pointer"}
                                        onClick={() => toggleAmenity(amenity.id)}
                                    >
                                        {amenity.title}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="space-y-1.5">
                            <Label htmlFor="landLordId" className="text-xs font-semibold">Landlord ID (Admin Only)</Label>
                            <Input
                                id="landLordId"
                                value={form.landLordId}
                                onChange={(e) => setForm({ ...form, landLordId: e.target.value })}
                                placeholder="Paste Landlord User ID here..."
                                disabled={isViewOnly}
                                className="rounded-xl disabled:opacity-100 disabled:bg-zinc-50"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                        <Textarea
                            id="description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe your property..."
                            rows={3}
                            disabled={isViewOnly}
                            className="rounded-xl text-xs disabled:opacity-100 disabled:bg-zinc-50"
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-semibold">Availability</Label>
                            <p className="text-[11px] text-zinc-500">Mark if property is currently available for rent</p>
                        </div>
                        <Switch
                            checked={form.isAvailable}
                            disabled={isViewOnly}
                            onCheckedChange={(val) => setForm({ ...form, isAvailable: val })}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                            {isViewOnly ? "Close" : "Cancel"}
                        </Button>
                        {isViewOnly ? (
                            <Button key="edit-btn" type="button" onClick={(e) => { e.preventDefault(); onSetEditMode?.(); }} className="rounded-xl">
                                Edit Property
                            </Button>
                        ) : (
                            <Button key="submit-btn" type="submit" disabled={loading} className="rounded-xl gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isEdit ? "Update Property" : "Create Property"}</span>
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
