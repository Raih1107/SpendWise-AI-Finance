import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Wallet } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "@/components/theme-toggle";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50" />

      <nav className="relative container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-105">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Spend<span className="text-blue-600 dark:text-blue-500">Wise</span>
          </span>
        </Link>

        {/* Center Nav Links - Only for signed-out users */}
        <div className="hidden md:flex items-center gap-8">
          <SignedOut>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              Features
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              How It Works
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              Testimonials
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
            </Link>
            <a href="/transaction/create">
              <Button
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition-all duration-200"
              >
                <PenBox size={16} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </a>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-200"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 font-medium transition-all duration-200"
              >
                Get Started
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-200",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
