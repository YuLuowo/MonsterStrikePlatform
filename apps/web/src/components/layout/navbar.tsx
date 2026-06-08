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
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetClose,
    SheetDescription
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="fixed top-4 inset-x-0 z-50 mx-3 md:mx-auto max-w-2xl px-4 border-2 border-accent/80 rounded-2xl bg-accent/30 shadow-xs backdrop-blur backdrop-saturate-100 transition-colors">
            <div className="container flex justify-between items-center h-full px-4 py-4">
                <div className="hidden md:flex justify-between items-center gap-4 w-full">
                    <div className="flex items-center gap-2 px-2">
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
                                    <Link href="/monster?page=1">圖鑑</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div className="flex justify-end items-center gap-2">
                        <ModeToggle />
                        <UserMenu />
                    </div>
                </div>

                <div className="flex md:hidden items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <span className="font-semibold">怪物彈珠平台</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <Sheet>
                            <SheetTrigger asChild>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon">
                                        <Menu />
                                    </Button>
                                </div>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle className="text-xl font-semibold">選單</SheetTitle>
                                    <SheetDescription>部分功能尚未完成，未來陸續增加</SheetDescription>
                                </SheetHeader>
                                <nav className="flex flex-col gap-3 px-4">
                                    <SheetClose asChild>
                                        <Link href="/" className="text-base">主頁</Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link href="/monster?page=1" className="text-base">圖鑑</Link>
                                    </SheetClose>
                                    <div className="flex items-center gap-4 pt-4 border-t">
                                        <UserMenu />
                                    </div>
                                </nav>
                                <SheetFooter />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
