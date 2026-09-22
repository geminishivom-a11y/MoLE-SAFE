import type { EmployerRecord, RiskLevel } from "./mockData";

export const examples = {
  Employer: {
    low: "Sharma Facility Services",
    medium: "Sunrise Construction Services",
    high: "Guaranteed Sarkari Placement Desk",
  },
  "Phone Number": { low: "+91 98XXXXXX21", medium: "+91 96XXXXXX08", high: "+91 99XXXXXX99" },
  "Website / URL": {
    low: "https://sharmafacility.example",
    medium: "https://sunrisebuild.example",
    high: "https://instant-sarkari-jobs.example",
  },
  "Job Message": {
    low: "Sharma Facility Services: Facility Support Associate, Varanasi. Job ID MS-JOB-1024. No fee required. Contact sharmafacility.example.",
    medium:
      "Sunrise Construction Services is hiring site helpers in Patna. Please send your documents to the recruiter before your interview.",
    high:
      "Congratulations! Guaranteed government job. Pay INR 2,500 registration fee today to confirm your appointment. Limited seats! Send Aadhaar and bank details on WhatsApp.",
  },
  "QR Code": { low: "MS-JOB-1024", medium: "MS-JOB-3052", high: "MS-JOB-9999" },
} as const;

export const actions: Record<RiskLevel, string> = {
  LOW: "Continue with normal verification.",
  MEDIUM: "Verify independently before sharing documents.",
  HIGH: "Do not pay money or share sensitive documents. Report this opportunity.",
};

export type VerificationType = keyof typeof examples;

export function validateVerification(type: VerificationType, raw: string) {
  const value = raw.trim();
  if (!value) return "Enter a value to start verification.";
  if (value.length > 4000) return "Please keep your input under 4,000 characters.";
  if (type === "Phone Number" && !/^(?:\+?91[\s-]?)?[6-9][\dXx\s-]{8,14}$/.test(value)) {
    return "Enter a valid Indian mobile format, or use a masked demo number below.";
  }
  if (type === "Website / URL") {
    try {
      const u = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.') || /\s/.test(value)) {
        return "Enter a website such as sharmafacility.example.";
      }
    } catch {
      return "Enter a valid website or URL.";
    }
  }
  if (type === "Job Message" && value.length < 20) return "Paste a job message with at least 20 characters.";
  if (type === "Employer" && value.length < 3) return "Enter at least 3 characters of the employer name.";
  if (type === "QR Code" && !/^MS-JOB-\d{4}$/i.test(value)) return "Enter a demo job ID in the format MS-JOB-1024.";
  return "";
}

export function verify(type: VerificationType, raw: string, employers: EmployerRecord[]) {
  const text = raw.trim().toLowerCase();
  const normalize = (v: string) => v.toLowerCase().replace(/[\s+-]/g, "");
  const employer = employers.find((e) => {
    if (type === "Employer") return e.name.toLowerCase() === text;
    if (type === "Phone Number") return normalize(e.phone) === normalize(raw);
    if (type === "QR Code") return e.jobs.some((j) => j.id.toLowerCase() === text);
    if (type === "Website / URL") {
      try {
        return new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`).hostname === e.domain;
      } catch {
        return false;
      }
    }
    return text.includes(e.name.toLowerCase()) || text.includes(e.domain) || e.jobs.some((j) => text.includes(j.id.toLowerCase()));
  });

  const fee =
    /(?:pay|send|deposit|transfer).{0,35}(?:₹|rs\.?\s?\d|inr\s?\d|registration|processing|fee)|(?:registration|processing|visa)\s+(?:fee|deposit)/i.test(
      raw,
    ) && !/\bno\s+(?:registration\s+|processing\s+)?fee/i.test(raw);
  const urgency = /today|immediately|limited seats|urgent|act now/i.test(raw);
  const sensitive = /aadhaar|bank details|passport|otp/i.test(raw);
  const guaranteed = /guaranteed\s+(?:government|sarkari)|without\s+(?:an?\s+)?(?:exam|interview)/i.test(raw);
  const flagged = Object.values(examples).some((e) => normalize(e.high) === normalize(raw)) || /instant-sarkari-jobs\.example/i.test(raw);

  const high = flagged || fee || guaranteed;
  const risk: RiskLevel = high ? "HIGH" : employer?.risk || "MEDIUM";
  const known = Boolean(employer);
  const reasons: string[] = [];
  if (fee) reasons.push("An upfront recruitment or registration payment is requested.");
  if (guaranteed) reasons.push("The message promises a guaranteed government appointment.");
  if (urgency) reasons.push("Urgent language pressures the recipient to act quickly.");
  if (sensitive) reasons.push("The message requests sensitive personal information.");
  if (flagged) reasons.push("This exact identifier matches a flagged scenario in the demo dataset.");
  if (!known) reasons.push("No matching employer identity was found in the demo dataset.");
  if (employer && employer.risk === "MEDIUM") reasons.push("Employer identity information is still under review in this demo.");
  if (risk === "LOW") reasons.push("The identifier matches a linked contact, domain, or job record in the demo dataset.");

  return {
    risk,
    employer,
    known,
    fee,
    urgency,
    sensitive,
    flagged,
    reasons,
    input: raw,
    type,
    status: high ? "Suspicious signals detected" : known && risk === "LOW" ? "Identity signals found" : known ? "Incomplete identity signals" : "Insufficient information",
    name: employer?.name || (type === "Employer" ? raw : flagged ? "Unlinked recruitment opportunity" : "Unmatched opportunity"),
    action: actions[risk],
  };
}

export const translations = {
  en: {
    verify: "Verify an Opportunity",
    directory: "Employer Directory",
    alerts: "Scam Alerts",
    how: "How It Works",
    login: "Citizen Login",
    run: "Run Verification",
    report: "Report This Opportunity",
    another: "Verify Another",
    title: "Verify Before You Trust.",
    payment: "MoLE will not ask jobseekers to pay a processing fee to obtain employment.",
    high: actions.HIGH,
  },
  hi: {
    verify: "अवसर की जाँच करें",
    directory: "नियोक्ता निर्देशिका",
    alerts: "धोखाधड़ी अलर्ट",
    how: "यह कैसे काम करता है",
    login: "नागरिक लॉगिन",
    run: "जाँच शुरू करें",
    report: "इस अवसर की रिपोर्ट करें",
    another: "फिर से जाँच करें",
    title: "भरोसा करने से पहले जाँचें।",
    payment: "MoLE नौकरी पाने के लिए नौकरी चाहने वालों से प्रोसेसिंग शुल्क नहीं मांगेगा।",
    high: "पैसे न दें और संवेदनशील दस्तावेज़ साझा न करें। इस अवसर की रिपोर्ट करें।",
  },
  bn: {
    verify: "সুযোগ যাচাই করুন",
    directory: "নিয়োগকর্তা তালিকা",
    alerts: "প্রতারণার সতর্কতা",
    how: "যেভাবে কাজ করে",
    login: "নাগরিক লগইন",
    run: "যাচাই শুরু করুন",
    report: "এই সুযোগ রিপোর্ট করুন",
    another: "আবার যাচাই করুন",
    title: "বিশ্বাস করার আগে যাচাই করুন।",
    payment: "কর্মসংস্থান পেতে MoLE চাকরিপ্রার্থীদের কাছে প্রসেসিং ফি চাইবে না।",
    high: "টাকা দেবেন না বা সংবেদনশীল নথি শেয়ার করবেন না। এই সুযোগ রিপোর্ট করুন।",
  },
  mr: {
    verify: "संधीची पडताळणी करा",
    directory: "नियोक्ता निर्देशिका",
    alerts: "फसवणूक सूचना",
    how: "हे कसे कार्य करते",
    login: "नागरिक लॉगिन",
    run: "पडताळणी सुरू करा",
    report: "या संधीची तक्रार करा",
    another: "पुन्हा पडताळणी करा",
    title: "विश्वास ठेवण्यापूर्वी पडताळा.",
    payment: "रोजगार मिळवण्यासाठी MoLE नोकरी शोधणाऱ्यांकडून प्रक्रिया शुल्क मागणार नाही.",
    high: "पैसे देऊ नका किंवा संवेदनशील कागदपत्रे शेअर करू नका. या संधीची तक्रार करा.",
  },
  ta: {
    verify: "வாய்ப்பைச் சரிபார்க்கவும்",
    directory: "முதலாளி பட்டியல்",
    alerts: "மோசடி எச்சரிக்கைகள்",
    how: "இது எப்படி இயங்குகிறது",
    login: "குடிமக்கள் உள்நுழைவு",
    run: "சரிபார்ப்பைத் தொடங்கு",
    report: "இந்த வாய்ப்பைப் புகாரளி",
    another: "மீண்டும் சரிபார்",
    title: "நம்புவதற்கு முன் சரிபார்க்கவும்.",
    payment: "வேலை பெறுவதற்கு MoLE வேலை தேடுபவர்களிடம் செயலாக்கக் கட்டணம் கேட்காது.",
    high: "பணம் செலுத்தவோ முக்கிய ஆவணங்களைப் பகிரவோ வேண்டாம். இந்த வாய்ப்பைப் புகாரளிக்கவும்.",
  },
  te: {
    verify: "అవకాశాన్ని ధృవీకరించండి",
    directory: "యజమానుల డైరెక్టరీ",
    alerts: "మోసం హెచ్చరికలు",
    how: "ఇది ఎలా పనిచేస్తుంది",
    login: "పౌరుల లాగిన్",
    run: "ధృవీకరణ ప్రారంభించండి",
    report: "ఈ అవకాశంపై ఫిర్యాదు చేయండి",
    another: "మళ్లీ ధృవీకరించండి",
    title: "నమ్మే ముందు ధృవీకరించండి.",
    payment: "ఉపాధి పొందడానికి MoLE ఉద్యోగార్థులను ప్రాసెసింగ్ రుసుము అడగదు.",
    high: "డబ్బు చెల్లించవద్దు లేదా సున్నితమైన పత్రాలను పంచుకోవద్దు. ఈ అవకాశంపై ఫిర్యాదు చేయండి.",
  },
} as const;

export function getReports() {
  try {
    const rows = JSON.parse(localStorage.getItem("mole-safe-reports") || "[]");
    return Array.isArray(rows) ? rows.filter((x) => x && typeof x.id === "string" && typeof x.type === "string") : [];
  } catch {
    return [];
  }
}

export function saveReport(record: Record<string, string>) {
  const rows = getReports();
  let n = 1001;
  const ids = new Set(rows.map((r) => r.id));
  while (ids.has(`MS-2026-${n}`)) n += 1;
  const report = { ...record, id: `MS-2026-${n}`, date: new Date().toISOString() };
  localStorage.setItem("mole-safe-reports", JSON.stringify([...rows, report]));
  return report;
}