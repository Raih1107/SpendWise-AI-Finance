"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        {/* 404 Visual */}
        <div className="text-8xl font-extrabold text-gradient mb-4">404</div>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Oops! The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link href="/">
            <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition-all duration-200">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
