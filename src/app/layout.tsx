import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Quản lý Dự án - Dashboard",
  description: "Hệ thống quản lý và phân tích dự án",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body
        className={`${inter.variable} font-sans antialiased h-full overflow-hidden`}
      >
        <div className="flex h-screen">
          <Navbar />
          <div className="w-64 shrink-0"></div>
          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
