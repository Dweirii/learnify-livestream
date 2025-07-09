# نظام الحظر المتقدم - Learnify

## نظرة عامة

تم تطوير نظام حظر متقدم يضمن عدم ظهور المستخدمين المحظورين في أي مكان في التطبيق، مع حذف تلقائي لعلاقات المتابعة.

## الميزات الرئيسية

### ✅ 1. حذف تلقائي لعلاقات المتابعة

عند حظر مستخدم:
- يتم حذف علاقة المتابعة في كلا الاتجاهين تلقائياً
- استخدام `db.$transaction` لضمان التناسق
- استخدام `db.follow.deleteMany()` مع `OR` للتعامل مع كلا الاتجاهين

```typescript
// حذف علاقات المتابعة في كلا الاتجاهين
db.follow.deleteMany({
  where: {
    OR: [
      { followerId: blockerId, followingId: blockedId },
      { followerId: blockedId, followingId: blockerId },
    ],
  },
})
```

### ✅ 2. استبعاد المستخدمين المحظورين

تم إنشاء دوال مساعدة لاستبعاد المستخدمين المحظورين من جميع الاستعلامات:

#### `createBlockedUsersFilter(currentUserId: string)`
```typescript
export function createBlockedUsersFilter(currentUserId: string) {
  return {
    AND: [
      // استبعاد المستخدمين الذين حظروا المستخدم الحالي
      {
        blocking: {
          none: { blockedId: currentUserId },
        },
      },
      // استبعاد المستخدمين الذين حظرهم المستخدم الحالي
      {
        blockedBy: {
          none: { blockerId: currentUserId },
        },
      },
    ],
  };
}
```

#### `createFollowedUsersBlockFilter(currentUserId: string)`
```typescript
export function createFollowedUsersBlockFilter(currentUserId: string) {
  return {
    following: createBlockedUsersFilter(currentUserId),
  };
}
```

### ✅ 3. الاستعلامات المحسنة

#### المستخدمون الموصى بهم (`getRecommendedUsers`)
- يستبعد المستخدمين المحظورين
- يستبعد المستخدمين المتابَعين
- ترتيب حسب البث المباشر أولاً

#### المستخدمون المتابَعون (`getFollowedUsers`)
- يستبعد المستخدمين المحظورين في كلا الاتجاهين
- ترتيب حسب البث المباشر أولاً

#### شريط الجانب (`getFollowedUsersSidebar`)
- يستبعد المستخدمين المحظورين
- محدود بـ 10 مستخدمين
- ترتيب حسب البث المباشر أولاً

### ✅ 4. الدوال الجديدة

#### `blockUser`
- إنشاء علاقة الحظر
- حذف علاقات المتابعة تلقائياً
- إزالة من غرفة LiveKit
- إرجاع `UserPreview`

#### `unblockUser`
- إزالة علاقة الحظر
- التحقق من وجود الحظر
- إرجاع `UserPreview`

#### `isBlocked`
- التحقق من حالة الحظر في كلا الاتجاهين
- إرجاع `BlockStatus`

#### `getBlockedUsers`
- قائمة المستخدمين المحظورين
- دعم الصفحات
- إرجاع `PaginatedResponse<UserPreview>`

## الأنواع المحددة

### `UserPreview`
```typescript
type UserPreview = {
  id: string;
  username: string | null;
  imageUrl: string;
};
```

### `BlockStatus`
```typescript
type BlockStatus = {
  blockedByMe: boolean;
  blockedByOther: boolean;
  isBlocked: boolean;
};
```

### `PaginatedResponse<T>`
```typescript
type PaginatedResponse<T> = {
  items: T[];
  nextCursor?: string;
};
```

## الأداء والتحسينات

### 1. استخدام المعاملات (Transactions)
- ضمان تناسق البيانات عند الحظر
- حذف علاقات المتابعة في نفس المعاملة

### 2. استعلامات Prisma المحسنة
- استخدام `AND` و `OR` للاستعلامات المعقدة
- استخدام `none` و `some` للعلاقات
- فهرسة مناسبة في قاعدة البيانات

### 3. الدوال المساعدة
- تجنب تكرار الكود
- سهولة الصيانة والتطوير
- نوعية آمنة مع TypeScript

## الأمان

### 1. التحقق من الصلاحيات
- استخدام `getSelf()` للمصادقة
- التحقق من وجود المستخدم قبل الحظر

### 2. منع الحظر الذاتي
- التحقق من أن المستخدم لا يحظر نفسه
- رسائل خطأ واضحة

### 3. معالجة الأخطاء
- معالجة أخطاء LiveKit
- استمرار العمل حتى لو فشل إزالة المشارك

## الاستخدام

### حظر مستخدم
```typescript
const result = await api.stream.blockUser.mutate({
  otherUserId: "user-id"
});
```

### إلغاء حظر مستخدم
```typescript
const result = await api.stream.unblockUser.mutate({
  otherUserId: "user-id"
});
```

### التحقق من حالة الحظر
```typescript
const status = await api.stream.isBlocked.query({
  otherUserId: "user-id"
});
```

### قائمة المستخدمين المحظورين
```typescript
const blockedUsers = await api.stream.getBlockedUsers.query({
  limit: 20,
  cursor: "next-cursor"
});
```

## الاختبار

يجب اختبار:
1. حظر مستخدم يتبعه المستخدم الحالي
2. حظر مستخدم يتابع المستخدم الحالي
3. حظر مستخدم لا توجد بينهما علاقة متابعة
4. إلغاء حظر مستخدم
5. التحقق من عدم ظهور المستخدمين المحظورين في القوائم
6. التحقق من حذف علاقات المتابعة تلقائياً 