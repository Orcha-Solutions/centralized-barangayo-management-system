/**
 * Reference data for seeding. All personal data is SYNTHETIC —
 * generated from name pools, never real residents.
 */

// ---- Deterministic RNG so seeds are reproducible ----
let _state = 0x2f6e2b1;
export function resetRng(seed = 0x2f6e2b1) {
  _state = seed;
}
export function rng(): number {
  // xorshift32
  _state ^= _state << 13;
  _state ^= _state >>> 17;
  _state ^= _state << 5;
  _state >>>= 0;
  return _state / 0xffffffff;
}
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}
export function pickWeighted<T>(pairs: readonly (readonly [T, number])[]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r <= 0) return v;
  }
  return pairs[pairs.length - 1]![0];
}
export function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
export function chance(p: number): boolean {
  return rng() < p;
}
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
export function daysAhead(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

// ---- PSGC (subset; codes are illustrative but well-formed) ----

export const REGION = { psgcCode: "1300000000", name: "National Capital Region (NCR)" };

export const PROVINCES = [
  { psgcCode: "1374000000", name: "Second District (Eastern Manila)" },
  { psgcCode: "1376000000", name: "Rizal" },
];

export const CITIES = [
  {
    psgcCode: "1374500000",
    name: "Marikina City",
    isCity: true,
    provinceIdx: 0,
    isDemo: true,
  },
  { psgcCode: "1374600000", name: "Pasig City", isCity: true, provinceIdx: 0 },
  { psgcCode: "1376100000", name: "Municipality of Rodriguez", isCity: false, provinceIdx: 1 },
];

/** Marikina City's 16 barangays — the demo tenant set. */
export const MARIKINA_BARANGAYS = [
  { psgcCode: "1374501001", name: "Barangka" },
  { psgcCode: "1374501002", name: "Calumpang" },
  { psgcCode: "1374501003", name: "Concepcion Dos" },
  { psgcCode: "1374501004", name: "Concepcion Uno" },
  { psgcCode: "1374501005", name: "Fortune" },
  { psgcCode: "1374501006", name: "Industrial Valley Complex" },
  { psgcCode: "1374501007", name: "Jesus de la Peña" },
  { psgcCode: "1374501008", name: "Malanday" },
  { psgcCode: "1374501009", name: "Marikina Heights" },
  { psgcCode: "1374501010", name: "Nangka" },
  { psgcCode: "1374501011", name: "Parang" },
  { psgcCode: "1374501012", name: "San Roque" },
  { psgcCode: "1374501013", name: "Santa Elena" },
  { psgcCode: "1374501014", name: "Santo Niño" },
  { psgcCode: "1374501015", name: "Tañong" },
  { psgcCode: "1374501016", name: "Tumana" },
];

export const OTHER_BARANGAYS = [
  { cityIdx: 1, psgcCode: "1374601001", name: "San Antonio" },
  { cityIdx: 1, psgcCode: "1374601002", name: "Kapitolyo" },
  { cityIdx: 2, psgcCode: "1376101001", name: "San Jose" },
  { cityIdx: 2, psgcCode: "1376101002", name: "Burgos" },
];

export const PUROKS = [
  "Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6",
];

export const STREETS = [
  "Bayan-bayanan Ave.", "J.P. Rizal St.", "Shoe Ave.", "Gil Fernando Ave.",
  "Katipunan St.", "Bonifacio Ave.", "Mabini St.", "Sumulong Highway",
  "M. Cruz St.", "General Ordoñez St.", "Dao St.", "Molave St.",
];

// ---- Synthetic Filipino name pools ----

export const FIRST_M = [
  "Juan", "Jose", "Antonio", "Ricardo", "Eduardo", "Manuel", "Rodrigo", "Carlo",
  "Miguel", "Rafael", "Andres", "Emilio", "Fernando", "Ramon", "Alfredo",
  "Danilo", "Rolando", "Efren", "Nestor", "Arnel", "Jayson", "Mark", "Kevin",
  "Christian", "Joshua", "Angelo", "Paulo", "Dante", "Rogelio", "Benigno",
];

export const FIRST_F = [
  "Maria", "Ana", "Josefina", "Rosario", "Carmen", "Luzviminda", "Teresita",
  "Corazon", "Elena", "Gloria", "Lourdes", "Cristina", "Marilou", "Jocelyn",
  "Divina", "Imelda", "Nenita", "Rowena", "Analyn", "Jenelyn", "Aileen",
  "Kimberly", "Angelica", "Nicole", "Michelle", "Grace", "Charmaine", "Liezl",
];

export const MIDDLE = [
  "Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza",
  "Torres", "Flores", "Ramos", "Aquino", "Castillo", "Villanueva", "Salazar",
];

export const LAST = [
  "Dela Cruz", "Santos", "Reyes", "Bautista", "Gonzales", "Ramos", "Mendoza",
  "Flores", "Villanueva", "Castillo", "Aguilar", "Domingo", "Rivera", "Navarro",
  "Salvador", "Pascual", "Marquez", "Espiritu", "Bernardo", "Trinidad",
  "Magpantay", "Dimagiba", "Lacson", "Alonzo", "Panganiban", "Sarmiento",
];

export const OCCUPATIONS = [
  "Tricycle Driver", "Sari-sari Store Owner", "Factory Worker", "Teacher",
  "Nurse", "Construction Worker", "Vendor", "Security Guard", "Call Center Agent",
  "Seamstress", "Barangay Staff", "Carpenter", "Housekeeper", "Farmer",
  "Delivery Rider", "Government Employee", "Student", "Unemployed", "Retired",
];

export const EDUCATION = [
  "Elementary Graduate", "High School Graduate", "Vocational",
  "College Undergraduate", "College Graduate", "Post Graduate", "No Formal Education",
];

export const RELIGIONS = [
  "Roman Catholic", "Iglesia ni Cristo", "Born Again Christian", "Islam",
  "Aglipayan", "Seventh-day Adventist",
];

export const BLOOD = ["A+", "B+", "O+", "AB+", "A-", "O-"];

export const DWELLING = ["Concrete", "Semi-concrete", "Wood", "Light materials"];
export const TENURE = ["Owned", "Rented", "Shared", "Caretaker"];
export const WATER = ["Manila Water", "Deep well", "Communal faucet", "Refilling station"];
export const TOILET = ["Water-sealed", "Shared", "Open pit", "None"];
export const INCOME_BANDS = [
  "Below ₱10,000", "₱10,000–₱20,000", "₱20,000–₱40,000", "₱40,000+",
];

// ---- Module reference data ----

export const CERTIFICATE_TYPES = [
  {
    code: "BRGY_CLEARANCE",
    name: "Barangay Clearance",
    fee: 50,
    validityDays: 180,
    requirements: ["Valid ID", "Proof of residency", "Cedula (community tax certificate)"],
  },
  {
    code: "RESIDENCY",
    name: "Certificate of Residency",
    fee: 30,
    validityDays: 180,
    requirements: ["Valid ID", "Proof of address"],
  },
  {
    code: "INDIGENCY",
    name: "Certificate of Indigency",
    fee: 0,
    validityDays: 90,
    requirements: ["Valid ID"],
    exemptNote: "No fee — issued to indigent residents.",
  },
  {
    code: "BUSINESS",
    name: "Barangay Business Clearance",
    fee: 200,
    validityDays: 365,
    requirements: ["Valid ID", "DTI/SEC registration", "Lease contract or proof of ownership"],
    note: "Prerequisite to the city business permit (LGC §152(c)).",
  },
  {
    code: "FIRST_TIME_JOBSEEKER",
    name: "First Time Jobseeker Certificate",
    fee: 0,
    validityDays: 365,
    requirements: ["Valid ID", "Proof of residency (6 months)"],
    exemptNote: "Free by law (RA 11261 — First Time Jobseekers Assistance Act).",
  },
  {
    code: "GOOD_MORAL",
    name: "Certificate of Good Moral Character",
    fee: 50,
    validityDays: 180,
    requirements: ["Valid ID", "Barangay clearance"],
  },
];

export const CERT_PURPOSES = [
  "Employment requirement", "Bank account opening", "School enrollment",
  "Scholarship application", "Business permit renewal", "Police clearance",
  "Postal ID application", "Loan application", "Travel requirement",
];

export const PROPERTY_CATEGORIES = [
  "Good Fiscal or Financial Administration or Fiscal Sustainability",
  "Disaster Preparedness",
  "Social Protection and Sensitivity Program",
  "Health Compliance and Responsiveness",
  "Peace and Order",
  "Environmental Management",
];

export const PROPERTY_SEED = [
  { name: "BARANGAY HALL", type: "infrastructure", status: "operational", capacity: 120 },
  { name: "MULTI-PURPOSE COVERED COURT", type: "infrastructure", status: "operational", capacity: 500 },
  { name: "BARANGAY HEALTH CENTER", type: "infrastructure", status: "operational", capacity: 40 },
  { name: "DAY CARE CENTER", type: "infrastructure", status: "operational", capacity: 35 },
  { name: "SENIOR CITIZEN CENTER", type: "infrastructure", status: "operational", capacity: 50 },
  { name: "MATERIALS RECOVERY FACILITY", type: "infrastructure", status: "operational", capacity: 0 },
  { name: "EVACUATION CENTER", type: "infrastructure", status: "operational", capacity: 300 },
  { name: "BARANGAY OUTPOST — PUROK 3", type: "infrastructure", status: "operational", capacity: 8 },
  { name: "FOOTBRIDGE — RIVERSIDE", type: "infrastructure", status: "under_construction", capacity: 0 },
  { name: "DRAINAGE SYSTEM PHASE 2", type: "infrastructure", status: "under_construction", capacity: 0 },
  { name: "PATROL MOTORCYCLE", type: "non_infrastructure", status: "operational", capacity: 2 },
  { name: "AMBULANCE / PATIENT TRANSPORT", type: "non_infrastructure", status: "operational", capacity: 4 },
  { name: "GARBAGE TRUCK", type: "non_infrastructure", status: "unserviceable", capacity: 0 },
  { name: "GENERATOR SET 15KVA", type: "non_infrastructure", status: "operational", capacity: 0 },
  { name: "RESCUE BOAT (RUBBER)", type: "non_infrastructure", status: "operational", capacity: 10 },
  { name: "PUBLIC ADDRESS SYSTEM", type: "non_infrastructure", status: "operational", capacity: 0 },
  { name: "LAPTOP UNITS (SECRETARIAT)", type: "non_infrastructure", status: "operational", capacity: 6 },
  { name: "WATER PUMP — FLOOD CONTROL", type: "non_infrastructure", status: "unserviceable", capacity: 0 },
];

export const MATERIALS_SEED = [
  { name: "Relief Goods Pack (Family)", unit: "pack", quantity: 240, reorderLevel: 100 },
  { name: "Bottled Water 500ml", unit: "bottle", quantity: 1200, reorderLevel: 500 },
  { name: "Face Masks", unit: "box", quantity: 45, reorderLevel: 20 },
  { name: "Medical Supplies Kit", unit: "kit", quantity: 18, reorderLevel: 10 },
  { name: "Bond Paper A4", unit: "ream", quantity: 32, reorderLevel: 15 },
  { name: "Certificate Paper (Security)", unit: "ream", quantity: 12, reorderLevel: 8 },
  { name: "Sandbags", unit: "pc", quantity: 380, reorderLevel: 200 },
  { name: "Flashlights", unit: "pc", quantity: 24, reorderLevel: 15 },
];

export const CONCERN_CATEGORIES = [
  "streetlight", "flooding", "garbage", "pothole", "noise", "stray_animal", "other",
];

export const CONCERN_TEMPLATES: Record<string, string[]> = {
  streetlight: [
    "Sirang ilaw sa kanto ng {street}. Madilim tuwing gabi at delikado sa mga naglalakad.",
    "Wala nang ilaw sa {street} mula noong isang linggo.",
  ],
  flooding: [
    "Baha agad kapag umuulan sa {street}. Hindi makadaan ang mga tricycle.",
    "Barado ang kanal sa {street}, umaapaw tuwing malakas ang ulan.",
  ],
  garbage: [
    "Hindi nakolekta ang basura sa {street} ngayong linggo.",
    "May nagtatapon ng basura sa bakanteng lote sa {street}.",
  ],
  pothole: [
    "Malaking lubak sa {street}, panganib sa mga motorsiklo.",
    "Sirang kalsada sa harap ng {street}, lumalala na.",
  ],
  noise: [
    "Sobrang lakas ng videoke sa {street} hanggang madaling araw.",
    "Ingay ng construction sa {street} tuwing gabi.",
  ],
  stray_animal: [
    "Maraming askal sa {street}, natatakot ang mga bata.",
    "May aso na naninila sa {street}, wala nang may-ari.",
  ],
  other: [
    "Nasirang water pipe sa {street}, tumatagas ang tubig.",
    "Kailangan ng speed bump sa {street}, mabilis ang mga sasakyan.",
  ],
};

export const BILLERS = [
  { code: "MERALCO", name: "Meralco", category: "utility", commission: 800 },
  { code: "MAYNILAD", name: "Maynilad Water", category: "utility", commission: 700 },
  { code: "MANILAWATER", name: "Manila Water", category: "utility", commission: 700 },
  { code: "PLDT", name: "PLDT Home", category: "telco", commission: 600 },
  { code: "GLOBE", name: "Globe Telecom", category: "telco", commission: 600 },
  { code: "CONVERGE", name: "Converge ICT", category: "telco", commission: 600 },
  { code: "SSS", name: "Social Security System", category: "government", commission: 500 },
  { code: "PHILHEALTH", name: "PhilHealth", category: "government", commission: 500 },
  { code: "PAGIBIG", name: "Pag-IBIG Fund", category: "government", commission: 500 },
];

export const MERCHANT_NAMES = [
  "Aling Nena Sari-Sari Store", "JR Mini Grocery", "Tindahan ni Mang Ben",
  "Marikina Bakeshop", "Kuya Jun Carinderia", "3 Sisters Store",
  "Lolo Ising Hardware", "Purok 2 Water Station", "Ate Baby Rice Dealer",
  "Nanay Linda Eatery", "Kap's Convenience", "Riverside Fruit Stand",
];

export const AGENT_NAMES = [
  "Villanueva Padala Center", "Santos Pawnshop & Remittance",
  "Purok 4 Bayad Center", "Malanday Cash Agent",
];

export const JOB_POSTS = [
  { title: "Production Operator", employer: "Marikina Footwear Mfg.", kind: "job", salaryRange: "₱610/day" },
  { title: "Sales Associate", employer: "SM Marikina", kind: "job", salaryRange: "₱16,000/mo" },
  { title: "Delivery Rider", employer: "QuickMove Logistics", kind: "job", salaryRange: "₱18,000/mo + incentives" },
  { title: "Free TESDA Shoemaking NC II", employer: "TESDA Marikina", kind: "training", salaryRange: null },
  { title: "Barangay Scholarship Program 2026", employer: "Barangay LGU", kind: "scholarship", salaryRange: null },
  { title: "Basic Computer Literacy Training", employer: "DICT Tech4ED", kind: "training", salaryRange: null },
];

export const HAZARD_TYPES = ["flood", "landslide", "fire", "earthquake"];

export const INSTITUTIONS = [
  { code: "LUPON", name: "Lupong Tagapamayapa" },
  { code: "BDRRMC", name: "Barangay Disaster Risk Reduction and Management Committee" },
  { code: "BADAC", name: "Barangay Anti-Drug Abuse Council" },
  { code: "BCPC", name: "Barangay Council for the Protection of Children" },
  { code: "SK", name: "Sangguniang Kabataan" },
  { code: "WOMEN", name: "Barangay Women's Association" },
  { code: "YOUTH", name: "Barangay Youth Organization" },
];
