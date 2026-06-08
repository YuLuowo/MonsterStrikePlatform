"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { signOut, useSession } from "next-auth/react";
import LoginButton from "@/components/custom/login-button";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return null;
    }

    if (!session?.user) {
        return (
            <LoginButton />
        );
    }

    const initials =
        session.user.name?.slice(0, 2).toUpperCase() ?? "U";

    const DesktopMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="cursor-pointer rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={session.user.image ?? ""}
                            alt={session.user.name ?? ""}
                        />
                        <AvatarFallback>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span className="text-sm">
                            {session.user.name}
                        </span>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    個人資料
                </DropdownMenuItem>

                <DropdownMenuItem>
                    設定
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-500"
                >
                    登出
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const MobileMenu = (
        <div className="flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name ?? ""}
                    />
                    <AvatarFallback>
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <span>{session.user.name}</span>
            </div>
            <div className="flex flex-col px-1 gap-4">
                <span>個人資料</span>
                <span>設定</span>
            </div>
            <Button variant="destructive" onClick={() => signOut()}>
                登出
            </Button>
        </div>
    );

    return (
        <>
            <div className="hidden md:block">{DesktopMenu}</div>
            <div className="block md:hidden w-full">{MobileMenu}</div>
        </>
    );
}