import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-center h-screen flex items-center justify-center">Loading properties ...</div>}>
            <LoginForm />
        </Suspense>
    );
}
