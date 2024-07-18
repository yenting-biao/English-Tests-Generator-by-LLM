import type { Metadata } from "next";
import { Inter as Fontsans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

const fontSans = Fontsans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Reading Comprehension Questions Generator",
  description:
    "Generate reading comprehension problems for your students by Large Language Models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <Header /> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
