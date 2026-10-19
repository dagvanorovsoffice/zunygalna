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

export function getNextJune15(referenceDate: Date = new Date('2026-10-19T00:00:00')): string {
  const year = referenceDate.getFullYear();
  if (referenceDate >= new Date(year, 5, 1)) {
    return `${year + 1}-06-15`;
  }
  return `${year}-06-15`;
}

export function getDaysUntilDate(
  targetDateStr: string,
  referenceDate: Date = new Date()
): number {
  const targetDateObj = new Date(targetDateStr + 'T00:00:00');
  const refStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const diffMs = targetDateObj.getTime() - refStart.getTime();
  return Math.max(14, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export interface TierDefinition {
  totalDeficitKcal: number;
  defaultMovementSplitPct: number;
  weeklyLossKg: number;
  labelMn: string;
  labelEn: string;
  descMn: string;
  descEn: string;
  studyNoteMn: string;
  studyNoteEn: string;
}

/**
 * Dynamically computes the 3 Deficit Tiers (Light, Medium, Heavy) anchored to the user's
 * Target Weight and Summer Target Date (June 15th), while respecting Asian clinical guidelines.
 * - Medium: Exact daily calorie deficit required to reach `targetWeightKg` on `targetDate` (clamped to safe bounds).
 * - Light: 75% of the Medium deficit (gentle lifestyle pace, prioritizing movement).
 * - Heavy: 130% of the Medium deficit (intensive push — reaches `targetWeightKg` ahead of schedule or loses extra fat by June 15th).
 */
export function getDynamicDeficitTiers(
  weightKg: number,
  targetWeightKg: number,
  targetDate: string,
  referenceDate: Date = new Date()
): Record<DeficitTier, TierDefinition> {
  const days = getDaysUntilDate(targetDate, referenceDate);
  const kgToLose = Math.max(0.5, Number((weightKg - targetWeightKg).toFixed(1)));
  const exactRequiredDeficit = Math.round((kgToLose * 7700) / days);

  // Clamp medium to safe clinical range (150 to 850 kcal/day)
  const mediumDeficit = Math.min(850, Math.max(150, exactRequiredDeficit));
  const lightDeficit = Math.max(120, Math.round(mediumDeficit * 0.75));
  const heavyDeficit = Math.min(
    1000,
    Math.max(mediumDeficit + 120, Math.round(mediumDeficit * 1.3))
  );

  return {
    light: {
      totalDeficitKcal: lightDeficit,
      defaultMovementSplitPct: 0.65,
      weeklyLossKg: Number(((lightDeficit * 7) / 7700).toFixed(2)),
      labelMn: 'Хөнгөн (Light)',
      labelEn: 'Light Pace',
      descMn: 'Өлсөхгүйгээр алхалт болон хөдөлгөөнөө нэмж аажмаар галбиржих',
      descEn: 'Gentle pace prioritizing daily walking with minimal food restriction',
      studyNoteMn:
        'Япон улсын "Metabo" хөтөлбөр: өдөрт +3,000 алхам ба бага зэргийн илчлэг хасалт нь булчин алдахгүйгээр дотор өөхийг тууштай бууруулдаг.',
      studyNoteEn:
        'Japanese Metabo Guideline: +3,000 daily steps + mild dietary cut steadily reduces visceral fat without muscle loss.',
    },
    medium: {
      totalDeficitKcal: mediumDeficit,
      defaultMovementSplitPct: 0.58,
      weeklyLossKg: Number(((mediumDeficit * 7) / 7700).toFixed(2)),
      labelMn: 'Дундаж (Зорилтот хурд)',
      labelEn: 'Target Goal Pace (Medium)',
      descMn: `${targetDate} гэхэд яг ${targetWeightKg} кг зорилтдоо хүрэх тэнцвэртэй хурд`,
      descEn: `Exact balanced daily deficit to reach your ${targetWeightKg} kg target on ${targetDate}`,
      studyNoteMn:
        'Азийн Таргалалт Судлалын Холбоо (AASO) болон БНСУ-ын KSSO зөвлөмж: өдрийн алдагдлыг хөдөлгөөн + хоолны зохицуулалтаар хослуулах нь хамгийн тогтвортой үр дүн өгдөг.',
      studyNoteEn:
        'Asian-Pacific & Korean Society for the Study of Obesity (KSSO): combining daily walking and portion control yields highest long-term adherence.',
    },
    heavy: {
      totalDeficitKcal: heavyDeficit,
      defaultMovementSplitPct: 0.53,
      weeklyLossKg: Number(((heavyDeficit * 7) / 7700).toFixed(2)),
      labelMn: 'Эрчимтэй (Heavy)',
      labelEn: 'Intensive Push',
      descMn: 'Зорилтот жиндээ хугацаанаас өмнө хүрэх эсвэл зуны өмнө илүү их өөх шатаах',
      descEn: 'Reach your target weight ahead of schedule or burn extra fat before summer',
      studyNoteMn:
        'Ази хүний бодисын солилцооны аюулгүй дээд хязгаар: өндөр алдагдлын үед булчин задлахгүйн тулд хөдөлгөөний шаталтыг өндөр байлгах шаардлагатай.',
      studyNoteEn:
        'Safe Asian clinical ceiling: higher daily deficits must derive heavily from physical activity so food intake stays above safe BMR floors.',
    },
  };
}

/**
 * Recalculates `movementAddKcal` and `dietCutKcal` whenever the user updates
 * `weightKg`, `targetWeightKg`, `targetDate`, or `deficitTier`.
 */
export function syncProfileSlidersWithGoal(
  profile: UserProfile,
  referenceDate: Date = new Date()
): UserProfile {
  const tiers = getDynamicDeficitTiers(
    profile.weightKg,
    profile.targetWeightKg,
    profile.targetDate,
    referenceDate
  );
  const activeTier = tiers[profile.deficitTier];
  const movementAddKcal = Math.round(
    activeTier.totalDeficitKcal * activeTier.defaultMovementSplitPct
  );
  const dietCutKcal = Math.max(0, activeTier.totalDeficitKcal - movementAddKcal);

  return {
    ...profile,
    movementAddKcal,
    dietCutKcal,
  };
}

export const DEFAULT_USER_PROFILE: UserProfile = syncProfileSlidersWithGoal({
  name: 'Тэмүүлэн',
  gender: 'male',
  age: 28,
  heightCm: 172,
  weightKg: 78,
  targetWeightKg: 68,
  targetDate: '2027-06-15',
  commuteMethod: 'bus_walk',
  commuteDistanceKm: 2.5,
  commuteRoundTrip: true,
  exerciseDaysPerWeek: 2,
  exerciseIntensity: 'moderate',
  deficitTier: 'medium',
  movementAddKcal: 190,
  dietCutKcal: 135,
  dailyProteinGrams: 115,
  resistanceDaysPerWeek: 3,
});

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
  const mifflin =
    10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
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
      const kcal = Math.round(totalKm * weightKg * 0.72);
      return { commuteKcal: kcal, commuteActiveMeters: Math.round(totalKm * 1000) };
    }
    case 'bus_walk': {
      const walkedKm = Math.min(2.4, Math.max(0.8, totalKm * 0.35));
      const standingKcal = Math.round(weightKg * 0.35);
      const walkKcal = Math.round(walkedKm * weightKg * 0.72);
      return {
        commuteKcal: walkKcal + standingKcal,
        commuteActiveMeters: Math.round(walkedKm * 1000),
      };
    }
    case 'bike': {
      const kcal = Math.round(totalKm * weightKg * 0.38);
      return { commuteKcal: kcal, commuteActiveMeters: Math.round(totalKm * 1000) };
    }
    case 'car': {
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
  const met = intensity === 'light' ? 3.5 : intensity === 'moderate' ? 6.0 : 8.5;
  const durationHours = 0.75; // 45 mins
  const singleSessionKcal = Math.round(met * weightKg * durationHours);
  const dailyAvgExerciseKcal = Math.round((singleSessionKcal * daysPerWeek) / 7);
  return { dailyAvgExerciseKcal, singleSessionKcal };
}

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
  baseNeatKcal: number;
  commuteKcal: number;
  commuteActiveMeters: number;
  dailyAvgExerciseKcal: number;
  singleSessionKcal: number;
  baselineTdeeKcal: number;
  projectedTotalBurnKcal: number;
  recommendedDailyFoodKcal: number;
  safeMinFoodKcal: number;
  totalDailyNetDeficitKcal: number;
  extraMovementMetersPerDay: number;
  totalDailyTargetActiveBurnKcal: number;
  totalDailyTargetDistanceMeters: number;
  daysUntilSummerTarget: number;
  kgToLose: number;
  requiredDailyDeficitForTargetDate: number;
  projectedWeightOnTargetDateKg: number;
  projectedKgLostBySummer: number;
  estimatedCompletionDate: string;
  dynamicTiers: Record<DeficitTier, TierDefinition>;
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

  const movementAddKcal = Math.max(0, Math.round(profile.movementAddKcal));
  const maxSafeDietCut = Math.max(0, baselineTdeeKcal - safeMinFoodKcal);
  const effectiveDietCutKcal = Math.min(
    Math.max(0, Math.round(profile.dietCutKcal)),
    maxSafeDietCut
  );

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

  const daysUntilSummerTarget = getDaysUntilDate(profile.targetDate, referenceDate);
  const kgToLose = Math.max(0, Number((profile.weightKg - profile.targetWeightKg).toFixed(1)));
  const totalKcalToLose = kgToLose * 7700;
  const requiredDailyDeficitForTargetDate = Math.round(
    totalKcalToLose / daysUntilSummerTarget
  );

  const rawKgLostBySummer = (totalDailyNetDeficitKcal * daysUntilSummerTarget) / 7700;
  const projectedKgLostBySummer = Number(rawKgLostBySummer.toFixed(1));
  const projectedWeightOnTargetDateKg = Number(
    Math.max(38, profile.weightKg - rawKgLostBySummer).toFixed(1)
  );

  const daysNeededAtCurrentDeficit =
    totalDailyNetDeficitKcal > 0
      ? Math.ceil(totalKcalToLose / totalDailyNetDeficitKcal)
      : 365;
  const refStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const completionDateObj = new Date(
    refStart.getTime() + daysNeededAtCurrentDeficit * 24 * 60 * 60 * 1000
  );
  const estimatedCompletionDate = completionDateObj.toISOString().slice(0, 10);

  const dynamicTiers = getDynamicDeficitTiers(
    profile.weightKg,
    profile.targetWeightKg,
    profile.targetDate,
    referenceDate
  );

  const tierProjections = (['light', 'medium', 'heavy'] as DeficitTier[]).reduce(
    (acc, tier) => {
      const def = dynamicTiers[tier].totalDeficitKcal;
      const lostBySummer = (def * daysUntilSummerTarget) / 7700;
      const weightBySummer = Number(
        Math.max(38, profile.weightKg - lostBySummer).toFixed(1)
      );
      const dNeeded = kgToLose > 0 ? Math.ceil((kgToLose * 7700) / def) : 0;
      const dObj = new Date(refStart.getTime() + dNeeded * 24 * 60 * 60 * 1000);
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
    projectedKgLostBySummer,
    estimatedCompletionDate,
    dynamicTiers,
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
  recompScore: number;
  statusTitleMn: string;
  statusTitleEn: string;
  adviceMn: string;
  adviceEn: string;
  extraMuscleBmrBoostKcal: number;
}

export function calculateBodyRecomp(
  profile: UserProfile,
  plan: CaloriePlanSummary
): BodyRecompAnalysis {
  const { bmi } = calculateAsianBmi(profile.heightCm, profile.weightKg);
  const sexFactor = profile.gender === 'male' ? 1 : 0;

  const rawBodyFat = 1.2 * bmi + 0.23 * profile.age - 10.8 * sexFactor - 4.2;
  const estimatedBodyFatPct = Number(
    (
      profile.customBodyFatPct ??
      Math.min(48, Math.max(profile.gender === 'male' ? 8 : 14, rawBodyFat))
    ).toFixed(1)
  );

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

  const proteinScore = Math.min(40, Math.round((proteinGramsPerKg / 1.6) * 40));
  const exerciseScore = Math.min(40, Math.round((resistanceDays / 3) * 40));
  const deficitSafetyScore =
    plan.recommendedDailyFoodKcal >= plan.safeMinFoodKcal + 150 ? 20 : 10;
  const recompScore = Math.min(100, proteinScore + exerciseScore + deficitSafetyScore);

  const isPromotingMuscleGrowth =
    proteinGramsPerKg >= 1.35 && resistanceDays >= 2 && profile.dietCutKcal <= 500;

  const totalWeightLossKg = Math.max(
    0,
    profile.weightKg - plan.projectedWeightOnTargetDateKg
  );
  const muscleChangeKg = isPromotingMuscleGrowth
    ? Math.min(2.2, (plan.daysUntilSummerTarget / 30) * 0.28)
    : -Math.min(1.5, totalWeightLossKg * 0.18);
  const fatLostKg = Math.max(
    0,
    totalWeightLossKg + (muscleChangeKg > 0 ? muscleChangeKg * 0.5 : 0)
  );

  const summerWeight = plan.projectedWeightOnTargetDateKg;
  const summerFatMass = Math.max(4, fatMassKg - fatLostKg);
  const summerMuscleMass = Math.max(15, skeletalMuscleMassKg + muscleChangeKg);

  const projectedSummerFatPct = Number(((summerFatMass / summerWeight) * 100).toFixed(1));
  const projectedSummerMusclePct = Number(
    ((summerMuscleMass / summerWeight) * 100).toFixed(1)
  );

  const extraMuscleBmrBoostKcal = 90;

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

export function generateInitialHeatmapHistory(targetDeficitKcal: number): DailyProgressLog[] {
  const logs: DailyProgressLog[] = [];
  const today = new Date();
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
    todayGoalKcal: 550,
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
    todayGoalKcal: 680,
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
