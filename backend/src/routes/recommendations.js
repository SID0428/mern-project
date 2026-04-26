const express = require('express');
const { generateRecommendations } = require('../services/gemini');
const { getCache, setCache } = require('../services/cache');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const preferences = {
      topics: req.body.topics || req.body.description,
      skillLevel: req.body.skillLevel || 'beginner',
      description: req.body.description,
    };
    const cacheKey = `recommendations:${JSON.stringify(preferences)}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const payload = await generateRecommendations(preferences);
    await setCache(cacheKey, payload, 300);
    return res.json({ ...payload, cached: false });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
