# GMV Media — خطوات التركيب (مرة واحدة بس)

## 1) ارفع المشروع على Vercel
ارفع المجلد ده كله (GitHub أو `vercel deploy`). مفيش Build، Vercel بيتعرف على `api/` و `vercel.json` لوحده.

## 2) 🔴 غيّر توكن تيليجرام فورًا
التوكن القديم كان مكتوب في كود الموقع (ظاهر لأي حد). افتح @BotFather ← `/revoke` ← اختار البوت ← خد توكن جديد.

## 3) Environment Variables (Vercel ← Settings ← Environment Variables)
| الاسم | القيمة |
|---|---|
| `TELEGRAM_BOT_TOKEN` | التوكن الجديد |
| `TELEGRAM_CHAT_ID` | `7056197961` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit ← Developer options |
| `IMAGEKIT_PRIVATE_KEY` | نفس المكان (سري، ما تحطهوش في أي ملف) |
| `ADMIN_UID` | بتجيبه في الخطوة 5 |
بعد الإضافة اعمل Redeploy.

## 4) Firebase
1. Authentication ← Sign-in method ← فعّل **Email/Password** ← Users ← Add user (إيميلك وكلمة سر قوية).
2. Authentication ← Settings ← عطّل إنشاء حسابات جديدة (User actions → disable sign-up) لو متاح.
3. Project settings: تأكد إن `apiKey` في `assets/js/firebase-config.js` مطابق (كان مكتوب بشكلين مختلفين في الموقع القديم).

## 5) الأدمن + القواعد
1. افتح `/admin/` وسجل دخول. هيظهرلك الـ UID (أو في تبويب الإعدادات) — انسخه.
2. حطه في Vercel كـ `ADMIN_UID` (Redeploy).
3. افتح `firebase/database.rules.json` وبدّل `PUT_ADMIN_UID_HERE` بالـ UID (4 مرات+) وانسخ الملف كله في Realtime Database ← Rules ← Publish.
4. في الأدمن ← الإعدادات ← "مزامنة العدّاد" عشان عدد الزوار القديم يفضل ظاهر.

## 6) ImageKit
الرفع بيروح لفولدر `/gmv/designs` و `/gmv/videos`. الصور بتتخدم بـ `?tr=` (تصغير + WebP تلقائي) فالموقع خفيف. حد رفع الفيديو بيعتمد على خطة ImageKit.

## الاستخدام
- **رفع جديد**: اسحب الملفات، اختار أماكن الظهور، ابدأ الرفع.
- **المكتبة**: تعديل/إخفاء/حذف أي عنصر (حتى ملفات المشروع الأصلية تقدر تخفيها وتغير أماكنها).
- **الأماكن والترتيب**: ترتيب كل قسم بالأسهم.
- **باقات الأسعار (server-*)**: ثابتة ومقفولة — مش بتتخفي ولا بتتغير من اللوحة، والجديد بيتضاف بعدها.
