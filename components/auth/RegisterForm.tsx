"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

import { registerAction } from "@/app/(auth)/_actions/authActions"

export default function RegisterForm() {
    const router = useRouter();
    const redirectTo = "auth/login";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setErrors({});
        setIsPending(true);

        try {
            const formData = new FormData();

            formData.append("email", email.trim());
            formData.append("password", password);
            formData.append("name", name.trim());

            const result = await registerAction(
                redirectTo,
                {
                    success: false,
                    statusCode: 200,
                    message: "",
                    data: null
                },
                formData
            );

            if (!result.success) {
                toast.error(result.message || "Registration failed.");
                return;
            }

            toast.success(result.message || "Registration successful.");

            router.push(redirectTo);
        } catch (error) {
            console.error("Registration error:", error);

            toast.error("Registration failed. Please try again.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-20 border p-6 rounded-lg shadow-sm">
            <Link href="/" className="font-bold text-center text-4xl block mb-2">RentNest</Link>
            <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

            <div>
                <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isPending}
                />
                {errors?.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
            </div>

            <div>
                <Input
                    name="password"
                    type="password"
                    placeholder="Password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isPending}
                />
                {errors?.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>

            <div>
                <Input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isPending}
                />
                {errors?.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>



            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Registering..." : "Register"}
            </Button>

            <p className="text-center mt-4">
                Already have an account?{" "}
                <Link className="text-blue-600 hover:underline" href={redirectTo ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/auth/login"}>
                    Login
                </Link>
            </p>
        </form>
    );
}

