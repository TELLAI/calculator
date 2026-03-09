import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      organizationId: string | null;
      organizationName: string | null;
    };
  }
  interface User {
    role: string;
    organizationId: string | null;
    organizationName: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            profile: {
              include: { organization: true },
            },
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.profile?.role ?? "user",
          organizationId: user.profile?.organization_id ?? null,
          organizationName: user.profile?.organization?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role as string;
        token.organizationId = user.organizationId as string | null;
        token.organizationName = user.organizationName as string | null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as string) ?? "user";
        session.user.organizationId = (token.organizationId as string | null) ?? null;
        session.user.organizationName = (token.organizationName as string | null) ?? null;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
});
