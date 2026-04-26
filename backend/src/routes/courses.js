const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const Course = require('../models/Course');
const { requireAdmin } = require('../middleware/auth');
const { getCache, setCache, clearCacheByPrefix } = require('../services/cache');
const { mapCourseRow } = require('../utils/mapCourseRow');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

function buildQuery(query) {
  const filter = {};
  const { q, level, university, minTuition, maxTuition } = query;

  if (q) filter.$text = { $search: q };
  if (level && level !== 'all') filter.courseLevel = level;
  if (university && university !== 'all') filter.universityCode = university;
  if (minTuition || maxTuition) {
    filter.firstYearTuitionFee = {};
    if (minTuition) filter.firstYearTuitionFee.$gte = Number(minTuition);
    if (maxTuition) filter.firstYearTuitionFee.$lte = Number(maxTuition);
  }

  return filter;
}

router.get('/', async (req, res, next) => {
  try {
    const cacheKey = `courses:${JSON.stringify(req.query)}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 24), 1), 100);
    const filter = buildQuery(req.query);
    const [items, total] = await Promise.all([
      Course.find(filter)
        .sort(req.query.q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    const payload = { items, total, page, limit };
    await setCache(cacheKey, payload, 300);
    return res.json({ ...payload, cached: false });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cacheKey = `course:${req.params.id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ course: cached, cached: true });

    const course = await Course.findOne({ uniqueId: req.params.id }).lean();
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    await setCache(cacheKey, course, 600);
    return res.json({ course, cached: false });
  } catch (error) {
    return next(error);
  }
});

router.post('/upload', requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file is required.' });

    const records = parse(req.file.buffer.toString('utf8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    const courses = records.map(mapCourseRow).filter((course) => course.uniqueId && course.courseName);

    const operations = courses.map((course) => ({
      updateOne: {
        filter: { uniqueId: course.uniqueId },
        update: { $set: course },
        upsert: true,
      },
    }));

    if (operations.length) await Course.bulkWrite(operations, { ordered: false });
    await clearCacheByPrefix('course');

    return res.status(201).json({ imported: courses.length });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
