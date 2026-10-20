"use client";

import * as React from "react";
import Link from "next/link";
import {
  checkSubdomainAvailability,
  createInvitation,
  recruitTenantMember,
} from "@cbms/api-client";
import { Alert, PageHead } from "@cbms/ui";
import { ActionResult } from "../../../../components/common";
import { useRbacStore } from "../../../../lib/rbac-store";
import {
  useCreateTenantMutation,
  useTenantsQuery,
} from "../../../../lib/rbac-queries";
import { StepIndicator } from "./components/StepIndicator";
import { Step1Identity } from "./components/Step1Identity";
import { Step2Leadership } from "./components/Step2Leadership";
import { Step3Operations } from "./components/Step3Operations";
import { Step4Review } from "./components/Step4Review";
import type {
  DbMode,
  LeadershipMode,
  ProvisionedDossier,
  SubdomainAvailability,
} from "./types";

export default function OnboardBarangayPage() {
  const user = useRbacStore((s) => s.user);
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);
  const hasRole = useRbacStore((s) => s.hasRole);

  const tenantsQuery = useTenantsQuery();
  const createTenantMutation = useCreateTenantMutation();

  const canProvisionNewBarangay =
    hasRole("SYSTEM_ADMIN") ||
    user?.scope === "platform" ||
    user?.email?.toLowerCase().startsWith("admin@") ||
    user?.email?.toLowerCase().includes("orcha") ||
    user?.email?.toLowerCase().includes("superadmin");

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Step 1: Barangay Identity & Subdomain State
  const [brgyName, setBrgyName] = React.useState("");
  const [brgyCode, setBrgyCode] = React.useState("");
  const [subdomain, setSubdomain] = React.useState("");
  const [customDomain, setCustomDomain] = React.useState("");
  const [psgcCode, setPsgcCode] = React.useState("137402017");
  const [cityId, setCityId] = React.useState("city-marikina");
  const [dbMode, setDbMode] = React.useState<DbMode>("shared_db");

  // Subdomain availability check state
  const [checkingSubdomain, setCheckingSubdomain] = React.useState(false);
  const [subdomainStatus, setSubdomainStatus] =
    React.useState<SubdomainAvailability | null>(null);

  // Step 2: Initial Executive & Staff Onboarding State
  const [leadershipMode, setLeadershipMode] = React.useState<LeadershipMode>("both");
  const [execName, setExecName] = React.useState("");
  const [execEmail, setExecEmail] = React.useState("");
  const [execPhone, setExecPhone] = React.useState("+63 917 555 0100");
  const [execRole, setExecRole] = React.useState("PUNONG_BARANGAY");
  const [execPassword, setExecPassword] = React.useState("Password123!");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("BARANGAY_SECRETARY");

  // Step 3: Operational & DILG Statutory Defaults
  const [hallAddress, setHallAddress] = React.useState("");
  const [hallPhone, setHallPhone] = React.useState("(02) 8646-0000");
  const [emergencyHotline, setEmergencyHotline] = React.useState("161 / +63 917 911 0000");
  const [purokCount, setPurokCount] = React.useState(7);
  const [clearanceFee, setClearanceFee] = React.useState(50);
  const [residencyFee, setResidencyFee] = React.useState(50);
  const [businessClearanceFee, setBusinessClearanceFee] = React.useState(250);

  // Execution & Handover State
  const [provisioning, setProvisioning] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [dossier, setDossier] = React.useState<ProvisionedDossier | null>(null);

  // Auto-derive code, subdomain, and default emails when Barangay Name changes
  function handleNameChange(val: string) {
    setBrgyName(val);
    const stripped = val.replace(/^barangay\s+/i, "").trim();
    const generatedCode = stripped
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const generatedSub = stripped
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24);

    setBrgyCode(generatedCode);
    setSubdomain(generatedSub);
    if (generatedSub) {
      setExecEmail(`kapitan@${generatedSub}.gov.ph`);
      setInviteEmail(`secretary@${generatedSub}.gov.ph`);
      setHallAddress(`Barangay ${stripped} Hall, Marikina City, Metro Manila`);
    }
  }

  // Debounced Subdomain Availability Check
  React.useEffect(() => {
    const clean = subdomain.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      setSubdomainStatus(null);
      return;
    }
    let cancelled = false;
    setCheckingSubdomain(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkSubdomainAvailability(clean);
        if (!cancelled) setSubdomainStatus(res);
      } catch {
        if (!cancelled) setSubdomainStatus(null);
      } finally {
        if (!cancelled) setCheckingSubdomain(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [subdomain]);

  async function handleProvisionSubmit() {
    setProvisioning(true);
    setFeedback(null);
    try {
      const cleanName = brgyName.replace(/^barangay\s+/i, "").trim();
      const payload = {
        name: `Barangay ${cleanName}`,
        code: brgyCode.trim() || cleanName.toUpperCase().replace(/\s+/g, "_"),
        subdomain: subdomain.trim().toLowerCase(),
        customDomain: customDomain.trim() || undefined,
        cityId: cityId.trim() || "city-marikina",
        psgcCode: psgcCode.trim() || "137402017",
        mode: dbMode,
        settings: {
          hallAddress,
          hallPhone,
          emergencyHotline,
          purokCount,
          statutoryFees: {
            clearance: clearanceFee,
            residency: residencyFee,
            businessClearance: businessClearanceFee,
          },
        },
      };

      const result = await createTenantMutation.mutateAsync(payload);
      const createdTenant = result.tenant;
      const resultDossier: ProvisionedDossier = { tenant: createdTenant };

      // 1. Create Direct Executive Account
      if (leadershipMode === "both" || leadershipMode === "direct") {
        try {
          await recruitTenantMember(createdTenant.id, {
            name: execName.trim() || "Punong Barangay",
            email: execEmail.trim() || `kapitan@${createdTenant.subdomain}.gov.ph`,
            password: execPassword || "Password123!",
            role: execRole || "PUNONG_BARANGAY",
            phoneNumber: execPhone || undefined,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
          });
          resultDossier.primaryMember = {
            name: execName.trim() || "Punong Barangay",
            email: execEmail.trim() || `kapitan@${createdTenant.subdomain}.gov.ph`,
            role: execRole || "PUNONG_BARANGAY",
            tempPassword: execPassword || "Password123!",
          };
        } catch (memberErr: any) {
          console.warn("Direct official account auto-binding notice:", memberErr);
        }
      }

      // 2. Dispatch Invitation Token
      if (leadershipMode === "both" || leadershipMode === "invite") {
        try {
          const invTargetEmail =
            leadershipMode === "invite"
              ? execEmail.trim() || `kapitan@${createdTenant.subdomain}.gov.ph`
              : inviteEmail.trim() || `secretary@${createdTenant.subdomain}.gov.ph`;
          const invTargetRole = leadershipMode === "invite" ? execRole : inviteRole;

          const invRes = await createInvitation(createdTenant.id, {
            email: invTargetEmail,
            role: invTargetRole,
            expiresDays: 7,
          });

          resultDossier.inviteLink =
            invRes.inviteUrl ||
            `http://localhost:4100/login?invite=${encodeURIComponent(invRes.invitation?.token || "demo-token")}`;
          resultDossier.inviteEmail = invTargetEmail;
          resultDossier.inviteRole = invTargetRole;
        } catch (invErr: any) {
          console.warn("Invitation token auto-generation notice:", invErr);
        }
      }

      setDossier(resultDossier);
      setActiveTenant(createdTenant);
      await tenantsQuery.refetch();
      setFeedback({
        ok: true,
        message: `Successfully provisioned Barangay ${createdTenant.name} (${createdTenant.subdomain}.cbms.gov.ph).`,
      });
    } catch (err: any) {
      setFeedback({
        ok: false,
        message: err?.message || "Failed to provision barangay tenant.",
      });
    } finally {
      setProvisioning(false);
    }
  }

  function handleReset() {
    setDossier(null);
    setBrgyName("");
    setBrgyCode("");
    setSubdomain("");
    setStep(1);
  }

  return (
    <>
      <PageHead
        title="Onboard New Barangay"
        breadcrumb="Super Admin / Barangays / Onboard"
        actions={
          <Link href="/super-admin" className="cbms-btn cbms-btn--secondary">
            ← Back to Barangays
          </Link>
        }
      />

      <ActionResult
        error={feedback && !feedback.ok ? feedback.message : undefined}
        success={feedback && feedback.ok ? feedback.message : undefined}
      />

      <StepIndicator step={step} setStep={setStep} hasDossier={!!dossier} />

      {!canProvisionNewBarangay && (
        <div style={{ marginBottom: 14 }}>
          <Alert tone="danger">
            <strong>Access Restricted:</strong> Barangay tenant provisioning is managed by Platform Operations.
          </Alert>
        </div>
      )}

      {step === 1 && (
        <Step1Identity
          brgyName={brgyName}
          onNameChange={handleNameChange}
          brgyCode={brgyCode}
          setBrgyCode={setBrgyCode}
          subdomain={subdomain}
          setSubdomain={setSubdomain}
          checkingSubdomain={checkingSubdomain}
          subdomainStatus={subdomainStatus}
          psgcCode={psgcCode}
          setPsgcCode={setPsgcCode}
          cityId={cityId}
          setCityId={setCityId}
          dbMode={dbMode}
          setDbMode={setDbMode}
          customDomain={customDomain}
          setCustomDomain={setCustomDomain}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2Leadership
          leadershipMode={leadershipMode}
          setLeadershipMode={setLeadershipMode}
          execName={execName}
          setExecName={setExecName}
          execEmail={execEmail}
          setExecEmail={setExecEmail}
          execRole={execRole}
          setExecRole={setExecRole}
          execPhone={execPhone}
          setExecPhone={setExecPhone}
          execPassword={execPassword}
          setExecPassword={setExecPassword}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3Operations
          hallAddress={hallAddress}
          setHallAddress={setHallAddress}
          hallPhone={hallPhone}
          setHallPhone={setHallPhone}
          emergencyHotline={emergencyHotline}
          setEmergencyHotline={setEmergencyHotline}
          purokCount={purokCount}
          setPurokCount={setPurokCount}
          clearanceFee={clearanceFee}
          setClearanceFee={setClearanceFee}
          residencyFee={residencyFee}
          setResidencyFee={setResidencyFee}
          businessClearanceFee={businessClearanceFee}
          setBusinessClearanceFee={setBusinessClearanceFee}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <Step4Review
          brgyName={brgyName}
          brgyCode={brgyCode}
          subdomain={subdomain}
          psgcCode={psgcCode}
          dbMode={dbMode}
          leadershipMode={leadershipMode}
          execName={execName}
          execEmail={execEmail}
          execRole={execRole}
          inviteEmail={inviteEmail}
          inviteRole={inviteRole}
          purokCount={purokCount}
          clearanceFee={clearanceFee}
          businessClearanceFee={businessClearanceFee}
          provisioning={provisioning}
          dossier={dossier}
          onBack={() => setStep(3)}
          onSubmit={handleProvisionSubmit}
          onReset={handleReset}
        />
      )}
    </>
  );
}
