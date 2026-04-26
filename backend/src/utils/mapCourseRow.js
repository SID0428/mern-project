function clean(value) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim().replace(/\\$/, '');
  return text === '' || text.toUpperCase() === 'N/A' ? undefined : text;
}

function list(value) {
  const text = clean(value);
  return text ? text.split(',').map((item) => item.trim()).filter(Boolean) : [];
}

function number(value) {
  const text = clean(value);
  if (!text) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function yesNo(value) {
  return /^yes$/i.test(clean(value) || '');
}

function date(value) {
  const text = clean(value);
  if (!text) return undefined;
  const serial = Number(text);
  if (Number.isFinite(serial) && serial > 25000) {
    const milliseconds = Math.round((serial - 25569) * 86400 * 1000);
    return new Date(milliseconds).toISOString().slice(0, 10);
  }
  return text;
}

function mapCourseRow(row) {
  return {
    uniqueId: clean(row['Unique ID']),
    courseName: clean(row['Course Name']),
    courseCode: clean(row['Course Code']),
    universityCode: clean(row['University Code']),
    universityName: clean(row['University Name']),
    departmentSchool: clean(row['Department/School']),
    disciplineMajor: clean(row['Discipline/Major']),
    specialization: clean(row.Specialization),
    courseLevel: clean(row['Course Level']),
    overviewDescription: clean(row['Overview/Description']),
    summary: clean(row.Summary),
    prerequisites: list(row['Prerequisites (comma-separated)']),
    learningOutcomes: list(row['Learning Outcomes (comma-separated)']),
    teachingMethodology: clean(row['Teaching Methodology']),
    assessmentMethods: list(row['Assessment Methods (comma-separated)']),
    credits: number(row.Credits),
    durationMonths: number(row['Duration (Months)']),
    languageOfInstruction: clean(row['Language of Instruction']),
    syllabusUrl: clean(row['Syllabus URL']),
    keywords: list(row['Keywords (comma-separated)']),
    professorName: clean(row['Professor Name']),
    professorEmail: clean(row['Professor Email']),
    officeLocation: clean(row['Office Location']),
    openForIntake: clean(row['Open for Intake (Year/Semester)']),
    admissionOpenYears: clean(row['Admission Open Years']),
    attendanceType: clean(row['Attendance Type']),
    firstYearTuitionFee: number(row['1st Year Tuition Fee']),
    totalTuitionFee: number(row['Total Tuition Fee']),
    tuitionFeeCurrency: clean(row['Tuition Fee Currency']),
    applicationFeeAmount: number(row['Application Fee Amount']),
    applicationFeeCurrency: clean(row['Application Fee Currency']),
    applicationFeeWaived: yesNo(row['Application Fee Waived (Yes/No)']),
    requiredApplicationMaterials: clean(row['Required Application Materials']),
    twelfthGradeRequirement: clean(row['12th Grade Requirement']),
    undergraduateDegreeRequirement: clean(row['Undergraduate Degree Requirement']),
    minimumIELTSScore: number(row['Minimum IELTS Score']),
    minimumTOEFLScore: number(row['Minimum TOEFL Score']),
    minimumPTEScore: number(row['Minimum PTE Score']),
    minimumDuolingoScore: number(row['Minimum Duolingo Score']),
    minimumCambridgeEnglishScore: clean(row['Minimum Cambridge English Score']),
    otherEnglishTestsAccepted: clean(row['Other English Tests Accepted']),
    greRequired: yesNo(row['GRE Required (Yes/No)']),
    greScore: clean(row['GRE Score']),
    gmatRequired: yesNo(row['GMAT Required (Yes/No)']),
    gmatScore: clean(row['GMAT Score']),
    satRequired: yesNo(row['SAT Required (Yes/No)']),
    satScore: clean(row['SAT Score']),
    actRequired: yesNo(row['ACT Required (Yes/No)']),
    actScore: clean(row['ACT Score']),
    waiverOptions: clean(row['Waiver Options']),
    partnerCourse: yesNo(row['Partner Course (Yes/No)']),
    ftRanking2024: number(row['FT Ranking 2024']),
    acceptanceRate: number(row['Acceptance Rate']),
    domesticApplicationDeadline: date(row['Domestic Application Deadline']),
    internationalApplicationDeadline: date(row['International Application Deadline']),
    courseUrl: clean(row['Course URL']),
  };
}

module.exports = { mapCourseRow };
