import type { Metadata } from "next";
import { Inter as Fontsans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

const fontSans = Fontsans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "English Tests Generator",
  description:
    "Generate english tests for your students by Large Language Models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontSans.variable}>
        <SessionProvider>
          <div className="min-h-dvh bg-background font-sans antialiased flex flex-col items-center p-8">
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
