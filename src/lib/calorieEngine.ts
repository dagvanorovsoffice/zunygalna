export type Gender = 'male' | 'female';
export type CommuteMethod = 'walk' | 'bus_walk' | 'bike' | 'car' | 'wfh';
export type ExerciseIntensity = 'light' | 'moderate' | 'intense';
export type DeficitTier = 'light' | 'medium' | 'heavy';

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  targetDate: string; // YYYY-MM-DD (defaults to next June 15)
  commuteMethod: CommuteMethod;
  commuteDistanceKm: number; // one-way km
  commuteRoundTrip: boolean;
  exerciseDaysPerWeek: number;
  exerciseIntensity: ExerciseIntensity;
  deficitTier: DeficitTier;
  // Two linked sliders ("Two sides of the same coin"):
  // Total daily net deficit = movementAddKcal + dietCutKcal
  movementAddKcal: number; // Prioritized 1st: extra daily movement burn
  dietCutKcal: number; // 2nd: food calorie reduction from baseline maintenance
  // Optional overrides for Body Recomposition (Further tab)
  customBodyFatPct?: number;
  customMusclePct?: number;
  dailyProteinGrams?: number;
  resistanceDaysPerWeek?: number;
}

export interface DailyProgressLog {
  date: string; // YYYY-MM-DD
  walkedMeters: number; // e.g., 4200 m
  exerciseBurnKcal: number; // e.g., 220 kcal
  commuteCompleted: boolean;
  extraIntakeKcal: number; // >0 if user ate over target (pushes burn goal flag right!)
  fastingBonusKcal: number; // >0 if user fasted or ate lighter than target (boosts deficit brightness)
  netDeficitAchievedKcal: number;
  totalBurnAchievedKcal: number;
  effectiveBurnGoalKcal: number;
}

export interface FriendRacer {
  id: string;
  name: string;
  relation: 'friend' | 'family';
  avatarColor: string;
  badgeEmoji: string;
  todayBurnKcal: number;
  todayGoalKcal: number; // Friend's daily calorie burn goal (visible on the linear track!)
  todayWalkedMeters: number;
  weightLostKg: number;
  goalCompletionPct: number;
  weeklyDeficitStreak: number[]; // 7 days of deficit kcal for mini heatmap
  lastActiveTextMn: string;
  lastActiveTextEn: string;
}

export function getNextJune15(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const june15ThisYear = new Date(year, 5, 15); // Month is 0-indexed (5 = June)
  // If we are already past June 1st of this year, target next year's June 15th
  if (referenceDate >= new Date(year, 5, 1)) {
    return `${year + 1}-06-15`;
  }
  return `${year}-06-15`;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Тэмүүлэн',
  gender: 'male',
  age: 28,
  heightCm: 172,
  weightKg: 78,
  targetWeightKg: 68,
  targetDate: getNextJune15(),
  commuteMethod: 'bus_walk',
  commuteDistanceKm: 2.5,
  commuteRoundTrip: true,
  exerciseDaysPerWeek: 2,
  exerciseIntensity: 'moderate',
  deficitTier: 'medium',
  movementAddKcal: 320, // Movement prioritized first!
  dietCutKcal: 230, // Smaller food cut needed because movement is high
  dailyProteinGrams: 115,
  resistanceDaysPerWeek: 3,
};

export const DEFICIT_TIERS: Record<
  DeficitTier,
  {
    totalDeficitKcal: number;
    defaultMovementSplitPct: number; // Prioritize movement first!
    weeklyLossKg: number;
    labelMn: string;
    labelEn: string;
    descMn: string;
    descEn: string;
    studyNoteMn: string;
    studyNoteEn: string;
  }
> = {
  light: {
    totalDeficitKcal: 350,
    defaultMovementSplitPct: 0.65, // 65% from movement (+230 kcal), 35% from food (-120 kcal)
    weeklyLossKg: 0.32,
    labelMn: 'Хөнгөн (Light)',
    labelEn: 'Light Pace',
    descMn: 'Өлсөхгүйгээр алхалт болон хөдөлгөөнөө нэмж аажмаар галбиржих',
    descEn: 'Gentle pace prioritizing daily walking with minimal food restriction',
    studyNoteMn: 'Япон улсын "Metabo" хөтөлбөр: өдөрт +3,000 алхам ба бага зэргийн илчлэг хасалт (~350 ккал) нь булчин алдахгүйгээр дотор өөхийг тууштай бууруулдаг.',
    studyNoteEn: 'Japanese Metabo Guideline: +3,000 daily steps + mild dietary cut (~350 kcal/day) steadily reduces visceral fat without muscle loss.',
  },
  medium: {
    totalDeficitKcal: 550,
    defaultMovementSplitPct: 0.58, // ~320 kcal movement + ~230 kcal food cut
    weeklyLossKg: 0.5,
    labelMn: 'Дундаж (Medium)',
    labelEn: 'Balanced Standard',
    descMn: 'Эмч нарын хамгийн их зөвлөдөг тэнцвэртэй хурд (7 хоногт ~0.5 кг)',
    descEn: 'Doctor-recommended gold standard (~0.5 kg/week via active burn + smart meals)',
    studyNoteMn: 'Азийн Таргалалт Судлалын Холбоо (AASO) болон БНСУ-ын KSSO зөвлөмж: өдөрт ~500–550 ккал алдагдлыг хөдөлгөөн + хоолны зохицуулалтаар хослуулах нь хамгийн тогтвортой үр дүн өгдөг.',
    studyNoteEn: 'Asian-Pacific & Korean Society for the Study of Obesity (KSSO): ~500–550 kcal/day deficit combining daily walking and portion control yields highest long-term adherence.',
  },
  heavy: {
    totalDeficitKcal: 750,
    defaultMovementSplitPct: 0.53, // ~400 kcal movement + ~350 kcal food cut
    weeklyLossKg: 0.68,
    labelMn: 'Эрчимтэй (Heavy)',
    labelEn: 'Intensive Push',
    descMn: 'Зуны өмнө богино хугацаанд өндөр идэвх, чанд хооллолтоор жин хасах',
    descEn: 'High daily movement + disciplined meal portions for maximum safe summer transformation',
    studyNoteMn: 'Ази хүний бодисын солилцооны аюулгүй дээд хязгаар: өдөрт 750 ккал-аас хэтэрсэн хоолны хасалт нь булчин задлах эрсдэлтэй тул хөдөлгөөний шаталтыг өндөр байлгах шаардлагатай.',
    studyNoteEn: 'Safe Asian clinical ceiling: deficits up to 750 kcal/day must derive heavily from physical activity so food intake never drops below safe BMR floors (1,200/1,500 kcal).',
  },
};

export interface AsianBmiResult {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2';
  labelMn: string;
  labelEn: string;
  healthyMinKg: number;
  healthyMaxKg: number;
  colorClass: string;
}

/**
 * WHO Western Pacific Region (WPRO) Asian BMI Cutoffs:
 * Normal: 18.5 - 22.9 kg/m²
 * Overweight (At Risk): 23.0 - 24.9 kg/m²
 * Obese I: 25.0 - 29.9 kg/m²
 * Obese II: >= 30.0 kg/m²
 */
export function calculateAsianBmi(heightCm: number, weightKg: number): AsianBmiResult {
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  const healthyMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const healthyMaxKg = Math.round(22.9 * heightM * heightM * 10) / 10;

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'underweight',
      labelMn: 'Жингийн дутагдалтай (<18.5)',
      labelEn: 'Underweight (<18.5 Asian WPRO)',
      healthyMinKg,
      healthyMaxKg,
      colorClass: 'text-sky-700 bg-sky-50 border border-sky-200',
    };
  }
  if (bmi < 23.0) {
    return {
      bmi,
      category: 'normal',
      labelMn: 'Хэвийн жин (Ази стандарт 18.5–22.9)',
      labelEn: 'Normal Weight (Asian WPRO 18.5–22.9)',
      healthyMinKg,
      healthyMaxKg,
      colorClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    };
  }
  if (bmi < 25.0) {
    return {
      bmi,
      category: 'overweight',
      labelMn: 'Илүүдэл жингийн эрсдэлтэй (23.0–24.9)',
      labelEn: 'Overweight / At-Risk (Asian WPRO 23.0–24.9)',
      healthyMinKg,
      healthyMaxKg,
      colorClass: 'text-amber-700 bg-amber-50 border border-amber-200',
    };
  }
  if (bmi < 30.0) {
    return {
      bmi,
      category: 'obese1',
      labelMn: 'Таргалалт I зэрэг (≥25.0 Ази стандарт)',
      labelEn: 'Obese Class I (Asian WPRO ≥25.0)',
      healthyMinKg,
      healthyMaxKg,
      colorClass: 'text-orange-700 bg-orange-50 border border-orange-200',
    };
  }
  return {
    bmi,
    category: 'obese2',
    labelMn: 'Таргалалт II зэрэг (≥30.0)',
    labelEn: 'Obese Class II (≥30.0)',
    healthyMinKg,
    healthyMaxKg,
    colorClass: 'text-rose-700 bg-rose-50 border border-rose-200',
  };
}

/**
 * Calculates BMR using Ganpule et al. (2007) Asian-validated equation blended with Mifflin-St Jeor.
 */
export function calculateAsianBmr(gender: Gender, age: number, heightCm: number, weightKg: number): number {
  // Mifflin-St Jeor
  const mifflin =
    10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
  // Ganpule et al. (2007) Asian equation (in kcal/day)
  // Male: (0.0481 * W + 0.0234 * H - 0.0138 * A - 0.4235) * 1000 / 4.186
  // Female: (0.0481 * W + 0.0234 * H - 0.0138 * A - 0.9708) * 1000 / 4.186
  const ganpule =
    ((0.0481 * weightKg +
      0.0234 * heightCm -
      0.0138 * age -
      (gender === 'male' ? 0.4235 : 0.9708)) *
      1000) /
    4.186;

  return Math.round((mifflin + ganpule) / 2);
}

/**
 * Calculates daily work-home travel (commute) active calorie burn and walking meters.
 */
export function calculateCommuteMetrics(
  weightKg: number,
  method: CommuteMethod,
  oneWayKm: number,
  roundTrip: boolean
): { commuteKcal: number; commuteActiveMeters: number } {
  const totalKm = oneWayKm * (roundTrip ? 2 : 1);

  switch (method) {
    case 'walk': {
      // Walking burns ~0.72 kcal per kg per km
      const kcal = Math.round(totalKm * weightKg * 0.72);
      return { commuteKcal: kcal, commuteActiveMeters: Math.round(totalKm * 1000) };
    }
    case 'bus_walk': {
      // Bus commuters typically walk ~35% of the distance (to/from bus stops, standing) up to 2.2 km total
      const walkedKm = Math.min(2.4, Math.max(0.8, totalKm * 0.35));
      const standingKcal = Math.round(weightKg * 0.35);
      const walkKcal = Math.round(walkedKm * weightKg * 0.72);
      return {
        commuteKcal: walkKcal + standingKcal,
        commuteActiveMeters: Math.round(walkedKm * 1000),
      };
    }
    case 'bike': {
      // Cycling burns ~0.38 kcal per kg per km, equivalent journey distance
      const kcal = Math.round(totalKm * weightKg * 0.38);
      return { commuteKcal: kcal, commuteActiveMeters: Math.round(totalKm * 1000) };
    }
    case 'car': {
      // Short walk to parking (~300m total)
      return { commuteKcal: Math.round(weightKg * 0.25), commuteActiveMeters: 300 };
    }
    case 'wfh':
    default:
      return { commuteKcal: 0, commuteActiveMeters: 0 };
  }
}

/**
 * Calculates average daily exercise calorie burn from weekly sessions.
 */
export function calculateExerciseDailyAverage(
  weightKg: number,
  daysPerWeek: number,
  intensity: ExerciseIntensity
): { dailyAvgExerciseKcal: number; singleSessionKcal: number } {
  if (daysPerWeek <= 0) {
    return { dailyAvgExerciseKcal: 0, singleSessionKcal: 0 };
  }
  // Assume ~45 minute workout session
  // METs: light = 3.5, moderate = 6.0, intense = 8.5
  const met = intensity === 'light' ? 3.5 : intensity === 'moderate' ? 6.0 : 8.5;
  const durationHours = 0.75; // 45 mins
  const singleSessionKcal = Math.round(met * weightKg * durationHours);
  const dailyAvgExerciseKcal = Math.round((singleSessionKcal * daysPerWeek) / 7);
  return { dailyAvgExerciseKcal, singleSessionKcal };
}

/**
 * Converts calories burned via movement into equivalent walking meters (and km) for the linear journey.
 */
export function kcalToWalkingMeters(kcal: number, weightKg: number): number {
  const kcalPerKm = Math.max(40, weightKg * 0.72);
  return Math.round((kcal / kcalPerKm) * 1000);
}

export function walkingMetersToKcal(meters: number, weightKg: number): number {
  const kcalPerKm = Math.max(40, weightKg * 0.72);
  return Math.round((meters / 1000) * kcalPerKm);
}

export interface CaloriePlanSummary {
  bmrKcal: number;
  baseNeatKcal: number; // Non-exercise baseline daily living (1.2x BMR)
  commuteKcal: number;
  commuteActiveMeters: number;
  dailyAvgExerciseKcal: number;
  singleSessionKcal: number;
  baselineTdeeKcal: number; // Current daily burn before adding extra summer-goal movement
  projectedTotalBurnKcal: number; // baselineTdeeKcal + movementAddKcal
  recommendedDailyFoodKcal: number; // baselineTdeeKcal - dietCutKcal (floored at safe limit)
  safeMinFoodKcal: number;
  totalDailyNetDeficitKcal: number; // movementAddKcal + effectiveDietCutKcal
  extraMovementMetersPerDay: number;
  totalDailyTargetActiveBurnKcal: number; // Commute + Avg Exercise + Extra Movement Slider
  totalDailyTargetDistanceMeters: number;
  daysUntilSummerTarget: number;
  kgToLose: number;
  requiredDailyDeficitForTargetDate: number;
  projectedWeightOnTargetDateKg: number;
  estimatedCompletionDate: string;
  tierProjections: Record<
    DeficitTier,
    {
      totalDeficitKcal: number;
      projectedWeightBySummerKg: number;
      estimatedGoalDate: string;
      daysNeeded: number;
    }
  >;
}

export function calculateCaloriePlan(
  profile: UserProfile,
  referenceDate: Date = new Date()
): CaloriePlanSummary {
  const bmrKcal = calculateAsianBmr(
    profile.gender,
    profile.age,
    profile.heightCm,
    profile.weightKg
  );
  // Base sedentary living NEAT (20% of BMR)
  const baseNeatKcal = Math.round(bmrKcal * 0.2);

  const { commuteKcal, commuteActiveMeters } = calculateCommuteMetrics(
    profile.weightKg,
    profile.commuteMethod,
    profile.commuteDistanceKm,
    profile.commuteRoundTrip
  );

  const { dailyAvgExerciseKcal, singleSessionKcal } = calculateExerciseDailyAverage(
    profile.weightKg,
    profile.exerciseDaysPerWeek,
    profile.exerciseIntensity
  );

  const baselineTdeeKcal = bmrKcal + baseNeatKcal + commuteKcal + dailyAvgExerciseKcal;
  const safeMinFoodKcal = profile.gender === 'male' ? 1450 : 1200;

  // Apply the two linked sliders:
  // 1) Extra movement burn
  const movementAddKcal = Math.max(0, Math.round(profile.movementAddKcal));
  // 2) Food calorie cut (respecting safe minimum food intake floor)
  const maxSafeDietCut = Math.max(0, baselineTdeeKcal - safeMinFoodKcal);
  const effectiveDietCutKcal = Math.min(Math.max(0, Math.round(profile.dietCutKcal)), maxSafeDietCut);

  const recommendedDailyFoodKcal = baselineTdeeKcal - effectiveDietCutKcal;
  const projectedTotalBurnKcal = baselineTdeeKcal + movementAddKcal;
  const totalDailyNetDeficitKcal = movementAddKcal + effectiveDietCutKcal;

  const extraMovementMetersPerDay = kcalToWalkingMeters(movementAddKcal, profile.weightKg);
  const totalDailyTargetActiveBurnKcal =
    commuteKcal + dailyAvgExerciseKcal + movementAddKcal;
  const totalDailyTargetDistanceMeters =
    commuteActiveMeters +
    kcalToWalkingMeters(dailyAvgExerciseKcal, profile.weightKg) +
    extraMovementMetersPerDay;

  // Date & Weight math (1 kg body fat ≈ 7,700 kcal)
  const targetDateObj = new Date(profile.targetDate + 'T00:00:00');
  const diffMs = targetDateObj.getTime() - referenceDate.getTime();
  const daysUntilSummerTarget = Math.max(14, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const kgToLose = Math.max(0, Number((profile.weightKg - profile.targetWeightKg).toFixed(1)));
  const totalKcalToLose = kgToLose * 7700;
  const requiredDailyDeficitForTargetDate = Math.round(totalKcalToLose / daysUntilSummerTarget);

  const projectedKgLostBySummer = (totalDailyNetDeficitKcal * daysUntilSummerTarget) / 7700;
  const projectedWeightOnTargetDateKg = Number(
    Math.max(40, profile.weightKg - projectedKgLostBySummer).toFixed(1)
  );

  const daysNeededAtCurrentDeficit =
    totalDailyNetDeficitKcal > 0
      ? Math.ceil(totalKcalToLose / totalDailyNetDeficitKcal)
      : 365;
  const completionDateObj = new Date(
    referenceDate.getTime() + daysNeededAtCurrentDeficit * 24 * 60 * 60 * 1000
  );
  const estimatedCompletionDate = completionDateObj.toISOString().slice(0, 10);

  const tierProjections = (['light', 'medium', 'heavy'] as DeficitTier[]).reduce(
    (acc, tier) => {
      const def = DEFICIT_TIERS[tier].totalDeficitKcal;
      const lostBySummer = (def * daysUntilSummerTarget) / 7700;
      const weightBySummer = Number(
        Math.max(40, profile.weightKg - lostBySummer).toFixed(1)
      );
      const dNeeded = kgToLose > 0 ? Math.ceil((kgToLose * 7700) / def) : 0;
      const dObj = new Date(referenceDate.getTime() + dNeeded * 24 * 60 * 60 * 1000);
      acc[tier] = {
        totalDeficitKcal: def,
        projectedWeightBySummerKg: weightBySummer,
        estimatedGoalDate: dObj.toISOString().slice(0, 10),
        daysNeeded: dNeeded,
      };
      return acc;
    },
    {} as CaloriePlanSummary['tierProjections']
  );

  return {
    bmrKcal,
    baseNeatKcal,
    commuteKcal,
    commuteActiveMeters,
    dailyAvgExerciseKcal,
    singleSessionKcal,
    baselineTdeeKcal,
    projectedTotalBurnKcal,
    recommendedDailyFoodKcal,
    safeMinFoodKcal,
    totalDailyNetDeficitKcal,
    extraMovementMetersPerDay,
    totalDailyTargetActiveBurnKcal,
    totalDailyTargetDistanceMeters,
    daysUntilSummerTarget,
    kgToLose,
    requiredDailyDeficitForTargetDate,
    projectedWeightOnTargetDateKg,
    estimatedCompletionDate,
    tierProjections,
  };
}

export interface BodyRecompAnalysis {
  estimatedBodyFatPct: number;
  estimatedSkeletalMusclePct: number;
  fatMassKg: number;
  skeletalMuscleMassKg: number;
  projectedSummerFatPct: number;
  projectedSummerMusclePct: number;
  proteinGramsPerKg: number;
  targetProteinGrams: number;
  isPromotingMuscleGrowth: boolean;
  recompScore: number; // 0 to 100
  statusTitleMn: string;
  statusTitleEn: string;
  adviceMn: string;
  adviceEn: string;
  extraMuscleBmrBoostKcal: number; // How much +2kg muscle increases daily burn
}

/**
 * Evaluates Fat Ratio (%) vs. Muscle Ratio (%) and whether muscle growth is promoted while lowering fat.
 */
export function calculateBodyRecomp(
  profile: UserProfile,
  plan: CaloriePlanSummary
): BodyRecompAnalysis {
  const { bmi } = calculateAsianBmi(profile.heightCm, profile.weightKg);
  const sexFactor = profile.gender === 'male' ? 1 : 0;

  // Asian-calibrated Deurenberg body fat estimation if not overridden by smart scale
  const rawBodyFat =
    1.2 * bmi + 0.23 * profile.age - 10.8 * sexFactor - 4.2; // +1.2% Asian visceral adjustment
  const estimatedBodyFatPct = Number(
    (
      profile.customBodyFatPct ??
      Math.min(48, Math.max(profile.gender === 'male' ? 8 : 14, rawBodyFat))
    ).toFixed(1)
  );

  // Skeletal muscle mass % (typical healthy range: ~38-44% male, ~30-36% female)
  const rawMusclePct =
    profile.gender === 'male'
      ? Math.max(26, 54 - estimatedBodyFatPct * 0.65)
      : Math.max(22, 46 - estimatedBodyFatPct * 0.62);
  const estimatedSkeletalMusclePct = Number(
    (profile.customMusclePct ?? rawMusclePct).toFixed(1)
  );

  const fatMassKg = Number(((profile.weightKg * estimatedBodyFatPct) / 100).toFixed(1));
  const skeletalMuscleMassKg = Number(
    ((profile.weightKg * estimatedSkeletalMusclePct) / 100).toFixed(1)
  );

  const targetProteinGrams = Math.round(profile.weightKg * 1.6);
  const currentProtein =
    profile.dailyProteinGrams ?? Math.round((plan.recommendedDailyFoodKcal * 0.25) / 4);
  const proteinGramsPerKg = Number((currentProtein / profile.weightKg).toFixed(2));
  const resistanceDays = profile.resistanceDaysPerWeek ?? profile.exerciseDaysPerWeek;

  // Check if conditions promote muscle growth while lowering fat ratio:
  // 1) Protein >= 1.4 g/kg
  // 2) Resistance/Exercise >= 2 days/wk
  // 3) Food deficit not overly aggressive (<= 500 kcal food cut)
  const proteinScore = Math.min(40, Math.round((proteinGramsPerKg / 1.6) * 40));
  const exerciseScore = Math.min(40, Math.round((resistanceDays / 3) * 40));
  const deficitSafetyScore = plan.recommendedDailyFoodKcal >= plan.safeMinFoodKcal + 150 ? 20 : 10;
  const recompScore = Math.min(100, proteinScore + exerciseScore + deficitSafetyScore);

  const isPromotingMuscleGrowth =
    proteinGramsPerKg >= 1.35 && resistanceDays >= 2 && profile.dietCutKcal <= 500;

  // Project summer body composition on June 15th
  const totalWeightLossKg = Math.max(
    0,
    profile.weightKg - plan.projectedWeightOnTargetDateKg
  );
  const muscleChangeKg = isPromotingMuscleGrowth
    ? Math.min(2.2, (plan.daysUntilSummerTarget / 30) * 0.28)
    : -Math.min(1.5, totalWeightLossKg * 0.18);
  const fatLostKg = Math.max(0, totalWeightLossKg + (muscleChangeKg > 0 ? muscleChangeKg * 0.5 : 0));

  const summerWeight = plan.projectedWeightOnTargetDateKg;
  const summerFatMass = Math.max(4, fatMassKg - fatLostKg);
  const summerMuscleMass = Math.max(15, skeletalMuscleMassKg + muscleChangeKg);

  const projectedSummerFatPct = Number(((summerFatMass / summerWeight) * 100).toFixed(1));
  const projectedSummerMusclePct = Number(
    ((summerMuscleMass / summerWeight) * 100).toFixed(1)
  );

  // 1 kg of skeletal muscle burns ~13-15 kcal/day at rest, plus ~30-45 kcal/day via amplified NEAT/workout output
  const extraMuscleBmrBoostKcal = 90; // For +2kg active muscle mass (resting + active metabolic effect)

  let statusTitleMn = 'Булчин өсөж, өөхний хувь буурч байна (Recomposition)';
  let statusTitleEn = 'Muscle Growth Promoted & Fat Ratio Lowering';
  let adviceMn =
    'Таны уургийн хэмжээ болон идэвхтэй хөдөлгөөн булчингийн массыг дэмжиж, зөвхөн өөхнөөс жин хасах төгс нөхцөлийг бүрдүүлж байна.';
  let adviceEn =
    'Your protein intake and active movement protect and build lean muscle while selectively burning body fat.';

  if (!isPromotingMuscleGrowth) {
    if (proteinGramsPerKg < 1.35) {
      statusTitleMn = 'Өөх буурч байгаа ч уураг нэмэх шаардлагатай';
      statusTitleEn = 'Fat Lowering, But Needs More Protein for Muscle Growth';
      adviceMn = `Булчингийн хувиа өсгөхийн тулд өдөрт ~${targetProteinGrams}г уураг (үхрийн мах, өндөг, тахиа, аарц) хэрэглээрэй.`;
      adviceEn = `Increase daily protein toward ~${targetProteinGrams}g (lean beef, eggs, chicken, curd) to promote muscle synthesis while losing fat.`;
    } else if (resistanceDays < 2) {
      statusTitleMn = 'Хүчний дасгал нэмбэл булчингийн хувь илүү өснө';
      statusTitleEn = 'Add Resistance Exercise to Boost Muscle Ratio';
      adviceMn =
        'Долоо хоногт 2–3 удаа булчин чангалах дасгал (суулт, гар дээр суниалт, фитнесс) нэмснээр суурь шаталт (BMR) эрс нэмэгдэнэ.';
      adviceEn =
        'Adding 2–3 weekly resistance sessions signals your body to build lean muscle while burning fat.';
    } else {
      statusTitleMn = 'Хоолны хасалтаа багасгаж хөдөлгөөнөө нэмээрэй';
      statusTitleEn = 'Shift Deficit Toward Movement to Protect Muscle';
      adviceMn =
        'Хоолноос хэт их илчлэг хасах нь булчин задлах тул хос гулсуураар хөдөлгөөний шаталтаа нэмж хоолны хасалтаа зөөллөөрэй.';
      adviceEn =
        'Large dietary cuts can reduce muscle mass. Use the linked sliders to shift more deficit into daily movement.';
    }
  }

  return {
    estimatedBodyFatPct,
    estimatedSkeletalMusclePct,
    fatMassKg,
    skeletalMuscleMassKg,
    projectedSummerFatPct,
    projectedSummerMusclePct,
    proteinGramsPerKg,
    targetProteinGrams,
    isPromotingMuscleGrowth,
    recompScore,
    statusTitleMn,
    statusTitleEn,
    adviceMn,
    adviceEn,
    extraMuscleBmrBoostKcal,
  };
}

/**
 * Generates realistic 28-day history for the Duolingo / GitHub Commit Deficit Heatmap
 * so the user immediately sees how brighter squares represent higher daily deficits.
 */
export function generateInitialHeatmapHistory(targetDeficitKcal: number): DailyProgressLog[] {
  const logs: DailyProgressLog[] = [];
  const today = new Date();
  // Deterministic pattern of realistic daily achievements over the past 27 days
  const sampleMultipliers = [
    0.6, 0.85, 1.05, 0.9, 1.35, 1.1, 0.4,
    0.95, 1.15, 1.45, 0.8, 1.0, 1.25, 0.75,
    1.1, 1.3, 0.5, 0.95, 1.2, 1.5, 1.05,
    0.85, 1.15, 1.4, 1.0, 1.25, 1.35,
  ];

  for (let i = 27; i >= 1; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const mult = sampleMultipliers[(27 - i) % sampleMultipliers.length];
    const netDeficit = Math.round(targetDeficitKcal * mult);
    const walkedMeters = Math.round(2800 * mult + (i % 3) * 650);
    const exerciseKcal = i % 2 === 0 ? Math.round(180 * mult) : 0;
    const fastingBonus = i % 6 === 0 ? 180 : 0;

    logs.push({
      date: dateStr,
      walkedMeters,
      exerciseBurnKcal: exerciseKcal,
      commuteCompleted: mult >= 0.7,
      extraIntakeKcal: mult < 0.6 ? 220 : 0,
      fastingBonusKcal: fastingBonus,
      netDeficitAchievedKcal: netDeficit,
      totalBurnAchievedKcal: Math.round(450 * mult),
      effectiveBurnGoalKcal: 450,
    });
  }

  return logs;
}

export const INITIAL_FRIENDS_AND_FAMILY: FriendRacer[] = [
  {
    id: 'friend-1',
    name: 'Болд-Эрдэнэ (Ах)',
    relation: 'family',
    avatarColor: 'from-amber-500 to-orange-600',
    badgeEmoji: '🔥',
    todayBurnKcal: 640,
    todayGoalKcal: 550, // Overdid his goal today!
    todayWalkedMeters: 6850,
    weightLostKg: 4.2,
    goalCompletionPct: 116,
    weeklyDeficitStreak: [480, 620, 710, 540, 690, 820, 640],
    lastActiveTextMn: 'Ажил руугаа 3.2 км алхаж, зорилгоо давууллаа!',
    lastActiveTextEn: 'Walked 3.2 km to work and surpassed daily burn goal!',
  },
  {
    id: 'friend-2',
    name: 'Номин (Найз)',
    relation: 'friend',
    avatarColor: 'from-pink-500 to-rose-600',
    badgeEmoji: '⚡',
    todayBurnKcal: 490,
    todayGoalKcal: 520,
    todayWalkedMeters: 5400,
    weightLostKg: 3.6,
    goalCompletionPct: 94,
    weeklyDeficitStreak: [510, 490, 630, 580, 420, 650, 490],
    lastActiveTextMn: 'Оройн хоолоо хөнгөн идээд +1.5 км алхсан',
    lastActiveTextEn: 'Ate a light dinner and walked +1.5 km',
  },
  {
    id: 'friend-3',
    name: 'Баттулга (Найз)',
    relation: 'friend',
    avatarColor: 'from-sky-500 to-indigo-600',
    badgeEmoji: '🏃',
    todayBurnKcal: 360,
    todayGoalKcal: 680, // Ate extra snack so his goal moved further right!
    todayWalkedMeters: 3900,
    weightLostKg: 2.8,
    goalCompletionPct: 53,
    weeklyDeficitStreak: [320, 450, 520, 390, 610, 480, 360],
    lastActiveTextMn: 'Амттан идсэн тул шатаах зорилго нь +150 ккал-аар холдсон',
    lastActiveTextEn: 'Logged an extra snack (+150 kcal) so burn goal shifted further right',
  },
  {
    id: 'friend-4',
    name: 'Сарангэрэл (Эгч)',
    relation: 'family',
    avatarColor: 'from-purple-500 to-violet-600',
    badgeEmoji: '🌿',
    todayBurnKcal: 290,
    todayGoalKcal: 420,
    todayWalkedMeters: 3150,
    weightLostKg: 3.1,
    goalCompletionPct: 69,
    weeklyDeficitStreak: [410, 440, 390, 520, 490, 530, 290],
    lastActiveTextMn: 'Автобусны буудлаас гэр хүртэл 1.2 км алхсан',
    lastActiveTextEn: 'Walked 1.2 km from the bus stop home',
  },
];
