const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { connectDatabase } = require('./config/db');
const Course = require('./models/Course');
const { mapCourseRow } = require('./utils/mapCourseRow');

async function seed() {
  await connectDatabase();
  const csvPath = path.resolve(__dirname, '../data/course_template.csv');
  const records = parse(fs.readFileSync(csvPath, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const operations = records.map(mapCourseRow).filter((course) => course.uniqueId).map((course) => ({
    updateOne: {
      filter: { uniqueId: course.uniqueId },
      update: { $set: course },
      upsert: true,
    },
  }));

  if (operations.length) await Course.bulkWrite(operations);
  console.log(`Seeded ${operations.length} courses`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
