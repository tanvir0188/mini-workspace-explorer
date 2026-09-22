import RegisterForm from "@/components/auth/RegisterForm";
import { Suspense } from "react";

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="text-center h-screen flex items-center justify-center">Loading properties ...</div>}>
            <RegisterForm />

        </Suspense>
    );
}
