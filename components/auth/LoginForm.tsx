"use client"
import { useActionState, useEffect, useTransition } from "react"
import { loginAction, fastLoginDemoAction, googleLoginAction } from "@/app/(auth)/_actions/authActions"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginForm() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "";

    // Connect to server action
    const [state, action, pending] = useActionState(loginAction.bind(null, redirectTo), null as any);
    const [isFastLoginPending, startFastLogin] = useTransition();

    useEffect(() => {
        if (!state) return;
        if (!state.success) toast.error(state.message || "Login failed");
    }, [state]);

    const handleFastLogin = (role: "tenant" | "landlord" | "admin") => {
        startFastLogin(async () => {
            const result = await fastLoginDemoAction(role, redirectTo);
            if (result && !result.success) {
                toast.error(result.message || "Fast login failed");
            }
        });
    };

    const isPending = pending || isFastLoginPending;

    return (
        <form action={action} className="space-y-4 max-w-sm mx-auto mt-20 border p-6 rounded-lg shadow-sm">
            <Link href="/" className="font-bold text-center text-4xl block mb-2">RentNest</Link>
            <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
            <Input name="email" type="email" placeholder="Email" defaultValue={state?.data?.email || ""} required disabled={isPending} />
            {state?.errors?.email && <p className="text-red-500">{state.errors.email[0]}</p>}
            <Input name="password" type="password" placeholder="Password" defaultValue={state?.data?.password || ""} required disabled={isPending} />
            {state?.errors?.password && <p className="text-red-500">{state.errors.password[0]}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Logging in..." : "Login"}
            </Button>

            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                <Button type="button" variant="default" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isPending} onClick={() => googleLoginAction()}>
                    Continue with Google
                </Button>
                <Button type="button" variant="outline" className="w-full" disabled={isPending} onClick={() => handleFastLogin("tenant")}>
                    Continue as Tenant
                </Button>
                <Button type="button" variant="outline" className="w-full" disabled={isPending} onClick={() => handleFastLogin("landlord")}>
                    Continue as Landlord
                </Button>
                <Button type="button" variant="outline" className="w-full" disabled={isPending} onClick={() => handleFastLogin("admin")}>
                    Continue as Admin
                </Button>
            </div>

            <p className="text-center mt-4">Don't have an account? <Link className="text-blue-600 hover:underline" href="/auth/register">Register</Link></p>
        </form>
    );
}
