// components/full-page-loader.tsx
import { Loader2 } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );
}
