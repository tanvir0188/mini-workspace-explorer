"use client"
import { useState, useTransition } from "react"
import {
    loginAction,
} from "@/app/(auth)/_actions/authActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { LoginSchema } from "@/lib/types"
import { StoredUsers } from "@/lib/storedDataTypes/user"
import { useRouter, useSearchParams } from "next/navigation";
import { useRedirectToDashboard } from "@/utils/redirectToDashboard";

export default function LoginForm() {
    useRedirectToDashboard();
    const router = useRouter();
    const redirectTo = "/dashboard";

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
                email: email.trim().toLowerCase(),
                password
            };

            const validated = LoginSchema.safeParse(formData);

            if (!validated.success) {
                setErrors(
                    validated.error.flatten().fieldErrors
                );

                return;
            }

            const users: StoredUsers = JSON.parse(
                localStorage.getItem("users") || "[]"
            );

            const existUser = users.find(
                (user) =>
                    user.email === formData.email &&
                    user.password === formData.password
            );

            if (!existUser) {
                toast.error("Invalid email or password");

                setErrors({
                    email: ["Invalid email"],
                    password: ["Invalid password"]
                });

                return;
            }

            const result = await loginAction(redirectTo, existUser);

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            toast.success(result.message);

            // Redirect after successful login
            window.location.href = redirectTo || "/dashboard";
        } catch (error) {
            console.error("Login error:", error);
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

