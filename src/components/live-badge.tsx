import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface LiveBadgeProps {
  count?: number;
  className?: string;
  showCount?: boolean;
}

export const LiveBadge = ({ count = 0, className, showCount = true }: LiveBadgeProps) => {
  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        "bg-red-500/10 text-red-500 border-red-500/20",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      {showCount && count > 0 && (
        <>
          <Eye className="w-3 h-3" />
          <span>{count}</span>
        </>
      )}
    </Badge>
  );
};
