'use client';

import { HomeIcon, ProfileIcon } from "./icons/page";
import { Button, Divider } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export const Sidebar = () => {
    const router = useRouter();

    const currentRoute = usePathname();

    const navItems = [
        { href: "/dashboard", icon: HomeIcon, label: "Home" },
        { href: "/profile", icon: HomeIcon, label: "Profile" },
        { href: "/settings", icon: HomeIcon, label: "Settings" },
    ];

    return (
        <div key="side-bar" className="w-20 flex flex-col items-center gap-4 py-20">
            {navItems.map((item) => {
            const isActive = currentRoute === item.href;
            const Icon = item.icon;
            return (
                <Button
                key={item.href}
                color="primary"
                variant="light"
                onPress={() => router.replace(item.href)} isIconOnly
                className={`${isActive ? "bg-red-700" : ""}`}
                >
                <Icon />
                </Button>
            );
            })}
            <Divider className="bg-black" orientation="vertical" />
        </div>
    );
}