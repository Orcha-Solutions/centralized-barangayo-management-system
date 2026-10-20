import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handleInhabitantsMock(ctx: MockContext): any {
  const { cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    if (cleanPath === "/inhabitants") {
      let list = store.Inhabitant || [];
      if (currentUser.barangayId) {
        list = list.filter((x) => x.barangayId === currentUser.barangayId);
      }
      return list;
    }

    if (cleanPath === "/inhabitants/stats") {
      const list = (store.Inhabitant || []).filter(
        (x) => !currentUser.barangayId || x.barangayId === currentUser.barangayId,
      );
      return {
        total: list.length,
        male: list.filter((x) => x.gender === "male" || x.gender === "M").length,
        female: list.filter((x) => x.gender === "female" || x.gender === "F").length,
        seniors: list.filter((x) => x.age >= 60).length,
        youth: list.filter((x) => x.age >= 15 && x.age <= 30).length,
      };
    }

    if (cleanPath === "/households") {
      let list = store.Household || [];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filtered = list.filter((x) => x.barangayId === currentUser.barangayId);
        if (filtered.length > 0) list = filtered;
      }
      return list.map((h) => {
        const members = (store.Inhabitant || []).filter((i) => i.householdId === h.id);
        return {
          ...h,
          members,
          _count: { members: members.length },
          consents: h.consents || [],
        };
      });
    }

    const hhDetailMatch = cleanPath.match(/\/households\/([^\/]+)$/);
    if (hhDetailMatch) {
      const id = hhDetailMatch[1];
      const h = store.Household?.find((x) => x.id === id);
      if (!h) return null;
      const members = (store.Inhabitant || []).filter((i) => i.householdId === h.id);
      return {
        ...h,
        members,
        _count: { members: members.length },
        consents: h.consents || [],
      };
    }

    const hhTimelineMatch = cleanPath.match(/\/households\/([^\/]+)\/transactions/);
    if (hhTimelineMatch) {
      const hhId = hhTimelineMatch[1];
      const members = (store.Inhabitant || []).filter((i) => i.householdId === hhId);
      const memberIds = members.map((m) => m.id);
      const certs = (store.CertificateRequest || []).filter((c) => memberIds.includes(c.inhabitantId));

      const timeline = [
        ...certs.map((c) => ({
          id: c.id,
          type: "document",
          description: `Barangay Clearance (${c.purpose || "General Purpose"}) - ${
            members.find((m) => m.id === c.inhabitantId)?.firstName || "Member"
          }`,
          amount: (Number(c.fee) || 0) * 100,
          status: c.status,
          date: c.createdAt,
        })),
        {
          id: `m-ayuda-${hhId}`,
          type: "aid",
          description: "Emergency Ayuda / Social Amelioration Cash Assistance Disbursement",
          amount: 500000,
          status: "completed",
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `m-relief-${hhId}`,
          type: "relief",
          description: "Disaster Relief Operations Food Pack Distribution (Typhoon Recovery)",
          amount: 0,
          status: "released",
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `m-cert-${hhId}`,
          type: "document",
          description: "Barangay Certificate of Residency & Co-habitation",
          amount: 5000,
          status: "signed",
          date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `m-hh-reg-${hhId}`,
          type: "registry",
          description: "RBI Household Registration & Profiling Intake",
          amount: 0,
          status: "completed",
          date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return timeline;
    }

    const timelineMatch = cleanPath.match(/\/inhabitants\/([^\/]+)\/transactions/);
    if (timelineMatch) {
      const inhId = timelineMatch[1];
      const wallet = store.Wallet?.find((w) => w.inhabitantId === inhId);
      const wTxs = wallet ? (store.WalletTransaction || []).filter((tx) => tx.walletId === wallet.id) : [];
      const certs = (store.CertificateRequest || []).filter((c) => c.inhabitantId === inhId);
      const lgus = (store.LguDocRequest || []).filter((l) => l.inhabitantId === inhId);

      const timeline = [
        ...wTxs.map((t) => ({
          id: t.id,
          type: "wallet",
          description: t.type === "cash_out" ? "E-Wallet Cash Out" : "E-Wallet Disbursement",
          amount: Number(t.amountCentavos) || 0,
          status: t.status,
          date: t.createdAt,
        })),
        ...certs.map((c) => ({
          id: c.id,
          type: "document",
          description: `Barangay Clearance Request: ${c.purpose || "General Purpose"}`,
          amount: (Number(c.fee) || 0) * 100,
          status: c.status,
          date: c.createdAt,
        })),
        ...lgus.map((l) => ({
          id: l.id,
          type: "lgu_permit",
          description: `LGU Endorsement: ${l.docType ? l.docType.replace(/_/g, " ") : "Endorsement"}`,
          amount: (Number(l.fee) || 0) * 100,
          status: l.status,
          date: l.createdAt,
        })),
        {
          id: `m-bid-${inhId}`,
          type: "document",
          description: "Application for Barangay ID Card",
          amount: 5000,
          status: "released",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `m-ced-${inhId}`,
          type: "document",
          description: "Community Tax Certificate (Cedula) Issuance",
          amount: 8550,
          status: "signed",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `m-reg-${inhId}`,
          type: "document",
          description: "Census Registry Intake / Resident Profiling",
          amount: 0,
          status: "completed",
          date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return timeline;
    }

    if (cleanPath === "/civil-registry") {
      let list = store.CivilRegistryRecord || [];
      if (currentUser.barangayId) {
        list = list.filter((x) => x.barangayId === currentUser.barangayId);
      }
      return list;
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    if (cleanPath === "/households") {
      const newHh = {
        id: "hh-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        householdNo: body.householdNo || `HH-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        houseNo: body.houseNo || "",
        blockNo: body.blockNo || "",
        lotNo: body.lotNo || "",
        street: body.street || "",
        subdivision: body.subdivision || "",
        buildingName: body.buildingName || "",
        purok: body.purok || "Purok 1",
        sitio: body.sitio || "",
        addressLine: body.addressLine || "",
        householdName: body.householdName || "Household Residence",
        householdType: body.householdType || "nuclear",
        housingUnit: body.housingUnit || "single_house",
        monthlyIncome: body.monthlyIncome ? Number(body.monthlyIncome) : 0,
        numFamilies: body.numFamilies ? Number(body.numFamilies) : 1,
        numMembers: body.numMembers ? Number(body.numMembers) : 1,
        numMigrants: body.numMigrants ? Number(body.numMigrants) : 0,
        zipCode: body.zipCode || "1803",
        latitude: body.latitude ? Number(body.latitude) : null,
        longitude: body.longitude ? Number(body.longitude) : null,
        squareMeters: body.squareMeters ? Number(body.squareMeters) : null,
        hasGarage: !!body.hasGarage,
        hazardZoneRisk: body.hazardZoneRisk || "low_risk",
        wasteManagement: body.wasteManagement || "segregated",
        toiletFacility: body.toiletFacility || "water_sealed",
        waterSource: body.waterSource || "piped_deepwell",
        electricitySource: body.electricitySource || "grid",
        internetAccess: body.internetAccess || "broadband_fiber",
        landOwnership: body.landOwnership || "owned",
        buildingOwnership: body.buildingOwnership || "owned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.Household) store.Household = [];
      store.Household.push(newHh);
      saveStore(store);
      return newHh;
    }

    if (cleanPath === "/inhabitants") {
      const newInh = {
        id: "inh-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        residentType: body.residentType || "non_migrant",
        philsysNo: body.philsysNo || "",
        firstName: body.firstName,
        middleName: body.middleName || "",
        lastName: body.lastName,
        suffix: body.suffix || "",
        sex: body.sex || "male",
        gender: body.gender || body.sex || "male",
        birthDate: body.birthDate || "1990-01-01",
        birthPlace: body.birthPlace || "",
        residenceMotherAtBirth: body.residenceMotherAtBirth || "",
        civilStatus: body.civilStatus || "single",
        isPregnant: !!body.isPregnant,
        citizenship: body.citizenship || "Filipino",
        nationality: body.nationality || "filipino",
        contactPhone: body.contactPhone || "",
        contactEmail: body.contactEmail || "",
        telephoneNumber: body.telephoneNumber || "",
        householdId: body.householdId || null,
        relationToHead: body.relationToHead || "1",
        incomeSource: body.incomeSource || "1",
        monthlyIncome: body.monthlyIncome ? Number(body.monthlyIncome) : 0,
        occupation: body.occupation || "",
        educationLevel: body.educationLevel || "",
        bloodType: body.bloodType || "O+",
        height: body.height ? Number(body.height) : null,
        weight: body.weight ? Number(body.weight) : null,
        complexion: body.complexion || "medium",
        isRegisteredVoter: !!body.isRegisteredVoter,
        isResidentVoter: !!body.isResidentVoter,
        lastVotedYear: body.lastVotedYear ? Number(body.lastVotedYear) : 2025,
        ethnicity: body.ethnicity || "Tagalog",
        religion: body.religion || "Roman Catholic",
        mothersMaidenFirstName: body.mothersMaidenFirstName || "",
        mothersMaidenMiddleName: body.mothersMaidenMiddleName || "",
        mothersMaidenLastName: body.mothersMaidenLastName || "",
        govAssistance: body.govAssistance || "",
        isEmployed: !!body.isEmployed,
        isUnemployed: !!body.isUnemployed,
        isStudent: !!body.isStudent,
        isOsc: !!body.isOsc,
        isOsy: !!body.isOsy,
        isOfw: !!body.isOfw,
        isIndigenous: !!body.isIndigenous,
        isMigrant: !!body.isMigrant,
        isRefugee: !!body.isRefugee,
        isSenior: !!body.isSenior,
        isRegisteredSenior: !!body.isRegisteredSenior,
        isPwd: !!body.isPwd,
        isRegisteredPwd: !!body.isRegisteredPwd,
        pwdType: body.pwdType || "",
        isSoloParent: !!body.isSoloParent,
        isRegisteredSoloParent: !!body.isRegisteredSoloParent,
        is4Ps: !!body.is4Ps,
        isDeceased: false,
        privacyConsent: true,
        source: "CBMS",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.Inhabitant) store.Inhabitant = [];
      store.Inhabitant.push(newInh);
      saveStore(store);
      return newInh;
    }

    const deceasedMatch = cleanPath.match(/\/inhabitants\/([^\/]+)\/deceased$/);
    if (deceasedMatch) {
      const inhId = deceasedMatch[1];
      const inh = store.Inhabitant?.find((x: any) => x.id === inhId);
      if (inh) {
        inh.isDeceased = true;
        inh.deceasedDate = body.dateOfDeath || new Date().toISOString();
        inh.immediateCause = body.immediateCause || "";
        inh.underlyingCause = body.underlyingCause || "physical";
        saveStore(store);
      }
      return { success: true };
    }

    if (cleanPath === "/civil-registry") {
      const newRec = {
        id: "civ-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        recordType: body.recordType,
        registryNo: body.registryNo,
        registeredAt: body.registeredAt || new Date().toISOString(),
        inhabitantId: body.inhabitantId,
        childName: body.childName,
        fatherName: body.fatherName,
        motherName: body.motherName,
        dateOfBirth: body.dateOfBirth,
        placeOfBirth: body.placeOfBirth,
        groomName: body.groomName,
        brideName: body.brideName,
        dateOfMarriage: body.dateOfMarriage,
        placeOfMarriage: body.placeOfMarriage,
        deceasedName: body.deceasedName,
        dateOfDeath: body.dateOfDeath,
        causeOfDeath: body.causeOfDeath,
        placeOfDeath: body.placeOfDeath,
        remarks: body.remarks,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.CivilRegistryRecord) store.CivilRegistryRecord = [];
      store.CivilRegistryRecord.push(newRec);

      if (body.recordType === "death" && body.inhabitantId) {
        const inh = store.Inhabitant?.find((i) => i.id === body.inhabitantId);
        if (inh) {
          inh.isActive = false;
        }
      }

      saveStore(store);
      return newRec;
    }
  }

  // 3. PATCH requests
  if (method === "PATCH") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    const inhMatch = cleanPath.match(/\/inhabitants\/([^\/]+)/);
    if (inhMatch) {
      const id = inhMatch[1];
      const inh = store.Inhabitant?.find((x) => x.id === id);
      if (inh) {
        Object.assign(inh, body);
        inh.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return inh || {};
    }

    const hhMatch = cleanPath.match(/\/households\/([^\/]+)/);
    if (hhMatch) {
      const id = hhMatch[1];
      const h = store.Household?.find((x) => x.id === id);
      if (h) {
        Object.assign(h, body);
        h.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return h || {};
    }
  }

  // 4. DELETE requests
  if (method === "DELETE") {
    const inhMatch = cleanPath.match(/\/inhabitants\/([^\/]+)/);
    if (inhMatch) {
      const id = inhMatch[1];
      if (store.Inhabitant) {
        store.Inhabitant = store.Inhabitant.filter((x) => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const hhMatch = cleanPath.match(/\/households\/([^\/]+)/);
    if (hhMatch) {
      const id = hhMatch[1];
      if (store.Household) {
        store.Household = store.Household.filter((x) => x.id !== id);
      }
      if (store.Inhabitant) {
        store.Inhabitant.forEach((i) => {
          if (i.householdId === id) i.householdId = null;
        });
      }
      saveStore(store);
      return { success: true };
    }
  }

  return undefined;
}
