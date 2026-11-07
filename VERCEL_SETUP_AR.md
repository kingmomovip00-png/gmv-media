# إعداد GMV على Vercel

1. لوحة الإدارة تستخدم Firebase Authentication (Email/Password). أنشئ حسابات الأدمن ثم ضع الإيميلات نفسها في `ADMIN_EMAILS` مفصولة بفواصل.
2. أنشئ Firebase Service Account وحوّل ملف JSON إلى Base64 وضعه في `FIREBASE_SERVICE_ACCOUNT_BASE64`.
3. إعدادات Firebase Web الحالية في `admin.js` مأخوذة من مشروع AXEL الموجود في الملف المرجعي، والبيانات الخاصة بـ GMV منفصلة داخل مجموعتي `gmv_media` و`gmv_settings`. لفصل GMV في مشروع Firebase مستقل، استبدل `cfg` أعلى `admin.js` بمفاتيح Web App الجديدة واستخدم Service Account من المشروع نفسه.
4. أضف مفاتيح ImageKit الثلاثة. الملفات ترفع إلى `/gmv-media` ثم تُسجل بياناتها في Firestore.
5. ارفع محتويات المجلد إلى GitHub واربطه بـ Vercel. Framework Preset: Other، Root Directory: `.`. الـ API في `api/index.js` والصفحات ثابتة.
6. افتح `/admin.html` وسجّل الدخول بحساب موجود في `ADMIN_EMAILS`. يمكنك رفع الصور والفيديوهات، إظهارها/إخفاؤها أو حذفها، وضبط الجريد إلى متحرك أو ثابت وسرعته واتجاهه.

`TELEGRAM_BOT_TOKEN` و`TELEGRAM_CHAT_ID` و`FRONTEND_ORIGIN` موجودة ضمن قائمة متغيرات البيئة المطلوبة، لكن إشعارات Telegram غير مفعلة في GMV حاليًا لعدم تحديد حدث إشعار مناسب. لا تضع أي مفاتيح سرية داخل ملفات الواجهة.
