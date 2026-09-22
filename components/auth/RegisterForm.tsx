"use client"
import { useActionState, useEffect } from "react"
import { registerAction, googleLoginAction } from "@/app/(auth)/_actions/authActions"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { SelectValue } from "../ui/select"
import Link from "next/link"


export default function RegisterForm() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "";

    // Connect to server action
    const [state, action, pending] = useActionState(registerAction.bind(null, redirectTo), null as any);

    useEffect(() => {
        if (!state) return;
        if (!state.success && state.statusCode === 400) toast.error(state.message || "Registration failed");
        if (!state.success && state.statusCode === 500) toast.error(state.message || "Registration failed");
        if (state.success) toast.success(state.message || "Registration successful");
    }, [state]);

    return (
        <form action={action} className="space-y-4 max-w-sm mx-auto mt-20 border p-6 rounded-lg shadow-sm">
            <Link href="/" className="font-bold text-center text-4xl block mb-2">RentNest</Link>
            <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
            <Input name="email" type="email" placeholder="Email" defaultValue={state?.data?.email || ""} required />
            {state?.errors?.email && <p className="text-red-500">{state.errors.email[0]}</p>}
            <Input name="password" type="password" placeholder="Password" defaultValue={state?.data?.password || ""} required />
            {state?.errors?.password && <p className="text-red-500">{state.errors.password[0]}</p>}
            <Input name="name" type="text" placeholder="Name" defaultValue={state?.data?.name || ""} required />
            {state?.errors?.name && <p className="text-red-500">{state.errors.name[0]}</p>}

            <Select name="role" defaultValue={state?.data?.role || ""} required>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="LANDLORD">Landlord</SelectItem>
                    <SelectItem value="TENANT">Tenant</SelectItem>
                </SelectContent>
            </Select>

            {state?.errors?.role && <p className="text-red-500">{state.errors.role[0]}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Registering..." : "Register"}
            </Button>

            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                <Button type="button" variant="default" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={pending} onClick={() => googleLoginAction()}>
                    Continue with Google
                </Button>
            </div>

            <p className="text-center mt-4">Already have an account? <Link className="text-blue-600 hover:underline" href="/auth/login">Login</Link></p>
        </form>

    );
}
