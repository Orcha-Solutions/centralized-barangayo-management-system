INSERT INTO appointment (
    id, "barangayId", "inhabitantId", service, "scheduledAt", "queueNumber", status, notes
) VALUES
(
    'apt-001',
    'brgy-barangka',
    'uh8hppo',
    'Barangay Clearance',
    NOW() + INTERVAL '1 day',
    'Q-20261027-001',
    'booked',
    'Employment requirement clearance application.'
),
(
    'apt-002',
    'brgy-barangka',
    'xk3tyib',
    'Certificate of Indigency',
    NOW() + INTERVAL '2 day',
    'Q-20261028-002',
    'booked',
    'Medical assistance at DSWD requirement.'
),
(
    'apt-003',
    'brgy-barangka',
    'b5d8sa6',
    'Cedula (Community Tax Certificate)',
    NOW() - INTERVAL '1 hour',
    'Q-20261026-003',
    'checked_in',
    'In-person renewal of local tax certificate.'
)
ON CONFLICT (id) DO NOTHING;
