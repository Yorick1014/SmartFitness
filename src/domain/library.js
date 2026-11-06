const exercises = [
  {
    id: "curls",
    name: "Biceps curls",
    group: "Arms",
    area: "Upper body",
    equipment: "Dumbbells",
    view: "Front view",
    tone: "",
    level: "Beginner",
    primary: ["Biceps"],
    secondary: ["Forearms"],
    pattern: "Elbow flexion",
    desc: "A controlled dumbbell curl for the front of your upper arms.",
    setup: "Face the camera. Keep your shoulders, elbows and wrists in view.",
    cue: "Keep your upper arms steady and lower at a controlled pace.",
    label: "Face the camera",
    steps: [
      "Stand with a dumbbell in each hand, palms facing forward and arms at your sides.",
      "Bend your elbows to bring the weights toward your shoulders, keeping your upper arms close to your sides.",
      "Lower the weights with control to complete one repetition.",
    ],
  },
  {
    id: "squats",
    name: "Squats",
    group: "Legs",
    area: "Lower body",
    equipment: "Bodyweight",
    view: "Side view",
    tone: "peach",
    level: "Beginner",
    primary: ["Quadriceps", "Glutes"],
    secondary: ["Hamstrings", "Core"],
    pattern: "Squat",
    desc: "A bodyweight squat that moves through the hips and knees.",
    setup:
      "Turn sideways to the camera. Leave enough room for your full body to stay in view.",
    cue: "Follow a comfortable, controlled pace throughout the movement.",
    label: "Stand side-on",
    steps: [
      "Stand with your feet about shoulder-width apart and your arms in a comfortable position.",
      "Bend your hips and knees, lowering to a comfortable depth with your feet on the floor.",
      "Push through your feet to return to standing and complete one repetition.",
    ],
  },
  {
    id: "pushups",
    name: "Push-ups",
    group: "Chest",
    area: "Upper body",
    equipment: "Bodyweight",
    view: "Side view",
    tone: "mint",
    level: "Intermediate",
    primary: ["Chest"],
    secondary: ["Triceps", "Shoulders", "Core"],
    pattern: "Horizontal push",
    desc: "A floor-based press using your own bodyweight.",
    setup:
      "Place the camera to your side at a low angle. Keep your shoulders, hips and feet in view.",
    cue: "Use spoken counts so you can focus on the movement.",
    label: "Low, side-on camera",
    steps: [
      "Start with your hands on the floor slightly wider than your shoulders and your legs extended.",
      "Bend your elbows to lower your body with control, keeping your trunk steady.",
      "Press through your hands to return to the starting position.",
    ],
  },
  {
    id: "shoulderpress",
    name: "Shoulder press",
    group: "Shoulders",
    area: "Upper body",
    equipment: "Dumbbells",
    view: "Front view",
    tone: "peach",
    level: "Intermediate",
    primary: ["Shoulders"],
    secondary: ["Triceps"],
    pattern: "Vertical push",
    desc: "An overhead dumbbell press from shoulder height.",
    setup:
      "Face the camera and leave space above your head so your wrists remain visible at the top.",
    cue: "Press at a steady pace and keep the movement controlled.",
    label: "Leave room overhead",
    steps: [
      "Stand with a dumbbell in each hand at shoulder height.",
      "Press the weights upward through a comfortable range, keeping your trunk steady.",
      "Lower the weights back to shoulder height to complete one repetition.",
    ],
  },
  {
    id: "rows",
    name: "Bent-over row",
    group: "Back",
    area: "Upper body",
    equipment: "Dumbbells",
    view: "Side view",
    tone: "",
    level: "Intermediate",
    primary: ["Upper back", "Lats"],
    secondary: ["Biceps", "Rear shoulders"],
    pattern: "Horizontal pull",
    desc: "A dumbbell row from a hinged standing position.",
    setup:
      "Stand side-on to the camera. Keep your shoulders, elbows and hips visible while you hinge forward.",
    cue: "Move your elbows back without swinging the weights.",
    label: "Side-on, hips in view",
    steps: [
      "Hold your dumbbells, soften your knees and hinge forward at the hips.",
      "Pull the dumbbells toward the sides of your torso, keeping your back steady.",
      "Lower your arms with control and repeat.",
    ],
  },
  {
    id: "lateralraises",
    name: "Lateral raises",
    group: "Shoulders",
    area: "Upper body",
    equipment: "Dumbbells",
    view: "Front view",
    tone: "mint",
    level: "Beginner",
    primary: ["Side shoulders"],
    secondary: ["Upper traps"],
    pattern: "Shoulder abduction",
    desc: "A light dumbbell raise out to the sides of your body.",
    setup:
      "Face the camera. Leave space on both sides so your hands remain visible as you raise your arms.",
    cue: "Raise and lower the weights smoothly without swinging.",
    label: "Keep both arms in view",
    steps: [
      "Stand with a light dumbbell in each hand by your sides and your elbows slightly bent.",
      "Raise your arms out to the sides to a comfortable height, around shoulder level.",
      "Lower slowly back to your sides to complete one repetition.",
    ],
  },
  {
    id: "lunges",
    name: "Reverse lunges",
    group: "Legs",
    area: "Lower body",
    equipment: "Bodyweight",
    view: "Side view",
    tone: "",
    level: "Intermediate",
    primary: ["Quadriceps", "Glutes"],
    secondary: ["Hamstrings", "Calves"],
    pattern: "Lunge",
    desc: "A backward step followed by a controlled return to standing.",
    setup:
      "Stand side-on to the camera and leave enough space behind you for the backward step.",
    cue: "Take your time between steps and keep your balance.",
    label: "Leave space to step back",
    steps: [
      "Stand with your feet about hip-width apart.",
      "Step one foot backward and bend both knees through a comfortable range.",
      "Return to standing. Complete one leg at a time in this demo; one return is one rep.",
    ],
  },
  {
    id: "calfraises",
    name: "Standing calf raises",
    group: "Legs",
    area: "Lower body",
    equipment: "Bodyweight",
    view: "Side view",
    tone: "mint",
    level: "Beginner",
    primary: ["Calves"],
    secondary: [],
    pattern: "Ankle extension",
    desc: "A standing heel raise with a controlled return to the floor.",
    setup:
      "Use a side view with both feet and ankles fully visible. Keep a stable support within reach if needed.",
    cue: "Lift and lower your heels at a steady pace.",
    label: "Keep your ankles visible",
    steps: [
      "Stand upright with your feet on the floor; use a stable support for balance if needed.",
      "Raise your heels to lift onto the balls of your feet.",
      "Lower your heels with control to complete one repetition.",
    ],
  },
  {
    id: "glutebridge",
    name: "Glute bridges",
    group: "Glutes",
    area: "Lower body",
    equipment: "Exercise mat",
    view: "Side view",
    tone: "peach",
    level: "Beginner",
    primary: ["Glutes"],
    secondary: ["Hamstrings", "Core"],
    pattern: "Hip extension",
    desc: "A floor-based hip lift with your feet planted on the mat.",
    setup:
      "Place the camera at a low side angle. Keep your shoulders, hips and knees in frame.",
    cue: "Lift and lower with control, using spoken counts if you look away.",
    label: "Low side view of the mat",
    steps: [
      "Lie on your back with your knees bent, feet flat and arms by your sides.",
      "Lift your hips until your trunk and thighs form a comfortable line.",
      "Lower your hips back to the mat to complete one repetition.",
    ],
  },
  {
    id: "crunches",
    name: "Crunches",
    group: "Core",
    area: "Core",
    equipment: "Exercise mat",
    view: "Side view",
    tone: "",
    level: "Beginner",
    primary: ["Abdominals"],
    secondary: [],
    pattern: "Trunk flexion",
    desc: "A small upper-body lift with your lower back on the mat.",
    setup:
      "Use a low side view. Keep your head, shoulders, hips and knees visible on the mat.",
    cue: "Keep the movement small and controlled; use audio feedback when looking away.",
    label: "Low side view of the mat",
    steps: [
      "Lie on your back with your knees bent and feet flat on the mat.",
      "Lift your head and shoulders a small distance, keeping your neck comfortable.",
      "Lower your shoulders to the mat to complete one repetition.",
    ],
  },
];
const valid = (id) => exercises.some((e) => e.id === id);
const clean = (items) => [
  ...new Set(Array.isArray(items) ? items.filter(valid) : []),
];
function normalizeAccess(raw = {}) {
  const recent = Array.isArray(raw.recent)
    ? raw.recent
    : Array.isArray(raw.history)
      ? raw.history.map((s) => s.exercise)
      : [];
  const savedRecent = clean(recent).slice(0, 5);
  return {
    favorites: clean(raw.favorites),
    recent: savedRecent.length ? savedRecent : ["curls", "squats", "pushups"],
  };
}
function recordRecent(recent, id) {
  return valid(id)
    ? [id, ...clean(recent).filter((item) => item !== id)].slice(0, 5)
    : clean(recent).slice(0, 5);
}
function toggleFavorite(favorites, id) {
  const list = clean(favorites);
  return valid(id)
    ? list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id]
    : list;
}
function recentExercises(recent) {
  return clean(recent)
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean);
}
function findExercises({ query = "", muscle = "all", equipment = "all" } = {}) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return exercises.filter((e) => {
    const text = [
      e.name,
      e.group,
      e.area,
      e.equipment,
      e.pattern,
      ...e.primary,
      ...e.secondary,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (muscle === "all" || e.group === muscle) &&
      (equipment === "all" || e.equipment === equipment) &&
      terms.every((t) => text.includes(t))
    );
  });
}

function prioritizedExercises(list, recent = [], favorites = []) {
  const recentRank = new Map(recent.map((id, i) => [id, i]));
  const fav = new Set(favorites);
  return list
    .map((exercise, index) => ({ exercise, index }))
    .sort((a, b) => {
      const aR = recentRank.has(a.exercise.id);
      const bR = recentRank.has(b.exercise.id);
      const aF = fav.has(a.exercise.id);
      const bF = fav.has(b.exercise.id);
      const aFlag = aR || aF;
      const bFlag = bR || bF;
      if (aFlag !== bFlag) return aFlag ? -1 : 1;
      if (aR && bR)
        return recentRank.get(a.exercise.id) - recentRank.get(b.exercise.id);
      if (aR !== bR) return aR ? -1 : 1;
      if (aF !== bF) return aF ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ exercise }) => exercise);
}

export {
  exercises,
  normalizeAccess,
  recordRecent,
  toggleFavorite,
  recentExercises,
  findExercises,
  prioritizedExercises,
};
