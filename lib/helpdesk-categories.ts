/**
 * Community helpdesk: English keys + English sub-labels for API / DB.
 * Hindi copy lives in HELPDESK_CATEGORY_LABELS_HI & HELPDESK_SUB_LABELS_HI (UI only).
 */
export const categories = {
  employment: [
    "Job needed",
    "Resume help",
    "Interview guidance",
  ],
  education: [
    "Scholarship",
    "Career guidance",
    "College admission",
  ],
  health: [
    "Medical assistance",
    "Financial aid (treatment)",
    "Blood donation",
  ],
  legal: [
    "Document assistance",
    "Dispute resolution",
    "Police / legal guidance",
  ],
  women_support: [
    "Safety",
    "Employment",
    "Helpline",
  ],
  social_support: [
    "Financial aid",
    "Family support",
    "Emergency assistance",
  ],
  government_schemes: [
    "Scheme information",
    "Application assistance",
  ],
  technical: [
    "Login issue",
    "Bug report",
    "Feature request",
  ],
  other: ["Other"],
} as const;

export type HelpdeskCategory = keyof typeof categories;

export const HELPDESK_CATEGORIES = Object.keys(categories) as HelpdeskCategory[];

/** Hindi titles for category dropdown */
export const HELPDESK_CATEGORY_LABELS_HI: Record<HelpdeskCategory, string> = {
  employment: "रोजगार / नौकरी सहायता",
  education: "शिक्षा सहायता",
  health: "स्वास्थ्य सहायता",
  legal: "कानूनी सहायता",
  women_support: "महिला सहायता",
  social_support: "सामाजिक सहायता",
  government_schemes: "सरकारी योजना सहायता",
  technical: "तकनीकी सहायता (Website/App)",
  other: "अन्य",
};

/** Hindi labels for each English sub-category string */
export const HELPDESK_SUB_LABELS_HI: Record<
  HelpdeskCategory,
  Record<string, string>
> = {
  employment: {
    "Job needed": "नौकरी चाहिए",
    "Resume help": "रिज़्यूमे सहायता",
    "Interview guidance": "इंटरव्यू मार्गदर्शन",
  },
  education: {
    Scholarship: "स्कॉलरशिप",
    "Career guidance": "करियर मार्गदर्शन",
    "College admission": "कॉलेज प्रवेश",
  },
  health: {
    "Medical assistance": "चिकित्सा सहायता",
    "Financial aid (treatment)": "आर्थिक मदद (इलाज)",
    "Blood donation": "ब्लड डोनेशन",
  },
  legal: {
    "Document assistance": "दस्तावेज़ सहायता",
    "Dispute resolution": "विवाद समाधान",
    "Police / legal guidance": "पुलिस/कानूनी मार्गदर्शन",
  },
  women_support: {
    Safety: "सुरक्षा",
    Employment: "रोजगार",
    Helpline: "हेल्पलाइन",
  },
  social_support: {
    "Financial aid": "आर्थिक मदद",
    "Family support": "परिवार सहायता",
    "Emergency assistance": "आपातकालीन सहायता",
  },
  government_schemes: {
    "Scheme information": "योजना जानकारी",
    "Application assistance": "आवेदन सहायता",
  },
  technical: {
    "Login issue": "लॉगिन समस्या",
    "Bug report": "बग रिपोर्ट",
    "Feature request": "फीचर रिक्वेस्ट",
  },
  other: {
    Other: "अन्य",
  },
};

export function categoryLabelHi(key: HelpdeskCategory): string {
  return HELPDESK_CATEGORY_LABELS_HI[key];
}

export function subLabelHi(category: HelpdeskCategory, subEn: string): string {
  return HELPDESK_SUB_LABELS_HI[category][subEn] ?? subEn;
}

export function isValidHelpdeskCategory(
  value: string,
): value is HelpdeskCategory {
  return value in categories;
}

export function isValidSubCategory(
  category: HelpdeskCategory,
  sub: string,
): boolean {
  const subs = categories[category];
  return (subs as readonly string[]).includes(sub);
}
