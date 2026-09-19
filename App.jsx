import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  GraduationCap,
  Menu,
  Moon,
  RotateCcw,
  Sparkles,
  Target,
  Upload,
  X,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Subject = "Biology" | "Chemistry" | "Physics" | "Mathematics";

type ScheduleItem = {
  id: string;
  start: string;
  end: string;
  title: string;
  description: string;
  category: "recharge" | "core" | "dinner" | "esslce" | "sat" | "routine";
  accent: string;
};

type Competency = {
  id: string;
  concept: string;
  gradeLevel: "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
  subject: Subject;
  competencies: string[];
  pitfalls: string[];
  confidence: number;
};

type MockQuestion = {
  id: string;
  subject: Subject;
  difficulty: "Advanced" | "Very Advanced";
  question: string;
  skills: string[];
  estimatedMinutes: number;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "esslce-sat-study-tracker-v1";

const SCHEDULE: ScheduleItem[] = [
  {
    id: "recharge",
    start: "15:35",
    end: "17:00",
    title: "Recharge & Unwind",
    description: "Recover from school. Eat, move, hydrate, and mentally reset.",
    category: "recharge",
    accent: "cyan",
  },
  {
    id: "core-theory",
    start: "17:00",
    end: "18:00",
    title: "Core Theory Block",
    description: "Rotate Biology, Chemistry, Physics, and Mathematics.",
    category: "core",
    accent: "purple",
  },
  {
    id: "dinner",
    start: "18:00",
    end: "19:30",
    title: "Dinner & Zero Screen Time",
    description: "Full break. No phone, laptop, social media, or study materials.",
    category: "dinner",
    accent: "green",
  },
  {
    id: "esslce",
    start: "19:30",
    end: "20:30",
    title: "ESSLCE Past Paper Speed Practice",
    description: "Timed exam questions. Prioritize accuracy under pressure.",
    category: "esslce",
    accent: "cyan",
  },
  {
    id: "sat",
    start: "20:30",
    end: "21:15",
    title: "SAT Quant / Verbal Drills",
    description: "Focused SAT practice with short review loops.",
    category: "sat",
    accent: "purple",
  },
  {
    id: "routine",
    start: "21:15",
    end: "22:00",
    title: "Pack Bag & Sleep Routine",
    description: "Hard limit: study ends at 22:00. Prepare tomorrow and wind down.",
    category: "routine",
    accent: "green",
  },
];

const SUBJECT_KEYWORDS: Record<Subject, string[]> = {
  Biology: [
    "cell",
    "mitosis",
    "meiosis",
    "dna",
    "rna",
    "gene",
    "genetics",
    "protein",
    "enzyme",
    "photosynthesis",
    "respiration",
    "ecosystem",
    "ecology",
    "evolution",
    "homeostasis",
    "hormone",
    "nervous",
    "immune",
    "reproduction",
    "organ",
    "tissue",
    "population",
    "biodiversity",
  ],
  Chemistry: [
    "atom",
    "atomic",
    "periodic",
    "element",
    "molecule",
    "bond",
    "ionic",
    "covalent",
    "reaction",
    "stoichiometry",
    "mole",
    "acid",
    "base",
    "ph",
    "redox",
    "oxidation",
    "reduction",
    "equilibrium",
    "organic",
    "hydrocarbon",
    "electrolysis",
    "solution",
    "concentration",
  ],
  Physics: [
    "force",
    "motion",
    "velocity",
    "acceleration",
    "momentum",
    "energy",
    "work",
    "power",
    "gravity",
    "electric",
    "current",
    "voltage",
    "resistance",
    "circuit",
    "wave",
    "frequency",
    "wavelength",
    "optics",
    "lens",
    "magnetic",
    "pressure",
    "density",
    "thermal",
    "heat",
  ],
  Mathematics: [
    "algebra",
    "equation",
    "quadratic",
    "function",
    "graph",
    "linear",
    "polynomial",
    "factor",
    "sequence",
    "series",
    "probability",
    "statistics",
    "mean",
    "median",
    "geometry",
    "triangle",
    "circle",
    "trigonometry",
    "sine",
    "cosine",
    "tangent",
    "vector",
    "matrix",
    "calculus",
    "derivative",
    "integral",
  ],
};

const GRADE_KEYWORDS: Record<Competency["gradeLevel"], string[]> = {
  "Grade 9": [
    "basic",
    "introduct",
    "foundation",
    "cell",
    "ecosystem",
    "force",
    "motion",
    "fraction",
    "ratio",
    "linear",
    "atom",
    "element",
  ],
  "Grade 10": [
    "reaction",
    "bond",
    "genetics",
    "energy",
    "momentum",
    "quadratic",
    "trigonometry",
    "electric",
    "probability",
    "photosynthesis",
  ],
  "Grade 11": [
    "equilibrium",
    "organic",
    "redox",
    "waves",
    "circuit",
    "function",
    "sequence",
    "statistics",
    "homeostasis",
    "evolution",
  ],
  "Grade 12": [
    "calculus",
    "derivative",
    "integral",
    "advanced",
    "electrolysis",
    "genetics",
    "molecular",
    "electromagnetic",
    "complex",
    "optimization",
  ],
};

const DEFAULT_NOTES = `Cellular respiration converts chemical energy stored in glucose into ATP.
Photosynthesis uses light energy to produce glucose from carbon dioxide and water.
Newton's second law states that the net force on an object equals mass multiplied by acceleration.
In chemistry, the mole connects microscopic particles to measurable quantities.
Quadratic functions can be solved using factoring, completing the square, or the quadratic formula.
DNA stores genetic information and genes influence inherited characteristics.`;

const SUBJECT_COLORS: Record<Subject, string> = {
  Biology: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  Chemistry: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
  Physics: "text-violet-300 border-violet-500/30 bg-violet-500/10",
  Mathematics: "text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/10",
};

/* -------------------------------------------------------------------------- */
/* Utility functions                                                          */
/* -------------------------------------------------------------------------- */

function countMatches(text: string, keywords: string[]): number {
  const normalized = text.toLowerCase();
  return keywords.reduce((count, keyword) => {
    const matches = normalized.match(
      new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")
    );
    return count + (matches?.length ?? 0);
  }, 0);
}

function detectSubject(text: string): Subject {
  const scores = Object.entries(SUBJECT_KEYWORDS).map(([subject, keywords]) => ({
    subject: subject as Subject,
    score: countMatches(text, keywords),
  }));

  scores.sort((a, b) => b.score - a.score);

  return scores[0]?.score > 0 ? scores[0].subject : "Mathematics";
}

function detectGrade(text: string): Competency["gradeLevel"] {
  const scores = Object.entries(GRADE_KEYWORDS).map(([grade, keywords]) => ({
    grade: grade as Competency["gradeLevel"],
    score: countMatches(text, keywords),
  }));

  scores.sort((a, b) => b.score - a.score);

  return scores[0]?.score > 0 ? scores[0].grade : "Grade 11";
}

function extractConcepts(text: string): string[] {
  const found: string[] = [];
  const normalized = text.toLowerCase();

  Object.values(SUBJECT_KEYWORDS)
    .flat()
    .forEach((keyword) => {
      if (
        normalized.includes(keyword.toLowerCase()) &&
        !found.some((existing) => existing.toLowerCase() === keyword)
      ) {
        found.push(keyword);
      }
    });

  const sentences = text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);

  sentences.slice(0, 8).forEach((sentence) => {
    const words = sentence.split(/\s+/);
    if (words.length >= 4) {
      const concept = words
        .slice(0, Math.min(7, words.length))
        .join(" ")
        .replace(/^[a-z]/, (char) => char.toUpperCase());

      if (
        !found.some((existing) =>
          concept.toLowerCase().includes(existing.toLowerCase())
        )
      ) {
        found.push(concept);
      }
    }
  });

  return found.slice(0, 8);
}

function competenciesFor(subject: Subject): string[] {
  const base: Record<Subject, string[]> = {
    Biology: [
      "Explain mechanisms using cause-and-effect reasoning",
      "Interpret biological diagrams and experimental evidence",
      "Connect structure to function",
      "Apply concepts to unfamiliar biological scenarios",
    ],
    Chemistry: [
      "Balance and interpret chemical relationships",
      "Track quantities using proportional reasoning",
      "Predict outcomes from chemical principles",
      "Interpret experimental and quantitative evidence",
    ],
    Physics: [
      "Translate physical situations into mathematical models",
      "Select and apply appropriate physical laws",
      "Track units, vectors, and significant relationships",
      "Explain results conceptually after calculation",
    ],
    Mathematics: [
      "Translate word problems into mathematical models",
      "Manipulate algebraic expressions accurately",
      "Interpret graphs, functions, and quantitative relationships",
      "Check solutions against constraints and context",
    ],
  };

  return base[subject];
}

function pitfallsFor(subject: Subject): string[] {
  const base: Record<Subject, string[]> = {
    Biology: [
      "Confusing correlation with biological causation",
      "Memorizing terminology without explaining mechanisms",
      "Ignoring variables and controls in experiments",
    ],
    Chemistry: [
      "Losing track of units or mole relationships",
      "Confusing oxidation state with physical charge",
      "Using formulas without checking reaction conditions",
    ],
    Physics: [
      "Mixing scalar and vector quantities",
      "Using equations without identifying assumptions",
      "Dropping units or sign conventions during calculations",
    ],
    Mathematics: [
      "Skipping domain or constraint checks",
      "Arithmetic errors after correct algebraic setup",
      "Choosing a familiar formula before interpreting the problem",
    ],
  };

  return base[subject];
}

function analyzeNotes(text: string): Competency[] {
  const clean = text.trim();

  if (!clean) {
    return [];
  }

  const concepts = extractConcepts(clean);

  if (concepts.length === 0) {
    return [
      {
        id: "general-1",
        concept: "General study material",
        gradeLevel: detectGrade(clean),
        subject: detectSubject(clean),
        competencies: competenciesFor(detectSubject(clean)),
        pitfalls: pitfallsFor(detectSubject(clean)),
        confidence: 62,
      },
    ];
  }

  return concepts.map((concept, index) => {
    const subject = detectSubject(`${clean} ${concept}`);
    const gradeLevel = detectGrade(`${clean} ${concept}`);

    const evidenceScore = Math.min(
      95,
      58 +
        countMatches(clean, SUBJECT_KEYWORDS[subject]) * 3 +
        countMatches(clean, GRADE_KEYWORDS[gradeLevel]) * 2
    );

    return {
      id: `${concept.toLowerCase().replace(/\W+/g, "-")}-${index}`,
      concept,
      gradeLevel,
      subject,
      competencies: competenciesFor(subject).slice(0, index % 2 === 0 ? 3 : 4),
      pitfalls: pitfallsFor(subject),
      confidence: evidenceScore,
    };
  });
}

function generateMockQuestions(
  text: string,
  competencies: Competency[]
): MockQuestion[] {
  const subject = competencies[0]?.subject ?? detectSubject(text);
  const concepts =
    competencies.length > 0
      ? competencies.slice(0, 4).map((item) => item.concept)
      : extractConcepts(text).slice(0, 4);

  const conceptText =
    concepts.length > 0 ? concepts.join(", ") : "the material in your notes";

  const templates: Record<Subject, string[]> = {
    Biology: [
      `A research team is investigating ${conceptText}. They obtain an unexpected result after changing one environmental variable while keeping several controls constant. Explain the mechanism that should produce the expected result, identify two alternative explanations for the observation, and design a follow-up investigation that distinguishes between those explanations. Your response must connect molecular/cellular mechanisms to the larger biological outcome.`,
      `A patient presents with symptoms that can be explained by disruption of ${conceptText}. Construct a step-by-step biological explanation beginning at the relevant cellular or molecular level and continuing to the observable symptoms. Then explain how an experimental measurement could be used to distinguish this mechanism from a superficially similar condition.`,
    ],
    Chemistry: [
      `A chemical process involving ${conceptText} is carried out in a controlled laboratory system. The measured result differs from the theoretical prediction. Analyze the discrepancy by considering stoichiometry, limiting reactants, equilibrium or reaction conditions, and measurement uncertainty. Show how you would determine which explanation is most consistent with the evidence.`,
      `An industrial laboratory must optimize a process involving ${conceptText} while minimizing waste. Develop a quantitative strategy for choosing conditions, explain the relevant chemical principles, predict how changing one condition affects the system, and describe the experimental evidence you would require before accepting the optimized procedure.`,
    ],
    Physics: [
      `An engineering team designs a system involving ${conceptText}. During testing, the measured motion or energy transfer differs from the ideal model. Build a complete physical model, state the assumptions behind it, derive the relationships needed to analyze the system, and explain how experimental measurements could reveal which assumption is responsible for the discrepancy.`,
      `A complex real-world system combines several effects related to ${conceptText}. Starting from a verbal description, identify the forces or physical quantities involved, construct the appropriate equations, solve symbolically before substituting values, and interpret the result. Finally, explain how changing one parameter would affect the outcome.`,
    ],
    Mathematics: [
      `A school or business needs to make a decision using a model involving ${conceptText}. Formulate the problem mathematically, identify all constraints, solve using an appropriate method, and interpret the result in context. Then analyze how the answer changes if one key assumption is altered. Your solution should include a reasonableness check.`,
      `You are given a quantitative investigation involving ${conceptText}. Several possible models appear plausible from the initial data. Compare the models using algebraic, graphical, and numerical reasoning. Determine which conclusions are justified by the available information, identify any hidden assumptions, and explain what additional data would reduce uncertainty.`,
    ],
  };

  return templates[subject].map((question, index) => ({
    id: `mock-${Date.now()}-${index}`,
    subject,
    difficulty: index === 0 ? "Advanced" : "Very Advanced",
    question,
    skills: competencies
      .slice(index, index + 3)
      .flatMap((item) => item.competencies)
      .slice(0, 4),
    estimatedMinutes: 16 + index * 5,
  }));
}

function getInitialCompleted(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as {
      completed?: Record<string, boolean>;
    };

    return parsed.completed ?? {};
  } catch {
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/* Small UI components                                                       */
/* -------------------------------------------------------------------------- */

function AccentIcon({ category }: { category: ScheduleItem["category"] }) {
  const common = "w-5 h-5";

  if (category === "core") return <BookOpen className={common} />;
  if (category === "esslce") return <Target className={common} />;
  if (category === "sat") return <Brain className={common} />;
  if (category === "dinner") return <Moon className={common} />;
  if (category === "routine") return <CheckCircle2 className={common} />;

  return <Zap className={common} />;
}

function StatCard({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-gray-800 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [completed, setCompleted] =
    useState<Record<string, boolean>>(getInitialCompleted);

  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showMockGenerator, setShowMockGenerator] = useState(false);
  const [mockQuestions, setMockQuestions] = useState<MockQuestion[]>([]);
  const [expandedCompetency, setExpandedCompetency] = useState<string | null>(
    null
  );
  const [activeSubject, setActiveSubject] = useState<Subject | "All">("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completed,
        updatedAt: new Date().toISOString(),
      })
    );
  }, [completed]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const completedCount = useMemo(
    () => SCHEDULE.filter((item) => completed[item.id]).length,
    [completed]
  );

  const dailyCompletion = Math.round(
    (completedCount / SCHEDULE.length) * 100
  );

  const coreCompletion = useMemo(() => {
    const coreIds = ["core-theory", "esslce", "sat"];
    const done = coreIds.filter((id) => completed[id]).length;
    return Math.round((done / coreIds.length) * 100);
  }, [completed]);

  const filteredCompetencies = useMemo(
    () =>
      activeSubject === "All"
        ? competencies
        : competencies.filter((item) => item.subject === activeSubject),
    [competencies, activeSubject]
  );

  const estimatedWeeklyTarget = 28;
  const weeklyCompleted =
    completedCount + (completedCount > 0 ? 6 : 0);
  const weeklyProgress = Math.min(
    100,
    Math.round((weeklyCompleted / estimatedWeeklyTarget) * 100)
  );

  const currentSchedule = useMemo(() => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    return SCHEDULE.find((item) => {
      const [sh, sm] = item.start.split(":").map(Number);
      const [eh, em] = item.end.split(":").map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      return minutes >= start && minutes < end;
    });
  }, [currentTime]);

  function toggleTask(id: string) {
    setCompleted((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }

  function resetDay() {
    setCompleted({});
  }

  function analyze() {
    setAnalyzing(true);

    window.setTimeout(() => {
      const results = analyzeNotes(notes);
      setCompetencies(results);
      setAnalyzing(false);

      if (results.length > 0) {
        setExpandedCompetency(results[0].id);
      }
    }, 650);
  }

  function generateMocks() {
    const source =
      notes.trim() ||
      competencies.map((item) => item.concept).join(". ");

    const results = competencies.length
      ? generateMockQuestions(source, competencies)
      : generateMockQuestions(source, analyzeNotes(source));

    setMockQuestions(results);
    setShowMockGenerator(true);
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowed =
      file.type === "text/plain" ||
      file.name.toLowerCase().endsWith(".txt") ||
      file.name.toLowerCase().endsWith(".md");

    if (!allowed) {
      window.alert("Please upload a .txt or .md study-notes file.");
      event.target.value = "";
      return;
    }

    try {
      const content = await file.text();
      setNotes(content);
    } catch {
      window.alert("The selected file could not be read.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-500/10">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white sm:text-lg">
                  ESSLCE <span className="text-cyan-400">&</span> SAT
                </h1>
                <span className="hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300 sm:inline">
                  Competency Engine
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Grade 12 Natural Science • Daily Command Center
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                Today
              </p>
              <p className="text-sm font-bold text-gray-300">
                {currentTime.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="h-8 w-px bg-gray-800" />

            <div className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-3 py-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <div>
                <p className="text-xs font-black text-white">12 day streak</p>
                <p className="text-[9px] text-gray-500">Keep it alive</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-xl border border-gray-800 p-2 text-gray-400 hover:text-white md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-800 px-4 py-3 md:hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Daily streak</span>
              <span className="flex items-center gap-1 text-sm font-bold text-orange-300">
                <Flame className="h-4 w-4" />
                12 days
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-violet-950/20 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                Study intelligence online
              </div>

              <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                Turn every study session into{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  exam-ready competence.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                Review Grades 9–12, build ESSLCE stamina, and sharpen SAT
                Quant and Verbal skills with a schedule designed around your
                after-school recovery window.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-2.5">
                  <span className="text-xs text-gray-500">Daily completion</span>
                  <span className="ml-2 text-sm font-black text-cyan-300">
                    {dailyCompletion}%
                  </span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-2.5">
                  <span className="text-xs text-gray-500">Core blocks</span>
                  <span className="ml-2 text-sm font-black text-violet-300">
                    {coreCompletion}%
                  </span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-2.5">
                  <span className="text-xs text-gray-500">Hard stop</span>
                  <span className="ml-2 text-sm font-black text-green-300">
                    22:00
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    Current block
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {currentSchedule?.title ?? "Outside study schedule"}
                  </p>
                </div>

                <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300">
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {currentSchedule
                    ? `${currentSchedule.start} – ${currentSchedule.end}`
                    : "22:00 – 15:35"}
                </span>
                <span className="font-bold text-cyan-300">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <ProgressBar value={dailyCompletion} className="mt-3" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-cyan-300" />}
            label="Today"
            value={`${completedCount}/${SCHEDULE.length}`}
            detail="scheduled blocks complete"
            accent="bg-cyan-400/10"
          />

          <StatCard
            icon={<Flame className="h-5 w-5 text-orange-300" />}
            label="Streak"
            value="12 days"
            detail="consecutive study days"
            accent="bg-orange-400/10"
          />

          <StatCard
            icon={<BarChart3 className="h-5 w-5 text-violet-300" />}
            label="Weekly target"
            value={`${weeklyProgress}%`}
            detail={`${weeklyCompleted}/${estimatedWeeklyTarget} blocks estimated`}
            accent="bg-violet-400/10"
          />

          <StatCard
            icon={<Brain className="h-5 w-5 text-emerald-300" />}
            label="Competencies"
            value={`${competencies.length}`}
            detail="concepts currently mapped"
            accent="bg-emerald-400/10"
          />
        </section>

        {/* Main Grid */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {/* Schedule Column */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Daily Schedule</h3>
                  <p className="text-xs text-gray-400">
                    After-school study framework
                  </p>
                </div>
                <button
                  onClick={resetDay}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-400 transition hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {SCHEDULE.map((item) => {
                  const isDone = Boolean(completed[item.id]);
                  const isCurrent = currentSchedule?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleTask(item.id)}
                      className={`group relative flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition-all duration-200 ${
                        isDone
                          ? "border-gray-800/50 bg-gray-950/40 opacity-60"
                          : isCurrent
                          ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/5"
                          : "border-gray-800/80 bg-gray-950/80 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                            isDone
                              ? "border-cyan-500 bg-cyan-500 text-gray-950"
                              : "border-gray-700 bg-gray-900 group-hover:border-gray-500"
                          }`}
                        >
                          {isDone && <Check className="h-4 w-4 stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-cyan-400">
                              {item.start} – {item.end}
                            </span>
                            {isCurrent && (
                              <span className="animate-pulse rounded-full bg-cyan-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-gray-950">
                                Live
                              </span>
                            )}
                          </div>
                          <h4
                            className={`mt-1 font-bold ${
                              isDone
                                ? "text-gray-400 line-through"
                                : "text-white"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <p className="mt-1 text-xs text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="ml-3 shrink-0 rounded-xl bg-gray-900 p-2 text-gray-400">
                        <AccentIcon category={item.category} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Competency Analyzer & Practice Column */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Study Notes Intelligence
                  </h3>
                  <p className="text-xs text-gray-400">
                    Paste notes to identify key skills & pitfalls
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-400 transition hover:text-white">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload .txt</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-4">
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste biology, chemistry, physics, or math notes..."
                  className="w-full rounded-2xl border border-gray-800 bg-gray-950 p-4 text-xs font-mono text-gray-200 placeholder-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={analyze}
                  disabled={analyzing || !notes.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 py-2.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  <Brain className="h-4 w-4" />
                  {analyzing ? "Analyzing..." : "Map Competencies"}
                </button>

                <button
                  onClick={generateMocks}
                  disabled={!notes.trim() && competencies.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 py-2.5 text-xs font-bold text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Exam Questions
                </button>
              </div>

              {/* Subject Filter Pills */}
              {competencies.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {(["All", "Biology", "Chemistry", "Physics", "Mathematics"] as const).map(
                    (sub) => (
                      <button
                        key={sub}
                        onClick={() => setActiveSubject(sub)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                          activeSubject === sub
                            ? "bg-cyan-500 text-gray-950"
                            : "bg-gray-950 text-gray-400 hover:text-white"
                        }`}
                      >
                        {sub}
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Competencies List */}
              {filteredCompetencies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {filteredCompetencies.map((item) => {
                    const isExpanded = expandedCompetency === item.id;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-gray-800 bg-gray-950 p-4"
                      >
                        <div
                          onClick={() =>
                            setExpandedCompetency(isExpanded ? null : item.id)
                          }
                          className="flex cursor-pointer items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                SUBJECT_COLORS[item.subject]
                              }`}
                            >
                              {item.subject}
                            </span>
                            <span className="text-xs font-bold text-gray-400">
                              {item.gradeLevel}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {item.concept}
                            </h4>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-3 border-t border-gray-800/60 pt-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                Target Competencies
                              </p>
                              <ul className="mt-1.5 space-y-1">
                                {item.competencies.map((c, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-xs text-gray-300"
                                  >
                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                Common Pitfalls
                              </p>
                              <ul className="mt-1.5 space-y-1">
                                {item.pitfalls.map((p, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-xs text-gray-300"
                                  >
                                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mock Questions Generator Panel */}
              {showMockGenerator && mockQuestions.length > 0 && (
                <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-violet-300">
                      <Sparkles className="h-4 w-4" />
                      Generated Practice Scenario
                    </h4>
                    <button
                      onClick={() => setShowMockGenerator(false)}
                      className="text-gray-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-4">
                    {mockQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-gray-800 bg-gray-950 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Est. {q.estimatedMinutes} mins
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-gray-200">
                          {q.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
