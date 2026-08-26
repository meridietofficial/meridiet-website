/*
 * ManualDietPlanDocument — Diet plan document for manually created plans.
 * Based on the same card-per-day layout as DietPlanDocument but:
 *   • No cover page
 *   • Uses the dietitian's own branding (logo, name, contact)
 *   • Supports extra_meals added by the dietitian
 */
import { forwardRef } from "react";
import type { DietitianProfile } from "../api/dietitian";
import {
  FaHeart, FaCalendarAlt, FaEnvelope, FaPhoneAlt, FaGlobe,
  FaUser, FaHeartbeat, FaBullseye, FaRunning, FaNotesMedical, FaUtensils, FaRegStickyNote,
  FaBirthdayCake, FaVenusMars, FaRulerVertical, FaMapMarkerAlt, FaWeight, FaCalculator,
  FaChartPie, FaFireAlt, FaBolt, FaStethoscope, FaClipboardList, FaDumbbell,
  FaQuoteLeft, FaBriefcase, FaSmoking, FaPills, FaCapsules, FaExclamationTriangle, FaBan,
  FaPepperHot, FaQuoteRight, FaClock, FaTint, FaWalking, FaMoon,
  FaCheckCircle, FaInfoCircle, FaHome, FaExchangeAlt, FaChartLine, FaAppleAlt,
  FaUtensilSpoon, FaSun, FaBreadSlice, FaCheese, FaSeedling, FaTimesCircle,
  FaLongArrowAltRight, FaLightbulb, FaBalanceScale, FaCarrot,
  FaChartBar, FaTrophy, FaRulerCombined, FaStar, FaCamera, FaSmile,
  FaRuler, FaCircleNotch, FaTshirt, FaHandRock,
} from "react-icons/fa";
import {
  LuTarget, LuClipboardList, LuChefHat, LuLeaf, LuBadgeCheck,
} from "react-icons/lu";

export const PAGE_W = 794;
export const PAGE_H = 1123;

const C = {
  brand:  "#1E8E3E",
  dark:   "#14532d",
  banner: "#15532a",
  gold:   "#C7A14A",
  ink:    "#1f2937",
  sub:    "#6b7280",
  faint:  "#9ca3af",
  line:   "#e6efe3",
  card:   "#f4f8f0",
  soft:   "#eef5ea",
  white:  "#ffffff",
};
const EXTRA_MEAL_COLOR = "#e11d74";
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

// ── helpers ───────────────────────────────────────────────────────────────────
const humanize = (v: any): string => {
  if (v === null || v === undefined || v === "") return "";
  return String(v).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};
const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")} / ${String(d.getMonth() + 1).padStart(2, "0")} / ${d.getFullYear()}`;
};
const list = (v: any): any[] => {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string" && v.trim()) return v.split(",").map((s: string) => s.trim()).filter(Boolean);
  return [];
};
const none = (arr: any): string => {
  const l = list(arr).filter((x: any) => String(x).toLowerCase() !== "none");
  return l.length ? l.map(humanize).join(", ") : "None";
};

// ── atoms ─────────────────────────────────────────────────────────────────────
const CaloriePill = ({ text }: { text?: string | null }) => (
  <div style={{ border: `1.5px solid ${C.line}`, borderRadius: 22, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 8, background: C.white, fontWeight: 700, color: C.ink, fontSize: 14 }}>
    <FaFireAlt size={15} color={C.brand} /> {text || "Calorie Plan"}
  </div>
);

const DietitianHeader = ({ dietitian, calorie }: { dietitian?: DietitianProfile | null; calorie?: string | null }) => {
  const logoUrl = dietitian?.documents?.logo_url || null;
  const name    = dietitian?.full_name || "";
  const degrees = (dietitian?.degrees || []).map((d) => d.degree).filter(Boolean);
  const spec    = (dietitian?.specialization || [])[0];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      {/* Dietitian identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {logoUrl && (
          <img src={logoUrl} alt="" crossOrigin="anonymous"
            style={{ height: 46, width: "auto", objectFit: "contain", maxWidth: 160 }} />
        )}
        <div>
          {name && <div style={{ fontWeight: 800, fontSize: 15, color: C.dark, lineHeight: 1.15 }}>{name}</div>}
          {degrees.length > 0 && (
            <div style={{ fontSize: 9.5, color: C.sub, marginTop: 1 }}>{degrees.join(", ")}</div>
          )}
          {spec && (
            <div style={{ fontSize: 9.5, color: C.brand, marginTop: 1 }}>{humanize(spec)}</div>
          )}
        </div>
      </div>
      <CaloriePill text={calorie} />
    </div>
  );
};

const DietitianFooter = ({ page, tagline, dietitian }: {
  page: number;
  tagline?: { main: string; sub?: string } | null;
  dietitian?: DietitianProfile | null;
}) => {
  const email = dietitian?.email || "";
  const phone = [dietitian?.phone_code, dietitian?.phone_number].filter(Boolean).join(" ");
  const city  = [dietitian?.city, dietitian?.state].filter(Boolean).join(", ");
  return (
    <div style={{ position: "absolute", left: 30, right: 30, bottom: 20 }}>
      {tagline && (
        <div style={{ background: C.banner, borderRadius: 12, padding: "10px 20px", minHeight: 50, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", color: C.white, marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{tagline.main}</div>
          {tagline.sub && <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{tagline.sub}</div>}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5, color: C.sub, borderTop: `1px solid ${C.line}`, paddingTop: 7 }}>
        <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 }}>
          {email && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FaEnvelope size={10} color={C.brand} /> {email}</span>}
          {phone && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FaPhoneAlt size={10} color={C.brand} /> {phone}</span>}
        </span>
        <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, letterSpacing: 2, color: C.sub }}>{String(page).padStart(2, "0")}</span>
        <span style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {city && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FaMapMarkerAlt size={10} color={C.brand} /> {city}</span>}
        </span>
      </div>
    </div>
  );
};

const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; bg?: string; pad?: number }>(
  ({ children, bg = C.white, pad = 30 }, ref) => (
    <div className="dp-page" ref={ref}
      style={{ width: PAGE_W, height: PAGE_H, background: bg, position: "relative", overflow: "hidden", fontFamily: FONT, color: C.ink, boxSizing: "border-box", padding: pad, margin: "0 auto 24px", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}>
      {children}
    </div>
  )
);
Page.displayName = "MDPPage";

const Title = ({ pre, accent, size = 28 }: { pre: string; accent?: string; size?: number }) => (
  <div style={{ margin: "14px 0 4px", fontSize: size, fontWeight: 800, color: C.dark, letterSpacing: -0.5, lineHeight: 1.1 }}>
    {pre} {accent && <span style={{ color: C.brand }}>{accent}</span>}
  </div>
);

const SectionCard = ({ icon, title, children, style }: { icon: React.ReactNode; title: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: "11px 14px", ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 16, display: "flex", alignItems: "center" }}>{icon}</span>
      <div style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.dark, letterSpacing: 0.3 }}>{title}</div>
    </div>
    {children}
  </div>
);

const Row = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string | null }) => (
  <div style={{ display: "flex", alignItems: "center", fontSize: 11, padding: "4px 0", lineHeight: 1.3 }}>
    {icon && <span style={{ width: 15, display: "flex", justifyContent: "center", color: C.faint, marginRight: 8, flexShrink: 0 }}>{icon}</span>}
    <span style={{ color: C.sub, minWidth: 116, flexShrink: 0 }}>{label}</span>
    <span style={{ color: C.sub, margin: "0 5px" }}>:</span>
    <span style={{ color: C.ink, fontWeight: 600 }}>{value || "—"}</span>
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span style={{ background: C.soft, color: C.brand, borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{children}</span>
);

// ════════════════════════════════════════════════════════════════════════════
// PAGE 1 — CLIENT PROFILE & VITALS
// ════════════════════════════════════════════════════════════════════════════
const ProfilePage = ({ plan, dietitian, page }: { plan: any; dietitian?: DietitianProfile | null; page: number }) => {
  const cp = plan?.client_profile || {};
  const p  = cp.personal_information    || {};
  const v  = cp.current_vitals          || {};
  const g  = cp.health_and_fitness_goals || {};
  const lf = cp.lifestyle_overview      || {};
  const md = cp.medical_information     || {};
  const di = cp.dietary_information     || {};
  const s  = plan?.summary              || {};
  return (
    <Page>
      <DietitianHeader dietitian={dietitian} calorie={s.calorie_range} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Title pre="CLIENT PROFILE &" accent="VITALS" />
          <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0" }}>Here's a summary of the information provided to personalise your plan.</p>
        </div>
      </div>
      <div style={{ position: "absolute", right: 30, top: 100, background: C.soft, borderRadius: 10, padding: "8px 14px", fontSize: 11, color: C.ink }}>
        <div>📅 Date: <b>{fmtDate(new Date().toISOString())}</b></div>
      </div>
      <div style={{ width: 50, height: 3, background: C.brand, borderRadius: 3, margin: "8px 0 10px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <SectionCard icon={<FaUser size={13} color={C.brand} />} title="PERSONAL INFORMATION" style={{ padding: "8px 11px" }}>
          <Row icon={<FaUser size={11} />}          label="Full Name"    value={humanize(p.full_name)} />
          <Row icon={<FaBirthdayCake size={11} />}  label="Age"          value={p.age ? `${p.age} Years` : null} />
          <Row icon={<FaVenusMars size={11} />}     label="Gender"       value={humanize(p.gender)} />
          <Row icon={<FaCalendarAlt size={11} />}   label="Date of Birth" value={p.date_of_birth ? fmtDate(p.date_of_birth) : null} />
          <Row icon={<FaRulerVertical size={11} />} label="Height"       value={p.height} />
          <Row icon={<FaPhoneAlt size={11} />}      label="Phone Number" value={p.phone} />
          <Row icon={<FaEnvelope size={11} />}      label="Email ID"     value={p.email} />
          <Row icon={<FaMapMarkerAlt size={11} />}  label="Location"     value={[p.city, p.state].filter(Boolean).join(", ")} />
        </SectionCard>

        <SectionCard icon={<FaHeartbeat size={13} color={C.brand} />} title="CURRENT VITALS" style={{ padding: "8px 11px" }}>
          <Row icon={<FaWeight size={11} />}       label="Weight"        value={v.weight_kg ? `${v.weight_kg} kg` : null} />
          <Row icon={<FaRulerVertical size={11} />}label="Height"        value={v.height_cm ? `${v.height_cm} cm` : null} />
          <Row icon={<FaCalculator size={11} />}   label="BMI"           value={v.bmi != null ? `${v.bmi}` : null} />
          <Row icon={<FaChartPie size={11} />}     label="BMI Category"  value={v.bmi_category} />
          <Row icon={<FaFireAlt size={11} />}      label="BMR"           value={v.bmr_kcal ? `${v.bmr_kcal} kcal/day` : null} />
          <Row icon={<FaBolt size={11} />}         label="TDEE"          value={v.tdee_kcal ? `${v.tdee_kcal} kcal/day` : null} />
          <Row icon={<FaRunning size={11} />}      label="Activity Level" value={humanize(lf.activity_level)} />
          <Row icon={<FaStethoscope size={11} />}  label="Digestive Health" value={humanize(lf.digestive_health)} />
        </SectionCard>

        <SectionCard icon={<FaBullseye size={13} color={C.brand} />} title="HEALTH & FITNESS GOALS" style={{ padding: "8px 11px" }}>
          <Row icon={<FaBullseye size={11} />}     label="Primary Goal"    value={list(g.goals).map(humanize).join(", ") || humanize(s.primary_goal)} />
          <Row icon={<FaFireAlt size={11} />}      label="Calorie Target"  value={s.calorie_range} />
          <Row icon={<FaDumbbell size={11} />}     label="Protein Target"  value={s.protein_target_g ? `${s.protein_target_g} g/day` : null} />
          <Row icon={<FaNotesMedical size={11} />} label="Health Notes"    value={g.health_notes} />
        </SectionCard>

        <SectionCard icon={<FaRunning size={13} color={C.brand} />} title="LIFESTYLE OVERVIEW" style={{ padding: "8px 11px" }}>
          <Row icon={<FaBriefcase size={11} />}    label="Work Type"       value={humanize(lf.work_type)} />
          <Row icon={<FaDumbbell size={11} />}     label="Workout Type"    value={humanize(lf.workout_type)} />
          <Row icon={<FaRunning size={11} />}      label="Activity Level"  value={humanize(lf.activity_level)} />
          <Row icon={<FaSmoking size={11} />}      label="Smoke / Alcohol" value={humanize(lf.smoke_alcohol)} />
          <Row icon={<FaStethoscope size={11} />}  label="Digestive Health" value={humanize(lf.digestive_health)} />
        </SectionCard>

        <SectionCard icon={<FaNotesMedical size={13} color={C.brand} />} title="MEDICAL INFORMATION" style={{ padding: "8px 11px" }}>
          <Row icon={<FaNotesMedical size={11} />}       label="Medical Conditions"    value={none(md.medical_conditions)} />
          <Row icon={<FaHeartbeat size={11} />}          label="Other Condition"       value={md.other_condition} />
          <Row icon={<FaPills size={11} />}              label="On Medication"         value={humanize(md.on_medication)} />
          <Row icon={<FaCapsules size={11} />}           label="Medications"           value={md.medications} />
          <Row icon={<FaExclamationTriangle size={11} />}label="Allergies / Avoid"    value={none(md.food_allergies)} />
        </SectionCard>

        <SectionCard icon={<FaUtensils size={13} color={C.brand} />} title="DIETARY INFORMATION" style={{ padding: "8px 11px" }}>
          <Row icon={<FaUtensils size={11} />}    label="Diet Type"         value={humanize(di.diet_type)} />
          <Row icon={<FaPepperHot size={11} />}   label="Cuisine Pref."    value={list(di.cuisine_preference).map(humanize).join(", ")} />
          <Row icon={<FaHeart size={11} />}        label="Favorite Foods"   value={di.favorite_foods} />
          <Row icon={<FaBan size={11} />}          label="Foods Disliked"   value={di.foods_dislike} />
        </SectionCard>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "stretch" }}>
        <div style={{ flex: 1.9, background: C.soft, borderRadius: 14, padding: "10px 14px" }}>
          <div style={{ fontWeight: 800, fontSize: 11, color: C.dark, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}><FaRegStickyNote size={11} color={C.brand} /> ADDITIONAL NOTES</div>
          <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.45 }}>{g.health_notes || "Please follow the plan as advised. Reach out if you have any queries."}</div>
        </div>
        <div style={{ flex: 1, background: C.soft, borderRadius: 14, padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: C.brand }}>
          <FaQuoteLeft size={12} style={{ opacity: 0.55, alignSelf: "flex-start" }} />
          <div style={{ fontFamily: "'Segoe Script',cursive", fontStyle: "italic", fontSize: 12, lineHeight: 1.4, margin: "3px 0" }}>Your health journey is unique. We're here to support you every step of the way.</div>
          <FaQuoteRight size={12} style={{ opacity: 0.55, alignSelf: "flex-end" }} />
        </div>
      </div>

      <DietitianFooter page={page} dietitian={dietitian} tagline={{ main: "Let's build a healthier, happier you!", sub: "Your goals. Our guidance. Real results." }} />
    </Page>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE 2 — HOW TO USE + PLAN OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
const OverviewPage = ({ plan, dietitian, page }: { plan: any; dietitian?: DietitianProfile | null; page: number }) => {
  const s     = plan?.summary || {};
  const weeks = plan?.weeks   || [];
  const steps = [
    { Icon: FaClock,   t: "Eat On Time",    d: "Follow meal timings consistently for better energy and digestion." },
    { Icon: FaTint,    t: "Stay Hydrated",  d: "Drink 2.5–3L water daily throughout your transformation journey." },
    { Icon: FaWalking, t: "Stay Active",    d: "Aim for 7000–10000 steps daily along with light exercise." },
    { Icon: FaMoon,    t: "Sleep Well",     d: "Maintain 7–8 hours of quality sleep for recovery and fat loss." },
  ];
  const weekColors = [C.brand, "#2f9e44", "#1b7a39", C.gold];
  const includes = [
    [FaClipboardList, "Daily meal plans"],  [FaHome,       "Indian home-style meals"],
    [FaUtensilSpoon,  "Portion guidance"],  [FaFireAlt,    "Calorie-aware meals"],
    [FaAppleAlt,      "Healthy snack ideas"],[FaTint,       "Hydration support"],
    [FaExchangeAlt,   "Smart food swaps"],  [FaChartLine,  "Progress tracking"],
  ];
  const notes = [
    "One cheat meal allowed weekly.",
    "Avoid processed sugar as much as possible.",
    "Portion sizes may vary slightly based on your needs.",
    "Consistency matters more than perfection.",
    "Listen to your body and make mindful choices.",
  ];
  return (
    <Page>
      <DietitianHeader dietitian={dietitian} calorie={s.calorie_range} />
      <Title pre="HOW TO USE" accent="THIS PLAN" />
      <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 14px" }}>Simple steps to follow for the best results</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        {steps.map(({ Icon, t, d }) => (
          <div key={t} style={{ background: C.card, borderRadius: 12, padding: "12px 11px", textAlign: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 7px" }}><Icon size={15} color={C.brand} /></div>
            <div style={{ fontWeight: 800, fontSize: 12, color: C.dark, marginBottom: 3 }}>{t}</div>
            <div style={{ fontSize: 10, color: C.sub, lineHeight: 1.35 }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "14px 0 3px" }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{weeks.length ? `${weeks.length * 7}-DAY` : "30-DAY"} PLAN OVERVIEW</span>
      </div>
      <p style={{ textAlign: "center", fontSize: 11.5, color: C.sub, margin: "0 0 10px" }}>A structured approach to transform your lifestyle</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(weeks.length ? weeks : []).map((w: any, i: number) => (
          <div key={i} style={{ display: "flex", background: C.card, borderRadius: 12, overflow: "hidden", minHeight: 68 }}>
            <div style={{ width: 64, background: weekColors[i % 4], color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.85 }}>WEEK</div>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{w.week || i + 1}</div>
            </div>
            <div style={{ flex: 1, padding: "8px 12px", display: "flex", gap: 12 }}>
              <div style={{ flex: 1.4 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: C.brand }}>{w.title || `Week ${i + 1}`}</div>
                <div style={{ fontSize: 10, color: C.sub, lineHeight: 1.35, marginTop: 2 }}>{w.description || "A structured week to progress your nutrition and habits."}</div>
              </div>
              {list(w.focus).length > 0 && (
                <div style={{ flex: 1, borderLeft: `1px solid ${C.line}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: C.brand, marginBottom: 3 }}>FOCUS</div>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 9.5, color: C.sub, lineHeight: 1.4 }}>
                    {list(w.focus).slice(0, 4).map((f: string, k: number) => <li key={k}>{f}</li>)}
                  </ul>
                </div>
              )}
              {w.what_to_expect && (
                <div style={{ flex: 0.9, borderLeft: `1px solid ${C.line}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: C.gold, marginBottom: 3 }}>WHAT TO EXPECT</div>
                  <div style={{ fontSize: 9.5, color: C.sub, lineHeight: 1.35 }}>{w.what_to_expect}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 12 }}>
        <SectionCard icon={<FaCheckCircle size={13} color={C.brand} />} title="WHAT THIS PLAN INCLUDES">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 8px" }}>
            {includes.map(([Ic, label]: any[]) => (
              <div key={label} style={{ fontSize: 10.5, color: C.ink, display: "flex", alignItems: "center", gap: 6 }}>
                <Ic size={10} color={C.brand} />{label}
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard icon={<FaInfoCircle size={13} color={C.brand} />} title="IMPORTANT NOTES">
          <ul style={{ margin: 0, paddingLeft: 15, fontSize: 10.5, color: C.sub, lineHeight: 1.55 }}>
            {notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </SectionCard>
      </div>

      <DietitianFooter page={page} dietitian={dietitian} tagline={{ main: "Small healthy choices repeated daily create long-term transformation." }} />
    </Page>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// WEEK PAGES — card-per-day layout
// ════════════════════════════════════════════════════════════════════════════
const MEALS = [
  { key: "breakfast", label: "Breakfast", Icon: FaSun     },
  { key: "lunch",     label: "Lunch",     Icon: FaUtensils },
  { key: "snack",     label: "Snack",     Icon: FaAppleAlt },
  { key: "dinner",    label: "Dinner",    Icon: FaMoon     },
];

const DayCard = ({ d }: { d: any }) => {
  const extraMeals: any[] = Array.isArray(d.extra_meals) ? d.extra_meals : [];
  return (
    <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.line}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.brand, color: "#fff", padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.3 }}>DAY {d.day}</span>
        {d.total_kcal != null && (
          <span style={{ fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            <FaFireAlt size={8} /> {d.total_kcal} kcal
          </span>
        )}
      </div>
      <div style={{ padding: "7px 9px", flex: 1 }}>
        {/* Fixed meals */}
        {MEALS.map((m) => {
          const items = list(d[m.key]);
          if (!items.length) return null;
          const time = d.meal_timing?.[m.key];
          return (
            <div key={m.key} style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8.5, fontWeight: 800, color: C.brand, letterSpacing: 0.3, marginBottom: 2 }}>
                <m.Icon size={8} />
                <span>{m.label.toUpperCase()}</span>
                {time && <span style={{ marginLeft: "auto", color: C.faint, fontWeight: 700 }}>{time}</span>}
              </div>
              {items.map((it: any, k: number) => (
                <div key={k} style={{ display: "flex", gap: 5, fontSize: 8.5, color: C.ink, lineHeight: 1.3, paddingLeft: 2 }}>
                  <span style={{ color: C.brand, flexShrink: 0 }}>•</span>
                  <span style={{ flex: 1 }}>
                    {(it.food || "").replace(/\s*\([^)]*\)/g, "").trim()}
                    {it.quantity ? <span style={{ color: C.sub }}> — {it.quantity}</span> : ""}
                  </span>
                </div>
              ))}
            </div>
          );
        })}

        {/* Extra meals */}
        {extraMeals.map((em: any, ei: number) => {
          const items = list(em.items);
          return (
            <div key={`em-${ei}`} style={{ marginBottom: 7, borderLeft: `2px solid ${EXTRA_MEAL_COLOR}`, paddingLeft: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8.5, fontWeight: 800, color: EXTRA_MEAL_COLOR, letterSpacing: 0.3, marginBottom: 2 }}>
                <FaUtensilSpoon size={8} color={EXTRA_MEAL_COLOR} />
                <span>{(em.name || "Extra Meal").toUpperCase()}</span>
                {em.time && <span style={{ marginLeft: "auto", color: C.faint, fontWeight: 700 }}>{em.time}</span>}
              </div>
              {items.length === 0 ? (
                <div style={{ fontSize: 8, color: C.faint, paddingLeft: 2 }}>—</div>
              ) : items.map((it: any, k: number) => (
                <div key={k} style={{ display: "flex", gap: 5, fontSize: 8.5, color: C.ink, lineHeight: 1.3, paddingLeft: 2 }}>
                  <span style={{ color: EXTRA_MEAL_COLOR, flexShrink: 0 }}>•</span>
                  <span style={{ flex: 1 }}>
                    {(it.food || "").replace(/\s*\([^)]*\)/g, "").trim()}
                    {it.quantity ? <span style={{ color: C.sub }}> — {it.quantity}</span> : ""}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, padding: "5px 9px", display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700 }}>
        {d.total_protein_g != null && (
          <span style={{ color: C.brand, display: "flex", alignItems: "center", gap: 3 }}>
            <FaDumbbell size={8} /> {d.total_protein_g}g protein
          </span>
        )}
        {d.water_liters != null && (
          <span style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 3 }}>
            <FaTint size={8} /> {d.water_liters}L water
          </span>
        )}
      </div>
    </div>
  );
};

const WeekPage = ({ week, weekIndex, plan, dietitian, page }: {
  week: any; weekIndex: number; plan: any; dietitian?: DietitianProfile | null; page: number;
}) => {
  const s        = plan?.summary || {};
  const days     = week?.days    || [];
  const startDay = days[0]?.day  || weekIndex * 7 + 1;
  const endDay   = days[days.length - 1]?.day || startDay + days.length - 1;
  return (
    <Page>
      <DietitianHeader dietitian={dietitian} calorie={s.calorie_range} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <Title pre={`WEEK ${week?.week || weekIndex + 1} —`} accent="MEAL PLAN" size={22} />
        <Chip><span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}><FaBullseye size={10} /> Goal: {humanize(s.primary_goal) || "—"}</span></Chip>
      </div>
      <p style={{ fontSize: 11.5, color: C.sub, margin: "2px 0 10px" }}>
        Days {startDay}–{endDay}{week?.title ? ` — ${week.title}` : ""}.
      </p>

      {/* Macro targets bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { Icon: FaFireAlt,    label: "Calories", val: s.calorie_range ? s.calorie_range.replace("/day", "").trim() : null, color: C.gold },
          { Icon: FaDumbbell,   label: "Protein",  val: s.protein_target_g ? `${s.protein_target_g} g` : null, color: C.brand },
          { Icon: FaBreadSlice, label: "Carbs",    val: s.carbs_target_g   ? `${s.carbs_target_g} g`   : null, color: "#d97706" },
          { Icon: FaCheese,     label: "Fat",      val: s.fat_target_g     ? `${s.fat_target_g} g`     : null, color: "#dc2626" },
        ].filter((x) => x.val).map(({ Icon, label, val, color }) => (
          <div key={label} style={{ flex: 1, background: C.card, borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}><Icon size={10} /></span>
            <div>
              <div style={{ fontSize: 8, color: C.sub, fontWeight: 700, letterSpacing: 0.3 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.dark }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Day cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 9 }}>
        {days.map((d: any) => <DayCard key={d.day} d={d} />)}
      </div>

      <DietitianFooter page={page} dietitian={dietitian} tagline={{ main: "You've got this!", sub: "Consistency today, transformation tomorrow." }} />
    </Page>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// FEATURED RECIPES PAGE
// ════════════════════════════════════════════════════════════════════════════
const RECIPE_MACROS = [
  { Icon: FaBreadSlice, label: "Carbs",   key: "carbs_g" },
  { Icon: FaDumbbell,   label: "Protein", key: "protein_g" },
  { Icon: FaCheese,     label: "Fat",     key: "fat_g" },
  { Icon: FaSeedling,   label: "Fiber",   key: "fiber_g" },
];

const RecipeCard = ({ r }: { r: any }) => (
  <div style={{ background: C.white, borderRadius: 12, padding: "9px 12px", border: `1px solid ${C.line}`, display: "flex", flexDirection: "column" }}>
    <div style={{ fontWeight: 800, fontSize: 13, color: C.brand, lineHeight: 1.15, marginBottom: 3 }}>{r.name}</div>
    <div style={{ display: "flex", flexWrap: "nowrap", gap: 12, fontSize: 9.5, color: C.sub, marginBottom: 7, whiteSpace: "nowrap" }}>
      {r.cook_time && <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><FaClock size={9} color={C.brand} /> {r.cook_time}</span>}
      {r.servings  && <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><FaUtensils size={9} color={C.brand} /> {r.servings} Serving{r.servings > 1 ? "s" : ""}</span>}
      {r.calories  && <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><FaFireAlt size={9} color={C.gold} /> {r.calories} kcal</span>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 12, flex: 1 }}>
      <div>
        <div style={{ fontSize: 9.5, fontWeight: 800, color: C.dark, marginBottom: 2 }}>Ingredients</div>
        <ul style={{ margin: 0, paddingLeft: 13, fontSize: 9, color: C.sub, lineHeight: 1.35 }}>
          {list(r.ingredients).map((it: string, i: number) => <li key={i}>{it}</li>)}
        </ul>
      </div>
      <div>
        <div style={{ fontSize: 9.5, fontWeight: 800, color: C.dark, marginBottom: 2 }}>How to make</div>
        <div style={{ fontSize: 9, color: C.sub, lineHeight: 1.4 }}>{list(r.steps).slice(0, 6).join(" ")}</div>
      </div>
    </div>
    {r.macros && (
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, paddingTop: 6, borderTop: `1px solid ${C.line}` }}>
        {RECIPE_MACROS.map(({ Icon, label, key }) => (
          r.macros[key] != null && (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", color: C.brand, flexShrink: 0 }}><Icon size={9} /></span>
              <div style={{ lineHeight: 1.05 }}>
                <div style={{ fontSize: 7.5, color: C.faint, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.dark }}>{r.macros[key]}g</div>
              </div>
            </div>
          )
        ))}
      </div>
    )}
  </div>
);

const RecipesPage = ({ plan, dietitian, page }: { plan: any; dietitian?: DietitianProfile | null; page: number }) => {
  const s       = plan?.summary || {};
  const recipes = list(plan?.featured_recipes).slice(0, 4);
  const tips    = [
    "Use minimal oil for cooking.",
    "Steam or boil vegetables to retain nutrients.",
    "Choose whole grains over refined grains.",
    "Add more herbs & spices for flavor.",
    "Stay consistent with portion sizes.",
  ];
  return (
    <Page>
      <DietitianHeader dietitian={dietitian} calorie={s.calorie_range} />
      <Title pre="FEATURED" accent="RECIPES" />
      <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 12px" }}>
        Simple, delicious &amp; nutritious recipes from your plan.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, gridAutoRows: "1fr" }}>
        {recipes.map((r: any, i: number) => <RecipeCard key={i} r={r} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <SectionCard icon={<LuChefHat size={13} color={C.brand} />} title="COOKING TIPS" style={{ padding: "10px 13px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tips.map((t) => (
              <div key={t} style={{ fontSize: 10, color: C.ink, display: "flex", alignItems: "center", gap: 7 }}>
                <FaCheckCircle size={10} color={C.brand} style={{ flexShrink: 0 }} />{t}
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard icon={<FaLightbulb size={13} color={C.brand} />} title="GOOD TO KNOW" style={{ padding: "10px 13px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              [FaBreadSlice, "Eat carbs earlier in the day for energy."],
              [FaDumbbell,   "Protein at every meal keeps you full longer."],
              [FaTint,       "Drink water 30 min before meals to aid digestion."],
              [FaMoon,       "Avoid heavy meals 2–3 hours before bedtime."],
              [FaAppleAlt,   "Snack on fruits or nuts to curb cravings."],
            ].map(([Icon, t]: any[]) => (
              <div key={t} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 10, color: C.sub, lineHeight: 1.35 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", color: C.brand, flexShrink: 0, marginTop: 1 }}><Icon size={9} /></span>
                {t}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <DietitianFooter page={page} dietitian={dietitian} tagline={{ main: "Eat clean. Stay consistent. See results." }} />
    </Page>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// HYDRATION & TIPS PAGE
// ════════════════════════════════════════════════════════════════════════════
const HydrationPage = ({ plan, dietitian, page }: { plan: any; dietitian?: DietitianProfile | null; page: number }) => {
  const s       = plan?.summary || {};
  const allSwaps = (plan?.weeks || []).flatMap((w: any) => list(w.smart_swaps));
  const seen = new Set<string>();
  const swaps = allSwaps.filter((sw: any) => {
    const k = (sw.instead_of || "") + (sw.choose || "");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 8);
  const schedule = [
    ["🌅", "After Waking Up",          "1 glass (Warm water)"],
    ["🍳", "Before Breakfast",          "1 glass"],
    ["💼", "Mid-Morning",               "1 glass"],
    ["🍱", "Before Lunch",              "1 glass"],
    ["🕒", "Mid-Afternoon",             "1 glass"],
    ["🏋️", "Before Workout / Evening", "1 glass"],
    ["🥗", "Before Dinner",             "1 glass"],
    ["🌙", "Before Bed",                "1 glass"],
  ];
  const tips = list(plan?.general_tips);
  return (
    <Page>
      <DietitianHeader dietitian={dietitian} calorie={s.calorie_range} />
      <Title pre="SMART SWAPS &" accent="HYDRATION GUIDE" />
      <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 14px" }}>Small swaps today. Big transformation tomorrow.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SectionCard icon={<FaExchangeAlt size={13} color={C.brand} />} title="SMART SWAPS FOR BETTER CHOICES">
          <div style={{ display: "flex", fontSize: 9.5, fontWeight: 800, color: C.brand, padding: "4px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ flex: 1 }}>INSTEAD OF</span><span style={{ flex: 1 }}>CHOOSE THIS</span>
          </div>
          {(swaps.length ? swaps : [
            { instead_of: "Chips",             choose: "Roasted Makhana" },
            { instead_of: "Cola / Soft Drinks", choose: "Lemon / Herbal Water" },
            { instead_of: "White Bread",       choose: "Whole Wheat Bread" },
            { instead_of: "Sugar",             choose: "Jaggery / Honey" },
            { instead_of: "Fried Snacks",      choose: "Roasted Chana" },
            { instead_of: "White Rice",        choose: "Brown Rice / Millets" },
          ]).map((sw: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", fontSize: 11, padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ flex: 1, color: C.ink }}>{sw.instead_of}</span>
              <span style={{ color: C.brand, fontWeight: 800, margin: "0 6px" }}>→</span>
              <span style={{ flex: 1, color: C.brand, fontWeight: 700 }}>{sw.choose}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard icon={<FaTint size={13} color={C.brand} />} title="HYDRATION GUIDE">
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 7 }}>{plan?.hydration_guide || "Water is essential for fat loss, metabolism, digestion and glowing skin."}</div>
          <div style={{ background: C.soft, borderRadius: 8, padding: "7px 10px", textAlign: "center", fontWeight: 800, color: C.brand, fontSize: 11.5, marginBottom: 9 }}>
            DAILY GOAL: 8–10 GLASSES (2.5–3 LITRES)
          </div>
          {schedule.map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", fontSize: 10.5, padding: "4px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ width: 22 }}>{row[0]}</span>
              <span style={{ flex: 1, color: C.ink }}>{row[1]}</span>
              <span style={{ color: C.sub }}>{row[2]}</span>
            </div>
          ))}
        </SectionCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
        <SectionCard icon={<FaTint size={13} color={C.brand} />} title="BENEFITS OF HYDRATION">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["Boosts Metabolism", "Detoxifies Body", "Improves Digestion", "Enhances Skin Health", "Improves Energy Levels"].map((b) => (
              <div key={b} style={{ fontSize: 10.5, color: C.sub, display: "flex", alignItems: "center", gap: 6 }}><FaCheckCircle size={9} color={C.brand} style={{ flexShrink: 0 }} /> {b}</div>
            ))}
          </div>
        </SectionCard>
        <SectionCard icon={<FaStethoscope size={13} color={C.brand} />} title="GENERAL TIPS">
          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 10, color: C.sub, lineHeight: 1.5 }}>
            {(tips.length ? tips : ["Prioritize protein at every meal.", "Include colorful vegetables and fruits.", "Stay consistent with meal timings.", "Listen to hunger and fullness cues."]).slice(0, 5).map((t: string, i: number) => <li key={i}>{t}</li>)}
          </ul>
        </SectionCard>
        <SectionCard icon={<FaCheckCircle size={13} color={C.brand} />} title="HYDRATION CHECKLIST">
          <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.8 }}>
            ✓ Drank 8–10 glasses today<br />
            ✓ Avoided sugary drinks<br />
            ✓ Included herbal / infused water<br />
            ✓ Made hydration a daily habit
          </div>
        </SectionCard>
      </div>

      <DietitianFooter page={page} dietitian={dietitian} tagline={{ main: "Hydrate well, nourish well, live well!", sub: "Consistency is your superpower." }} />
    </Page>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS TRACKER PAGE
// ════════════════════════════════════════════════════════════════════════════
const ProgressPage = ({ plan, dietitian, page }: { plan: any; dietitian?: DietitianProfile | null; page: number }) => {
  const s      = plan?.summary || {};
  const weeksN = plan?.weeks?.length || 4;
  const wk     = Array.from({ length: Math.max(weeksN, 4) }, (_: unknown, i: number) => `Week ${i + 1}`);
  const track = [
    { Icon: FaUtensils, t: "Followed Meal Plan", sub: "(80% or more)" },
    { Icon: FaTint,     t: "Stayed Hydrated",    sub: "(8-10 glasses/day)" },
    { Icon: FaDumbbell, t: "Worked Out",          sub: "(3-5 times/week)" },
    { Icon: FaMoon,     t: "Slept Well",          sub: "(7-8 hours/night)" },
    { Icon: FaSmile,    t: "Stress Managed",      sub: "(Mindful & Positive)" },
  ];
  const measures = [
    { Icon: FaWeight,      t: "Weight (kg)" },
    { Icon: FaCircleNotch, t: "Waist (cm)" },
    { Icon: FaRuler,       t: "Hips (cm)" },
    { Icon: FaTshirt,      t: "Chest (cm)" },
    { Icon: FaHandRock,    t: "Arms (cm)" },
    { Icon: FaWalking,     t: "Thighs (cm)" },
  ];
  const victories = [
    "More energy throughout the day", "Stronger and fitter body",
    "Better sleep quality",           "Better mood & focus",
    "Improved digestion",             "Reduced cravings",
    "Fitting into old clothes",       "More confidence",
    "Clearer skin",                   "Healthy habits stick!",
  ];
  return (
    <Page>
      <DietitianHeader dietitian={dietitian} calorie={s.calorie_range} />
      <Title pre="PROGRESS TRACKER &" accent="MEASUREMENTS" size={22} />
      <p style={{ fontSize: 11.5, color: C.sub, margin: "2px 0 12px" }}>Track your journey. Celebrate small wins. Stay consistent!</p>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
        <SectionCard icon={<FaChartBar size={13} color={C.brand} />} title="WEEKLY PROGRESS TRACKER" style={{ padding: "10px 12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "44%" }} />
              {wk.map((w) => <col key={w} style={{ width: `${56 / wk.length}%` }} />)}
            </colgroup>
            <thead>
              <tr style={{ background: C.brand }}>
                <th style={{ textAlign: "left", color: "#fff", padding: "5px 8px", fontSize: 9, borderTopLeftRadius: 6 }}>AREAS TO TRACK</th>
                {wk.map((w, i) => <th key={w} style={{ textAlign: "center", color: "#fff", padding: "5px 3px", fontSize: 9, borderTopRightRadius: i === wk.length - 1 ? 6 : 0 }}>{w}</th>)}
              </tr>
            </thead>
            <tbody>
              {track.map(({ Icon, t, sub }) => (
                <tr key={t}>
                  <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.line}`, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.ink }}>
                      <Icon size={10} color={C.brand} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 9 }}>{t}</div>
                        <div style={{ fontSize: 7.5, color: C.faint }}>{sub}</div>
                      </div>
                    </div>
                  </td>
                  {wk.map((w) => <td key={w} style={{ textAlign: "center", color: C.faint, padding: "5px 2px", borderBottom: `1px solid ${C.line}`, fontSize: 7.5, whiteSpace: "nowrap" }}>① ② ③ ④ ⑤</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard icon={<FaWeight size={13} color={C.brand} />} title="WEIGHT TRACKER" style={{ padding: "10px 12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5, tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: C.brand }}>
                {["Week", "Date", "Weight (kg)", "Change (kg)"].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "5px 6px", textAlign: i === 0 ? "left" : "center", fontSize: 9 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wk.map((w) => (
                <tr key={w}>
                  <td style={{ padding: "3px 6px", color: C.ink, borderBottom: `1px solid ${C.line}` }}>{w}</td>
                  {[0, 1, 2].map((c) => <td key={c} style={{ padding: "3px 6px", textAlign: "center", color: C.faint, borderBottom: `1px solid ${C.line}` }}>____</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8, background: C.soft, borderRadius: 8, padding: "7px 10px", fontSize: 9.5, color: C.ink, display: "flex", alignItems: "center", gap: 7 }}>
            <FaTrophy size={11} color={C.gold} style={{ flexShrink: 0 }} />
            <span><b style={{ color: C.brand }}>Remember:</b> Progress is progress, no matter how small.</span>
          </div>
        </SectionCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginTop: 12 }}>
        <SectionCard icon={<FaRulerCombined size={13} color={C.brand} />} title="MEASUREMENTS TRACKER" style={{ padding: "10px 12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9, tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: C.brand }}>
                {["MEASUREMENTS", ...wk, "Change"].map((h, i, arr) => (
                  <th key={h} style={{ textAlign: i === 0 ? "left" : "center", color: "#fff", padding: "5px 4px", fontSize: 8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measures.map(({ Icon, t }) => (
                <tr key={t}>
                  <td style={{ padding: "4px 6px", color: C.ink, borderBottom: `1px solid ${C.line}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon size={9} color={C.brand} /> {t}</span>
                  </td>
                  {[...wk, "Δ"].map((w) => <td key={w} style={{ textAlign: "center", color: C.faint, borderBottom: `1px solid ${C.line}`, padding: "4px 4px" }}>____</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard icon={<FaStar size={13} color={C.brand} />} title="NON-SCALE VICTORIES" style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 8.5, color: C.sub, marginBottom: 5 }}>Celebrate the changes that truly matter!</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {victories.map((v) => (
              <div key={v} style={{ fontSize: 9, color: C.ink, display: "flex", alignItems: "center", gap: 5 }}>
                <FaCheckCircle size={8} color={C.brand} style={{ flexShrink: 0 }} />{v}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10 }}>
        <div style={{ background: C.soft, borderRadius: 14, padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: C.brand }}>
          <FaQuoteLeft size={12} style={{ opacity: 0.55, alignSelf: "flex-start" }} />
          <div style={{ fontFamily: "'Segoe Script',cursive", fontStyle: "italic", fontSize: 12, lineHeight: 1.35, margin: "3px 0" }}>It's not about being perfect. It's about being consistent.</div>
          <FaQuoteRight size={12} style={{ opacity: 0.55, alignSelf: "flex-end" }} />
        </div>
        <SectionCard icon={<FaBalanceScale size={12} color={C.brand} />} title="PORTION GUIDE" style={{ padding: "7px 12px", alignSelf: "start" }}>
          {[
            [FaBreadSlice, "1 cup cooked grains"],
            [FaCarrot,     "1 cup vegetables"],
            [FaDumbbell,   "1 palm protein (dal, paneer, chana)"],
            [FaSeedling,   "1 thumb healthy fats (nuts, oil)"],
          ].map(([Icon, t]: any[]) => (
            <div key={t} style={{ fontSize: 9.5, color: C.ink, display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ width: 15, height: 15, borderRadius: "50%", background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", color: C.brand, flexShrink: 0 }}><Icon size={8} /></span>
              {t}
            </div>
          ))}
        </SectionCard>
      </div>

      {/* Daily Habit Tracker */}
      <div style={{ marginTop: 12 }}>
        <SectionCard icon={<FaCheckCircle size={13} color={C.brand} />} title="DAILY HABIT TRACKER — Tick each day you complete the habit" style={{ padding: "10px 12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "32%" }} />
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <col key={d} style={{ width: `${68 / 7}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ background: C.brand }}>
                <th style={{ textAlign: "left", color: "#fff", padding: "5px 8px", fontSize: 9, borderTopLeftRadius: 6 }}>HABIT</th>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                  <th key={d} style={{ textAlign: "center", color: "#fff", padding: "5px 3px", fontSize: 9, borderTopRightRadius: i === 6 ? 6 : 0 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [FaTint,     "Drank 8+ glasses of water"],
                [FaUtensils, "Followed meal plan"],
                [FaWalking,  "Exercise / walked 30 min"],
                [FaMoon,     "Slept 7–8 hours"],
                [FaBan,      "Avoided junk / sugar"],
                [FaSmile,    "Stayed positive & mindful"],
              ].map(([Icon, label]: any[], ri) => (
                <tr key={label} style={{ background: ri % 2 === 0 ? C.white : C.card }}>
                  <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.line}`, color: C.ink, whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Icon size={9} color={C.brand} style={{ flexShrink: 0 }} /> {label}
                    </span>
                  </td>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                    <td key={d} style={{ textAlign: "center", borderBottom: `1px solid ${C.line}`, padding: "5px 3px" }}>
                      <span style={{ display: "inline-block", width: 14, height: 14, border: `1.5px solid ${C.faint}`, borderRadius: 3 }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

      <DietitianFooter page={page} dietitian={dietitian} />
    </Page>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT ASSEMBLY — no cover page
// ════════════════════════════════════════════════════════════════════════════
const ManualDietPlanDocument = forwardRef<
  HTMLDivElement,
  { plan: any; dietitian?: DietitianProfile | null }
>(({ plan, dietitian }, ref) => {
  if (!plan) return null;
  const weeks = plan.weeks || [];
  let pageNo = 0;
  const next = () => ++pageNo;

  return (
    <div ref={ref} style={{ width: PAGE_W, margin: "0 auto" }}>
      <ProfilePage  plan={plan} dietitian={dietitian} page={next()} />
      <OverviewPage plan={plan} dietitian={dietitian} page={next()} />
      {weeks.map((w: any, i: number) => (
        <WeekPage key={i} week={w} weekIndex={i} plan={plan} dietitian={dietitian} page={next()} />
      ))}
      {list(plan.featured_recipes).length > 0 && (
        <RecipesPage plan={plan} dietitian={dietitian} page={next()} />
      )}
      <HydrationPage plan={plan} dietitian={dietitian} page={next()} />
      <ProgressPage  plan={plan} dietitian={dietitian} page={next()} />
    </div>
  );
});

ManualDietPlanDocument.displayName = "ManualDietPlanDocument";
export default ManualDietPlanDocument;
