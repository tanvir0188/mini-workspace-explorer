// import { cookies } from 'next/headers';
import configuration from "@/config/config";
import { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtUtils } from "./utils/jwt";
import { getNewAccessToken } from "./service/refreshToken";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];
// const PUBLIC_ROUTES = ["/", "/news", "/login", "/register"]
const PUBLIC_ROUTES = ["/", "/properties"]

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const cookieStore = await cookies();
    // const accessToken = cookieStore.get("accessToken")?.value;



    let accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    let decodedAccessToken = accessToken ? jwtUtils.verifyToken(accessToken, configuration.access_secret) : null;

    const decodedRefreshToken = refreshToken ? jwtUtils.verifyToken(refreshToken, configuration.refresh_secret) : null;

    if (!decodedAccessToken?.success && decodedRefreshToken?.success) {
        //access token has expired but refresh token is valid, get new access token from backend
        const result = await getNewAccessToken();

        if (result.success) {
            const newAccessToken = result.data.accessToken;

            cookieStore.set("accessToken", newAccessToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 24,
                sameSite: "lax",
            });

            accessToken = newAccessToken;
            decodedAccessToken = jwtUtils.verifyToken(accessToken!, configuration.access_secret);


        }
    }


    let userRole = null;

    if (!decodedAccessToken?.success) {
        //token has expired or is invalid, clear the cookies
        cookieStore.delete("accessToken");
        // return NextResponse.redirect(new URL('/login', request.url));
    }

    if (decodedAccessToken?.success && decodedAccessToken.data) {
        userRole = (decodedAccessToken.data as JwtPayload).role;
    }

    //user is logged in and trying to access login or register page, redirect to dashboard or root home page
    if (accessToken && AUTH_ROUTES.includes(pathname)) {
        if (userRole === "ADMIN") {
            return NextResponse.redirect(new URL('/dashboard/admin', request.url));
        } else if (userRole === "TENANT") {
            return NextResponse.redirect(new URL('/dashboard/tenant', request.url));
        } else if (userRole === "LANDLORD") {
            return NextResponse.redirect(new URL('/dashboard/landlord', request.url));
        } else {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

    // Authenticated Pages Protection : Authorization is not handled yet
    if (!accessToken && !isPublicRoute && !isAuthRoute) {
        const loginUrl = new URL('/auth/login', request.url)

        loginUrl.searchParams.set("redirectTo", pathname)

        return NextResponse.redirect(loginUrl);
    }

    // Authorization : Role based access control
    if (pathname.startsWith("/dashboard/admin") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL('/not-found', request.url));
    } else if (pathname.startsWith("/dashboard/tenant") && userRole !== "TENANT") {
        return NextResponse.redirect(new URL('/not-found', request.url));
    } else if (pathname.startsWith("/dashboard/landlord") && userRole !== "LANDLORD") {
        return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // const subscriptionStatus = await getSubscriptionStatus();

    // const isActive = Boolean(
    //     subscriptionStatus?.success && subscriptionStatus.data?.isSubscribed,
    // );

    // if (pathname === "/premium") {
    //     const subscriptionStatus = await getSubscriptionStatus();

    //     const isActive = Boolean(
    //         subscriptionStatus?.success && subscriptionStatus.data?.isSubscribed,
    //     );

    //     if (!isActive) {
    //         return NextResponse.redirect(new URL("/payment", request.url))
    //     }
    // }

    // if(pathname === "/payment"){
    //     // const subscriptionStatus = await getSubscriptionStatus();

    //     // const isActive = Boolean(
    //     //     subscriptionStatus?.success && subscriptionStatus.data?.isSubscribed,
    //     // );

    //     if (isActive) {
    //         return NextResponse.redirect(new URL("/premium", request.url))
    //     }
    // }

    // return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
}

export const config = {
    matcher: [
        // '/dashboard/:path*',
        // '/admin/:path*',
        '/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)'
    ],
}