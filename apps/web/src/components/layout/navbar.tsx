"use client"

import * as React from "react"
import Link from "next/link"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/custom/mode-toggle";
import UserMenu from "@/components/custom/user-menu";

export function Navbar() {
    return (
        <header className="fixed top-4 inset-x-0 z-50 mx-4 md:mx-auto max-w-4xl px-4 border-2 border-accent/80 rounded-2xl bg-accent/10 shadow-xs backdrop-blur backdrop-saturate-100 transition-colors">
            <div className="container flex justify-between items-center h-full px-4 py-4">
                <div className="hidden md:flex justify-between items-center gap-4 w-full">
                    <div className="flex items-center gap-2 px-2">
                        {/*icon*/}
                        <Link href="/">
                            <span className="font-semibold text-lg">怪物彈珠平台</span>
                        </Link>
                    </div>
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href="/">主頁</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href="/">圖鑑</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div className="flex justify-end items-center gap-2">
                        <ModeToggle />
                        <UserMenu />
                    </div>
                </div>
            </div>
        </header>
    )
}
