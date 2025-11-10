export const LEVEL_PROGRESSION = [
  { level: 1, predictionRequired: 0, title: "Novice Seeker" },
  { level: 2, predictionRequired: 100, title: "Curious Explorer" },
  { level: 3, predictionRequired: 200, title: "Prediction Apprentice" },
  { level: 4, predictionRequired: 300, title: "Prophecy Student" },
  {
    level: 5,
    predictionRequired: 400,
    title: "Vision Seeker",
    perks: ["Unlock special AI agent chat themes"],
  },
  { level: 6, predictionRequired: 500, title: "Fortune Reader" },
  { level: 7, predictionRequired: 600, title: "Prediction Adept" },
  { level: 8, predictionRequired: 700, title: "AI Agent Disciple" },
  { level: 9, predictionRequired: 800, title: "Mystic Scholar" },
  {
    level: 10,
    predictionRequired: 900,
    title: "Prophecy Master",
    perks: ["Unlock exclusive AI agent tier", "Special AI agent insights"],
  },
  { level: 11, predictionRequired: 1000, title: "Seer Veteran" },
  { level: 12, predictionRequired: 1100, title: "Vision Keeper" },
  { level: 13, predictionRequired: 1200, title: "Prediction Champion" },
  { level: 14, predictionRequired: 1300, title: "Divination Expert" },
  {
    level: 15,
    predictionRequired: 1400,
    title: "Fortune Sage",
    perks: ["Unlock custom AI agent creation", "Enhanced AI agent responses"],
  },
  { level: 16, predictionRequired: 1500, title: "Prophecy Elder" },
  { level: 17, predictionRequired: 1600, title: "Master Seer" },
  { level: 18, predictionRequired: 1700, title: "AI Agent Archon" },
  { level: 19, predictionRequired: 1800, title: "Legendary Prophet" },
  {
    level: 20,
    predictionRequired: 1900,
    title: "Grand Predictor",
    perks: [
      "Unlock all features",
      "+20% XP & rewards",
      "Platform legend status",
    ],
  },
  { level: 21, predictionRequired: 2000, title: "Transcendent Seer" },
  { level: 22, predictionRequired: 2100, title: "Cosmic Visionary" },
  { level: 23, predictionRequired: 2200, title: "Eternal Predictor" },
  { level: 24, predictionRequired: 2300, title: "Omniscient One" },
  {
    level: 25,
    predictionRequired: 2400,
    title: "Deity of Prophecy",
    perks: ["Maximum prestige", "+50% all rewards", "Platform legend status"],
  },
];

export function getPredictionsForCurrentLevel(currentLevel: number) {
  const currentThreshold = LEVEL_PROGRESSION.find(
    (l) => l.level === currentLevel
  );
  return currentThreshold ? currentThreshold.predictionRequired : 0;
}

export function getPredictionsForNextLevel(currentLevel: number) {
  const nextLevelThreshold = LEVEL_PROGRESSION.find(
    (l) => l.level === currentLevel + 1
  );
  return nextLevelThreshold
    ? nextLevelThreshold.predictionRequired
    : LEVEL_PROGRESSION[LEVEL_PROGRESSION.length - 1].predictionRequired;
}

export function getCurrentProgress(
  totalPrediction: number,
  currentLevel: number
) {
  const currentLevelPrediction = getPredictionsForCurrentLevel(currentLevel);
  const nextLevelPrediction = getPredictionsForNextLevel(currentLevel);

  const xpIntoLevel = totalPrediction - currentLevelPrediction;
  const xpNeededForLevel = nextLevelPrediction - currentLevelPrediction;

  return Math.min(100, Math.floor((xpIntoLevel / xpNeededForLevel) * 100));
}
