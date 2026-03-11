import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, fromLanguage, toLanguage } = await request.json();

    if (!title || !content || !fromLanguage || !toLanguage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following blog post from ${fromLanguage} to ${toLanguage}. Maintain the markdown formatting. Return ONLY a JSON object with "title" and "content" fields, no other text.`,
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent:\n${content}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Translation API failed');
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content;
    const translated = JSON.parse(translatedText);

    return NextResponse.json({
      title: translated.title,
      content: translated.content,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
