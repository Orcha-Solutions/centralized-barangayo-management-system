export interface NewInhabitantFormData {
  // Section 1: Inhabitant & Personal
  residentType: string;
  philsysNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  birthPlace: string;
  residenceMotherAtBirth: string;
  sex: string;
  gender: string;
  civilStatus: string;
  isPregnant: boolean;
  educationLevel: string;
  occupation: string;

  // Section 2: Contact & Address
  contactEmail: string;
  contactPhone: string;
  telephoneNumber: string;
  householdId: string;
  relationToHead: string;
  incomeSource: string;
  monthlyIncome: string;

  // Section 3: Identity & Demographics
  bloodType: string;
  height: string;
  weight: string;
  complexion: string;
  nationality: string;
  isRegisteredVoter: boolean;
  isResidentVoter: boolean;
  lastVotedYear: string;
  ethnicity: string;
  religion: string;
  mothersMaidenFirstName: string;
  mothersMaidenMiddleName: string;
  mothersMaidenLastName: string;

  // Section 4: Beneficiary & Sectoral
  govAssistance: string;
  isEmployed: boolean;
  isUnemployed: boolean;
  isOfw: boolean;
  isIndigenous: boolean;
  isStudent: boolean;
  isOsc: boolean;
  isOsy: boolean;
  isMigrant: boolean;
  isRefugee: boolean;
  isSenior: boolean;
  isRegisteredSenior: boolean;
  isPwd: boolean;
  isRegisteredPwd: boolean;
  pwdType: string;
  isSoloParent: boolean;
  isRegisteredSoloParent: boolean;
  is4Ps: boolean;

  // Section 5: Compliance
  privacyConsent: boolean;
}

export interface DuplicateCandidate {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate: string;
}
