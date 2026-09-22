import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
    "/",
    "/about",
];

const AUTH_ROUTES = [
    "/auth/login",
    "/auth/register",
];

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const isPublicRoute = PUBLIC_ROUTES.some(
        (route) =>
            pathname === route ||
            pathname.startsWith(route + "/")
    );

    const isAuthRoute = AUTH_ROUTES.some(
        (route) =>
            pathname === route ||
            pathname.startsWith(route + "/")
    );

    return NextResponse.next();
}