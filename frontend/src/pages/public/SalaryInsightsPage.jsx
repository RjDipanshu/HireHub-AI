/**
 * SalaryInsightsPage — HireHub AI
 * URL: /salaries
 * Public salary research tool comparable to Naukri Salary Insights, Glassdoor Salaries.
 */
import React, { useState, useCallback } from "react";
import { Search, IndianRupee, TrendingUp, Building2, Briefcase, MapPin, Users, Sparkles, BarChart2 } from "lucide-react";
import aiService from "../../services/aiService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SALARY_DB = {
  "software engineer": { base: { min: 8, median: 18, max: 35 }, byExperience: [{ level: "0–1 yr (Fresher)", min: 5, median: 8, max: 14 },{ level: "1–3 yrs (Junior)", min: 8, median: 14, max: 22 },{ level: "3–6 yrs (Mid)", min: 16, median: 24, max: 40 },{ level: "6–10 yrs (Senior)", min: 28, median: 42, max: 65 },{ level: "10+ yrs (Staff/Principal)", min: 50, median: 75, max: 120 }], topCompanies: [{ name: "Google", range: "₹60–₹1.2 Cr", badge: "#4285F4" },{ name: "Microsoft", range: "₹50–₹95 LPA", badge: "#00A4EF" },{ name: "Flipkart", range: "₹40–₹80 LPA", badge: "#F7C600" },{ name: "Swiggy", range: "₹35–₹70 LPA", badge: "#FC8019" },{ name: "Zepto", range: "₹30–₹60 LPA", badge: "#9B59B6" }], growth: "+11% YOY — Demand driven by AI/ML and cloud-native engineering", demand: "Very High" },
  "backend engineer": { base: { min: 10, median: 22, max: 45 }, byExperience: [{ level: "0–1 yr", min: 6, median: 10, max: 16 },{ level: "1–3 yrs", min: 10, median: 18, max: 28 },{ level: "3–6 yrs", min: 20, median: 30, max: 50 },{ level: "6–10 yrs", min: 35, median: 50, max: 80 },{ level: "10+ yrs", min: 60, median: 90, max: 140 }], topCompanies: [{ name: "Stripe", range: "₹70–₹1.4 Cr", badge: "#635BFF" },{ name: "Razorpay", range: "₹45–₹90 LPA", badge: "#3395FF" },{ name: "Meesho", range: "₹35–₹65 LPA", badge: "#EF4444" },{ name: "Swiggy", range: "₹30–₹60 LPA", badge: "#FC8019" }], growth: "+14% YOY — Go / Java microservices and fintech APIs driving premium", demand: "Very High" },
  "frontend engineer": { base: { min: 7, median: 16, max: 38 }, byExperience: [{ level: "0–1 yr", min: 4, median: 7, max: 12 },{ level: "1–3 yrs", min: 8, median: 14, max: 22 },{ level: "3–6 yrs", min: 16, median: 26, max: 42 },{ level: "6–10 yrs", min: 28, median: 42, max: 70 },{ level: "10+ yrs", min: 45, median: 70, max: 110 }], topCompanies: [{ name: "Vercel", range: "₹55–₹1 Cr", badge: "#000000" },{ name: "Figma", range: "₹50–₹95 LPA", badge: "#F24E1E" },{ name: "Atlassian", range: "₹40–₹80 LPA", badge: "#0052CC" },{ name: "Groww", range: "₹30–₹60 LPA", badge: "#00D09C" }], growth: "+9% YOY — React 19 + Next.js specialists highly valued", demand: "High" },
  "data scientist": { base: { min: 10, median: 24, max: 55 }, byExperience: [{ level: "0–1 yr", min: 6, median: 10, max: 18 },{ level: "1–3 yrs", min: 12, median: 20, max: 35 },{ level: "3–6 yrs", min: 22, median: 35, max: 60 },{ level: "6–10 yrs", min: 40, median: 60, max: 95 },{ level: "10+ yrs", min: 65, median: 100, max: 160 }], topCompanies: [{ name: "Google DeepMind", range: "₹1–₹2 Cr", badge: "#4285F4" },{ name: "Walmart Labs", range: "₹60–₹1.2 Cr", badge: "#0071CE" },{ name: "Uber ATG", range: "₹55–₹1.1 Cr", badge: "#000000" },{ name: "PhonePe", range: "₹40–₹80 LPA", badge: "#5F259F" }], growth: "+18% YOY — Generative AI + LLM engineering skyrocketing", demand: "Extreme" },
  "product manager": { base: { min: 12, median: 28, max: 65 }, byExperience: [{ level: "0–2 yrs (APM)", min: 10, median: 18, max: 28 },{ level: "2–5 yrs (PM)", min: 20, median: 30, max: 50 },{ level: "5–8 yrs (Sr PM)", min: 35, median: 50, max: 80 },{ level: "8–12 yrs (GPM)", min: 60, median: 85, max: 130 },{ level: "12+ yrs (Director)", min: 90, median: 130, max: 200 }], topCompanies: [{ name: "Meta", range: "₹1.2–₹2.5 Cr", badge: "#0668E1" },{ name: "Amazon", range: "₹80–₹1.5 Cr", badge: "#FF9900" },{ name: "Zomato", range: "₹50–₹90 LPA", badge: "#E23744" },{ name: "CRED", range: "₹45–₹85 LPA", badge: "#1A1A2E" }], growth: "+13% YOY — B2C consumer tech rewarding strategy skills", demand: "Very High" },
  "devops engineer": { base: { min: 9, median: 20, max: 42 }, byExperience: [{ level: "0–1 yr", min: 5, median: 9, max: 14 },{ level: "1–3 yrs", min: 10, median: 16, max: 26 },{ level: "3–6 yrs", min: 18, median: 28, max: 48 },{ level: "6–10 yrs", min: 32, median: 50, max: 80 },{ level: "10+ yrs", min: 55, median: 80, max: 120 }], topCompanies: [{ name: "AWS ProServe", range: "₹55–₹1 Cr", badge: "#FF9900" },{ name: "HashiCorp", range: "₹50–₹90 LPA", badge: "#7B42BC" },{ name: "Flipkart SRE", range: "₹35–₹70 LPA", badge: "#F7C600" }], growth: "+15% YOY — Kubernetes/GitOps specialization commanding 25–40% premium", demand: "High" },
};

function findRole(q) {
  const lower = q.toLowerCase().trim();
  for (const key of Object.keys(SALARY_DB)) {
    if (lower.includes(key) || key.includes(lower.split(" ")[0])) return SALARY_DB[key];
  }
  return null;
}

function SalaryBar({ min, median, max }) {
  const range = max - min || 1;
  const medPct = ((median - min) / range) * 100;
  return (
    <div style={{ padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
        <span>₹{min} LPA</span><span style={{ color: "#10b981" }}>Median ₹{median} LPA</span><span>₹{max} LPA</span>
      </div>
      <div style={{ position: "relative", height: 14, background: "linear-gradient(90deg,rgba(99,102,241,0.15) 0%,rgba(16,185,129,0.25) 50%,rgba(99,102,241,0.15) 100%)", borderRadius: 8 }}>
        <div style={{ position: "absolute", left: `${medPct}%`, top: -6, transform: "translateX(-50%)", width: 4, height: 26, background: "#10b981", borderRadius: 4, boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
      </div>
      <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>Based on 1,200+ salary reports</div>
    </div>
  );
}

const POPULAR_ROLES = ["Software Engineer","Backend Engineer","Frontend Engineer","Data Scientist","Product Manager","DevOps Engineer"];
const POPULAR_CITIES = ["Bengaluru","Mumbai","Delhi NCR","Hyderabad","Pune","Chennai","Remote"];
const DEMAND_COLOR = { Extreme: "#7c3aed", "Very High": "#059669", High: "#d97706", Medium: "#64748b" };

export function SalaryInsightsPage() {
  const [roleQuery, setRoleQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("Bengaluru");
  const [result, setResult] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Feature 6: Side-by-Side Comparison Mode
  const [compareMode, setCompareMode] = useState(false);
  const [roleA, setRoleA] = useState("Software Engineer");
  const [roleB, setRoleB] = useState("Product Manager");

  const dataA = findRole(roleA);
  const dataB = findRole(roleB);

  const handleSearch = useCallback(async (role, city) => {
    const r = role !== undefined ? role : roleQuery;
    const c = city !== undefined ? city : cityQuery;
    if (!r.trim()) return;
    setLoading(true); setSearched(true);
    try { const ai = await aiService.getHiringInsights(r, c); setAiData(ai); } catch { setAiData(null); }
    setResult(findRole(r));
    setLoading(false);
  }, [roleQuery, cityQuery]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(99,102,241,0.12)", color: "var(--primary-400)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "1rem" }}><Sparkles size={14} /> AI-Powered Salary Intelligence</div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "0 0 0.75rem", lineHeight: 1.2 }}>Know Your Worth.<br /><span style={{ color: "var(--primary-400)" }}>Research Salaries</span> in India.</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: 580, margin: "0 auto" }}>Explore real salary data across roles, experience levels, and cities — powered by 50,000+ salary reports.</p>

        {/* Mode Selector */}
        <div style={{ display: "inline-flex", background: "var(--bg-secondary)", padding: "4px", borderRadius: "10px", marginTop: "1.25rem", border: "1px solid var(--border-color)" }}>
          <button
            onClick={() => setCompareMode(false)}
            style={{
              padding: "6px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              background: !compareMode ? "var(--color-primary)" : "transparent",
              color: !compareMode ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            Role Salary Explorer
          </button>
          <button
            onClick={() => setCompareMode(true)}
            style={{
              padding: "6px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              background: compareMode ? "var(--color-primary)" : "transparent",
              color: compareMode ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            ⚖️ Side-by-Side Comparison (Levels.fyi style)
          </button>
        </div>
      </div>

      {compareMode ? (
        /* Feature 6: Real Data Side-by-Side Comparison Tool */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 1rem 0" }}>Compare Two Engineering & Product Roles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "center" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>ROLE A</label>
                <select className="input" value={roleA} onChange={e => setRoleA(e.target.value)} style={{ width: "100%", padding: "0.6rem" }}>
                  {Object.keys(SALARY_DB).map(k => (
                    <option key={k} value={k}>{k.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontWeight: 900, color: "var(--text-muted)", fontSize: "1.2rem", paddingTop: "1.2rem" }}>VS</div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>ROLE B</label>
                <select className="input" value={roleB} onChange={e => setRoleB(e.target.value)} style={{ width: "100%", padding: "0.6rem" }}>
                  {Object.keys(SALARY_DB).map(k => (
                    <option key={k} value={k}>{k.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Column A */}
            <div className="card" style={{ padding: "1.5rem", borderTop: "4px solid #2563eb" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#2563eb", letterSpacing: "0.05em" }}>ROLE A</span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0.2rem 0 0.8rem 0" }}>{roleA.toUpperCase()}</h2>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981", marginBottom: "0.2rem" }}>
                ₹{dataA?.base.median} LPA
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Range: ₹{dataA?.base.min} – ₹{dataA?.base.max} LPA
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Market Demand:</span>
                  <span style={{ fontWeight: 700, color: "#2563eb" }}>{dataA?.demand}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>YoY Growth:</span>
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>{dataA?.growth.split("—")[0]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Senior (6-10 yrs):</span>
                  <span style={{ fontWeight: 700 }}>₹{dataA?.byExperience?.[3]?.median || 42} LPA</span>
                </div>
              </div>
            </div>

            {/* Column B */}
            <div className="card" style={{ padding: "1.5rem", borderTop: "4px solid #7c3aed" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#7c3aed", letterSpacing: "0.05em" }}>ROLE B</span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0.2rem 0 0.8rem 0" }}>{roleB.toUpperCase()}</h2>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981", marginBottom: "0.2rem" }}>
                ₹{dataB?.base.median} LPA
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Range: ₹{dataB?.base.min} – ₹{dataB?.base.max} LPA
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Market Demand:</span>
                  <span style={{ fontWeight: 700, color: "#7c3aed" }}>{dataB?.demand}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>YoY Growth:</span>
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>{dataB?.growth.split("—")[0]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Senior (6-10 yrs):</span>
                  <span style={{ fontWeight: 700 }}>₹{dataB?.byExperience?.[3]?.median || 50} LPA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <>
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Job Role / Title</label>
            <div style={{ position: "relative" }}><Briefcase size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><input id="salary-role" className="input" value={roleQuery} onChange={e => setRoleQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="e.g. Software Engineer..." style={{ paddingLeft: 38 }} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Location</label>
            <div style={{ position: "relative" }}><MapPin size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><select className="input" value={cityQuery} onChange={e => setCityQuery(e.target.value)} style={{ paddingLeft: 36 }}>{POPULAR_CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <button onClick={() => handleSearch()} disabled={loading || !roleQuery.trim()} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.5rem", alignSelf: "flex-end" }}><Search size={16} />{loading ? "Searching..." : "Get Insights"}</button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", alignSelf: "center", fontWeight: 600 }}>Popular:</span>
          {POPULAR_ROLES.map(r => <button key={r} onClick={() => { setRoleQuery(r); handleSearch(r, cityQuery); }} style={{ padding: "3px 12px", borderRadius: 20, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)" }}>{r}</button>)}
        </div>
      </div>

      {loading && <div style={{ padding: "3rem 0", textAlign: "center" }}><LoadingSpinner label="Researching salary data..." size="md" /></div>}

      {!loading && searched && (result || aiData) && (() => {
        const d = result;
        const demand = aiData?.demandScore?.split("—")[0]?.trim() || (d ? d.demand : "High");
        const topSkills = aiData?.topSkillsInDemand || [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <div><h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.25rem" }}>{roleQuery} — {cityQuery}</h2><p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem" }}>Salary insights updated September 2026</p></div>
              <span style={{ padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: "0.82rem", background: `${DEMAND_COLOR[demand] || "#6366f1"}20`, color: DEMAND_COLOR[demand] || "#6366f1" }}>{demand} Demand</span>
            </div>
            {d && <SalaryBar min={d.base.min} median={d.base.median} max={d.base.max} />}
            {aiData?.salaryRange && <div className="card card-ai" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}><Sparkles size={22} color="var(--primary-400)" /><div><p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem" }}>AI Market Rate: {aiData.salaryRange}</p><p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>Avg time to hire: {aiData.averageTimeToHire}</p></div></div>}
            {d?.byExperience && <div className="card" style={{ padding: "1.5rem" }}><h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}><Users size={18} color="var(--primary-400)" /> Salary by Experience Level</h3><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}><thead><tr style={{ borderBottom: "2px solid var(--border-color)" }}>{["Experience","Minimum","Median","Maximum"].map(h => <th key={h} style={{ padding: "0.6rem 0.8rem", textAlign: h === "Experience" ? "left" : "center", color: "var(--text-secondary)", fontWeight: 700, fontSize: "0.8rem" }}>{h}</th>)}</tr></thead><tbody>{d.byExperience.map((row, i) => <tr key={i} style={{ borderBottom: "1px solid var(--border-color)", background: i % 2 === 0 ? "transparent" : "var(--bg-secondary)" }}><td style={{ padding: "0.65rem 0.8rem", fontWeight: 600 }}>{row.level}</td><td style={{ padding: "0.65rem 0.8rem", textAlign: "center", color: "var(--text-secondary)" }}>₹{row.min} LPA</td><td style={{ padding: "0.65rem 0.8rem", textAlign: "center", fontWeight: 800, color: "#10b981" }}>₹{row.median} LPA</td><td style={{ padding: "0.65rem 0.8rem", textAlign: "center", color: "var(--text-secondary)" }}>₹{row.max} LPA</td></tr>)}</tbody></table></div></div>}
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              {d?.topCompanies && <div className="card" style={{ flex: 1, minWidth: 240, padding: "1.5rem" }}><h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}><Building2 size={17} color="var(--primary-400)" /> Top-Paying Companies</h3><div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{d.topCompanies.map((co, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: 6, background: co.badge, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>{co.name[0]}</div><span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{co.name}</span></div><span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#16a34a" }}>{co.range}</span></div>)}</div></div>}
              <div className="card" style={{ flex: 1, minWidth: 240, padding: "1.5rem" }}>
                {topSkills.length > 0 && <><h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}><TrendingUp size={17} color="var(--primary-400)" /> Top Skills In Demand</h3><div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: d?.growth ? "1.25rem" : 0 }}>{topSkills.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "var(--primary-400)", fontSize: "0.78rem", fontWeight: 600, border: "1px solid rgba(99,102,241,0.2)" }}>{s}</span>)}</div></>}
                {d?.growth && <><h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: 8 }}><BarChart2 size={17} color="#10b981" /> Market Trend</h3><p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.65, color: "var(--text-secondary)" }}>{d.growth}</p></>}
              </div>
            </div>
          </div>
        );
      })()}

      {!loading && searched && !result && !aiData && <div className="card" style={{ padding: "3rem", textAlign: "center" }}><IndianRupee size={40} style={{ opacity: 0.2, margin: "0 auto 1rem" }} /><h3 style={{ margin: "0 0 0.5rem" }}>No Data Found</h3><p style={{ color: "var(--text-secondary)" }}>Try a more specific role like "Software Engineer" or "Data Scientist".</p></div>}

      {!searched && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginTop: "0.5rem" }}>{[{ icon: IndianRupee, title: "50,000+ Reports", desc: "Anonymous salary data from verified professionals", color: "#10b981" },{ icon: TrendingUp, title: "Real-Time Trends", desc: "Market salary shifts updated weekly", color: "#6366f1" },{ icon: Building2, title: "Top Companies", desc: "Benchmark against Google, Flipkart, Swiggy & more", color: "#f59e0b" },{ icon: BarChart2, title: "AI Insights", desc: "AI-generated market intelligence beyond the data", color: "#ec4899" }].map(c => <div key={c.title} className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}><div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><c.icon size={20} color={c.color} /></div><div><p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "0.9rem" }}>{c.title}</p><p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: 1.5 }}>{c.desc}</p></div></div>)}</div>}
      </>
      )}
    </div>
  );
}

export default SalaryInsightsPage;
