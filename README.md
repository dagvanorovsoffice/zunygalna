# Зун яг ална (`zunygalna`)

**Goal**: Make it simple to see the effects of small daily actions on your lifestyle over a period of time, reaching your target weight before the beginning of summer (`June 15th`).

## Key Features Built

1. **Frictionless Intro & Lifestyle Selection Tools (`src/components/IntroOnboarding.tsx`)**
   - Tap-cards and scrubbable sliders for Gender, Age, Height (`cm`), Weight (`kg`), Target Weight (`kg`), Editable Summer Target Date (default `June 15th`), Work–Home Travel method & distance (`km` / `m`), and Weekly Exercise frequency & intensity.
   - Calibrated using **Asian clinical & metabolic standards** (Ganpule/Miyake & Mifflin-St Jeor BMR + **WHO WPRO Asian BMI cutoffs**: Normal `18.5–22.9`, Overweight `23.0–24.9`, Obese `≥25.0`).
2. **3 Calorie Deficit Options & 2 Linked Horizontal Sliders (`src/lib/calorieEngine.ts`)**
   - **Light (`-350 kcal`)**, **Medium (`-550 kcal`)**, and **Heavy (`-750 kcal`)** presets.
   - **Two Linked Sliders ("Two Sides of the Same Coin")**: Prioritizes **Extra Daily Movement Burn (`+kcal` / `+km`)** first, and **Food Calorie Cut (`-kcal`)** second. Sliding Movement UP automatically reduces the required Food Cut so you can eat larger portions while hitting your June 15th goal.
3. **Sample Breakfast, Lunch & Dinner Visualizer (`src/lib/mealData.ts`)**
   - Swipeable options for Breakfast, Lunch, and Dinner with photos and **strictly metric (`g`, `ml`, `kcal`)** ingredient breakdowns under each photo (e.g., `60g white rice`, `50g beef`, `100g vegetables`) that dynamically scale as you adjust the sliders.
4. **Home: Daily Right-Facing Side-Scrollable Linear Journey & Heatmap (`src/components/HomeJourney.tsx`)**
   - **Daily Linear Race Track**: Scroll rightwards to see your avatar, your **Daily Calorie Burn Goal Flag**, your **Personal Best Ghost (`👻`)**, and **Friends & Family avatars + their respective Daily Burn Goal Flags**.
   - **Dynamic Goal Shift**: Logging extra food/snack intake pushes your Daily Calorie Burn Goal Flag further right; logging fasting or light dinner increases your net daily deficit.
   - **Duolingo / GitHub Commit Deficit Heatmap**: Weekly (7-day) and Monthly (28-day) grids where squares glow brighter green/lime/gold the higher your daily net calorie deficit.
5. **Learn (`src/components/LearnSection.tsx`) & Body Composition (`src/components/BodyRecompSection.tsx`)**
   - Interactive **Sugar & Processed Food vs. Whole Food** comparator (with walking distance burn cost in `km`/`m`).
   - **Muscle Mass = 24/7 BMR Furnace** simulator + shareable **Instagram / Facebook daily health cards**.
   - **Fat Ratio (%) vs. Muscle Ratio (%) Recomposition Analyzer**: Evaluates whether muscle growth is being promoted while lowering body fat ratio.

## Getting Started

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.
