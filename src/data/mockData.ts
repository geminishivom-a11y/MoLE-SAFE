export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type EmployerRecord = {
  id: string;
  name: string;
  sector: string;
  location: string;
  district: string;
  verified: boolean;
  nano: boolean;
  ncsLinked: boolean;
  eshramLinked: boolean;
  domain: string;
  phone: string;
  risk: RiskLevel;
  lastVerified: string;
  signals: string[];
  jobs: { id: string; role: string; wage: string; location: string }[];
  timeline: { date: string; event: string }[];
  workerReports: { summary: string; status: string; date: string }[];
};

export const employers: EmployerRecord[] = [
  {
    id: "sharma-facility-services",
    name: "Sharma Facility Services",
    sector: "Facility Management",
    location: "Varanasi, Uttar Pradesh",
    district: "Varanasi",
    verified: true,
    nano: true,
    ncsLinked: true,
    eshramLinked: true,
    domain: "sharmafacility.example",
    phone: "+91 98XXXXXX21",
    risk: "LOW",
    lastVerified: "2026-02-11",
    signals: ["Phone linked", "Domain verified", "Job IDs traceable", "Local attestation"],
    jobs: [
      { id: "MS-JOB-1024", role: "Facility Support Associate", wage: "INR 13,800/month", location: "Varanasi" },
      { id: "MS-JOB-1188", role: "Housekeeping Supervisor", wage: "INR 16,200/month", location: "Mirzapur" },
    ],
    timeline: [
      { date: "2026-02-11", event: "Domain and phone reconfirmed" },
      { date: "2026-01-26", event: "NCS linkage validated in demo registry" },
      { date: "2025-12-14", event: "Panchayat attestation uploaded in demo" },
    ],
    workerReports: [
      { summary: "Interview process was fee-free and documented.", status: "Closed", date: "2026-01-16" },
    ],
  },
  {
    id: "kashi-logistics-network",
    name: "Kashi Logistics Network",
    sector: "Logistics and Warehousing",
    location: "Lucknow, Uttar Pradesh",
    district: "Lucknow",
    verified: true,
    nano: false,
    ncsLinked: true,
    eshramLinked: false,
    domain: "kashilogistics.example",
    phone: "+91 95XXXXXX66",
    risk: "LOW",
    lastVerified: "2026-02-03",
    signals: ["Company registration provided", "Dispatch center location matched", "Domain active"],
    jobs: [{ id: "MS-JOB-2241", role: "Warehouse Loader", wage: "INR 12,600/month", location: "Lucknow" }],
    timeline: [
      { date: "2026-02-03", event: "Physical address matched against reports" },
      { date: "2026-01-17", event: "Phone ownership reconfirmed" },
    ],
    workerReports: [
      { summary: "Shift details were clear before joining.", status: "Resolved", date: "2026-01-29" },
    ],
  },
  {
    id: "sunrise-construction-services",
    name: "Sunrise Construction Services",
    sector: "Construction",
    location: "Patna, Bihar",
    district: "Patna",
    verified: true,
    nano: false,
    ncsLinked: true,
    eshramLinked: true,
    domain: "sunrisebuild.example",
    phone: "+91 96XXXXXX08",
    risk: "MEDIUM",
    lastVerified: "2026-02-08",
    signals: ["Employer identity found", "Document requests observed", "Review pending"],
    jobs: [{ id: "MS-JOB-3052", role: "Site Helper", wage: "INR 14,100/month", location: "Patna" }],
    timeline: [
      { date: "2026-02-08", event: "Recent recruiter message pattern under review" },
      { date: "2026-01-22", event: "eShram linkage confirmed in demo" },
    ],
    workerReports: [
      { summary: "Asked to share too many documents before interview.", status: "Open", date: "2026-02-04" },
    ],
  },
  {
    id: "maa-ganga-women-workforce-cooperative",
    name: "Maa Ganga Women Workforce Cooperative",
    sector: "Domestic Services",
    location: "Buxar, Bihar",
    district: "Buxar",
    verified: true,
    nano: true,
    ncsLinked: false,
    eshramLinked: true,
    domain: "maaganga-work.example",
    phone: "+91 97XXXXXX41",
    risk: "LOW",
    lastVerified: "2026-01-31",
    signals: ["CSC attestation", "Self-help group records", "QR profile available"],
    jobs: [{ id: "MS-JOB-4106", role: "Care Support Worker", wage: "INR 11,900/month", location: "Buxar" }],
    timeline: [
      { date: "2026-01-31", event: "QR identity profile refreshed" },
      { date: "2025-12-20", event: "Village-level attestation completed" },
    ],
    workerReports: [
      { summary: "Recruiter visited local center and explained terms.", status: "Closed", date: "2026-01-13" },
    ],
  },
  {
    id: "varanasi-handloom-services",
    name: "Varanasi Handloom Services",
    sector: "Textiles and Handloom",
    location: "Varanasi, Uttar Pradesh",
    district: "Varanasi",
    verified: true,
    nano: false,
    ncsLinked: true,
    eshramLinked: true,
    domain: "varanasihandloom.example",
    phone: "+91 94XXXXXX77",
    risk: "LOW",
    lastVerified: "2026-02-01",
    signals: ["NCS posting traceable", "Phone continuity confirmed", "No fee clauses"],
    jobs: [{ id: "MS-JOB-5122", role: "Loom Assistant", wage: "INR 12,300/month", location: "Varanasi" }],
    timeline: [
      { date: "2026-02-01", event: "Recent postings mapped to official contact" },
      { date: "2025-12-18", event: "Verification profile approved in demo" },
    ],
    workerReports: [{ summary: "No payment requested at any stage.", status: "Closed", date: "2026-01-08" }],
  },
];

export const scamAlerts = [
  {
    id: "AL-901",
    title: "Fake recruitment fee scam",
    severity: "HIGH",
    location: "Patna, Bihar",
    date: "2026-02-12",
    channel: "WhatsApp",
    status: "Active",
    action: "Do not pay registration fee. Verify employer ID first.",
  },
  {
    id: "AL-902",
    title: "Fake government job message",
    severity: "HIGH",
    location: "Varanasi, Uttar Pradesh",
    date: "2026-02-10",
    channel: "SMS",
    status: "Under monitoring",
    action: "Messages promising guaranteed Sarkari jobs should be treated as suspicious.",
  },
  {
    id: "AL-903",
    title: "Impersonation of recruiter",
    severity: "MEDIUM",
    location: "Lucknow, Uttar Pradesh",
    date: "2026-02-09",
    channel: "Phone",
    status: "Investigating",
    action: "Cross-check contact number with listed employer profile.",
  },
  {
    id: "AL-904",
    title: "Fake overseas employment offer",
    severity: "HIGH",
    location: "Hyderabad, Telangana",
    date: "2026-02-06",
    channel: "Telegram",
    status: "Active",
    action: "Avoid sharing passport details before independent verification.",
  },
  {
    id: "AL-905",
    title: "Fake WhatsApp HR account",
    severity: "MEDIUM",
    location: "Chennai, Tamil Nadu",
    date: "2026-02-05",
    channel: "WhatsApp",
    status: "Contained",
    action: "Report cloned recruiter accounts to help block reuse.",
  },
];

export const dashboardMetrics = {
  opportunitiesScreened: 48219,
  highRisk: 1297,
  reportsReceived: 3184,
  employersVerified: 874,
  phonesFlagged: 643,
  domainsFlagged: 281,
  avgResponseTime: "02m 14s",
};

export const riskDistribution = [
  { label: "Low", value: 68, color: "bg-emerald-500" },
  { label: "Medium", value: 22, color: "bg-amber-500" },
  { label: "High", value: 10, color: "bg-rose-600" },
];

export const reportTrend = [
  { month: "Sep", count: 214 },
  { month: "Oct", count: 268 },
  { month: "Nov", count: 301 },
  { month: "Dec", count: 392 },
  { month: "Jan", count: 438 },
  { month: "Feb", count: 492 },
];

export const categoryBreakdown = [
  { category: "Fee scam", count: 41 },
  { category: "Fake govt job", count: 26 },
  { category: "Impersonation", count: 18 },
  { category: "Overseas scam", count: 9 },
  { category: "Other", count: 6 },
];

export const stateWiseReports = [
  { state: "Uttar Pradesh", count: 812 },
  { state: "Bihar", count: 664 },
  { state: "Maharashtra", count: 541 },
  { state: "Tamil Nadu", count: 463 },
  { state: "Telangana", count: 388 },
];