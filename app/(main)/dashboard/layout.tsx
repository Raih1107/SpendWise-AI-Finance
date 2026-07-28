import DashboardPage from "./page";
import { BarLoader } from "react-spinners";
import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-muted/20 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-title leading-tight pb-0.5">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Your financial overview at a glance
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="space-y-4">
              <BarLoader width={"100%"} color="#3b82f6" height={3} />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 rounded-2xl bg-muted/60 animate-pulse"
                  />
                ))}
              </div>
            </div>
          }
        >
          <DashboardPage />
        </Suspense>
      </div>
    </div>
  );
}
