import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT =
  'Bạn là Trợ lý AI của Thư viện TLU (Trường Đại học Thăng Long). ' +
  'Nhiệm vụ: hỗ trợ độc giả tóm tắt sách, đề xuất tài liệu học thuật, ' +
  'giải đáp câu hỏi về thư viện và hướng dẫn tìm kiếm tài liệu. ' +
  'Luôn trả lời bằng tiếng Việt, ngắn gọn và hữu ích.';

type MsgIn = { role: 'user' | 'model'; content: string };

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'Chưa cấu hình GROQ_API_KEY trên server.' },
      { status: 500 },
    );
  }

  let messages: MsgIn[];
  try {
    ({ messages } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Request body không hợp lệ.' }, { status: 400 });
  }

  const openaiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: openaiMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message ?? `OpenAI trả lỗi HTTP ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    const reply: string = data.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}