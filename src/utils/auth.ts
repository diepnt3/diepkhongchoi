import { auth } from "@/auth";

/**
 * Lấy accessToken từ server session
 * Sử dụng trong Server Components hoặc API routes
 */
export async function getAccessToken() {
  const session = await auth();
  return session?.accessToken;
}

/**
 * Lấy accessToken từ client session
 * Sử dụng trong Client Components
 */
export function getAccessTokenFromSession(
  session: { accessToken?: string } | null
) {
  return session?.accessToken;
}
