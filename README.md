# Learnify - منصة التعلم التفاعلية

هذا مشروع [Next.js](https://nextjs.org) مبني باستخدام [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## البدء

### 1. تثبيت التبعيات

```bash
npm install
# أو
yarn install
# أو
pnpm install
```

### 2. إعداد متغيرات البيئة

قم بإنشاء ملف `.env.local` في المجلد الجذر وأضف المتغيرات التالية:

```env
# LiveKit Configuration
LIVEKIT_API_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/learnify"

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Webhook Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. إعداد قاعدة البيانات

```bash
# إنشاء جداول قاعدة البيانات
npx prisma db push

# توليد Prisma Client
npx prisma generate
```

### 4. تشغيل خادم التطوير

```bash
npm run dev
# أو
yarn dev
# أو
pnpm dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح لرؤية النتيجة.

## الميزات

- ✅ نظام مصادقة باستخدام Clerk
- ✅ نظام متابعة المستخدمين
- ✅ نظام حظر المستخدمين المتقدم
- ✅ بث مباشر باستخدام LiveKit
- ✅ قاعدة بيانات PostgreSQL مع Prisma
- ✅ تخزين مؤقت باستخدام Redis
- ✅ واجهة مستخدم حديثة مع Tailwind CSS
- ✅ TypeScript للسلامة النوعية

### نظام الحظر المتقدم

- ✅ حذف تلقائي لعلاقات المتابعة عند الحظر
- ✅ استبعاد المستخدمين المحظورين من جميع الاستعلامات
- ✅ دعم الحظر في كلا الاتجاهين
- ✅ إدارة قائمة المستخدمين المحظورين
- ✅ أداء محسن باستخدام استعلامات Prisma المتقدمة

## الحلول للمشاكل الشائعة

### خطأ LiveKit
إذا واجهت خطأ يتعلق بـ LiveKit، تأكد من:
1. إضافة متغيرات البيئة الصحيحة لـ LiveKit
2. أن خادم LiveKit يعمل بشكل صحيح
3. أن مفاتيح API صحيحة

### خطأ قاعدة البيانات
إذا واجهت خطأ في قاعدة البيانات:
1. تأكد من أن PostgreSQL يعمل
2. تحقق من صحة `DATABASE_URL`
3. قم بتشغيل `npx prisma db push`

## تعلم المزيد

لمعرفة المزيد عن Next.js، راجع الموارد التالية:

- [Next.js Documentation](https://nextjs.org/docs) - تعلم ميزات وAPI الخاص بـ Next.js
- [Learn Next.js](https://nextjs.org/learn) - دورة تفاعلية لـ Next.js

يمكنك الاطلاع على [مستودع Next.js على GitHub](https://github.com/vercel/next.js) - ملاحظاتك ومساهماتك مرحب بها!

## النشر على Vercel

أسهل طريقة لنشر تطبيق Next.js هي استخدام [منصة Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) من مبتكري Next.js.

راجع [وثائق نشر Next.js](https://nextjs.org/docs/app/building-your-application/deploying) للمزيد من التفاصيل.
