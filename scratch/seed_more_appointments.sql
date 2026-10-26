INSERT INTO appointment (
    id, "barangayId", "inhabitantId", service, "scheduledAt", "queueNumber", status, "checkedInAt", "servedAt", "completedAt", notes, "createdAt"
) VALUES
-- Today's Bookings
('apt-004', 'brgy-barangka', 'man0ouo', 'Barangay Clearance', NOW() + INTERVAL '1 hour', 'Q-20261026-004', 'booked', NULL, NULL, NULL, 'Job application for BPO call center agent.', NOW()),
('apt-005', 'brgy-barangka', 'km5onz0', 'Cedula (Community Tax Certificate)', NOW() + INTERVAL '2 hours', 'Q-20261026-005', 'booked', NULL, NULL, NULL, 'Annual local business permit filing requirement.', NOW()),
('apt-006', 'brgy-barangka', NULL, 'General Public Assistance', NOW() + INTERVAL '3 hours', 'Q-20261026-006', 'booked', NULL, NULL, NULL, 'Walk-in inquiring about educational financial assistance.', NOW()),
('apt-007', 'brgy-barangka', 'gf6r6q7', 'Certificate of Indigency', NOW() + INTERVAL '4 hours', 'Q-20261026-007', 'booked', NULL, NULL, NULL, 'Philippine Charity Sweepstakes Office (PCSO) guarantee letter requirement.', NOW()),

-- At the counter (checked_in / serving)
('apt-008', 'brgy-barangka', '1apeuwh', 'Barangay Clearance', NOW() - INTERVAL '30 minutes', 'Q-20261026-008', 'checked_in', NOW() - INTERVAL '30 minutes', NULL, NULL, 'Clearance for postal ID renewal.', NOW() - INTERVAL '1 hour'),
('apt-009', 'brgy-barangka', 'r1659cd', 'Business Permit Endorsement', NOW() - INTERVAL '45 minutes', 'Q-20261026-009', 'serving', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '10 minutes', NULL, 'Sari-sari store business permit endorsement renewal.', NOW() - INTERVAL '2 hours'),
('apt-010', 'brgy-barangka', NULL, 'Health & Medical Service', NOW() - INTERVAL '15 minutes', 'Q-20261026-010', 'checked_in', NOW() - INTERVAL '15 minutes', NULL, NULL, 'Blood pressure monitoring and immunization record request.', NOW() - INTERVAL '1 hour'),
('apt-011', 'brgy-barangka', '0wmuny5', 'Katarungang Pambarangay Hearing', NOW() - INTERVAL '50 minutes', 'Q-20261026-011', 'serving', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '20 minutes', NULL, 'Mediation session before Punong Barangay for KP-001.', NOW() - INTERVAL '3 hours'),

-- Completed transactions
('apt-012', 'brgy-barangka', 'rxutxw1', 'Barangay Clearance', NOW() - INTERVAL '2 hours', 'Q-20261026-012', 'completed', NOW() - INTERVAL '2 hours 15 minutes', NOW() - INTERVAL '2 hours 5 minutes', NOW() - INTERVAL '2 hours', 'Clearance issued successfully with QR code seal.', NOW() - INTERVAL '4 hours'),
('apt-013', 'brgy-barangka', 'uh8hppo', 'Cedula (Community Tax Certificate)', NOW() - INTERVAL '3 hours', 'Q-20261026-013', 'completed', NOW() - INTERVAL '3 hours 10 minutes', NOW() - INTERVAL '3 hours 5 minutes', NOW() - INTERVAL '3 hours', 'Official CTC receipt issued. Total fees collected P55.00.', NOW() - INTERVAL '5 hours'),
('apt-014', 'brgy-barangka', 'xk3tyib', 'Certificate of Indigency', NOW() - INTERVAL '4 hours', 'Q-20261026-014', 'completed', NOW() - INTERVAL '4 hours 20 minutes', NOW() - INTERVAL '4 hours 10 minutes', NOW() - INTERVAL '4 hours', 'Burial assistance endorsement letter approved.', NOW() - INTERVAL '6 hours'),

-- No-Shows & Cancelled
('apt-015', 'brgy-barangka', NULL, 'Barangay Clearance', NOW() - INTERVAL '5 hours', 'Q-20261026-015', 'no_show', NULL, NULL, NULL, 'Applicant did not appear after 3 queue calls.', NOW() - INTERVAL '8 hours'),
('apt-016', 'brgy-barangka', 'b5d8sa6', 'Business Permit Endorsement', NOW() - INTERVAL '6 hours', 'Q-20261026-016', 'cancelled', NULL, NULL, NULL, 'Citizen requested cancellation due to missing DTI certificate.', NOW() - INTERVAL '9 hours'),

-- Tomorrow & Future Schedule
('apt-017', 'brgy-barangka', 'man0ouo', 'Barangay Clearance', NOW() + INTERVAL '1 day 2 hours', 'Q-20261027-017', 'booked', NULL, NULL, NULL, 'Passport application clearance requirement.', NOW()),
('apt-018', 'brgy-barangka', 'km5onz0', 'Cedula (Community Tax Certificate)', NOW() + INTERVAL '1 day 3 hours', 'Q-20261027-018', 'booked', NULL, NULL, NULL, 'Annual corporate CTC declaration.', NOW()),
('apt-019', 'brgy-barangka', 'gf6r6q7', 'Katarungang Pambarangay Hearing', NOW() + INTERVAL '1 day 5 hours', 'Q-20261027-019', 'booked', NULL, NULL, NULL, 'Second conciliation hearing before Lupon Pangkat.', NOW()),
('apt-020', 'brgy-barangka', NULL, 'Health & Medical Service', NOW() + INTERVAL '2 days 1 hour', 'Q-20261028-020', 'booked', NULL, NULL, NULL, 'Free dental consultation clinic schedule.', NOW()),
('apt-021', 'brgy-barangka', '1apeuwh', 'Certificate of Indigency', NOW() + INTERVAL '2 days 3 hours', 'Q-20261028-021', 'booked', NULL, NULL, NULL, 'Medical subsidy request for Mandaluyong City Medical Center.', NOW()),
('apt-022', 'brgy-barangka', 'r1659cd', 'General Public Assistance', NOW() + INTERVAL '2 days 4 hours', 'Q-20261028-022', 'booked', NULL, NULL, NULL, 'Senior citizen ID application assistance inquiry.', NOW()),
('apt-023', 'brgy-barangka', '0wmuny5', 'Business Permit Endorsement', NOW() + INTERVAL '3 days 2 hours', 'Q-20261029-023', 'booked', NULL, NULL, NULL, 'Carwash business barangay locational clearance.', NOW()),
('apt-024', 'brgy-barangka', 'rxutxw1', 'Barangay Clearance', NOW() + INTERVAL '3 days 4 hours', 'Q-20261029-024', 'booked', NULL, NULL, NULL, 'Security guard license renewal requirement.', NOW()),

-- Historical past records for pagination & testing sorting
('apt-025', 'brgy-barangka', 'uh8hppo', 'Cedula (Community Tax Certificate)', NOW() - INTERVAL '2 days', 'Q-20261024-025', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'Processed CTC receipt.', NOW() - INTERVAL '2 days'),
('apt-026', 'brgy-barangka', 'xk3tyib', 'Barangay Clearance', NOW() - INTERVAL '3 days', 'Q-20261023-026', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'Processed clearance for employment.', NOW() - INTERVAL '3 days'),
('apt-027', 'brgy-barangka', 'b5d8sa6', 'Certificate of Indigency', NOW() - INTERVAL '4 days', 'Q-20261022-027', 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'Indigency certificate issued for hospital discharge.', NOW() - INTERVAL '4 days'),
('apt-028', 'brgy-barangka', 'man0ouo', 'General Public Assistance', NOW() - INTERVAL '5 days', 'Q-20261021-028', 'no_show', NULL, NULL, NULL, 'Client did not show up.', NOW() - INTERVAL '5 days'),
('apt-029', 'brgy-barangka', 'km5onz0', 'Barangay Clearance', NOW() - INTERVAL '6 days', 'Q-20261020-029', 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', 'Clearance released.', NOW() - INTERVAL '6 days'),
('apt-030', 'brgy-barangka', 'gf6r6q7', 'Business Permit Endorsement', NOW() - INTERVAL '7 days', 'Q-20261019-030', 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'Water refilling station endorsement issued.', NOW() - INTERVAL '7 days'),

-- Mirrored records for active tenant alias (tnt-barangka)
('apt-031', 'tnt-barangka', '1apeuwh', 'Barangay Clearance', NOW() + INTERVAL '1 hour', 'Q-20261026-031', 'booked', NULL, NULL, NULL, 'Tenant mirror appointment for testing.', NOW()),
('apt-032', 'tnt-barangka', 'r1659cd', 'Certificate of Indigency', NOW() + INTERVAL '2 hours', 'Q-20261026-032', 'checked_in', NOW(), NULL, NULL, 'Tenant mirror appointment for testing.', NOW()),
('apt-033', 'tnt-barangka', '0wmuny5', 'Business Permit Endorsement', NOW() + INTERVAL '3 hours', 'Q-20261026-033', 'serving', NOW(), NOW(), NULL, 'Tenant mirror appointment for testing.', NOW())
ON CONFLICT (id) DO UPDATE SET
    "barangayId" = EXCLUDED."barangayId",
    "inhabitantId" = EXCLUDED."inhabitantId",
    service = EXCLUDED.service,
    "scheduledAt" = EXCLUDED."scheduledAt",
    "queueNumber" = EXCLUDED."queueNumber",
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;
