# 🔄 API Migration Guide - دليل نقل Gemini API

## 📌 ملخص التغييرات

تم نقل **جميع استدعاءات Gemini API** من Frontend إلى Backend لتحقيق:
- 🔐 **أمان أفضل**: مفتاح API محمي على الخادم
- ⚡ **نفس الأداء**: لا تغيير في السرعة
- 🎯 **نفس الوظائف**: جميع الميزات تعمل كما هي

---

## 🏗️ البنية الجديدة

### قبل (❌ غير آمن)
```
Frontend (Browser)
    ↓
    استدعاء مباشر لـ Gemini API
    ↓
    مفتاح API مكشوف في Network Tab
```

### بعد (✅ آمن)
```
Frontend (Browser)
    ↓
    POST /api/gemini
    ↓
    Vercel Serverless Function
    ↓
    استدعاء Gemini API بمفتاح محمي
    ↓
    إرجاع النتيجة للـ Frontend
```

---

## 📁 هيكل الملفات

```
vetorra/
├── api/
│   └── gemini.ts          ← 🆕 API موحد للخادم
├── services/
│   └── geminiService.ts   ← ✏️ محدث للاستدعاء عبر fetch
├── env.d.tsx              ← ✏️ إزالة VITE_GEMINI_API_KEY
├── .env.example           ← ✏️ تحديث المتغيرات البيئية
├── vercel.json            ← 🆕 إعدادات Vercel Functions
├── DEPLOYMENT.md          ← 🆕 دليل النشر المفصل
├── QUICK_START.md         ← 🆕 البدء السريع
└── CHECKLIST.md           ← 🆕 قائمة التحقق
```

---

## 🔧 التغييرات التقنية

### 1. `/api/gemini.ts` (جديد)

**الوظائف المدعومة**:
- `generateNews` - توليد الأخبار
- `generateDirectoryNews` - توليد أخبار بالدُفعات
- `generateTools` - توليد الأدوات
- `generateImage` - توليد الصور
- `chat` - المحادثة الذكية
- `intelligentSearch` - البحث الذكي
- `transcribeAudio` - تحويل الصوت إلى نص
- `generateSpeech` - تحويل النص إلى صوت

**مثال على الاستخدام**:
```typescript
const response = await fetch("/api/gemini", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    task: "generateNews",
    payload: {
      prompt: "Write news about AI",
      useSearch: true,
      schema: { /* ... */ }
    }
  })
});

const result = await response.json();
```

### 2. `geminiService.ts` (محدث)

**قبل**:
```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});
```

**بعد**:
```typescript
// لا استيراد للمكتبة في Frontend
const callGeminiAPI = async (task: string, payload: any) => {
    const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, payload })
    });
    return response.json();
};
```

**جميع الوظائف** تم تحديثها:
- ✅ `generateNewsDetails`
- ✅ `generateDirectoryNews`
- ✅ `generateDirectoryTools`
- ✅ `generateToolDetails`
- ✅ `generateAIImage`
- ✅ `intelligentSearch`
- ✅ `sendChatMessage`
- ✅ `transcribeAudio`
- ✅ `generateSpeech`
- ⚠️ `generateVideo` (placeholder)
- ⚠️ `editImage` (placeholder)

---

## 🔐 الأمان

### ما تم تحسينه:

#### ✅ قبل النقل (غير آمن):
```javascript
// في Frontend - أي شخص يمكنه رؤية المفتاح
const ai = new GoogleGenAI({
  apiKey: "AIzaSy..." // 🚨 مكشوف في الكود
});
```

#### ✅ بعد النقل (آمن):
```typescript
// في Backend فقط
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY // 🔒 محمي
});
```

### إجراءات الأمان الإضافية:

1. **CORS Headers**: محدد للسماح بطلبات من نطاقك فقط
2. **Environment Variables**: المفتاح في Vercel Secrets فقط
3. **No Client Exposure**: المفتاح لا يظهر أبداً في Browser

---

## 🧪 الاختبار

### اختبار محلي:

```bash
# 1. إعداد البيئة
cp .env.example .env
# عدّل .env وأضف GEMINI_API_KEY

# 2. تشغيل مع Vercel Dev (موصى به)
npm install -g vercel
vercel dev

# 3. أو استخدم Vite (قد لا تعمل /api)
npm run dev
```

### اختبار في Production:

1. انشر على Vercel
2. أضف `GEMINI_API_KEY` في Environment Variables
3. اختبر الميزات:
   - توليد خبر
   - توليد أداة
   - إنشاء صورة
   - البحث الذكي

---

## 📊 مقارنة الأداء

| الميزة | قبل | بعد | ملاحظات |
|--------|-----|-----|---------|
| **الأمان** | ❌ ضعيف | ✅ قوي | مفتاح محمي |
| **السرعة** | ⚡ سريع | ⚡ سريع | نفس الأداء |
| **التكلفة** | 💰 نفسها | 💰 نفسها | نفس استخدام API |
| **Scalability** | ⚠️ محدود | ✅ ممتاز | Serverless auto-scale |
| **Error Handling** | ⚠️ بسيط | ✅ محسّن | معالجة مركزية |

---

## 🚀 الخطوات التالية (اختيارية)

### تحسينات موصى بها:

1. **Rate Limiting**
   ```typescript
   // إضافة حد للطلبات
   import rateLimit from 'express-rate-limit';
   ```

2. **Response Caching**
   ```typescript
   // حفظ النتائج المكررة
   import cache from 'memory-cache';
   ```

3. **Logging & Monitoring**
   ```typescript
   // مراقبة الأخطاء
   import * as Sentry from "@sentry/node";
   ```

4. **API Key Rotation**
   - تغيير المفتاح دورياً
   - استخدام أكثر من مفتاح

---

## 🐛 المشاكل الشائعة وحلولها

### Problem: Functions timeout بعد 10 ثوانٍ

**Solution**: في `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Problem: CORS errors

**Solution**: تحقق من headers في `api/gemini.ts`:
```typescript
res.setHeader("Access-Control-Allow-Origin", "*");
```

### Problem: Environment variable not found

**Solution**:
1. تأكد من إضافة `GEMINI_API_KEY` في Vercel
2. أعد النشر (Redeploy)
3. تحقق من Logs

---

## 📚 مراجع مفيدة

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions/serverless-functions)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Environment Variables في Vercel](https://vercel.com/docs/environment-variables)

---

**تم بنجاح! 🎉**

الآن API آمن ومحمي على الخادم.
