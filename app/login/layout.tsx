import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/app/globals.css";
import AnimationNav from "./nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Login | UIP Admin",
  description: "Login to UIP Admin dashboard",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable} min-h-screen font-sans bg-white dark:bg-black text-gray-900 dark:text-white antialiased`}>
      <AnimationNav />
      {children}
    </div>
  );
} 