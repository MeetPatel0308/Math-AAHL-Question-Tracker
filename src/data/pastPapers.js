export const ALL_TOPICS = [
  "Algebra",
  "Functions",
  "Trigonometry",
  "Vectors",
  "Calculus",
  "Statistics & Probability"
];

const getRandomTopics = (seed) => {
  // Use a pseudo-random approach based on the seed (question index) to have consistent data
  const numTopics = (seed % 3 === 0) ? 2 : 1;
  const topics = [];
  const startIdx = seed % ALL_TOPICS.length;
  
  topics.push(ALL_TOPICS[startIdx]);
  
  if (numTopics === 2) {
    const secondIdx = (startIdx + 2) % ALL_TOPICS.length;
    topics.push(ALL_TOPICS[secondIdx]);
  }
  
  return topics;
};

export const generateQuestions = (year, series, tz, paper, numQuestions) => {
  const questions = [];
  for (let i = 1; i <= numQuestions; i++) {
    let section = "A";
    if (paper === "Paper 1" || paper === "Paper 2") {
      if (i > 9) section = "B";
    } else {
      section = "N/A";
    }

    const globalSeed = year + i + (series === "May" ? 1 : 2) + (paper === "Paper 1" ? 1 : paper === "Paper 2" ? 2 : 3);
    const topics = getRandomTopics(globalSeed);

    questions.push({
      id: `${year}-${series}-${tz}-${paper.replace(" ", "")}-Q${i}`,
      number: i,
      section: section,
      topics: topics,
      // Metadata for display in topic view
      metadata: {
        year,
        series,
        timezone: tz,
        paperName: paper
      }
    });
  }
  return questions;
};

export const pastPapersData = [
  {
    year: 2023,
    seriesList: [
      {
        series: "May",
        timezones: [
          {
            timezone: "TZ1",
            papers: [
              { paperName: "Paper 1", questions: generateQuestions(2023, "May", "TZ1", "Paper 1", 12) },
              { paperName: "Paper 2", questions: generateQuestions(2023, "May", "TZ1", "Paper 2", 12) },
              { paperName: "Paper 3", questions: generateQuestions(2023, "May", "TZ1", "Paper 3", 3) },
            ],
          },
          {
            timezone: "TZ2",
            papers: [
              { paperName: "Paper 1", questions: generateQuestions(2023, "May", "TZ2", "Paper 1", 12) },
              { paperName: "Paper 2", questions: generateQuestions(2023, "May", "TZ2", "Paper 2", 12) },
              { paperName: "Paper 3", questions: generateQuestions(2023, "May", "TZ2", "Paper 3", 3) },
            ],
          },
        ],
      },
      {
        series: "November",
        timezones: [
          {
            timezone: "TZ0",
            papers: [
              { paperName: "Paper 1", questions: generateQuestions(2023, "Nov", "TZ0", "Paper 1", 12) },
              { paperName: "Paper 2", questions: generateQuestions(2023, "Nov", "TZ0", "Paper 2", 12) },
              { paperName: "Paper 3", questions: generateQuestions(2023, "Nov", "TZ0", "Paper 3", 3) },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 2022,
    seriesList: [
      {
        series: "May",
        timezones: [
          {
            timezone: "TZ1",
            papers: [
              { paperName: "Paper 1", questions: generateQuestions(2022, "May", "TZ1", "Paper 1", 12) },
              { paperName: "Paper 2", questions: generateQuestions(2022, "May", "TZ1", "Paper 2", 12) },
              { paperName: "Paper 3", questions: generateQuestions(2022, "May", "TZ1", "Paper 3", 3) },
            ],
          },
          {
            timezone: "TZ2",
            papers: [
              { paperName: "Paper 1", questions: generateQuestions(2022, "May", "TZ2", "Paper 1", 12) },
              { paperName: "Paper 2", questions: generateQuestions(2022, "May", "TZ2", "Paper 2", 12) },
              { paperName: "Paper 3", questions: generateQuestions(2022, "May", "TZ2", "Paper 3", 3) },
            ],
          },
        ],
      },
      {
        series: "November",
        timezones: [
          {
            timezone: "TZ0",
            papers: [
              { paperName: "Paper 1", questions: generateQuestions(2022, "Nov", "TZ0", "Paper 1", 12) },
              { paperName: "Paper 2", questions: generateQuestions(2022, "Nov", "TZ0", "Paper 2", 12) },
              { paperName: "Paper 3", questions: generateQuestions(2022, "Nov", "TZ0", "Paper 3", 3) },
            ],
          },
        ],
      },
    ],
  },
];
