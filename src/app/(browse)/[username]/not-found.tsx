import { BlockedUserMessage } from "@/components/block/blocked-user-message";

export default function UserNotFound() {
  return (
    <div className="h-full">
      <BlockedUserMessage 
        message="هذا الملف الشخصي غير متاح أو تم حظره"
        showGoBack={true}
      />
    </div>
  );
} 