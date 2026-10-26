INSERT INTO blotter_actions (
    id, "blotterId", "barangayId", "actionTaken", "officerName", "officerRole", "statusAfter", "documentRef", notes, "timestamp"
) VALUES
(
    'act-001-01',
    'blt-001',
    'brgy-barangka',
    'Initial Intake & Complainant Interview',
    'Kgd. Roberto Santos',
    'Barangay Peace & Order Officer',
    'active',
    'INTAKE-2026-0089',
    'Complainant Juan Dela Cruz formally appeared before the desk to report recurring late-night disturbance by respondent. Statements taken in accordance with DILG KP guidelines.',
    '2026-10-24 11:30:00+08'
),
(
    'act-001-02',
    'blt-001',
    'brgy-barangka',
    'Tanod Dispatch & Ocular Inspection',
    'Officer Mark Reyes',
    'Barangay Tanod Team Leader',
    'active',
    'PATROL-LOG-442',
    'Dispatched tanod patrol unit to Purok 3. Notified household of respondent Pedro Penduko regarding ordinance on late-night noise levels. Issued verbal caution.',
    '2026-10-24 22:15:00+08'
),
(
    'act-001-03',
    'blt-001',
    'brgy-barangka',
    'KP Form 7: Summons Issued',
    'Sec. Elena Dimagiba',
    'Lupon Tagapamayapa Secretary',
    'active',
    'KP-SUMMON-2026-041',
    'Issued official 1st Notice of Hearing for Katarungang Pambarangay mediation scheduled on October 28, 2026 at 2:00 PM at the Barangay Hall.',
    '2026-10-25 09:00:00+08'
)
ON CONFLICT (id) DO NOTHING;
