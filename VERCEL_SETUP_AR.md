# إعداد GMV على Vercel — النسخة المصححة

## قبل تسجيل الدخول
1. تأكد أن مشروع Firebase المستخدم هو **gmv-media** وليس مشروع AXEL.
2. من Firebase Console الخاص بـ GMV افتح Authentication ثم فعّل Email/Password.
3. أضف حساب الأدمن داخل Authentication → Users (أو أنشئه من Add user).
4. ضع نفس البريد حرفيًا داخل متغير Vercel `ADMIN_EMAILS`.
5. أنشئ Service Account من **مشروع GMV نفسه**، وحوّل JSON إلى Base64 وضعه في `FIREBASE_SERVICE_ACCOUNT_BASE64`.

## متغيرات Vercel
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `ADMIN_EMAILS`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`
- `FRONTEND_ORIGIN` (رابط الموقع، أو اتركه غير مضبوط للسماح بالوصول الافتراضي)

## الاستخدام
- ارفع ملفات المشروع كاملة إلى GitHub ثم Deploy على Vercel.
- افتح `/admin.html`.
- ارفع الصور والفيديوهات وحدد الفئة: أعمالنا أو آراء العملاء أو العروض.
- إعدادات الجريد تسمح باختيار ثابت/متحرك والاتجاه والسرعة.

**مهم:** حساب AXEL لا يسجّل الدخول إلى GMV. يجب أن يكون حساب الأدمن موجودًا في Firebase Authentication لمشروع `gmv-media`، وأن يكون بريده ضمن `ADMIN_EMAILS`. الصفحة الرئيسية تحتفظ بمحتواها وصورها وأيقوناتها الأصلية كخطة بديلة؛ الصور المرفوعة من لوحة الأدمن تستبدل صور معرض الأعمال فقط عند وجود ملفات نشطة.
