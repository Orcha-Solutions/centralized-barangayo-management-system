import { dateTime, pesoAmount, titleize } from "@cbms/ui";
import type { RptPropertyItem, RptTaxDueItem } from "../../../../lib/rpt-queries";

export function printRptDossier(
  property: RptPropertyItem,
  due?: RptTaxDueItem | null
): void {
  const taxYear = due?.taxYear ?? new Date().getFullYear();
  const basicTax = due ? due.basicTaxAmount : Math.round(property.assessedValue * 0.01);
  const sefTax = due ? due.sefTaxAmount : Math.round(property.assessedValue * 0.01);
  const totalDue = due ? due.totalAmount : basicTax + sefTax;
  const brgyShare = due ? due.barangayShareAmount : Math.round(basicTax * 0.25);
  const paymentStatus = due?.paymentStatus ?? "unpaid";

  const printWin = window.open("", "_blank", "width=860,height=920");
  if (!printWin) {
    window.print();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>RPT Property Dossier — ${property.taxDeclarationNo}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 32px 40px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0a2463;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .header p { margin: 2px 0; font-size: 12px; color: #334155; }
    .header h1 {
      margin: 8px 0 4px;
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #0a2463;
    }
    .badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .tdn {
      font-family: monospace;
      font-size: 18px;
      font-weight: 700;
      color: #0a2463;
    }
    .status {
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      border: 1px solid #94a3b8;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0a2463;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 5px;
      margin: 18px 0 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    th, td {
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
      font-size: 12.5px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      width: 36%;
      font-weight: 600;
    }
    td.mono {
      font-family: monospace;
      font-weight: 600;
    }
    .highlight-row th, .highlight-row td {
      background: #f0fdf4;
      color: #065f46;
      font-weight: 700;
    }
    .signatures {
      margin-top: 42px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    .sig-box {
      border-top: 1px solid #334155;
      padding-top: 6px;
      text-align: center;
      font-size: 12px;
      color: #334155;
    }
    .footer-meta {
      margin-top: 28px;
      font-size: 11px;
      color: #64748b;
      text-align: right;
    }
    @media print {
      body { padding: 12px 18px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <p>Republic of the Philippines</p>
    <p><strong>Centralized Barangay Management System (CBMS)</strong></p>
    <h1>Real Property Tax (RPT) Declaration &amp; Assessment Record</h1>
    <p>Statutory Reference: RA 7160 (Local Government Code of 1991) §233, §235, §271</p>
  </div>

  <div class="badge-row">
    <div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600;">Tax Declaration No. (TDN)</div>
      <div class="tdn">${property.taxDeclarationNo}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600;margin-bottom:4px;">Tax Year ${taxYear} Status</div>
      <span class="status">${titleize(paymentStatus)}</span>
    </div>
  </div>

  <div class="section-title">1. Property &amp; Taxpayer Identification</div>
  <table>
    <tbody>
      <tr>
        <th>Registered Property Owner</th>
        <td><strong>${property.ownerName}</strong></td>
      </tr>
      <tr>
        <th>Property Classification</th>
        <td>${titleize(property.propertyType)}</td>
      </tr>
      <tr>
        <th>Street Address / Location</th>
        <td>${property.addressLine}</td>
      </tr>
      <tr>
        <th>Purok / Zone</th>
        <td>${property.purok || "—"}</td>
      </tr>
      <tr>
        <th>Lot No. / Block No.</th>
        <td>Lot ${property.lotNo || "—"} / Block ${property.blockNo || "—"}</td>
      </tr>
      <tr>
        <th>Date Declared</th>
        <td>${dateTime(property.createdAt)}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">2. Property Valuation &amp; Annual Tax Assessment (Tax Year ${taxYear})</div>
  <table>
    <tbody>
      <tr>
        <th>Fair Market Value</th>
        <td class="mono">${pesoAmount(property.marketValue)}</td>
      </tr>
      <tr>
        <th>Assessed Value (Taxable Base)</th>
        <td class="mono">${pesoAmount(property.assessedValue)}</td>
      </tr>
      <tr>
        <th>1% Basic Real Property Tax</th>
        <td class="mono">${pesoAmount(basicTax)}</td>
      </tr>
      <tr>
        <th>1% Special Education Fund (SEF) Tax</th>
        <td class="mono">${pesoAmount(sefTax)}</td>
      </tr>
      <tr>
        <th>Total Annual RPT Due</th>
        <td class="mono">${pesoAmount(totalDue)}</td>
      </tr>
      <tr class="highlight-row">
        <th>25% Barangay RPT Share (RA 7160 §271)</th>
        <td class="mono">+${pesoAmount(brgyShare)}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">3. Settlement &amp; Treasury Record</div>
  <table>
    <tbody>
      <tr>
        <th>Payment Status</th>
        <td><strong>${titleize(paymentStatus)}</strong></td>
      </tr>
      <tr>
        <th>Official Receipt No. (OR#)</th>
        <td class="mono">${due?.orNumber || "—"}</td>
      </tr>
      <tr>
        <th>Date Settled</th>
        <td>${due?.paidAt ? dateTime(due.paidAt) : "—"}</td>
      </tr>
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">
      <strong>Certified Correct By</strong><br />
      Barangay Treasurer / Records Officer
    </div>
    <div class="sig-box">
      <strong>Noted By</strong><br />
      Punong Barangay
    </div>
  </div>

  <div class="footer-meta">
    Printed from CBMS Admin Console on ${new Date().toLocaleString()} · Record ID: ${property.id}
  </div>

  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;

  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}
