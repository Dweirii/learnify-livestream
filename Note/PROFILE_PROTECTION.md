# نظام حماية الملفات الشخصية - Learnify

## نظرة عامة

تم تطوير نظام حماية متقدم لصفحات الملفات الشخصية يضمن عدم وصول المستخدمين المحظورين إلى صفحات بعضهم البعض.

## الميزات الرئيسية

### ✅ 1. حماية شاملة للصفحات

#### حماية في `page.tsx`
- التحقق من حالة الحظر قبل عرض الصفحة
- استخدام `notFound()` لإعادة التوجيه إلى 404
- دعم المستخدمين غير المسجلين

#### حماية في `generateMetadata`
- تطبيق نفس منطق الحماية على البيانات الوصفية
- منع ظهور معلومات المستخدمين المحظورين في محركات البحث
- إرجاع بيانات وصفية محايدة للمستخدمين المحظورين

### ✅ 2. دوال مساعدة محسنة

#### `checkIfBlocked(userAId, userBId)`
```typescript
export async function checkIfBlocked(userAId: string, userBId: string) {
  const blockRecord = await db.block.findFirst({
    where: {
      OR: [
        { blockerId: userAId, blockedId: userBId },
        { blockerId: userBId, blockedId: userAId },
      ],
    },
  });

  return {
    isBlocked: !!blockRecord,
    blockedByMe: blockRecord?.blockerId === userAId,
    blockedByOther: blockRecord?.blockerId === userBId,
  };
}
```

#### `checkProfileAccess(currentUserId, targetUserId)`
```typescript
export async function checkProfileAccess(currentUserId: string, targetUserId: string) {
  const blockStatus = await checkIfBlocked(currentUserId, targetUserId);
  
  if (blockStatus.blockedByOther) {
    return {
      canAccess: false,
      reason: "blocked_by_target",
      blockStatus,
    };
  }

  return {
    canAccess: true,
    reason: "allowed",
    blockStatus,
  };
}
```

### ✅ 3. مكونات واجهة المستخدم

#### `BlockStatusButton`
- يعرض زر الحظر أو إلغاء الحظر حسب الحالة
- يستخدم `api.stream.isBlocked.useQuery` للتحقق من الحالة
- يدعم التحديث التلقائي عند تغيير الحالة

#### `UnblockButton`
- زر إلغاء الحظر مع تأكيد
- يستخدم `api.stream.unblockUser.useMutation`
- رسائل نجاح وخطأ واضحة

#### `BlockedUserMessage`
- رسالة مخصصة للمستخدمين المحظورين
- تصميم جميل ومتجاوب
- زر العودة للصفحة السابقة

### ✅ 4. صفحة 404 مخصصة

#### `not-found.tsx`
- صفحة 404 مخصصة للملفات الشخصية
- رسالة واضحة للمستخدمين المحظورين
- تجربة مستخدم محسنة

## التنفيذ التقني

### 1. حماية الصفحة الرئيسية

```typescript
export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  
  // الحصول على المستخدم الحالي
  let self;
  try {
    self = await getSelf();
  } catch {
    // المستخدم غير مسجل الدخول
  }

  const user = await db.user.findUnique({
    where: { username: username },
    include: { stream: true },
  });

  if (!user || user.username !== username) {
    notFound();
  }

  // التحقق من حالة الحظر
  if (self) {
    const accessCheck = await checkProfileAccess(self.id, user.id);
    
    if (!accessCheck.canAccess) {
      notFound();
    }
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 h-full">
        <div className="hidden md:block">
          <FollowButton userId={user.id} />
          {self && (
            <BlockStatusButton user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2. حماية البيانات الوصفية

```typescript
export async function generateMetadata({ params }: UserPageProps) {
  const { username } = await params;
  
  let self;
  try {
    self = await getSelf();
  } catch {
    // المستخدم غير مسجل الدخول
  }

  const user = await db.user.findUnique({
    where: { username: username },
    select: { id: true, username: true, imageUrl: true },
  });

  if (!user || user.username !== username) {
    return { title: "المستخدم غير موجود" };
  }

  // التحقق من حالة الحظر
  if (self) {
    const accessCheck = await checkProfileAccess(self.id, user.id);
    
    if (!accessCheck.canAccess) {
      return { title: "المستخدم غير موجود" };
    }
  }

  return {
    title: `${user.username} - Learnify`,
    description: `ملف شخصي لـ ${user.username}`,
    openGraph: {
      title: `${user.username} - Learnify`,
      description: `ملف شخصي لـ ${user.username}`,
      images: [user.imageUrl],
    },
  };
}
```

## الأمان والخصوصية

### 1. حماية شاملة
- حماية في مستوى الخادم (Server-Side)
- حماية في مستوى البيانات الوصفية
- حماية في مستوى واجهة المستخدم

### 2. معالجة الحالات المختلفة
- المستخدمين المسجلين
- المستخدمين غير المسجلين
- المستخدمين المحظورين
- المستخدمين غير الموجودين

### 3. أداء محسن
- استعلام واحد للتحقق من الحظر
- استخدام `findFirst` بدلاً من `findMany`
- فهرسة مناسبة في قاعدة البيانات

## الاختبار

يجب اختبار:
1. وصول مستخدم عادي لملف شخصي عادي
2. محاولة وصول مستخدم محظور لملف شخصي
3. محاولة وصول مستخدم غير مسجل لملف شخصي
4. وصول مستخدم لملف شخصي غير موجود
5. تغيير حالة الحظر في الوقت الفعلي
6. إلغاء الحظر والوصول مرة أخرى

## الاستخدام

### حماية صفحة جديدة
```typescript
import { checkProfileAccess } from "@/lib/utils";

// في دالة الصفحة
if (self) {
  const accessCheck = await checkProfileAccess(self.id, user.id);
  
  if (!accessCheck.canAccess) {
    notFound();
  }
}
```

### إضافة زر الحظر/إلغاء الحظر
```typescript
import { BlockStatusButton } from "@/components/block/block-status-button";

<BlockStatusButton user={user} />
```

### عرض رسالة الحظر
```typescript
import { BlockedUserMessage } from "@/components/block/blocked-user-message";

<BlockedUserMessage 
  message="رسالة مخصصة"
  showGoBack={true}
/>
``` 