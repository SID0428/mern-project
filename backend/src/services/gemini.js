const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey, geminiModel } = require('../config/env');
const Course = require('../models/Course');

async function fallbackRecommendations(preferences) {
  const searchTerms = [preferences.topics, preferences.skillLevel, preferences.description]
    .filter(Boolean)
    .join(' ');

  const query = searchTerms
    ? { $text: { $search: searchTerms } }
    : {};

  const courses = await Course.find(query).limit(5).lean();
  const ranked = courses.length ? courses : await Course.find().sort({ partnerCourse: -1 }).limit(5).lean();

  return ranked.map((course, index) => ({
    courseId: course.uniqueId,
    courseName: course.courseName,
    universityName: course.universityName,
    matchScore: Math.max(70, 95 - index * 6),
    rationale: `Matches the requested ${preferences.skillLevel || 'general'} level interests through ${course.disciplineMajor || course.courseLevel}.`,
  }));
}

async function generateRecommendations(preferences) {
  if (!geminiApiKey || geminiApiKey.includes('replace-with')) {
    return {
      source: 'mock',
      note: 'GEMINI_API_KEY is not configured. This is the mock path where the Gemini call is simulated.',
      recommendations: await fallbackRecommendations(preferences),
    };
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: geminiModel });
  const prompt = [
    'Return only valid JSON with a recommendations array.',
    'Each item must include courseName, universityName, matchScore, and rationale.',
    `Preferences: ${JSON.stringify(preferences)}`,
  ].join('\n');

  const result = await model.generateContent(prompt);
  const raw = result.response.text().replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(raw);
    return { source: 'gemini', recommendations: parsed.recommendations || [] };
  } catch {
    return { source: 'gemini', recommendations: await fallbackRecommendations(preferences) };
  }
}

module.exports = { generateRecommendations };
