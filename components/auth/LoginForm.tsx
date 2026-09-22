"use client"
import { useState, useTransition } from "react"
import {
    loginAction,
} from "@/app/(auth)/_actions/authActions"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { LoginSchema } from "@/lib/types"
import { StoredUsers } from "@/lib/storedDataTypes/user"

export default function LoginForm() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const formData = {
                email: email.trim(),
                password,
            };

            const result = await loginAction(formData);
            if (result && !result.success) {
                toast.error(result.message || "Invalid credentials or user not found.");
                if (result.error) {
                    setErrors(result.error);
                }
            }
        } catch (err: any) {
            if (err?.message?.includes("NEXT_REDIRECT")) {
                return;
            }
            console.error("Login error:", err);
            toast.error("Login failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPending = isSubmitting;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-20 border p-6 rounded-lg shadow-sm">
            <Link href="/" className="font-bold text-center text-4xl block mb-2">RentNest</Link>
            <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isPending}
                />
                {errors?.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center mt-4">Don't have an account? <Link className="text-blue-600 hover:underline" href={redirectTo ? `/auth/register?redirectTo=${encodeURIComponent(redirectTo)}` : "/auth/register"}>Register</Link></p>
        </form>
    );
}

