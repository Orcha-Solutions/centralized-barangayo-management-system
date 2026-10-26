export interface InhabitantFormState {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  sex: "male" | "female";
  birthDate: string;
  civilStatus: string;
  citizenship: string;
  philsysNo: string;
  contactPhone: string;
  contactEmail: string;
  occupation: string;
  educationLevel: string;
  householdId: string;
  relationToHead: string;
  isSenior: boolean;
  isPwd: boolean;
  isSoloParent: boolean;
  is4Ps: boolean;
  isDeceased: boolean;
}

export const INITIAL_INHABITANT_FORM: InhabitantFormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  sex: "male",
  birthDate: "",
  civilStatus: "single",
  citizenship: "Filipino",
  philsysNo: "",
  contactPhone: "",
  contactEmail: "",
  occupation: "",
  educationLevel: "",
  householdId: "",
  relationToHead: "Head",
  isSenior: false,
  isPwd: false,
  isSoloParent: false,
  is4Ps: false,
  isDeceased: false,
};
