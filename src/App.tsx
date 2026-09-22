import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  categoryBreakdown,
  dashboardMetrics,
  employers,
  reportTrend,
  riskDistribution,
  scamAlerts,
  stateWiseReports,
} from "./data/mockData";
import {
  actions,
  examples,
  getReports,
  saveReport,
  translations,
  validateVerification,
  verify,
  type VerificationType,
} from "./data/logic";

type Lang = keyof typeof translations;

const languageOptions: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
];

const navItems = [
  { path: "/verify", key: "verify" },
  { path: "/employers", key: "directory" },
  { path: "/alerts", key: "alerts" },
  { path: "/how-it-works", key: "how" },
] as const;

const riskTone = {
  LOW: "text-emerald-700 bg-emerald-50 border-emerald-200",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
  HIGH: "text-rose-700 bg-rose-50 border-rose-200",
};

function detectType(input: string): VerificationType {
  if (/^MS-JOB-\d{4}$/i.test(input.trim())) return "QR Code";
  if (/https?:\/\//i.test(input) || /\.[a-z]{2,}/i.test(input)) return "Website / URL";
  if (/\+?91|\d{10}/.test(input)) return "Phone Number";
  if (input.split(" ").length > 6) return "Job Message";
  return "Employer";
}

function AppShell() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="mr-2 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0a2f6b] text-sm font-bold text-white">
              MS
            </span>
            <div>
              <p className="text-base font-bold tracking-tight text-[#0a2f6b]">MoLE SAFE</p>
              <p className="text-[11px] text-slate-500">Secure Access for Formal and Informal Employment</p>
            </div>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition ${isActive ? "bg-slate-100 text-[#0a2f6b]" : "text-slate-600 hover:bg-slate-100"}`
                }
              >
                {t[item.key]}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              DEMO MODE
            </span>
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              aria-label="Language selector"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
            <Link to="/dashboard" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              {t.login}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage lang={lang} />} />
          <Route path="/verify" element={<VerifyPage lang={lang} />} />
          <Route path="/employers" element={<EmployersPage />} />
          <Route path="/employers/:id" element={<EmployerProfilePage />} />
          <Route path="/nano-employer" element={<NanoEmployerPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage lang={lang} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({ lang }: { lang: Lang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const localReports = useMemo(() => getReports().length, []);

  return (
    <div className="space-y-10 pb-8">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="bg-[#0a2f6b] px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">MoLE SAFE</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-4 max-w-3xl text-base text-blue-100">
            Check an employer, recruiter, job message, phone number or QR code before sharing documents or paying money.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/verify" className="rounded-md bg-white px-4 py-2 font-semibold text-[#0a2f6b] hover:bg-slate-100">
              {t.verify}
            </Link>
            <Link to="/employers" className="rounded-md border border-blue-200 px-4 py-2 font-semibold text-white hover:bg-blue-900">
              Explore Verified Employers
            </Link>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/verify", { state: { prefill: { type: detectType(query), value: query } } });
            }}
            className="mt-6 flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter phone number, employer name, URL or job ID"
              className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-slate-900 outline-none ring-[#0a2f6b] focus:ring"
            />
            <button className="rounded-md bg-[#f7a600] px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400">Check</button>
          </form>
        </div>
        <div className="grid gap-4 px-6 py-5 text-sm sm:grid-cols-4 sm:px-10">
          <div>
            <p className="text-2xl font-bold text-[#0a2f6b]">874</p>
            <p className="text-slate-600">Verified employers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0a2f6b]">48,219</p>
            <p className="text-slate-600">Reports processed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0a2f6b]">1.3M</p>
            <p className="text-slate-600">Citizens protected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0a2f6b]">{scamAlerts.filter((x) => x.status === "Active").length}</p>
            <p className="text-slate-600">Active scam alerts</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-700">
          MoLE SAFE does not guarantee employment. It helps citizens understand available verification signals and safer next steps.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-[#0a2f6b]">First 30-second flow</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            "Citizen receives a suspicious job message",
            "Phone, URL or message is entered",
            "MoLE SAFE checks identity and communication signals",
            "Risk level is generated deterministically",
            "Citizen gets safer action guidance",
            "Citizen submits a local demo report",
          ].map((step, idx) => (
            <div key={step} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
              <p className="mb-1 text-xs font-semibold text-[#0a2f6b]">Step {idx + 1}</p>
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-[#0a2f6b]">Prototype status</h2>
        <p className="mt-2 text-sm text-slate-600">Locally stored citizen reports: {localReports}. Data shown on this prototype is simulated for hackathon demo use.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="rounded-md bg-[#0a2f6b] px-4 py-2 text-sm font-semibold text-white" to="/verify">
            Verify an Opportunity
          </Link>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" to="/report">
            Report a Scam
          </Link>
        </div>
      </section>
    </div>
  );
}

function VerifyPage({ lang }: { lang: Lang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType] = useState<VerificationType>("Employer");
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof verify> | null>(null);

  useEffect(() => {
    const payload = location.state as { prefill?: { type: VerificationType; value: string } } | undefined;
    if (payload?.prefill) {
      setType(payload.prefill.type);
      setRaw(payload.prefill.value);
    }
  }, [location.state]);

  const runVerification = () => {
    const message = validateVerification(type, raw);
    setError(message);
    if (message) return;
    setLoading(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(verify(type, raw, employers));
      setLoading(false);
    }, 700);
  };

  const trustWidth = result?.risk === "LOW" ? "35%" : result?.risk === "MEDIUM" ? "67%" : result ? "100%" : "0%";
  const trustColor = result?.risk === "LOW" ? "bg-emerald-500" : result?.risk === "MEDIUM" ? "bg-amber-500" : "bg-rose-600";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#0a2f6b]">Citizen Verification</h1>
        <p className="mt-2 text-sm text-slate-600">Pure deterministic demo rules. No network verification is performed.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(examples) as VerificationType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setType(tab);
                setRaw("");
                setError("");
                setResult(null);
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                type === tab ? "bg-[#0a2f6b] text-white" : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">{type}</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={type === "Job Message" ? 5 : 2}
            placeholder={examples[type].low}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-[#0a2f6b] focus:ring"
          />
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setRaw(examples[type][level])}
                className="rounded-md border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100"
              >
                Use {level} demo
              </button>
            ))}
          </div>
        </div>
        {error && <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <button onClick={runVerification} className="mt-4 rounded-md bg-[#0a2f6b] px-4 py-2 text-sm font-semibold text-white">
          {t.run}
        </button>
      </section>

      {loading && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-700">Analyzing identity and communication signals...</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded bg-slate-100">
            <div className="h-full w-1/2 animate-pulse bg-[#0a2f6b]" />
          </div>
        </section>
      )}

      {!loading && !result && <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Run verification to view risk level, reasons, and safer next action.</section>}

      {result && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#0a2f6b]">Verification Result</h2>
              <p className="mt-1 text-sm text-slate-600">Employer: {result.name}</p>
              <p className="text-sm text-slate-600">Status: {result.status}</p>
            </div>
            <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${riskTone[result.risk]}`}>Risk: {result.risk}</span>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Trust Meter</p>
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div style={{ width: trustWidth }} className={`h-3 rounded-full ${trustColor}`} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-[#0a2f6b]">A. Identity Signals</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>{result.known ? "Employer record found" : "Employer record not found"}</li>
                <li>{result.employer ? "Contact number linked" : "Contact linkage unavailable"}</li>
                <li>{result.employer?.ncsLinked ? "NCS linkage available" : "NCS linkage not found"}</li>
                <li>{result.employer?.eshramLinked ? "eShram linkage available" : "eShram linkage not found"}</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-[#0a2f6b]">B. Communication Signals</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>{result.employer ? "Official domain/contact pattern detected" : "No official domain/contact pattern match"}</li>
                <li>{result.urgency ? "Urgent language detected" : "No urgency pressure detected"}</li>
                <li>{result.sensitive ? "Sensitive data request detected" : "No sensitive data request detected"}</li>
                <li>{result.flagged ? "Flagged pattern match found" : "No exact flagged pattern match"}</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">C. Payment Warning: {t.payment}</div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-[#0a2f6b]">D. Recommended Action</h3>
            <p className="mt-2 text-sm text-slate-700">{result.risk === "HIGH" ? t.high : actions[result.risk]}</p>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              {result.reasons.map((reason) => (
                <p key={reason}>- {reason}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => navigate("/report", { state: { fromResult: result } })}
            >
              {t.report}
            </button>
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                setRaw("");
                setResult(null);
                setError("");
              }}
            >
              {t.another}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function EmployersPage() {
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [nanoOnly, setNanoOnly] = useState(false);
  const [ncsOnly, setNcsOnly] = useState(false);
  const [eshramOnly, setEshramOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");

  const filtered = employers.filter((emp) => {
    if (verifiedOnly && !emp.verified) return false;
    if (nanoOnly && !emp.nano) return false;
    if (ncsOnly && !emp.ncsLinked) return false;
    if (eshramOnly && !emp.eshramLinked) return false;
    if (locationFilter !== "all" && emp.district !== locationFilter) return false;
    if (sectorFilter !== "all" && emp.sector !== sectorFilter) return false;
    const q = search.toLowerCase();
    return !q || emp.name.toLowerCase().includes(q) || emp.location.toLowerCase().includes(q) || emp.sector.toLowerCase().includes(q);
  });

  const districts = [...new Set(employers.map((e) => e.district))];
  const sectors = [...new Set(employers.map((e) => e.sector))];

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-[#0a2f6b]">Employer Directory</h1>
      <p className="text-sm text-slate-600">Demo records for verification journeys. Not live government data.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Search employer" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="all">All locations</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
          <option value="all">All sectors</option>
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
        <Link to="/nano-employer" className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700">
          Nano-Employer Protocol
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-700">
        <label className="flex items-center gap-2"><input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} /> Verified</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={nanoOnly} onChange={(e) => setNanoOnly(e.target.checked)} /> Nano Employer</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={ncsOnly} onChange={(e) => setNcsOnly(e.target.checked)} /> NCS-linked</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={eshramOnly} onChange={(e) => setEshramOnly(e.target.checked)} /> eShram-linked</label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No employers matched your filters.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2">Employer</th>
                <th className="px-3 py-2">Sector</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Verification status</th>
                <th className="px-3 py-2">Last verified</th>
                <th className="px-3 py-2">Trust signals</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium">{emp.name}</td>
                  <td className="px-3 py-2">{emp.sector}</td>
                  <td className="px-3 py-2">{emp.location}</td>
                  <td className="px-3 py-2">{emp.verified ? "Verified" : "Pending"}</td>
                  <td className="px-3 py-2">{emp.lastVerified}</td>
                  <td className="px-3 py-2">{emp.signals.slice(0, 2).join(" • ")}</td>
                  <td className="px-3 py-2">
                    <Link className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold" to={`/employers/${emp.id}`}>
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EmployerProfilePage() {
  const { id } = useParams();
  const emp = employers.find((x) => x.id === id);

  if (!emp) {
    return <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Employer profile not found in demo records.</section>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0a2f6b]">{emp.name}</h1>
            <p className="text-sm text-slate-600">{emp.sector} • {emp.location}</p>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Verified profile</span>
        </div>
        <p className="mt-3 text-sm text-slate-500">Demo-only profile. Signals and timeline are simulated for prototype interaction.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">Verification timeline</h2>
          <div className="mt-3 space-y-2 text-sm">
            {emp.timeline.map((item) => (
              <div key={item.date + item.event} className="rounded-md border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{item.event}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">Identity and trust signals</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {emp.signals.map((signal) => (
              <li key={signal}>- {signal}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Safety guidance: no legitimate employer should ask for upfront recruitment fee.
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-[#0a2f6b]">Trust Graph</h2>
        <div className="mt-4 overflow-x-auto">
          <svg width="780" height="220" role="img" aria-label="Trust graph">
            <line x1="110" y1="110" x2="250" y2="50" stroke="#94a3b8" strokeWidth="2" />
            <line x1="110" y1="110" x2="250" y2="170" stroke="#94a3b8" strokeWidth="2" />
            <line x1="250" y1="50" x2="420" y2="50" stroke="#94a3b8" strokeWidth="2" />
            <line x1="250" y1="170" x2="420" y2="170" stroke="#94a3b8" strokeWidth="2" />
            <line x1="420" y1="50" x2="620" y2="110" stroke="#94a3b8" strokeWidth="2" />
            <line x1="420" y1="170" x2="620" y2="110" stroke="#94a3b8" strokeWidth="2" />
            {[
              { x: 110, y: 110, label: "Employer" },
              { x: 250, y: 50, label: "Phone" },
              { x: 250, y: 170, label: "Location" },
              { x: 420, y: 50, label: "Domain" },
              { x: 420, y: 170, label: "Job Posting" },
              { x: 620, y: 110, label: "Gov Portal" },
            ].map((node) => (
              <g key={node.label}>
                <circle cx={node.x} cy={node.y} r="34" fill="#eff6ff" stroke="#1d4ed8" />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12" fill="#0f172a">{node.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">Contact and jobs</h2>
          <p className="mt-2 text-sm text-slate-700">Phone: {emp.phone}</p>
          <p className="text-sm text-slate-700">Domain: {emp.domain}</p>
          <div className="mt-3 space-y-2 text-sm">
            {emp.jobs.map((job) => (
              <div key={job.id} className="rounded-md border border-slate-200 p-3">
                <p className="font-medium">{job.role}</p>
                <p className="text-slate-600">{job.id} • {job.location} • {job.wage}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">Worker reports</h2>
          <div className="mt-3 space-y-2 text-sm">
            {emp.workerReports.map((report) => (
              <div key={report.date + report.summary} className="rounded-md border border-slate-200 p-3">
                <p className="font-medium">{report.summary}</p>
                <p className="text-slate-600">{report.status} • {report.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function NanoEmployerPage() {
  const steps = [
    "Aadhaar/eKYC-style identity confirmation - DEMO",
    "CSC/Panchayat attestation - DEMO",
    "Local employment information collection",
    "eShram-linked identity confirmation - DEMO",
    "QR-based verification profile",
  ];

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-[#0a2f6b]">Nano-Employer Trust Protocol</h1>
      <p className="text-sm text-slate-600">
        Designed for small employers who may not have conventional corporate identifiers, while still providing citizen safety signals.
      </p>
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <p className="text-xs font-semibold text-[#0a2f6b]">Step {index + 1}</p>
            <p className="mt-1">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AlertsPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#0a2f6b]">Scam Alerts</h1>
        <p className="mt-2 text-sm text-slate-600">Live-looking threat intelligence for demonstration. Alerts are simulated.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {scamAlerts.map((alert) => (
            <div key={alert.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-slate-900">{alert.title}</h2>
                <span className={`rounded px-2 py-1 text-xs font-semibold ${alert.severity === "HIGH" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">Location: {alert.location}</p>
              <p className="text-sm text-slate-700">Reported: {alert.date}</p>
              <p className="text-sm text-slate-700">Channel: {alert.channel}</p>
              <p className="text-sm text-slate-700">Status: {alert.status}</p>
              <p className="mt-2 text-sm text-slate-600">Recommended action: {alert.action}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-[#0a2f6b]">India Scam Heatmap (simplified)</h2>
        <svg viewBox="0 0 600 340" className="mt-4 w-full rounded-md border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Simplified India heatmap">
          <path d="M172 38l45-14 62 18 40 48 62 14 30 53-11 60-42 31-10 44-48 24-58-19-34-37-36-5-24-40-28-22-22-56 20-58 54-41z" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="2" />
          <circle cx="235" cy="145" r="26" fill="rgba(220,38,38,0.35)" />
          <text x="205" y="147" fontSize="12" fill="#7f1d1d">UP</text>
          <circle cx="290" cy="162" r="22" fill="rgba(245,158,11,0.35)" />
          <text x="278" y="164" fontSize="12" fill="#78350f">Bihar</text>
          <circle cx="206" cy="216" r="19" fill="rgba(245,158,11,0.35)" />
          <text x="170" y="220" fontSize="12" fill="#78350f">Maharashtra</text>
          <circle cx="245" cy="268" r="16" fill="rgba(245,158,11,0.3)" />
          <text x="216" y="271" fontSize="12" fill="#78350f">Telangana</text>
          <circle cx="224" cy="300" r="15" fill="rgba(245,158,11,0.3)" />
          <text x="201" y="303" fontSize="12" fill="#78350f">Tamil Nadu</text>
        </svg>
      </section>
    </div>
  );
}

function ReportPage() {
  const location = useLocation();
  const seeded = (location.state as { fromResult?: ReturnType<typeof verify> } | null)?.fromResult;
  const [form, setForm] = useState<{
    type: string;
    employer: string;
    phone: string;
    website: string;
    message: string;
    location: string;
    screenshot: string;
    description: string;
  }>({
    type: seeded?.type || "Job Message",
    employer: seeded?.name || "",
    phone: "",
    website: "",
    message: seeded?.input || "",
    location: "",
    screenshot: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: string } | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.location || !form.description || (!form.phone && !form.website && !form.message)) {
      setError("Please fill mandatory fields and include at least one identifier (phone, website, or message).");
      return;
    }
    const saved = saveReport(form);
    setSuccess({ id: saved.id });
    setError("");
  };

  if (success) {
    return (
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h1 className="text-2xl font-bold text-emerald-800">Report received</h1>
        <p className="mt-2 text-sm text-emerald-900">Reference ID: {success.id}</p>
        <p className="mt-2 text-sm text-emerald-900">This prototype stores submissions locally in your browser for demo purposes only.</p>
        <Link className="mt-4 inline-block rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white" to="/verify">
          Verify another opportunity
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-[#0a2f6b]">Report a Scam</h1>
      <p className="mt-2 text-sm text-slate-600">Report records are local to this browser in demo mode.</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Opportunity type<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></label>
        <label className="text-sm">Employer name<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })} /></label>
        <label className="text-sm">Phone number<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="text-sm">Website<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2">Message<textarea className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
        <label className="text-sm">Location<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
        <label className="text-sm">Upload screenshot<input type="file" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" onChange={(e) => setForm({ ...form, screenshot: e.target.files?.[0]?.name || "" })} /></label>
        <label className="text-sm sm:col-span-2">Description<textarea className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        {error && <p className="sm:col-span-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button className="sm:col-span-2 rounded-md bg-[#0a2f6b] px-4 py-2 text-sm font-semibold text-white">Submit Report</button>
      </form>
    </section>
  );
}

function ScanPage() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof verify> | null>(null);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#0a2f6b]">Scan and Verify</h1>
        <p className="text-sm text-slate-600">Use manual job ID input in this prototype. Example: MS-JOB-1024.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex min-h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <div className="mx-auto h-36 w-36 rounded-md border border-slate-400 bg-[repeating-linear-gradient(45deg,#e2e8f0,#e2e8f0_8px,#f8fafc_8px,#f8fafc_16px)]" />
              <p className="mt-2 text-sm text-slate-500">QR Placeholder</p>
            </div>
          </div>
          <div className="space-y-3">
            <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Enter QR / Job ID" />
            <button
              onClick={() => {
                const msg = validateVerification("QR Code", value);
                setError(msg);
                if (msg) return;
                setResult(verify("QR Code", value, employers));
              }}
              className="rounded-md bg-[#0a2f6b] px-4 py-2 text-sm font-semibold text-white"
            >
              Verify QR
            </button>
            {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {result && (
              <div className="rounded-lg border border-slate-200 p-4 text-sm">
                <p className="font-semibold text-[#0a2f6b]">Employment opportunity linked to verified profile</p>
                <p className="mt-1">Employer: {result.name}</p>
                <p>Job ID: {value.toUpperCase()}</p>
                <p>Location: {result.employer?.location || "Unknown"}</p>
                <p>Verification signals: {result.reasons.slice(0, 2).join(" ")}</p>
                <p className="mt-2 font-medium">Safety recommendation: {result.action}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardPage() {
  const localReportCount = getReports().length;
  const maxTrend = Math.max(...reportTrend.map((x) => x.count));
  const trendPoints = reportTrend
    .map((point, i) => {
      const x = 30 + i * 90;
      const y = 190 - (point.count / maxTrend) * 150;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#0a2f6b]">MoLE SAFE Intelligence</h1>
        <p className="mt-2 text-sm text-slate-600">Operational dashboard for demo intelligence workflows.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Opportunities screened" value={dashboardMetrics.opportunitiesScreened.toLocaleString()} />
          <Metric label="High-risk opportunities" value={dashboardMetrics.highRisk.toLocaleString()} />
          <Metric label="Reports received" value={(dashboardMetrics.reportsReceived + localReportCount).toLocaleString()} />
          <Metric label="Employers verified" value={dashboardMetrics.employersVerified.toLocaleString()} />
          <Metric label="Phone numbers flagged" value={dashboardMetrics.phonesFlagged.toLocaleString()} />
          <Metric label="Domains flagged" value={dashboardMetrics.domainsFlagged.toLocaleString()} />
          <Metric label="Average response time" value={dashboardMetrics.avgResponseTime} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">Scam reports over time</h2>
          <svg viewBox="0 0 520 220" className="mt-3 w-full" role="img" aria-label="Scam report trend">
            <polyline fill="none" stroke="#1d4ed8" strokeWidth="3" points={trendPoints} />
            {reportTrend.map((point, i) => {
              const x = 30 + i * 90;
              const y = 190 - (point.count / maxTrend) * 150;
              return (
                <g key={point.month}>
                  <circle cx={x} cy={y} r="4" fill="#1d4ed8" />
                  <text x={x - 8} y={210} fontSize="12" fill="#475569">{point.month}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">Risk distribution</h2>
          <div className="mt-3 space-y-3">
            {riskDistribution.map((risk) => (
              <div key={risk.label}>
                <div className="flex justify-between text-sm"><span>{risk.label}</span><span>{risk.value}%</span></div>
                <div className="h-2 rounded bg-slate-100"><div className={`h-2 rounded ${risk.color}`} style={{ width: `${risk.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">Scam categories</h2>
          <div className="mt-3 space-y-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                <span>{cat.category}</span>
                <span className="font-semibold">{cat.count}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#0a2f6b]">State-wise reports</h2>
          <div className="mt-3 space-y-2">
            {stateWiseReports.map((state) => {
              const max = Math.max(...stateWiseReports.map((x) => x.count));
              return (
                <div key={state.state}>
                  <div className="flex justify-between text-sm"><span>{state.state}</span><span>{state.count}</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-sky-600" style={{ width: `${(state.count / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-[#0a2f6b]">Fusion Intelligence</h2>
        <p className="mt-2 text-sm text-slate-600">Connection view: Phone -&gt; Employer -&gt; Domain -&gt; Job Posting -&gt; Reports</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          {[
            "+91 99XXXXXX99",
            "Guaranteed Sarkari Placement Desk",
            "instant-sarkari-jobs.example",
            "MS-JOB-9999",
            "17 linked reports",
          ].map((node, idx) => (
            <div key={node} className="rounded border border-slate-200 p-3 text-center text-sm text-slate-700">
              <p className="font-semibold text-[#0a2f6b]">Node {idx + 1}</p>
              <p className="mt-1 break-words">{node}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#0a2f6b]">{value}</p>
    </div>
  );
}

function HowItWorksPage({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#0a2f6b]">{translations[lang].how}</h1>
        <p className="mt-2 text-sm text-slate-600">Verification architecture for secure access to employment opportunities.</p>
        <div className="mt-5 overflow-x-auto">
          <svg width="920" height="270" role="img" aria-label="How MoLE SAFE works">
            <rect x="20" y="108" width="150" height="52" rx="8" fill="#eff6ff" stroke="#1d4ed8" />
            <text x="95" y="138" textAnchor="middle" fontSize="13" fill="#0f172a">Citizen</text>
            <rect x="220" y="86" width="200" height="95" rx="8" fill="#ecfeff" stroke="#0e7490" />
            <text x="320" y="120" textAnchor="middle" fontSize="13" fill="#0f172a">MoLE SAFE Verification Layer</text>
            <text x="320" y="142" textAnchor="middle" fontSize="11" fill="#334155">Deterministic signal checks</text>
            <rect x="470" y="20" width="180" height="42" rx="8" fill="#f8fafc" stroke="#475569" /><text x="560" y="46" textAnchor="middle" fontSize="12">Identity Signals</text>
            <rect x="470" y="72" width="180" height="42" rx="8" fill="#f8fafc" stroke="#475569" /><text x="560" y="98" textAnchor="middle" fontSize="12">Communication Signals</text>
            <rect x="470" y="124" width="180" height="42" rx="8" fill="#f8fafc" stroke="#475569" /><text x="560" y="150" textAnchor="middle" fontSize="12">Employer Signals</text>
            <rect x="470" y="176" width="180" height="42" rx="8" fill="#f8fafc" stroke="#475569" /><text x="560" y="202" textAnchor="middle" fontSize="12">Community Reports</text>
            <rect x="470" y="228" width="180" height="42" rx="8" fill="#f8fafc" stroke="#475569" /><text x="560" y="254" textAnchor="middle" fontSize="12">Portal Signals</text>
            <rect x="710" y="84" width="180" height="92" rx="8" fill="#fefce8" stroke="#ca8a04" />
            <text x="800" y="122" textAnchor="middle" fontSize="13">Trust and Risk Engine</text>
            <text x="800" y="143" textAnchor="middle" fontSize="11">Safe Action Guidance</text>
            <line x1="170" y1="134" x2="220" y2="134" stroke="#64748b" strokeWidth="2" />
            <line x1="420" y1="134" x2="470" y2="41" stroke="#64748b" strokeWidth="2" />
            <line x1="420" y1="134" x2="470" y2="93" stroke="#64748b" strokeWidth="2" />
            <line x1="420" y1="134" x2="470" y2="145" stroke="#64748b" strokeWidth="2" />
            <line x1="420" y1="134" x2="470" y2="197" stroke="#64748b" strokeWidth="2" />
            <line x1="420" y1="134" x2="470" y2="249" stroke="#64748b" strokeWidth="2" />
            <line x1="650" y1="145" x2="710" y2="130" stroke="#64748b" strokeWidth="2" />
          </svg>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-[#0a2f6b]">Protection before the citizen clicks</h2>
        <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-5">
          <FlowBox text="Job message received" />
          <FlowBox text="Phone or URL extracted" />
          <FlowBox text="Risk signals checked" />
          <FlowBox text="Trust profile matched" />
          <FlowBox text="Citizen gets safe-action guidance" />
        </div>
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          Potential recruitment scam detected. Do not pay INR 2,500 registration fee. Verify the employer through MoLE SAFE.
        </div>
      </section>
    </div>
  );
}

function FlowBox({ text }: { text: string }) {
  return <div className="rounded border border-slate-200 px-3 py-3 text-center">{text}</div>;
}

function NotFound() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
      Page not found. Return to <Link className="font-semibold text-[#0a2f6b]" to="/">Home</Link>.
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
