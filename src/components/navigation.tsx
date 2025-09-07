"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, MessageSquareQuote } from "lucide-react";

const links = [
    { href: "/", label: "Avatar", icon: Home },
    { href: "/meme-generator", label: "Memes", icon: MessageSquareQuote },
];

export function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-2 sm:gap-4">
            {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="hidden sm:inline">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
