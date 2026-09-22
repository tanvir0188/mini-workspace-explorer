import { NavPathLink as Link } from "@/components/shared/NavPathLink";
import { getMe } from "@/service/getMe";
import { Home, List, Building, User, Users, Key, Filter, CreditCard } from "lucide-react";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";

export default async function Sidebar() {
    const session = await getMe();
    const user = session?.success ? session.data : null;

    if (!user) return null;

    const navLinks = (
        <nav className="flex flex-col gap-2">
            <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                <User className="w-5 h-5" />
                <span>My Profile</span>
            </Link>
            <Link href="/dashboard/workspaces" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-200 rounded-md transition-colors">
                <User className="w-5 h-5" />
                <span>My Workspaces</span>
            </Link>
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
