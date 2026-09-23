"use client";

import { logout } from "@/service/logout";
import { Button } from "@/components/ui/button";
import { NavPathLink as Link } from "@/components/shared/NavPathLink";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getMe } from "@/service/getMe";
import { useEffect, useState } from "react";

export default function NavbarAuth() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentSession = getMe();

        setSession(currentSession);
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        logout();

        setSession({
            success: false,
            message: "User not logged in!"
        });
    };

    if (isLoading) {
        return null;
    }

    const user = session?.success
        ? session.data
        : null;

    if (user) {
        const userEmail = user.email;
        const userName = user.name;

        const initials = userName
            ? userName
                .substring(0, 2)
                .toUpperCase()
            : "US";

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full p-0 flex items-center justify-center cursor-pointer"
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-zinc-800 text-white font-bold text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-56"
                    align="end"
                    forceMount
                >
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {userName}
                            </p>

                            <p className="text-xs leading-none text-muted-foreground">
                                {userEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link
                            href="/dashboard"
                            className="cursor-pointer w-full flex items-center"
                        >
                            Dashboard
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link
                            href="/dashboard/workspaces"
                            className="cursor-pointer w-full flex items-center"
                        >
                            Workspaces
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    >
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <div className="flex gap-2">
            <Link href="/auth/login">
                <Button variant="outline">
                    Login
                </Button>
            </Link>

            <Link href="/auth/register">
                <Button>
                    Register
                </Button>
            </Link>
        </div>
    );
}