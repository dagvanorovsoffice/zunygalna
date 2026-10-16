export type MealCategory = 'breakfast' | 'lunch' | 'dinner';

export interface MealIngredient {
  nameMn: string;
  nameEn: string;
  baseGrams: number; // Strictly metric (grams or ml)
  unit: 'g' | 'ml';
  baseKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  scalable: boolean; // Veggies stay generous (100g+) while dense carbs/proteins scale with target kcal
}

export interface SampleMealOption {
  id: string;
  category: MealCategory;
  titleMn: string;
  titleEn: string;
  subtitleMn: string;
  subtitleEn: string;
  imageUrl: string;
  baseMealKcal: number; // Reference calories for this meal
  prepMinutes: number;
  tagMn: string;
  tagEn: string;
  ingredients: MealIngredient[];
}

/**
 * Curated Breakfast, Lunch, and Dinner meals with strict metric measurements (g, ml, kcal).
 * Base portions are calibrated around a reference 1,650 kcal daily plan:
 * - Breakfast (~28% = ~460 kcal)
 * - Lunch (~40% = ~660 kcal)
 * - Dinner (~32% = ~530 kcal)
 * When the user adjusts the 3 Deficit Tiers or the 2 Linked Sliders (Movement vs. Food Cut),
 * `scaleMealToTargetKcal` dynamically scales the gram weights under each picture!
 */
export const SAMPLE_MEALS: SampleMealOption[] = [
  // ================= BREAKFAST OPTIONS =================
  {
    id: 'bf-1',
    category: 'breakfast',
    titleMn: 'Чанасан өндөг, овьёос ба аарцтай өглөөний цай',
    titleEn: 'Boiled Eggs, Warm Oats & Curd Bowl',
    subtitleMn: 'Удаан шингэх нүүрс ус + өндөр уураг',
    subtitleEn: 'Slow-release complex carbs + high satiety protein',
    imageUrl:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 440,
    prepMinutes: 8,
    tagMn: 'Өндөр уурагтай',
    tagEn: 'High Protein',
    ingredients: [
      {
        nameMn: 'Бүхэл үрийн овьёос (хуурай жин)',
        nameEn: 'Rolled oats (dry weight)',
        baseGrams: 50,
        unit: 'g',
        baseKcal: 190,
        proteinG: 6.5,
        carbsG: 34,
        fatG: 3.2,
        scalable: true,
      },
      {
        nameMn: 'Чанасан өндөг (2 ш ≈ 100г)',
        nameEn: 'Boiled whole eggs (2 pcs ≈ 100g)',
        baseGrams: 100,
        unit: 'g',
        baseKcal: 155,
        proteinG: 12.6,
        carbsG: 1.1,
        fatG: 10.6,
        scalable: true,
      },
      {
        nameMn: 'Чихэргүй тараг / аарц',
        nameEn: 'Unsweetened yogurt / Mongolian curd',
        baseGrams: 100,
        unit: 'g',
        baseKcal: 65,
        proteinG: 6.0,
        carbsG: 4.5,
        fatG: 2.5,
        scalable: true,
      },
      {
        nameMn: 'Алим эсвэл жимсгэнэ',
        nameEn: 'Fresh apple slices or berries',
        baseGrams: 60,
        unit: 'g',
        baseKcal: 30,
        proteinG: 0.3,
        carbsG: 7.5,
        fatG: 0.1,
        scalable: false,
      },
    ],
  },
  {
    id: 'bf-2',
    category: 'breakfast',
    titleMn: 'Хар талх, үхрийн хэл/мах ба ногоотой өглөөний зоог',
    titleEn: 'Rye Toast, Sliced Lean Beef & Fresh Greens',
    subtitleMn: 'Монголчуудын дуртай өег, чихэргүй өглөөний сонголт',
    subtitleEn: 'Savory low-glycemic breakfast without refined sugar',
    imageUrl:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 430,
    prepMinutes: 10,
    tagMn: 'Цусан дахь сахар тогтворжуулагч',
    tagEn: 'Steady Glucose',
    ingredients: [
      {
        nameMn: 'Бүхэл үрийн хар талх',
        nameEn: 'Whole-grain rye bread',
        baseGrams: 65,
        unit: 'g',
        baseKcal: 165,
        proteinG: 5.8,
        carbsG: 31,
        fatG: 2.1,
        scalable: true,
      },
      {
        nameMn: 'Чанасан өөхгүй үхрийн мах / хэл',
        nameEn: 'Boiled lean beef slices',
        baseGrams: 60,
        unit: 'g',
        baseKcal: 135,
        proteinG: 17.5,
        carbsG: 0,
        fatG: 6.8,
        scalable: true,
      },
      {
        nameMn: 'Шарсан/чанасан өндөг',
        nameEn: 'Poached or pan-seared egg',
        baseGrams: 55,
        unit: 'g',
        baseKcal: 85,
        proteinG: 6.5,
        carbsG: 0.6,
        fatG: 5.8,
        scalable: true,
      },
      {
        nameMn: 'Өргөст хэмх, улаан лооль, бууцай',
        nameEn: 'Cucumber, tomato & spinach',
        baseGrams: 100,
        unit: 'g',
        baseKcal: 25,
        proteinG: 1.2,
        carbsG: 4.5,
        fatG: 0.2,
        scalable: false,
      },
    ],
  },
  {
    id: 'bf-3',
    category: 'breakfast',
    titleMn: 'Гурвалжин будааны каш ба чанасан өндөг',
    titleEn: 'Warm Buckwheat Porridge & Boiled Eggs',
    subtitleMn: 'Төмөр болон эслэгээр баялаг өглөөний эрч хүч',
    subtitleEn: 'Rich in iron, magnesium, and slow-digesting fiber',
    imageUrl:
      'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 420,
    prepMinutes: 12,
    tagMn: 'Эслэгээр баялаг',
    tagEn: 'High Fiber',
    ingredients: [
      {
        nameMn: 'Агшаасан гурвалжин будаа',
        nameEn: 'Cooked buckwheat groats',
        baseGrams: 130,
        unit: 'g',
        baseKcal: 155,
        proteinG: 5.2,
        carbsG: 31,
        fatG: 1.2,
        scalable: true,
      },
      {
        nameMn: 'Чанасан өндөг',
        nameEn: 'Boiled eggs',
        baseGrams: 100,
        unit: 'g',
        baseKcal: 155,
        proteinG: 12.6,
        carbsG: 1.1,
        fatG: 10.6,
        scalable: true,
      },
      {
        nameMn: 'Сүү (1.5%–2.5% тослогтой)',
        nameEn: 'Low-fat milk (1.5%–2.5%)',
        baseGrams: 150,
        unit: 'ml',
        baseKcal: 75,
        proteinG: 5.0,
        carbsG: 7.2,
        fatG: 3.0,
        scalable: true,
      },
      {
        nameMn: 'Ногоон алим',
        nameEn: 'Green apple slices',
        baseGrams: 70,
        unit: 'g',
        baseKcal: 35,
        proteinG: 0.2,
        carbsG: 8.5,
        fatG: 0.1,
        scalable: false,
      },
    ],
  },

  // ================= LUNCH OPTIONS =================
  {
    id: 'ln-1',
    category: 'lunch',
    titleMn: 'Үхрийн мах, цагаан будаа ба жигнэсэн ногоо',
    titleEn: 'Lean Beef, Steamed White Rice & Vegetables',
    subtitleMn: 'Сонгодог хэмжээст таваг: 60г цагаан будаа, 50г–80г үхрийн мах, 100г+ ногоо',
    subtitleEn: 'Signature balanced plate: white rice, lean beef & steamed vegetables',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 520,
    prepMinutes: 18,
    tagMn: 'Сонгодог тэнцвэртэй таваг',
    tagEn: 'Classic Balanced Plate',
    ingredients: [
      {
        nameMn: 'Агшаасан цагаан будаа',
        nameEn: 'Steamed white rice',
        baseGrams: 60,
        unit: 'g',
        baseKcal: 78,
        proteinG: 1.6,
        carbsG: 17.0,
        fatG: 0.2,
        scalable: true,
      },
      {
        nameMn: 'Өөхгүй үхрийн мах (болгосон жин)',
        nameEn: 'Lean beef strips (cooked weight)',
        baseGrams: 50,
        unit: 'g',
        baseKcal: 125,
        proteinG: 14.5,
        carbsG: 0,
        fatG: 7.0,
        scalable: true,
      },
      {
        nameMn: 'Жигнэсэн хүнсний ногоо (брокколи, лууван, чинжүү)',
        nameEn: 'Steamed vegetables (broccoli, carrot, bell pepper)',
        baseGrams: 100,
        unit: 'g',
        baseKcal: 42,
        proteinG: 2.4,
        carbsG: 7.8,
        fatG: 0.4,
        scalable: false,
      },
      {
        nameMn: 'Чанасан өндөг эсвэл дүфү (нэмэлт уураг)',
        nameEn: 'Soft-boiled egg or firm tofu topper',
        baseGrams: 65,
        unit: 'g',
        baseKcal: 95,
        proteinG: 8.0,
        carbsG: 1.5,
        fatG: 6.2,
        scalable: true,
      },
      {
        nameMn: 'Тунгалаг шөл (ногоотой хар шөл)',
        nameEn: 'Clear beef & vegetable broth bowl',
        baseGrams: 200,
        unit: 'ml',
        baseKcal: 45,
        proteinG: 4.5,
        carbsG: 3.0,
        fatG: 1.5,
        scalable: false,
      },
    ],
  },
  {
    id: 'ln-2',
    category: 'lunch',
    titleMn: 'Тахианы цээж мах, гурвалжин будаа ба шинэ салат',
    titleEn: 'Grilled Chicken Breast, Buckwheat & Crisp Salad',
    subtitleMn: 'Өөх тос багатай, булчингийн массыг дэмжих өдрийн хоол',
    subtitleEn: 'High-protein, low-fat muscle-supporting lunch bowl',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 540,
    prepMinutes: 20,
    tagMn: 'Булчин дэмжигч',
    tagEn: 'Muscle Recomp',
    ingredients: [
      {
        nameMn: 'Шарсан/жигнэсэн тахианы цээж мах',
        nameEn: 'Grilled skinless chicken breast',
        baseGrams: 120,
        unit: 'g',
        baseKcal: 198,
        proteinG: 37.0,
        carbsG: 0,
        fatG: 4.3,
        scalable: true,
      },
      {
        nameMn: 'Агшаасан гурвалжин будаа',
        nameEn: 'Cooked buckwheat',
        baseGrams: 120,
        unit: 'g',
        baseKcal: 145,
        proteinG: 4.8,
        carbsG: 29.0,
        fatG: 1.1,
        scalable: true,
      },
      {
        nameMn: 'Шинэ ногооны салат (байцаа, өргөст хэмх, улаан лооль)',
        nameEn: 'Fresh vegetable salad (cabbage, cucumber, tomato)',
        baseGrams: 140,
        unit: 'g',
        baseKcal: 45,
        proteinG: 1.8,
        carbsG: 8.5,
        fatG: 0.3,
        scalable: false,
      },
      {
        nameMn: 'Чидун жимсний тос ба лимоны шүүс',
        nameEn: 'Olive oil & lemon dressing',
        baseGrams: 8,
        unit: 'ml',
        baseKcal: 70,
        proteinG: 0,
        carbsG: 0.5,
        fatG: 7.8,
        scalable: true,
      },
    ],
  },
  {
    id: 'ln-3',
    category: 'lunch',
    titleMn: 'Үхрийн мах, ногоотой гурил багатай шөл',
    titleEn: 'Mongolian Lean Beef & Vegetable Noodle Soup',
    subtitleMn: 'Гурилыг 50%-иар багасгаж, мах болон ногоог нэмсэн эрүүл хувилбар',
    subtitleEn: 'Traditional comfort soup with halved noodles and doubled vegetables',
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 510,
    prepMinutes: 22,
    tagMn: 'Монгол уламжлалт (Эрүүлжүүлсэн)',
    tagEn: 'Healthy Traditional',
    ingredients: [
      {
        nameMn: 'Өөхгүй үхрийн мах',
        nameEn: 'Lean beef slices',
        baseGrams: 95,
        unit: 'g',
        baseKcal: 210,
        proteinG: 26.5,
        carbsG: 0,
        fatG: 10.5,
        scalable: true,
      },
      {
        nameMn: 'Бор эсвэл гар татсан гурил (чанасан жин)',
        nameEn: 'Whole-wheat or hand-pulled noodles (cooked)',
        baseGrams: 85,
        unit: 'g',
        baseKcal: 135,
        proteinG: 4.5,
        carbsG: 27.0,
        fatG: 1.0,
        scalable: true,
      },
      {
        nameMn: 'Шөлний ногоо (манжин, лууван, байцаа, сонгино)',
        nameEn: 'Root & leafy vegetables (turnip, carrot, cabbage, onion)',
        baseGrams: 150,
        unit: 'g',
        baseKcal: 55,
        proteinG: 2.2,
        carbsG: 11.0,
        fatG: 0.3,
        scalable: false,
      },
      {
        nameMn: 'Тунгалаг ясны шөл',
        nameEn: 'Clear bone & herb broth',
        baseGrams: 300,
        unit: 'ml',
        baseKcal: 45,
        proteinG: 5.0,
        carbsG: 1.5,
        fatG: 1.8,
        scalable: false,
      },
    ],
  },

  // ================= DINNER OPTIONS =================
  {
    id: 'dn-1',
    category: 'dinner',
    titleMn: 'Үхрийн мах, жигнэсэн брокколи ба бага зэргийн будаа',
    titleEn: 'Seared Lean Beef, Steamed Broccoli & Light Rice',
    subtitleMn: 'Оройн цагаар нүүрс усыг багасгаж, уураг ба эслэгийг нэмсэн таваг',
    subtitleEn: 'Light evening carb portion with generous lean protein and greens',
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 430,
    prepMinutes: 15,
    tagMn: 'Оройн хөнгөн шаталт',
    tagEn: 'Lean Evening Plate',
    ingredients: [
      {
        nameMn: 'Агшаасан цагаан / бор будаа',
        nameEn: 'Steamed white / brown rice',
        baseGrams: 50,
        unit: 'g',
        baseKcal: 65,
        proteinG: 1.4,
        carbsG: 14.0,
        fatG: 0.2,
        scalable: true,
      },
      {
        nameMn: 'Шарсан/жигнэсэн үхрийн мах',
        nameEn: 'Pan-seared lean beef',
        baseGrams: 90,
        unit: 'g',
        baseKcal: 205,
        proteinG: 25.0,
        carbsG: 0,
        fatG: 11.0,
        scalable: true,
      },
      {
        nameMn: 'Жигнэсэн ногоон ногоо (брокколи, бууцай, хулуу)',
        nameEn: 'Steamed green vegetables (broccoli, spinach, zucchini)',
        baseGrams: 150,
        unit: 'g',
        baseKcal: 55,
        proteinG: 3.8,
        carbsG: 9.5,
        fatG: 0.5,
        scalable: false,
      },
    ],
  },
  {
    id: 'dn-2',
    category: 'dinner',
    titleMn: 'Жигнэсэн загас / тахиа ба ногооны зутан шөл',
    titleEn: 'Baked Fish or Chicken with Warm Vegetable Soup',
    subtitleMn: 'Ходоодонд хөнгөн, унтах үеийн өөх шаталтыг дэмжинэ',
    subtitleEn: 'Easy evening digestion that supports overnight fat oxidation',
    imageUrl:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 410,
    prepMinutes: 18,
    tagMn: 'Шөнийн өөх шаталт',
    tagEn: 'Overnight Fat Burn',
    ingredients: [
      {
        nameMn: 'Жигнэсэн загас эсвэл тахианы цээж мах',
        nameEn: 'Baked white fish/salmon or chicken breast',
        baseGrams: 110,
        unit: 'g',
        baseKcal: 195,
        proteinG: 28.0,
        carbsG: 0,
        fatG: 8.5,
        scalable: true,
      },
      {
        nameMn: 'Жигнэсэн төмс эсвэл амтат төмс',
        nameEn: 'Steamed potato or sweet potato cubes',
        baseGrams: 80,
        unit: 'g',
        baseKcal: 70,
        proteinG: 1.5,
        carbsG: 16.0,
        fatG: 0.1,
        scalable: true,
      },
      {
        nameMn: 'Брокколи, цэцэгт байцаа, лууван',
        nameEn: 'Steamed broccoli, cauliflower & carrots',
        baseGrams: 130,
        unit: 'g',
        baseKcal: 48,
        proteinG: 2.8,
        carbsG: 9.0,
        fatG: 0.4,
        scalable: false,
      },
    ],
  },
  {
    id: 'dn-3',
    category: 'dinner',
    titleMn: 'Өндөг, дүфү ба үхрийн махтай халуун ногоотой шөл',
    titleEn: 'Tofu, Egg & Lean Beef Clear Warming Soup',
    subtitleMn: 'Сэрүүн орой идэхэд тохиромжтой, илчлэг багатай уураглаг шөл',
    subtitleEn: 'High-volume, low-calorie protein soup for maximum fullness',
    imageUrl:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    baseMealKcal: 395,
    prepMinutes: 14,
    tagMn: 'Өндөр дүүргэлттэй',
    tagEn: 'High Satiety Soup',
    ingredients: [
      {
        nameMn: 'Өөхгүй үхрийн мах',
        nameEn: 'Thinly sliced lean beef',
        baseGrams: 70,
        unit: 'g',
        baseKcal: 160,
        proteinG: 19.5,
        carbsG: 0,
        fatG: 8.5,
        scalable: true,
      },
      {
        nameMn: 'Дүфү (зөөлөн эсвэл хатуу)',
        nameEn: 'Silken or firm tofu cubes',
        baseGrams: 100,
        unit: 'g',
        baseKcal: 85,
        proteinG: 9.0,
        carbsG: 2.0,
        fatG: 4.5,
        scalable: true,
      },
      {
        nameMn: 'Өндөг',
        nameEn: 'Whole egg ribbon',
        baseGrams: 50,
        unit: 'g',
        baseKcal: 75,
        proteinG: 6.3,
        carbsG: 0.5,
        fatG: 5.2,
        scalable: true,
      },
      {
        nameMn: 'Мөөг, байцаа, ногоон сонгино',
        nameEn: 'Mushrooms, napa cabbage & scallions',
        baseGrams: 120,
        unit: 'g',
        baseKcal: 35,
        proteinG: 2.2,
        carbsG: 6.0,
        fatG: 0.3,
        scalable: false,
      },
    ],
  },
];

export interface ScaledMealResult {
  meal: SampleMealOption;
  targetMealKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  scaledIngredients: Array<{
    nameMn: string;
    nameEn: string;
    grams: number;
    unit: 'g' | 'ml';
    kcal: number;
    proteinG: number;
  }>;
}

/**
 * Scales a sample meal's metric gram weights to match the user's daily calorie intake target.
 * Meal energy split:
 * - Breakfast: 28% of daily kcal
 * - Lunch: 40% of daily kcal
 * - Dinner: 32% of daily kcal
 */
export function scaleMealToDailyKcal(
  meal: SampleMealOption,
  dailyRecommendedKcal: number
): ScaledMealResult {
  const splitRatio =
    meal.category === 'breakfast' ? 0.28 : meal.category === 'lunch' ? 0.4 : 0.32;
  const targetMealKcal = Math.round(dailyRecommendedKcal * splitRatio);

  const fixedKcal = meal.ingredients
    .filter((i) => !i.scalable)
    .reduce((sum, i) => sum + i.baseKcal, 0);
  const scalableBaseKcal = meal.ingredients
    .filter((i) => i.scalable)
    .reduce((sum, i) => sum + i.baseKcal, 0);

  const remainingForScalable = Math.max(120, targetMealKcal - fixedKcal);
  const scaleFactor =
    scalableBaseKcal > 0
      ? Math.min(2.1, Math.max(0.55, remainingForScalable / scalableBaseKcal))
      : 1;

  let totalProteinG = 0;
  let totalCarbsG = 0;
  let totalFatG = 0;

  const scaledIngredients = meal.ingredients.map((ing) => {
    const factor = ing.scalable ? scaleFactor : 1;
    // Round grams to nearest 5g for clean metric readability (e.g. 60g, 50g, 100g)
    const rawGrams = ing.baseGrams * factor;
    const roundedGrams = Math.max(5, Math.round(rawGrams / 5) * 5);
    const actualRatio = roundedGrams / ing.baseGrams;
    const kcal = Math.round(ing.baseKcal * actualRatio);
    const proteinG = Number((ing.proteinG * actualRatio).toFixed(1));
    const carbsG = Number((ing.carbsG * actualRatio).toFixed(1));
    const fatG = Number((ing.fatG * actualRatio).toFixed(1));

    totalProteinG += proteinG;
    totalCarbsG += carbsG;
    totalFatG += fatG;

    return {
      nameMn: ing.nameMn,
      nameEn: ing.nameEn,
      grams: roundedGrams,
      unit: ing.unit,
      kcal,
      proteinG,
    };
  });

  const computedTotalKcal = scaledIngredients.reduce((s, i) => s + i.kcal, 0);

  return {
    meal,
    targetMealKcal: computedTotalKcal,
    totalProteinG: Math.round(totalProteinG),
    totalCarbsG: Math.round(totalCarbsG),
    totalFatG: Math.round(totalFatG),
    scaledIngredients,
  };
}
