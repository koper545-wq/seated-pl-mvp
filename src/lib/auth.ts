import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.user.findUnique({
          where: { email },
          include: {
            guestProfile: true,
            hostProfile: true,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name:
            user.guestProfile?.firstName ||
            user.hostProfile?.businessName ||
            user.email,
          userType: user.userType,
          image: user.guestProfile?.avatarUrl || user.hostProfile?.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in - create user if doesn't exist
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.email) return false;

        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
            include: { guestProfile: true },
          });

          if (!existingUser) {
            // Create new user with GuestProfile
            const firstName = account.provider === "google"
              ? (profile as { given_name?: string })?.given_name || user.name?.split(' ')[0] || ''
              : user.name?.split(' ')[0] || '';
            const lastName = account.provider === "google"
              ? (profile as { family_name?: string })?.family_name || user.name?.split(' ').slice(1).join(' ') || ''
              : user.name?.split(' ').slice(1).join(' ') || '';

            await db.user.create({
              data: {
                email: user.email,
                passwordHash: "", // OAuth users don't have password
                userType: "GUEST",
                emailVerified: new Date(),
                ageVerified: true,
                guestProfile: {
                  create: {
                    firstName,
                    lastName,
                    avatarUrl: user.image || null,
                  },
                },
              },
            });
          } else if (!existingUser.guestProfile) {
            // User exists but no profile - create one
            await db.guestProfile.create({
              data: {
                userId: existingUser.id,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                avatarUrl: user.image || null,
              },
            });
          }
        } catch (error) {
          console.error("OAuth signIn error:", error);
          console.error("OAuth signIn error details:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For OAuth, we need to fetch the user from DB to get the ID
        if (account?.provider === "google" || account?.provider === "facebook") {
          const dbUser = await db.user.findUnique({
            where: { email: user.email! },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.userType = dbUser.userType;
          }
        } else {
          token.id = user.id as string;
          token.userType = (user as { userType?: string }).userType || "GUEST";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
      }
      return session;
    },
  },
});
