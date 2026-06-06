import type { NextAuthOptions, Session } from "next-auth";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@repo/db";

export interface AuthSession extends Session {
    user: Session["user"] & {
        id: string;
    };
}

interface DiscordProfile {
    id: string;
    username: string;
    global_name?: string;
    banner?: string;
    image_url?: string;
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID || "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            const authSession = session as AuthSession;
            if (authSession.user) {
                authSession.user.id = token.id as string;
            }
            return authSession;
        },
        async signIn({ user, profile }) {
            const discordProfile = profile as DiscordProfile;

            if (discordProfile && user?.id) {
                try {
                    const bannerUrl = discordProfile?.banner
                        ? `https://cdn.discordapp.com/banners/${discordProfile.id}/${discordProfile.banner}.png`
                        : null;

                    await prisma.user.upsert({
                        where: {
                            id: user.id,
                        },
                        update: {
                            name: discordProfile.global_name,
                            username: discordProfile.username,
                            banner: bannerUrl,
                            discordId: discordProfile.id,
                        },
                        create: {
                            id: user.id,
                            name: discordProfile.global_name,
                            username: discordProfile.username,
                            email: user.email,
                            image: user.image,
                            banner: bannerUrl,
                            discordId: discordProfile.id,
                        },
                    });
                } catch (error) {
                    console.error("Upsert user failed:", error);
                }
            }
            return true;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const handler = NextAuth(authOptions);
export const auth = handler;
