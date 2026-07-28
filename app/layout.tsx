import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "SpendWise — AI Finance Platform",
  description: "Track, analyze, and optimize your spending with AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className} min-h-screen`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors position="top-right" />

            <footer className="border-t border-border/50 bg-muted/30 py-10">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    © 2025 <span className="text-gradient font-semibold">SpendWise</span>. All rights reserved.
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Made with <span className="text-red-500">♥</span> 
                  </p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
