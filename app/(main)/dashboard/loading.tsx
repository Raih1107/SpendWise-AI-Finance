import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin transition-all"></div>
        <div className="absolute h-12 w-12 rounded-full border-b-2 border-l-2 border-indigo-500 animate-[spin_1.5s_linear_infinite] transition-all"></div>
        <Loader2 className="h-6 w-6 text-blue-600 animate-pulse" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading your finances...
      </p>
    </div>
  );
}
