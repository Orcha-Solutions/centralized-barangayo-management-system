export interface PublicBarangay {
  id: string;
  name: string;
  psgcCode: string;
  logoUrl: string | null;
  brandPrimary: string;
  brandAccent: string;
  city: { name: string };
  addressLine?: string;
  contactPhone?: string;
  contactEmail?: string;
  hotline?: string;
  mode: "companion" | "standalone";
}

export const MARIKINA_BARANGAYS: PublicBarangay[] = [
  { id: "barangka", name: "Barangka", psgcCode: "137404001", logoUrl: null, brandPrimary: "#0A2463", brandAccent: "#FDB913", city: { name: "City of Marikina" }, addressLine: "A. Bonifacio Avenue, Barangka", contactPhone: "(02) 8941-1234", contactEmail: "info@barangka.gov.ph", hotline: "(02) 8941-9999", mode: "companion" },
  { id: "calumpang", name: "Calumpang", psgcCode: "137404002", logoUrl: null, brandPrimary: "#0F4C81", brandAccent: "#F5A623", city: { name: "City of Marikina" }, addressLine: "M.H. Del Pilar St., Calumpang", contactPhone: "(02) 8942-2345", contactEmail: "info@calumpang.gov.ph", hotline: "(02) 8942-9999", mode: "companion" },
  { id: "concepcion_uno", name: "Concepcion Uno", psgcCode: "137404003", logoUrl: null, brandPrimary: "#1B3B6F", brandAccent: "#E0A96D", city: { name: "City of Marikina" }, addressLine: "Bayan-Bayanan Ave., Concepcion Uno", contactPhone: "(02) 8943-3456", contactEmail: "info@concepcionuno.gov.ph", hotline: "(02) 8943-9999", mode: "companion" },
  { id: "concepcion_dos", name: "Concepcion Dos", psgcCode: "137404004", logoUrl: null, brandPrimary: "#10375C", brandAccent: "#F3C623", city: { name: "City of Marikina" }, addressLine: "Lilac St., Concepcion Dos", contactPhone: "(02) 8944-4567", contactEmail: "info@concepciondos.gov.ph", hotline: "(02) 8944-9999", mode: "standalone" },
  { id: "fortune", name: "Fortune", psgcCode: "137404005", logoUrl: null, brandPrimary: "#162447", brandAccent: "#E43F5A", city: { name: "City of Marikina" }, addressLine: "Fortune Avenue, Fortune", contactPhone: "(02) 8945-5678", contactEmail: "info@fortune.gov.ph", hotline: "(02) 8945-9999", mode: "companion" },
  { id: "industrial_valley", name: "Industrial Valley", psgcCode: "137404006", logoUrl: null, brandPrimary: "#1F4068", brandAccent: "#E5BA73", city: { name: "City of Marikina" }, addressLine: "Major Dizon St., IVC", contactPhone: "(02) 8946-6789", contactEmail: "info@ivc.gov.ph", hotline: "(02) 8946-9999", mode: "companion" },
  { id: "jesus_dela_pena", name: "Jesus Dela Peña", psgcCode: "137404007", logoUrl: null, brandPrimary: "#213E3B", brandAccent: "#E8FFFF", city: { name: "City of Marikina" }, addressLine: "P. Gomez St., Jesus Dela Peña", contactPhone: "(02) 8947-7890", contactEmail: "info@jdlp.gov.ph", hotline: "(02) 8947-9999", mode: "companion" },
  { id: "malanday", name: "Malanday", psgcCode: "137404008", logoUrl: null, brandPrimary: "#1B2A4A", brandAccent: "#C5A059", city: { name: "City of Marikina" }, addressLine: "J.P. Rizal St., Malanday", contactPhone: "(02) 8948-8901", contactEmail: "info@malanday.gov.ph", hotline: "(02) 8948-9999", mode: "standalone" },
  { id: "marikina_heights", name: "Marikina Heights", psgcCode: "137404009", logoUrl: null, brandPrimary: "#0B2545", brandAccent: "#8DA9C4", city: { name: "City of Marikina" }, addressLine: "Guerilla St., Marikina Heights", contactPhone: "(02) 8949-9012", contactEmail: "info@marikinaheights.gov.ph", hotline: "(02) 8949-9999", mode: "companion" },
  { id: "nangka", name: "Nangka", psgcCode: "137404010", logoUrl: null, brandPrimary: "#132743", brandAccent: "#EDB5BF", city: { name: "City of Marikina" }, addressLine: "J.P. Rizal St., Nangka", contactPhone: "(02) 8950-0123", contactEmail: "info@nangka.gov.ph", hotline: "(02) 8950-9999", mode: "companion" },
  { id: "parang", name: "Parang", psgcCode: "137404011", logoUrl: null, brandPrimary: "#082032", brandAccent: "#FF4C29", city: { name: "City of Marikina" }, addressLine: "BG Molina St., Parang", contactPhone: "(02) 8951-1234", contactEmail: "info@parang.gov.ph", hotline: "(02) 8951-9999", mode: "companion" },
  { id: "san_roque", name: "San Roque", psgcCode: "137404012", logoUrl: null, brandPrimary: "#19282F", brandAccent: "#BD9354", city: { name: "City of Marikina" }, addressLine: "E. Dela Paz St., San Roque", contactPhone: "(02) 8952-2345", contactEmail: "info@sanroque.gov.ph", hotline: "(02) 8952-9999", mode: "companion" },
  { id: "santa_elena", name: "Santa Elena", psgcCode: "137404013", logoUrl: null, brandPrimary: "#0A2463", brandAccent: "#FDB913", city: { name: "City of Marikina" }, addressLine: "W. Paz St., Santa Elena", contactPhone: "(02) 8953-3456", contactEmail: "info@staelena.gov.ph", hotline: "(02) 8953-9999", mode: "companion" },
  { id: "santo_nino", name: "Santo Niño", psgcCode: "137404014", logoUrl: null, brandPrimary: "#1D2D50", brandAccent: "#133B5C", city: { name: "City of Marikina" }, addressLine: "P. Burgos St., Santo Niño", contactPhone: "(02) 8954-4567", contactEmail: "info@santonino.gov.ph", hotline: "(02) 8954-9999", mode: "companion" },
  { id: "tañong", name: "Tañong", psgcCode: "137404015", logoUrl: null, brandPrimary: "#111D5E", brandAccent: "#C70039", city: { name: "City of Marikina" }, addressLine: "A. Mabini St., Tañong", contactPhone: "(02) 8955-5678", contactEmail: "info@tanong.gov.ph", hotline: "(02) 8955-9999", mode: "companion" },
  { id: "tumana", name: "Tumana", psgcCode: "137404016", logoUrl: null, brandPrimary: "#072227", brandAccent: "#4FBDBA", city: { name: "City of Marikina" }, addressLine: "Farmers Avenue, Tumana", contactPhone: "(02) 8956-6789", contactEmail: "info@tumana.gov.ph", hotline: "(02) 8956-9999", mode: "companion" },
];

export interface VerifiedDoc {
  code: string;
  docType: string;
  barangay: string;
  city: string;
  recipientInitials: string;
  issuedAt: string;
  validUntil: string;
  signedBy: string;
  status: "valid" | "expired" | "revoked";
  purpose: string;
}

export const SAMPLE_VERIFICATIONS: Record<string, VerifiedDoc> = {
  FDC82BB69CE7: {
    code: "FDC82BB69CE7",
    docType: "Barangay Clearance",
    barangay: "Barangka",
    city: "City of Marikina",
    recipientInitials: "J. D. C.",
    issuedAt: "2026-08-15",
    validUntil: "2027-02-15",
    signedBy: "Hon. Manuel S. Torres, Punong Barangay",
    status: "valid",
    purpose: "Employment Requirement",
  },
  BCMS99214A01: {
    code: "BCMS99214A01",
    docType: "Certificate of Residency",
    barangay: "Barangka",
    city: "City of Marikina",
    recipientInitials: "M. A. S.",
    issuedAt: "2026-09-01",
    validUntil: "2027-03-01",
    signedBy: "Hon. Manuel S. Torres, Punong Barangay",
    status: "valid",
    purpose: "Bank Account Opening",
  },
  BCMS88301B22: {
    code: "BCMS88301B22",
    docType: "Certificate of Indigency",
    barangay: "Calumpang",
    city: "City of Marikina",
    recipientInitials: "R. B. L.",
    issuedAt: "2026-07-10",
    validUntil: "2027-01-10",
    signedBy: "Hon. Roberto F. Gomez, Punong Barangay",
    status: "valid",
    purpose: "Medical Financial Assistance (DSWD)",
  },
};
