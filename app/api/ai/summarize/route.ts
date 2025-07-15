import { NextResponse } from "next/server";
import OpenAI from "openai";

// تأكد من وجود مفتاح OpenAI
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("❌ متغير البيئة OPENAI_API_KEY غير موجود");
}

const openai = new OpenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { text, language = "ar", summaryType = "paragraph" } = await req.json();

    // تحقق من صحة النص
    if (!text || typeof text !== "string" || text.trim().split(/\s+/).length < 20) {
      return NextResponse.json(
        { error: "🚫 الرجاء إدخال نص لا يقل عن 20 كلمة ليتم تلخيصه." },
        { status: 400 }
      );
    }

    if (text.length > 8000) {
      return NextResponse.json(
        { error: "🚫 النص طويل جدًا. الرجاء تقليله إلى أقل من 8000 حرف." },
        { status: 413 }
      );
    }

    if (!["ar", "en", "fr"].includes(language)) {
      return NextResponse.json(
        { error: "🚫 لغة غير مدعومة. الرجاء اختيار: ar, en, fr." },
        { status: 400 }
      );
    }

    if (!["paragraph", "bullets"].includes(summaryType)) {
      return NextResponse.json(
        { error: "🚫 نوع التلخيص غير مدعوم." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({ text, language, summaryType });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "أنت مساعد ذكي متخصص في التلخيص الأكاديمي. قدم ملخصًا جديدًا بلغة مختلفة دون نسخ الجمل الأصلية، وبدون أي إضافات.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const summary = completion.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json(
        { error: "❌ لم يتم توليد ملخص. جرّب نصًا مختلفًا." },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ API Error:", err.message);
    } else {
      console.error("❌ Unknown API Error:", err);
    }

    return NextResponse.json(
      { error: "⚠️ حدث خطأ غير متوقع أثناء التلخيص." },
      { status: 500 }
    );
  }
}

// إنشاء الـ Prompt بناءً على اللغة ونوع التلخيص
function buildPrompt({
  text,
  language,
  summaryType,
}: {
  text: string;
  language: string;
  summaryType: string;
}): string {
  const languageLabel: Record<string, string> = {
    ar: "العربية",
    en: "English",
    fr: "Français",
  };

  const summaryLabel: Record<string, string> = {
    paragraph: "ملخصًا أكاديميًا منظمًا على شكل فقرة واحدة لا تتجاوز 5 أسطر",
    bullets: "ملخصًا منظمًا على شكل نقاط رئيسية واضحة ومركزة",
  };

  const lang = languageLabel[language] || "العربية";
  const style = summaryLabel[summaryType] || "ملخص على شكل فقرة";

  const languageForce =
    language === "fr"
      ? "⚠️ Répondez uniquement en français."
      : language === "en"
      ? "⚠️ Respond only in English."
      : "⚠️ أجب فقط باللغة العربية.";

  return `
لديك النص التالي مكتوب باللغة ${lang}:

"""${text}"""

الرجاء توليد ${style}.
- لا تُعد صياغة الجمل كما هي.
- لا تضف معلومات من خارج النص.
- استخدم لغة جديدة ومبسطة.
- ركّز على نقل الفكرة وليس النسخ.

${languageForce}
`;
}
