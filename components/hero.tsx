"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 80;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 dark:opacity-30" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-gradient-to-t from-blue-500/5 to-transparent blur-3xl" />

      <div className="relative container mx-auto text-center max-w-6xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4" />
          AI-Powered Finance Management
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-[90px] leading-[1.05] font-extrabold tracking-tighter mb-6">
          <span className="gradient-title">Manage Your Finances</span>
          <br />
          <span className="text-slate-800 dark:text-slate-100">with Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          An AI-powered financial platform that helps you{" "}
          <span className="text-blue-600 dark:text-blue-400 font-medium">track</span>,{" "}
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">analyze</span>, and{" "}
          <span className="text-purple-600 dark:text-purple-400 font-medium">optimize</span>{" "}
          your spending with real-time insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="px-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all font-semibold text-base"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all font-semibold text-base"
            >
              Learn More
            </Button>
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-16 text-sm text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            Bank-level security
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Real-time analytics
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI-powered insights
          </div>
        </div>

        {/* Flat Dashboard Code Mockup Preview */}
        <div className="hero-image-wrapper mt-4 glow-blue" style={{ transform: "none" }}>
          <div ref={imageRef} className="hero-image" style={{ transform: "none" }}>
            <div className="relative mx-auto w-full max-w-5xl rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden text-left">
              
              {/* Window Header / Browser Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="px-4 py-1 rounded-md bg-slate-800/50 border border-slate-700/30 text-xs text-slate-400 font-mono">
                  spendwise.app/dashboard
                </div>
                <div className="w-12" />
              </div>

              {/* Mockup Body Content */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Top Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <p className="text-xs text-slate-400">Your financial overview at a glance</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Current Account (Main)</p>
                    <p className="text-xl font-extrabold text-white">$30,004,925.68</p>
                  </div>
                </div>

                {/* Budget Progress Bar Card */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Monthly Budget (Default account spending limit)</span>
                    <span className="text-emerald-400 font-semibold">7% used</span>
                  </div>
                  <p className="text-lg font-bold text-white mb-3">$650.00 <span className="text-xs text-slate-500 font-normal">of $10,000.00 budget</span></p>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[7%]" />
                  </div>
                </div>

                {/* Two-Column Grid: Recent Transactions & Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Recent Transactions List */}
                  <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-3">
                    <p className="text-sm font-semibold text-slate-200 mb-2">Recent Transactions</p>
                    
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 text-xs">
                      <div>
                        <p className="font-medium text-slate-200">Car Wash</p>
                        <p className="text-[10px] text-slate-400">Jul 28, 2026</p>
                      </div>
                      <span className="font-bold text-emerald-400">+$1000.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 text-xs">
                      <div>
                        <p className="font-medium text-slate-200">Flat rent and Car rent</p>
                        <p className="text-[10px] text-slate-400">Jul 28, 2026</p>
                      </div>
                      <span className="font-bold text-emerald-400">+$1000.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 text-xs">
                      <div>
                        <p className="font-medium text-slate-200">Gift purchase</p>
                        <p className="text-[10px] text-slate-400">Jul 28, 2026</p>
                      </div>
                      <span className="font-bold text-rose-400">-$50.00</span>
                    </div>
                  </div>

                  {/* Expense Breakdown Box */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-slate-200 self-start mb-4">Monthly Expense Breakdown</p>
                    <div className="relative w-28 h-28 rounded-full border-8 border-pink-500 border-t-purple-500 border-r-blue-500 flex items-center justify-center my-2">
                      <span className="text-xs font-mono text-slate-400">100%</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> Food</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Transp.</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Gifts</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;