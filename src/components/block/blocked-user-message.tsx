"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserX } from "lucide-react";
import { useRouter } from "next/navigation";

interface BlockedUserMessageProps {
  message?: string;
  showGoBack?: boolean;
}

export function BlockedUserMessage({ 
  message = "لا يمكنك الوصول إلى هذا الملف الشخصي", 
  showGoBack = true 
}: BlockedUserMessageProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-muted rounded-full">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">مستخدم محظور</CardTitle>
          <CardDescription className="text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            هذا المحتوى محمي من قبل المستخدم
          </div>
          {showGoBack && (
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="w-full"
            >
              العودة للصفحة السابقة
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 