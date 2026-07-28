// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 animate-fade-up">
          <Sparkles className="h-4 w-4" />
          AI-Powered Finance Management
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-[90px] leading-[1.05] font-extrabold tracking-tighter mb-6 animate-fade-up">
          <span className="gradient-title">Manage Your Finances</span>
          <br />
          <span className="text-slate-800 dark:text-slate-100">with Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up">
          An AI-powered financial platform that helps you{" "}
          <span className="text-blue-600 dark:text-blue-400 font-medium">track</span>,{" "}
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">analyze</span>, and{" "}
          <span className="text-purple-600 dark:text-purple-400 font-medium">optimize</span>{" "}
          your spending with real-time insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-up">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="px-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 font-semibold text-base"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all duration-300 font-semibold text-base"
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

        {/* Hero Image */}
        <div className="hero-image-wrapper mt-4 glow-blue">
          <div ref={imageRef} className="hero-image">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 rounded-2xl blur-xl opacity-60" />
              <Image
                src="/banner.jpeg"
                width={1280}
                height={720}
                alt="SpendWise Dashboard Preview"
                className="relative rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 mx-auto w-full max-w-5xl"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
