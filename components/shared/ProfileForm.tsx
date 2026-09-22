"use client"

import * as React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile } from "@/service/updateProfile"
import { Loader2, User, Mail, FileText, Image as ImageIcon } from "lucide-react"

import { useRouter } from "next/navigation"

export interface ProfileFormProps {
    initialData?: {
        name?: string;
        bio?: string;
        email?: string;
        profilePhoto?: string;
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const router = useRouter()
    const [name, setName] = useState(initialData?.name || "")
    const [bio, setBio] = useState(initialData?.bio || "")
    const [email, setEmail] = useState(initialData?.email || "")
    const [profilePhoto, setProfilePhoto] = useState<string | File>(initialData?.profilePhoto || "")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData();
        const payloadData: any = {
            name,
            bio,
            email,
        };

        if (profilePhoto instanceof File) {
            formData.append("file", profilePhoto);
        } else if (typeof profilePhoto === 'string' && profilePhoto.trim() !== "") {
            payloadData.profilePhoto = profilePhoto;
        }

        formData.append("data", JSON.stringify(payloadData));

        try {
            const res = await updateProfile(formData)

            if (res.success) {
                toast.success(res.message || "Profile updated successfully!")
                router.refresh()
            } else {
                toast.error(res.message || "Failed to update profile.")
            }
        } catch (error) {
            console.error("Profile form submission failed", error)
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    const initials = name
        ? name.substring(0, 2).toUpperCase()
        : email
            ? email.substring(0, 2).toUpperCase()
            : "US"

    return (
        <Card className="max-w-xl mx-auto shadow-xl border border-zinc-200/50 bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight bg-linear-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
                    Profile Settings
                </CardTitle>
                <CardDescription className="text-zinc-500">
                    Update your personal profile information and settings.
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Avatar Preview Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                            <AvatarImage src={typeof profilePhoto === 'string' ? profilePhoto : (profilePhoto instanceof File ? URL.createObjectURL(profilePhoto) : "")} alt={name || "Profile Picture"} />
                            <AvatarFallback className="bg-zinc-800 text-white text-xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left space-y-1">
                            <h4 className="font-semibold text-zinc-900">{name || "Your Name"}</h4>
                            <p className="text-xs text-zinc-500 max-w-xs break-all">
                                {email || "No email set"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-zinc-400" />
                                Full Name
                            </label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rounded-2xl"
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-zinc-400" />
                                Email Address
                            </label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-2xl"
                                required
                            />
                        </div>

                        {/* Profile Photo Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-zinc-400" />
                                Profile Photo
                            </label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setProfilePhoto(file);
                                    }
                                }}
                                className="rounded-2xl"
                            />
                        </div>

                        {/* Bio Textarea */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-zinc-400" />
                                Short Bio
                            </label>
                            <textarea
                                placeholder="Tell us about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="min-h-25 w-full rounded-2xl border border-input bg-input/30 px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-4xl px-6 font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {isLoading ? "Saving changes..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
