import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const avatarSize = cva("", {
  variants: {
    size: {
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarSize> {
  username: string;
  imageUrl: string;
  isLive?: boolean;
  showBadge?: boolean;
}

export const UserAvatar = ({
  username,
  imageUrl,
  isLive = false,
  showBadge = true,
  size,
}: UserAvatarProps) => {
  const canShowBadge = showBadge && isLive;

  return (
    <div className="relative">
      <Avatar
        className={cn(
          isLive && "ring-2 ring-red-500 border-2 border-background",
          avatarSize({ size })
        )}
      >
        <AvatarImage src={imageUrl} className="object-cover" />
        <AvatarFallback className="bg-muted text-muted-foreground font-medium">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {canShowBadge && (
        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
      )}
    </div>
  );
};

export const UserAvatarSkeleton = ({
  size,
}: VariantProps<typeof avatarSize>) => {
  return <Skeleton className={cn("rounded-full", avatarSize({ size }))} />;
};