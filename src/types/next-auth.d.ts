import "next-auth";
import { User } from "@/auth";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    accessToken?: string;
  }
}
