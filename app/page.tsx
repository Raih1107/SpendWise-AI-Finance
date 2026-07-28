// @ts-nocheck
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4 uppercase tracking-wider">
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="text-gradient">manage your finances</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful tools and insights that put you in complete control of your financial life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <div key={index} className="feature-card group cursor-default">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4 uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Get started in{" "}
              <span className="text-gradient">3 simple steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800" />

            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                    {React.cloneElement(step.icon as React.ReactElement, {
                      className: "h-8 w-8 text-white",
                    })}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                  {step.title.replace(/^\d+\.\s/, "")}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to Take Control of
              <br />
              Your Finances?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Start managing your finances smarter with AI-powered insights, budget tracking, and receipt scanning.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-10 h-12 bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl text-base"
                >
                  Start for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-blue-200 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Free plan available
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
