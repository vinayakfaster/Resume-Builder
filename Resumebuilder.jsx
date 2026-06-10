import { useState, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
//  DESIGN TOKENS  — change these 5 values to retheme everything
// ─────────────────────────────────────────────────────────────────
const C = {
  brand:      "#0f172a",   // slate-900  — nav bar, section titles
  accent:     "#6366f1",   // indigo-500 — buttons, active step, links
  accentSoft: "#eef2ff",   // indigo-50  — active step bg tint
  accentDark: "#4f46e5",   // indigo-600 — hover state
  muted:      "#64748b",   // slate-500  — labels, secondary text
  border:     "#e2e8f0",   // slate-200  — borders
  surface:    "#f8fafc",   // slate-50   — page bg
  card:       "#ffffff",   // white      — card bg
  danger:     "#ef4444",   // red-500    — remove buttons
  text:       "#0f172a",   // slate-900  — main text
  textLight:  "#475569",   // slate-600  — body copy
};

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const EMPTY_FORM = {
  name: "", title: "", phone: "", email: "", github: "",
  photo: null,
  summary: "",
  experience: [{ id: uid(), role: "", period: "", bullets: [""] }],
  projects:   [{ id: uid(), name: "", year: "", tech: "", bullets: [""] }],
  education:  [{ id: uid(), degree: "", school: "", year: "" }],
  skills: {
    Programming: [""],
    Frontend:    [""],
    Backend:     [""],
    Blockchain:  [""],
  },
};

const STEPS = ["Personal", "Experience", "Projects", "Education", "Skills", "Preview"];

// ─────────────────────────────────────────────────────────────────
//  TINY SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────

// Label above every input
function Label({ children }) {
  return (
    <label style={{
      display: "block", fontSize: 11, fontWeight: 700,
      color: C.muted, textTransform: "uppercase",
      letterSpacing: "0.06em", marginBottom: 5,
    }}>{children}</label>
  );
}

// Text input — reused everywhere
function Input({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 8,
        padding: "9px 12px", fontSize: 13, color: C.text,
        background: C.card, outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s",
        ...style,
      }}
      onFocus={e  => e.target.style.borderColor = C.accent}
      onBlur={e   => e.target.style.borderColor = C.border}
    />
  );
}

// Textarea
function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 8,
        padding: "9px 12px", fontSize: 13, color: C.text,
        background: C.card, outline: "none", resize: "vertical",
        boxSizing: "border-box", fontFamily: "inherit",
        transition: "border-color 0.15s",
      }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e  => e.target.style.borderColor = C.border}
    />
  );
}

// Primary button (filled)
function BtnPrimary({ children, onClick, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer",
        background: hover ? C.accentDark : C.accent,
        color: "#fff", fontSize: 13, fontWeight: 700,
        boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
        transition: "background 0.15s", ...style,
      }}>{children}</button>
  );
}

// Secondary button (outlined)
function BtnSecondary({ children, onClick, disabled = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: "10px 22px", borderRadius: 8,
        border: `1.5px solid ${disabled ? "#e2e8f0" : C.border}`,
        background: C.card, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "#cbd5e1" : C.text, transition: "border-color 0.15s", ...style,
      }}>{children}</button>
  );
}

// Ghost "add" button with dashed border
function BtnAdd({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "11px", borderRadius: 8,
        border: `2px dashed ${hover ? C.accent : C.border}`,
        background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer",
        color: hover ? C.accent : C.muted, transition: "all 0.15s",
      }}>{children}</button>
  );
}

// Card wrapper
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 12, padding: 24,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 8px rgba(0,0,0,0.05)", ...style,
    }}>{children}</div>
  );
}

// Step heading
function StepHeading({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span> {title}
      </div>
      {subtitle && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

// Entry card (experience / project / education)
function EntryCard({ children, onRemove, showRemove }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: 18, position: "relative", marginBottom: 14,
    }}>
      {showRemove && (
        <button onClick={onRemove} style={{
          position: "absolute", top: 12, right: 12,
          fontSize: 11, color: C.muted, background: "none",
          border: `1px solid ${C.border}`, borderRadius: 5,
          padding: "2px 8px", cursor: "pointer", fontWeight: 600,
        }}
          onMouseEnter={e => { e.target.style.color = C.danger; e.target.style.borderColor = C.danger; }}
          onMouseLeave={e => { e.target.style.color = C.muted;  e.target.style.borderColor = C.border; }}
        >✕ Remove</button>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  RESUME PREVIEW  (print-safe inline styles)
// ─────────────────────────────────────────────────────────────────
function ResumePreview({ data, innerRef }) {
  return (
    <div ref={innerRef} id="resume-root" style={{
      fontFamily: "Arial, Helvetica, sans-serif",
      background: "#fff", width: 900, minHeight: 1100,
      padding: "36px 44px 40px", boxSizing: "border-box",
    }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#111", letterSpacing: -0.5, lineHeight: 1, marginBottom: 5 }}>
            {data.name || "YOUR NAME"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 9 }}>
            {data.title || "Your Professional Title"}
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#444", flexWrap: "wrap" }}>
            {data.phone  && <span>📞 {data.phone}</span>}
            {data.email  && <span>✉ {data.email}</span>}
            {data.github && <span>🔗 {data.github}</span>}
          </div>
        </div>

        {/* Profile circle */}
        <div style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#6366f1" }}>
          {data.photo
            ? <img src={data.photo} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 10%", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 26, fontWeight: 800 }}>
                {(data.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
          }
        </div>
      </div>

      {/* ── TWO-COLUMN BODY ── */}
      <div style={{ display: "flex", gap: 28 }}>

        {/* LEFT */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.summary && <>
            <RSection>Summary</RSection>
            <p style={{ fontSize: 11, color: "#444", lineHeight: 1.65, marginBottom: 4 }}>{data.summary}</p>
          </>}

          {data.experience.some(e => e.role) && <>
            <RSection>Experience</RSection>
            {data.experience.filter(e => e.role).map(e => (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111" }}>{e.role}</div>
                {e.period && <div style={{ fontSize: 10.5, color: "#888", marginBottom: 4 }}>{e.period}</div>}
                <ul style={{ paddingLeft: 13 }}>
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#444", lineHeight: 1.6, marginBottom: 2 }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>}

          {data.projects.some(p => p.name) && <>
            <RSection>Projects</RSection>
            {data.projects.filter(p => p.name).map(p => (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111" }}>{p.name}</div>
                {p.year && <div style={{ fontSize: 10.5, color: "#888", marginBottom: 3 }}>{p.year}</div>}
                {p.tech && <div style={{ fontSize: 10.5, color: "#555", fontStyle: "italic", marginBottom: 4 }}>{p.tech}</div>}
                <ul style={{ paddingLeft: 13 }}>
                  {p.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#444", lineHeight: 1.6, marginBottom: 2 }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>}
        </div>

        {/* RIGHT */}
        <div style={{ width: 268, flexShrink: 0 }}>
          {data.education.some(e => e.degree) && <>
            <RSection>Education</RSection>
            {data.education.filter(e => e.degree).map((e, i, arr) => (
              <div key={e.id} style={{ marginBottom: 11, paddingBottom: 11, borderBottom: i < arr.length - 1 ? "1px dashed #e0e0e0" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: 2 }}>{e.degree}</div>
                {e.school && <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", marginBottom: 2 }}>{e.school}</div>}
                {e.year   && <div style={{ fontSize: 10.5, color: "#888" }}>{e.year}</div>}
              </div>
            ))}
          </>}

          {Object.entries(data.skills).some(([, v]) => v.some(Boolean)) && <>
            <RSection>Skills</RSection>
            {Object.entries(data.skills).map(([cat, tags]) => {
              const filled = tags.filter(Boolean);
              if (!filled.length) return null;
              return (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 5 }}>{cat}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {filled.map((t, i) => (
                      <span key={i} style={{ background: "#f4f4f4", border: "1px solid #e0e0e0", borderRadius: 3, padding: "2px 7px", fontSize: 10, color: "#333", fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </>}
        </div>
      </div>
    </div>
  );
}

// Section title inside resume (print-safe)
function RSection({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, color: "#111", textTransform: "uppercase", letterSpacing: 0.9, borderBottom: "1.5px solid #111", paddingBottom: 3, marginBottom: 12, marginTop: 18 }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  STEP COMPONENTS
// ─────────────────────────────────────────────────────────────────

function StepPersonal({ data, onChange }) {
  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange("photo", ev.target.result);
    reader.readAsDataURL(file);
  }
  return (
    <div>
      <StepHeading icon="👤" title="Personal Details" subtitle="This goes at the very top of your resume." />

      {/* Photo upload row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", overflow: "hidden", background: C.accent, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {data.photo
            ? <img src={data.photo} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 10%" }} />
            : <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{(data.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>
          }
        </div>
        <div>
          <Label>Profile Photo (optional)</Label>
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ fontSize: 12, color: C.muted }} />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Square crop works best · JPG or PNG</div>
        </div>
      </div>

      {/* Grid fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <Label>Full Name *</Label>
          <Input value={data.name} onChange={e => onChange("name", e.target.value)} placeholder="Vinayak Shukla" />
        </div>
        <div>
          <Label>Professional Title *</Label>
          <Input value={data.title} onChange={e => onChange("title", e.target.value)} placeholder="Full Stack Developer" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={data.phone} onChange={e => onChange("phone", e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={data.email} onChange={e => onChange("email", e.target.value)} placeholder="you@email.com" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Label>GitHub / LinkedIn URL</Label>
          <Input value={data.github} onChange={e => onChange("github", e.target.value)} placeholder="github.com/yourhandle" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Label>Professional Summary</Label>
          <Textarea value={data.summary} onChange={e => onChange("summary", e.target.value)}
            placeholder="Brief overview of your skills, experience and what you bring to the table..." rows={4} />
        </div>
      </div>
    </div>
  );
}

function StepExperience({ data, onChange }) {
  const update    = (id, f, v) => onChange("experience", data.experience.map(e => e.id === id ? { ...e, [f]: v } : e));
  const updBullet = (id, i, v) => onChange("experience", data.experience.map(e => e.id !== id ? e : { ...e, bullets: e.bullets.map((b, j) => j === i ? v : b) }));
  const addBullet = id          => onChange("experience", data.experience.map(e => e.id === id ? { ...e, bullets: [...e.bullets, ""] } : e));
  const delBullet = (id, i)     => onChange("experience", data.experience.map(e => e.id !== id ? e : { ...e, bullets: e.bullets.filter((_, j) => j !== i) }));
  const addEntry  = ()          => onChange("experience", [...data.experience, { id: uid(), role: "", period: "", bullets: [""] }]);
  const delEntry  = id          => onChange("experience", data.experience.filter(e => e.id !== id));

  return (
    <div>
      <StepHeading icon="💼" title="Work Experience" subtitle="Add your roles, most recent first." />
      {data.experience.map(e => (
        <EntryCard key={e.id} showRemove={data.experience.length > 1} onRemove={() => delEntry(e.id)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Label>Job Title / Role</Label><Input value={e.role} onChange={ev => update(e.id, "role", ev.target.value)} placeholder="Freelance Full Stack Developer" /></div>
            <div><Label>Period</Label><Input value={e.period} onChange={ev => update(e.id, "period", ev.target.value)} placeholder="2022 – Present" /></div>
          </div>
          <Label>Key Achievements</Label>
          {e.bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
              <Input value={b} onChange={ev => updBullet(e.id, i, ev.target.value)} placeholder={`Bullet point ${i + 1}`} />
              {e.bullets.length > 1 && (
                <button onClick={() => delBullet(e.id, i)} style={{ flexShrink: 0, width: 30, height: 36, borderRadius: 6, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", color: C.muted, fontSize: 16 }}
                  onMouseEnter={e => e.target.style.color = C.danger}
                  onMouseLeave={e => e.target.style.color = C.muted}>×</button>
              )}
            </div>
          ))}
          <button onClick={() => addBullet(e.id)} style={{ fontSize: 12, color: C.accent, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>+ Add bullet</button>
        </EntryCard>
      ))}
      <BtnAdd onClick={addEntry}>+ Add another role</BtnAdd>
    </div>
  );
}

function StepProjects({ data, onChange }) {
  const update    = (id, f, v) => onChange("projects", data.projects.map(p => p.id === id ? { ...p, [f]: v } : p));
  const updBullet = (id, i, v) => onChange("projects", data.projects.map(p => p.id !== id ? p : { ...p, bullets: p.bullets.map((b, j) => j === i ? v : b) }));
  const addBullet = id          => onChange("projects", data.projects.map(p => p.id === id ? { ...p, bullets: [...p.bullets, ""] } : p));
  const delBullet = (id, i)     => onChange("projects", data.projects.map(p => p.id !== id ? p : { ...p, bullets: p.bullets.filter((_, j) => j !== i) }));
  const addProj   = ()          => onChange("projects", [...data.projects, { id: uid(), name: "", year: "", tech: "", bullets: [""] }]);
  const delProj   = id          => onChange("projects", data.projects.filter(p => p.id !== id));

  return (
    <div>
      <StepHeading icon="🚀" title="Projects" subtitle="Highlight your best work." />
      {data.projects.map(p => (
        <EntryCard key={p.id} showRemove={data.projects.length > 1} onRemove={() => delProj(p.id)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Label>Project Name</Label><Input value={p.name} onChange={e => update(p.id, "name", e.target.value)} placeholder="My Awesome Project" /></div>
            <div><Label>Year</Label><Input value={p.year} onChange={e => update(p.id, "year", e.target.value)} placeholder="2024" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><Label>Tech Stack</Label><Input value={p.tech} onChange={e => update(p.id, "tech", e.target.value)} placeholder="React, Node.js, MongoDB..." /></div>
          <Label>Highlights</Label>
          {p.bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
              <Input value={b} onChange={e => updBullet(p.id, i, e.target.value)} placeholder={`Highlight ${i + 1}`} />
              {p.bullets.length > 1 && (
                <button onClick={() => delBullet(p.id, i)} style={{ flexShrink: 0, width: 30, height: 36, borderRadius: 6, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", color: C.muted, fontSize: 16 }}
                  onMouseEnter={e => e.target.style.color = C.danger}
                  onMouseLeave={e => e.target.style.color = C.muted}>×</button>
              )}
            </div>
          ))}
          <button onClick={() => addBullet(p.id)} style={{ fontSize: 12, color: C.accent, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>+ Add bullet</button>
        </EntryCard>
      ))}
      <BtnAdd onClick={addProj}>+ Add another project</BtnAdd>
    </div>
  );
}

function StepEducation({ data, onChange }) {
  const update = (id, f, v) => onChange("education", data.education.map(e => e.id === id ? { ...e, [f]: v } : e));
  const add    = ()          => onChange("education", [...data.education, { id: uid(), degree: "", school: "", year: "" }]);
  const del    = id          => onChange("education", data.education.filter(e => e.id !== id));

  return (
    <div>
      <StepHeading icon="🎓" title="Education" subtitle="Latest qualification first." />
      {data.education.map(e => (
        <EntryCard key={e.id} showRemove={data.education.length > 1} onRemove={() => del(e.id)}>
          <div style={{ display: "grid", gap: 12 }}>
            <div><Label>Degree / Qualification</Label><Input value={e.degree} onChange={ev => update(e.id, "degree", ev.target.value)} placeholder="B.Tech – Computer Science" /></div>
            <div><Label>Institution</Label><Input value={e.school} onChange={ev => update(e.id, "school", ev.target.value)} placeholder="IIT Delhi" /></div>
            <div><Label>Year</Label><Input value={e.year} onChange={ev => update(e.id, "year", ev.target.value)} placeholder="2018 – 2022" /></div>
          </div>
        </EntryCard>
      ))}
      <BtnAdd onClick={add}>+ Add qualification</BtnAdd>
    </div>
  );
}

function StepSkills({ data, onChange }) {
  const cats      = Object.keys(data.skills);
  const updTag    = (cat, i, v) => onChange("skills", { ...data.skills, [cat]: data.skills[cat].map((t, j) => j === i ? v : t) });
  const addTag    = cat          => onChange("skills", { ...data.skills, [cat]: [...data.skills[cat], ""] });
  const delTag    = (cat, i)     => onChange("skills", { ...data.skills, [cat]: data.skills[cat].filter((_, j) => j !== i) });
  const addCat    = ()           => {
    const name = prompt("New category name (e.g. DevOps, Cloud, Tools):");
    if (name && !data.skills[name]) onChange("skills", { ...data.skills, [name]: [""] });
  };

  return (
    <div>
      <StepHeading icon="⚡" title="Skills" subtitle="Add your technical skills by category." />
      {cats.map(cat => (
        <div key={cat} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>{cat}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {data.skills[cat].map((tag, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input value={tag} onChange={e => updTag(cat, i, e.target.value)} placeholder="Skill..."
                  style={{ border: `1.5px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 110, outline: "none", background: C.card, color: C.text }}
                  onFocus={e  => e.target.style.borderColor = C.accent}
                  onBlur={e   => e.target.style.borderColor = C.border}
                />
                {data.skills[cat].length > 1 && (
                  <button onClick={() => delTag(cat, i)} style={{ color: C.muted, background: "none", border: "none", cursor: "pointer", fontSize: 15, lineHeight: 1 }}
                    onMouseEnter={e => e.target.style.color = C.danger}
                    onMouseLeave={e => e.target.style.color = C.muted}>×</button>
                )}
              </div>
            ))}
            <button onClick={() => addTag(cat)} style={{ fontSize: 12, color: C.accent, background: "none", border: `1px dashed ${C.accent}`, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontWeight: 600 }}>+ Add</button>
          </div>
        </div>
      ))}
      <BtnAdd onClick={addCat}>+ Add skill category</BtnAdd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const resumeRef = useRef(null);

  // Single updater for any top-level form field
  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // Open a blank tab, write the resume HTML, trigger browser print → Save as PDF
  function handlePrint() {
    const node = document.getElementById("resume-root");
    if (!node) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${form.name || "Resume"}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#fff; }
        @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
      </style>
    </head><body>${node.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }

  const isPreview = step === 5;
  const progress  = ((step + 1) / STEPS.length) * 100;

  const stepContent = [
    <StepPersonal    data={form} onChange={updateField} />,
    <StepExperience  data={form} onChange={updateField} />,
    <StepProjects    data={form} onChange={updateField} />,
    <StepEducation   data={form} onChange={updateField} />,
    <StepSkills      data={form} onChange={updateField} />,
    null,
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.surface, fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* ── TOP NAV ── */}
      <nav style={{ background: C.brand, padding: "0 28px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 54, gap: 4 }}>
          {/* Logo */}
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginRight: 20, letterSpacing: -0.3 }}>
            <span style={{ color: C.accent }}>◈</span> ResumeBuilder
          </span>
          {/* Step tabs */}
          {STEPS.map((s, i) => {
            const active  = step === i;
            const done    = i < step;
            return (
              <button key={s} onClick={() => setStep(i)} style={{
                padding: "6px 13px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: active ? C.accent : "transparent",
                color: active ? "#fff" : done ? "#a5b4fc" : "#64748b",
                transition: "all 0.15s",
              }}>
                {done ? "✓ " : `${i + 1}. `}{s}
              </button>
            );
          })}
        </div>
      </nav>

      {isPreview ? (
        /* ── PREVIEW PAGE ── */
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Preview & Download</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>Your resume is ready. Click Download PDF → then Save as PDF in the print dialog.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <BtnSecondary onClick={() => setStep(0)}>✏️ Edit Details</BtnSecondary>
              <BtnPrimary onClick={handlePrint}>⬇ Download PDF</BtnPrimary>
            </div>
          </div>

          {/* Scaled resume card */}
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ transform: "scale(0.78)", transformOrigin: "top left", width: 900, pointerEvents: "none" }}>
              <ResumePreview data={form} innerRef={resumeRef} />
            </div>
          </div>
        </div>

      ) : (
        /* ── FORM PAGE ── */
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>

          {/* Progress bar */}
          <div style={{ height: 4, background: C.border, borderRadius: 99, marginBottom: 26, overflow: "hidden" }}>
            <div style={{ height: "100%", background: C.accent, borderRadius: 99, width: `${progress}%`, transition: "width 0.35s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 18, textAlign: "right" }}>
            Step {step + 1} of {STEPS.length}
          </div>

          {/* Form card */}
          <Card>{stepContent[step]}</Card>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <BtnSecondary onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</BtnSecondary>
            <BtnPrimary   onClick={() => setStep(s => Math.min(5, s + 1))}>
              {step === 4 ? "Preview Resume →" : "Next →"}
            </BtnPrimary>
          </div>
        </div>
      )}
    </div>
  );
}
