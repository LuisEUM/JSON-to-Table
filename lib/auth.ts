import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { UserRole } from "@prisma/client";

// Función para determinar el rol basado en el dominio del correo
const getRoleFromEmail = (email: string): UserRole => {
  const lowercaseEmail = email.toLowerCase();
  if (
    lowercaseEmail.endsWith("@insidesalons.com") ||
    lowercaseEmail.endsWith("@insidehair.es")
  ) {
    return "EMPLOYEE";
  }
  return "CLIENT";
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    // signOut: '/auth/signout',
    // error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async signIn({ user, account }) {
      // Si es un nuevo usuario que se registra con Google, asignar rol según el dominio
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser && user.email) {
          // Es un nuevo usuario, asignar rol según el dominio
          const role = getRoleFromEmail(user.email);
          // No es necesario crear el usuario aquí, el adaptador lo hace
          // pero actualizamos el rol después de que se cree
          await prisma.user.update({
            where: { email: user.email },
            data: { role },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) || "Usuario";
        session.user.email = (token.email as string) || "usuario@example.com";
        session.user.image = token.picture as string | undefined;
        session.user.role = (token.role as UserRole) || "USER";
      }
      return session;
    },
    async jwt({ token }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email as string,
        },
      });

      if (!dbUser) {
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
      };
    },
  },
};

// Extender los tipos de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
    };
  }

  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    role?: UserRole;
  }
}
