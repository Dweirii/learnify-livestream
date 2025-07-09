// ✅ أنواع مشتركة للتطبيق

export type UserPreview = {
  id: string;
  username: string | null;
  imageUrl: string;
};

export type StreamPreview = {
  isLive: boolean;
  viewers: number;
};

export type UserWithStream = UserPreview & {
  stream: StreamPreview | null;
};

export type BlockStatus = {
  blockedByMe: boolean;
  blockedByOther: boolean;
  isBlocked: boolean;
};

export type FollowStatus = {
  isFollowing: boolean;
  isFollowedBy: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor?: string;
}; 