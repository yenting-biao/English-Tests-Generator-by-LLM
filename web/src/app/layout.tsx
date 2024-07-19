import type { Metadata } from "next";
import { Inter as Fontsans } from "next/font/google";
import "./globals.css";
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
      <body className={fontSans.variable}>
        <div className="min-h-screen bg-background font-sans antialiased flex flex-col items-center p-8">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <h3 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
              Reading Comprehension Questions Generator
            </h3>
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
