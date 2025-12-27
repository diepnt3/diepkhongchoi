import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import axios from "axios";

// Định nghĩa user type
export interface User {
  id: string;
  email: string;
  name?: string;
  accessToken?: string;
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");

      if (isOnLoginPage) {
        if (isLoggedIn)
          return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = (user as User).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              validateStatus: (status) => status < 500, // Chấp nhận cả 4xx để xử lý
            }
          );

          // Kiểm tra nếu response thành công (2xx)
          if (response.status >= 200 && response.status < 300) {
            if (
              response.data &&
              response.data.accessToken &&
              response.data.user
            ) {
              return {
                id: String(response.data.user.id),
                email: response.data.user.email,
                name: response.data.user.name,
                accessToken: response.data.accessToken,
              };
            }
          }

          // Xử lý lỗi từ API
          if (response.status === 401) {
            console.error("Login failed: Invalid credentials", {
              email: credentials.email,
              status: response.status,
              data: response.data,
            });
          } else {
            console.error("Login failed: Unexpected response", {
              status: response.status,
              data: response.data,
            });
          }

          return null;
        } catch (error) {
          // Xử lý lỗi network hoặc lỗi khác
          if (axios.isAxiosError(error)) {
            if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
              console.error("Login error: Cannot connect to API server", {
                url: `${API_BASE_URL}/auth/login`,
                error: error.message,
              });
            } else if (error.response) {
              // API trả về response nhưng có lỗi
              console.error("Login error: API returned error", {
                status: error.response.status,
                data: error.response.data,
                message: error.message,
              });
            } else {
              console.error("Login error: Request failed", {
                message: error.message,
                code: error.code,
              });
            }
          } else {
            console.error("Login error: Unknown error", error);
          }
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
