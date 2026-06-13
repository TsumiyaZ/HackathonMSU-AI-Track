import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadReviews } from '@/lib/hotels';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('targetId');

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'targetId is required' }, { status: 400 });
    }

    const allReviews = await loadReviews();
    const relevantReviews = allReviews.filter(r => r.target_id === targetId);

    if (relevantReviews.length === 0) {
      return NextResponse.json({
        success: true,
        summary: 'ยังไม่มีรีวิวสำหรับรายการนี้',
        highlights: [],
        warnings: [],
        score: 0,
        sample_size: 0
      });
    }

    const avgRating = relevantReviews.reduce((s, r) => s + r.rating, 0) / relevantReviews.length;

    // Try to use Gemini for AI sentiment, fallback to rule-based
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Analyze these hotel reviews and provide a brief Thai sentiment summary.
Reviews: ${JSON.stringify(relevantReviews.map(r => ({ rating: r.rating, comment: r.comment })))}

Return ONLY a JSON object:
{
  "summary": "Thai summary (1-2 sentences)",
  "highlights": ["top positive points (max 3)"],
  "warnings": ["top negative points (max 3)"],
  "score": (number from -1 to 1 based on sentiment)
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json?\n?/gi, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return NextResponse.json({
          success: true,
          ...parsed,
          sample_size: relevantReviews.length
        });
      } catch {
        // Fall through to rule-based
      }
    }

    // Rule-based fallback
    const positives = relevantReviews.filter(r => r.rating >= 4).map(r => r.comment);
    const negatives = relevantReviews.filter(r => r.rating <= 3).map(r => r.comment);
    const score = (avgRating - 3) / 2;

    return NextResponse.json({
      success: true,
      summary: `จากรีวิว ${relevantReviews.length} รายการ คะแนนเฉลี่ย ${avgRating.toFixed(1)}/5`,
      highlights: positives.slice(0, 3),
      warnings: negatives.slice(0, 3),
      score: Number(score.toFixed(2)),
      sample_size: relevantReviews.length
    });
  } catch (error: any) {
    console.error('Sentiment API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
