import { NavPathLink as Link } from "@/components/shared/NavPathLink";
import { getMe } from "@/service/getMe";
import { Home, List, Building, User, Users, Key, Filter, CreditCard } from "lucide-react";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";

export default async function Sidebar() {
    const session = await getMe();
    const user = session?.success ? session.data : null;

    if (!user) return null;

    const role = user.profile.role;

    const navLinks = (
        <nav className="flex flex-col gap-2">
            {role === "TENANT" && (
                <>
                    <Link href="/dashboard/tenant" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Home className="w-5 h-5" />
                        <span>Overview</span>
                    </Link>
                    <Link href="/dashboard/tenant/requests" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <List className="w-5 h-5" />
                        <span>Rental Requests</span>
                    </Link>
                    <Link href="/dashboard/tenant/payments" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <CreditCard className="w-5 h-5" />
                        <span>Payments</span>
                    </Link>
                    <Link href="/dashboard/tenant/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                    </Link>
                </>
            )}

            {role === "LANDLORD" && (
                <>
                    <Link href="/dashboard/landlord" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Home className="w-5 h-5" />
                        <span>Overview</span>
                    </Link>
                    <Link href="/dashboard/landlord/properties" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Building className="w-5 h-5" />
                        <span>My Properties</span>
                    </Link>
                    <Link href="/dashboard/landlord/requests" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <List className="w-5 h-5" />
                        <span>Rental Requests</span>
                    </Link>
                    <Link href="/dashboard/landlord/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                    </Link>
                </>
            )}

            {role === "ADMIN" && (
                <>
                    <Link href="/dashboard/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Home className="w-5 h-5" />
                        <span>Overview</span>
                    </Link>
                    <Link href="/dashboard/admin/users" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Users className="w-5 h-5" />
                        <span>Users</span>
                    </Link>
                    <Link href="/dashboard/admin/rentals" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Key className="w-5 h-5" />
                        <span>Rentals</span>
                    </Link>
                    <Link href="/dashboard/admin/properties" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Building className="w-5 h-5" />
                        <span>Properties</span>
                    </Link>
                    <Link href="/dashboard/admin/payments" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <CreditCard className="w-5 h-5" />
                        <span>Payments</span>
                    </Link>
                    <Link href="/dashboard/admin/filters" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                    </Link>
                    <Link href="/dashboard/admin/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                    </Link>
                </>
            )}

            {role !== "TENANT" && role !== "LANDLORD" && role !== "ADMIN" && (
                <div className="px-4 py-2 text-muted-foreground italic">
                    No links configured for {role}.
                </div>
            )}
        </nav>
    );

    return (
        <>
            {/* Mobile Drawer Trigger Bar */}
            <MobileSidebarDrawer>
                {navLinks}
            </MobileSidebarDrawer>

            {/* Desktop Fixed Sidebar */}
            <aside className="hidden md:flex w-64 bg-zinc-50 border-r min-h-full p-4 flex-col gap-4 shrink-0">
                <h2 className="text-lg font-bold mb-4 px-2">Dashboard</h2>
                {navLinks}
            </aside>
        </>
    );
}
