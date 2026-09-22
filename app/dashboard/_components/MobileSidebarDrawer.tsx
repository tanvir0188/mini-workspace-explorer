"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function MobileSidebarDrawer({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden border-b bg-zinc-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                            <Menu className="w-4 h-4" />
                            <span>Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-6">
                        <SheetHeader className="p-0 mb-6 text-left">
                            <SheetTitle className="text-lg font-bold">Dashboard Menu</SheetTitle>
                        </SheetHeader>
                        <div onClick={() => setOpen(false)}>
                            {children}
                        </div>
                    </SheetContent>
                </Sheet>
                <span className="font-semibold text-sm">Dashboard</span>
            </div>
        </div>
    );
}
