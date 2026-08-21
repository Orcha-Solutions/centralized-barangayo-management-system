"use client";

/**
 * Filipino/Taglish-first i18n for the resident PWA.
 *
 * `fil` is the default because this app is for residents, not staff.
 * The dictionary is the single source of every user-facing string; `TKey`
 * is derived from `en`, so a missing Filipino translation is a type error.
 */

import * as React from "react";

export type Lang = "en" | "fil";

export const LANG_STORAGE_KEY = "cbms.lang";
export const DEFAULT_LANG: Lang = "fil";

// ---------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------

export const en = {
  // --- app chrome ---
  app_name: "CBMS Resident",
  app_tagline: "Barangay services in your pocket",
  loading: "Loading…",
  saving: "Saving…",
  sending: "Sending…",
  cancel: "Cancel",
  close: "Close",
  back: "Back",
  retry: "Try again",
  optional: "optional",
  none: "None",
  error_generic: "Something went wrong. Please try again.",
  error_offline: "Cannot reach the barangay server. Check your connection.",
  companion_note:
    "CBMS is a companion to the DILG LGUSS-BIMS (MC 2025-104). It never replaces the official system.",

  // --- tabs ---
  tab_home: "Home",
  tab_services: "Services",
  tab_report: "Report",
  tab_wallet: "Wallet",
  tab_me: "Me",

  // --- login ---
  login_title: "Welcome to CBMS",
  login_sub: "Sign in to use your barangay services",
  login_identifier: "Mobile number or email",
  login_identifier_ph: "juan@example.ph or 09XX XXX XXXX",
  login_password: "Password",
  login_password_ph: "Your password",
  login_submit: "Sign in",
  login_quickfill: "Demo accounts (tap to fill)",
  login_phone_unsupported:
    "Mobile-number sign-in is not enabled in this demo. Please use your registered email.",
  login_failed: "Wrong email or password.",
  login_mfa_note: "This account needs an authenticator code — use the staff console instead.",
  login_demo_note: "Demo password for every seeded account: Cbms#2026",

  // --- home ---
  home_greet: "Hello, {name}!",
  home_greet_plain: "Hello!",
  home_sub: "What can the barangay do for you today?",
  home_announcements: "Barangay announcements",
  home_no_announcements: "No announcements right now.",
  home_shortcuts: "Quick services",
  tile_clearance: "Clearance",
  tile_report: "Report a Concern",
  tile_appointments: "Appointments",
  tile_wallet: "Wallet",
  tile_health: "Health",
  tile_jobs: "Jobs",
  home_sos_label: "SOS — EMERGENCY",
  home_sos_hint: "Tap to call for help from the barangay tanod and responders.",
  home_participate: "Vote in participatory budgeting →",

  // --- services / certificates ---
  services_title: "Services",
  services_sub: "Request barangay certificates",
  services_parity_note:
    "Certificates mirror the BIMS-BCIS sub-system. Online self-service is CBMS-exclusive.",
  svc_available: "Available certificates",
  svc_fee: "Fee",
  svc_free: "Free",
  svc_how_much: "How much is the fee?",
  svc_requirements: "Requirements",
  svc_no_requirements: "No documents required.",
  svc_validity: "Valid for {days} days",
  svc_request: "Request this",
  svc_request_title: "Request {name}",
  svc_purpose: "Purpose of the request",
  svc_purpose_ph: "e.g. Job application, scholarship, bank account",
  svc_purpose_short: "Please describe the purpose (at least 3 characters).",
  svc_submit: "Send request",
  svc_created: "Request sent. Reference {ref}.",
  svc_pay_now: "Pay now with my wallet",
  svc_paying: "Paying…",
  svc_paid_ok: "Paid. Official receipt {or}.",
  svc_pay_waived: "Fee waived — no payment needed.",
  svc_my_requests: "My requests",
  svc_no_requests: "You have no requests yet.",
  svc_view_doc: "View / Download",
  svc_hide_doc: "Hide document",
  svc_verify_code: "Verification code",
  svc_verify_open: "Open the public verification page",
  svc_verify_hint: "Anyone can check this code at the barangay verification page.",
  svc_issued: "Issued",
  svc_expires: "Valid until",
  svc_or_number: "Official receipt",
  svc_timeline: "Status",
  svc_rate: "Rate this service",
  svc_download_txt: "Download as text",

  // --- request statuses ---
  st_draft: "Draft",
  st_submitted: "Submitted",
  st_awaiting_payment: "Awaiting payment",
  st_paid: "Paid",
  st_for_approval: "For approval",
  st_approved: "Approved",
  st_released: "Released",
  st_rejected: "Rejected",
  st_cancelled: "Cancelled",

  // --- report a concern ---
  report_title: "Report a Concern",
  report_sub: "Barangay 311 — we answer within 3 working days",
  rep_category: "What is the concern?",
  cat_streetlight: "Broken streetlight",
  cat_flooding: "Flooding",
  cat_garbage: "Uncollected garbage",
  cat_pothole: "Pothole / road damage",
  cat_noise: "Noise disturbance",
  cat_stray_animal: "Stray animal",
  cat_other: "Other",
  rep_description: "Describe what happened",
  rep_description_ph: "Where is it and what needs fixing?",
  rep_description_short: "Please write at least 5 characters.",
  rep_purok: "Purok",
  rep_purok_ph: "e.g. Purok 3",
  rep_use_location: "Use my location",
  rep_locating: "Getting your location…",
  rep_location_set: "Location attached ({lat}, {lng})",
  rep_location_denied: "Location permission denied. You can still send the report.",
  rep_location_unsupported: "This device cannot share a location.",
  rep_submit: "Send",
  rep_sent: "Report sent. Reference {ref}.",
  rep_my_concerns: "My reports",
  rep_none: "You have not reported anything yet.",
  rep_sla_due: "Due {when}",
  rep_sla_breached: "Past the 3-day deadline",
  rep_resolved_on: "Resolved {when}",
  rep_resolution: "Barangay response",

  // --- sos ---
  sos_title: "SOS",
  sos_sub: "Emergency alert to the barangay",
  sos_kind: "What kind of emergency?",
  kind_medical: "Medical",
  kind_fire: "Fire",
  kind_crime: "Crime",
  kind_flood: "Flood",
  sos_note: "Short note",
  sos_note_ph: "e.g. Elderly, difficulty breathing, 2nd floor",
  sos_test_mode: "Test mode",
  sos_test_hint: "Test alerts are clearly labelled and will NOT dispatch responders.",
  sos_live_hint: "This is a LIVE alert. The barangay tanod and responders will be notified.",
  sos_send: "SEND SOS",
  sos_send_test: "SEND TEST ALERT",
  sos_sending: "Sending…",
  sos_sent_live: "Alert sent. Help is being dispatched.",
  sos_sent_test: "Test alert recorded. No responders were dispatched.",
  sos_reference: "Reference",
  sos_location_used: "Your location was attached to the alert.",
  sos_location_missing: "No location attached — describe where you are in the note.",
  sos_another: "Send another alert",
  sos_call_hint: "For a life-threatening emergency, also call the barangay hotline.",

  // --- wallet ---
  wallet_title: "My Wallet",
  wallet_sub: "Barangay e-wallet",
  wallet_balance: "Available balance",
  wallet_status: "Status",
  wallet_kyc: "KYC tier",
  wallet_recent: "Recent transactions",
  wallet_none: "No transactions yet.",
  wallet_in: "Received",
  wallet_out: "Sent",
  wallet_fee: "fee",
  wallet_aid_free:
    "Cashing out government aid is FREE. No fee is ever deducted from your ayuda.",
  wallet_no_wallet:
    "You do not have a barangay wallet yet. Visit the barangay hall to enrol — cash over the counter always remains available.",
  wallet_cashout_note:
    "Cash out at any accredited barangay agent. Bring your digital barangay ID.",
  wallet_st_active: "Active",
  wallet_st_frozen: "Frozen",
  wallet_st_closed: "Closed",
  kyc_tier1: "Tier 1 (basic)",
  kyc_tier2: "Tier 2 (full KYC)",
  txn_disbursement: "Government aid / disbursement",
  txn_fee_collection: "Service fee",
  txn_bill_payment: "Bill payment",
  txn_merchant_payment: "Merchant payment",
  txn_p2p_transfer: "Transfer",
  txn_cash_in: "Cash in",
  txn_cash_out: "Cash out",
  txn_reversal: "Reversal",
  txn_adjustment: "Adjustment",
  txn_pending: "Pending",
  txn_failed: "Failed",
  txn_reversed: "Reversed",

  // --- me ---
  me_title: "My Account",
  me_sub: "Profile, ID and privacy",
  me_id_card: "Digital Barangay ID",
  me_id_number: "ID number",
  me_qr: "QR code",
  me_qr_hint: "Show this code at the barangay hall or to an accredited agent.",
  me_id_valid_until: "Valid until",
  me_id_none: "No digital ID has been issued to you yet.",
  me_id_revoked: "This ID has been revoked. Please visit the barangay hall.",
  me_profile: "My details",
  me_name: "Name",
  me_birthdate: "Date of birth",
  me_age: "Age",
  me_sex: "Sex",
  me_civil_status: "Civil status",
  me_phone: "Mobile number",
  me_email: "Email",
  me_address: "Address",
  me_purok: "Purok",
  me_household: "Household no.",
  me_barangay: "Barangay",
  me_hotline: "Barangay hotline",
  me_consents: "My data-sharing consents",
  me_no_consents: "No consent records on file.",
  me_consent_granted: "Granted {when} by {who}",
  me_consent_withdrawn: "Withdrawn {when}",
  me_language: "Language / Wika",
  me_lang_fil: "Filipino",
  me_lang_en: "English",
  me_download: "Download my data",
  me_download_hint:
    "Your right under the Data Privacy Act (RA 10173). Saves everything the barangay holds about you as a JSON file.",
  me_downloading: "Preparing your file…",
  me_download_done: "Saved as my-cbms-data.json",
  me_logout: "Sign out",
  me_feedback_link: "Rate a barangay service",
  me_participate_link: "Participatory budgeting",

  // --- feedback ---
  fb_title: "Service feedback",
  fb_sub: "Client Satisfaction Measurement (RA 11032)",
  fb_question: "How was the service?",
  fb_star_1: "Very poor",
  fb_star_2: "Poor",
  fb_star_3: "Okay",
  fb_star_4: "Good",
  fb_star_5: "Excellent",
  fb_comment: "Comment",
  fb_comment_ph: "Tell us what went well or what to improve",
  fb_submit: "Send feedback",
  fb_thanks: "Thank you! Your feedback has been recorded.",
  fb_pick_rating: "Please tap a star first.",
  fb_for_request: "For request {ref}",
  fb_another: "Send another rating",
  fb_low_note: "Ratings of 1–2 stars are escalated to the Punong Barangay as a grievance.",

  // --- participatory budgeting ---
  pb_title: "Participatory Budgeting",
  pb_sub: "Choose the next barangay project",
  pb_no_cycle: "There is no open voting cycle right now.",
  pb_closes: "Voting closes {when}",
  pb_options: "Choose one project",
  pb_votes: "{n} votes",
  pb_vote: "Submit my vote",
  pb_voting: "Submitting…",
  pb_thanks: "Thank you, your vote has been recorded!",
  pb_already: "You have already voted in this cycle.",
  pb_pick_first: "Please choose a project first.",
  pb_one_vote: "One vote per resident. Your vote cannot be changed.",

  // --- appointments ---
  appt_title: "Appointments",
  appt_sub: "Book a slot at the barangay hall",
  appt_book: "Book an appointment",
  appt_service: "Service",
  appt_svc_certificate: "Certificate pick-up",
  appt_svc_kp_hearing: "KP hearing",
  appt_svc_health: "Health service",
  appt_svc_general: "General enquiry",
  appt_when: "Date and time",
  appt_submit: "Book",
  appt_booked: "Booked. See you at the barangay hall.",
  appt_mine: "My appointments",
  appt_none: "You have no appointments.",
  appt_queue: "Queue no.",
  appt_pick_time: "Please choose a date and time.",
  appt_st_booked: "Booked",
  appt_st_checked_in: "Checked in",
  appt_st_serving: "Now serving",
  appt_st_completed: "Completed",
  appt_st_no_show: "No show",
  appt_st_cancelled: "Cancelled",

  // --- health ---
  health_title: "Health services",
  health_sub: "Barangay health centre programmes",
  health_none: "No health campaigns are running right now.",
  health_active: "Ongoing",
  health_ended: "Ended",
  health_starts: "Starts {when}",
  health_until: "Until {when}",

  // --- jobs ---
  jobs_title: "Jobs & livelihood",
  jobs_sub: "Openings, training and scholarships",
  jobs_none: "No postings right now.",
  jobs_employer: "Employer",
  jobs_location: "Location",
  jobs_salary: "Salary",
  jobs_contact: "Contact",
  jobs_closes: "Closes {when}",
  jobs_kind_job: "Job",
  jobs_kind_training: "Training",
  jobs_kind_scholarship: "Scholarship",
} as const;

export type TKey = keyof typeof en;

export const fil: Record<TKey, string> = {
  // --- app chrome ---
  app_name: "CBMS Residente",
  app_tagline: "Serbisyo ng barangay, nasa bulsa mo",
  loading: "Naglo-load po…",
  saving: "Sine-save po…",
  sending: "Ipinapadala po…",
  cancel: "Kanselahin",
  close: "Isara",
  back: "Bumalik",
  retry: "Subukan ulit",
  optional: "opsyonal",
  none: "Wala",
  error_generic: "May problema po. Pakisubukan ulit.",
  error_offline: "Hindi maabot ang server ng barangay. Pakicheck ang koneksyon.",
  companion_note:
    "Ang CBMS ay katuwang lamang ng LGUSS-BIMS ng DILG (MC 2025-104). Hindi po nito pinapalitan ang opisyal na sistema.",

  // --- tabs ---
  tab_home: "Home",
  tab_services: "Serbisyo",
  tab_report: "Report",
  tab_wallet: "Wallet",
  tab_me: "Ako",

  // --- login ---
  login_title: "Mabuhay! Welcome sa CBMS",
  login_sub: "Mag-sign in po para magamit ang serbisyo ng barangay",
  login_identifier: "Mobile number o email",
  login_identifier_ph: "juan@example.ph o 09XX XXX XXXX",
  login_password: "Password",
  login_password_ph: "Iyong password",
  login_submit: "Mag-sign in",
  login_quickfill: "Demo accounts (i-tap para mapunan)",
  login_phone_unsupported:
    "Hindi pa po available ang login gamit ang mobile number sa demo na ito. Pakigamit po ang naka-rehistrong email.",
  login_failed: "Mali po ang email o password.",
  login_mfa_note:
    "Kailangan ng authenticator code ang account na ito — gamitin po ang staff console.",
  login_demo_note: "Demo password para sa lahat ng seeded account: Cbms#2026",

  // --- home ---
  home_greet: "Kumusta, {name}!",
  home_greet_plain: "Kumusta po!",
  home_sub: "Ano po ang maitutulong ng barangay ngayon?",
  home_announcements: "Mga anunsyo ng barangay",
  home_no_announcements: "Wala pong anunsyo sa ngayon.",
  home_shortcuts: "Mabilisang serbisyo",
  tile_clearance: "Clearance",
  tile_report: "Mag-report",
  tile_appointments: "Appointment",
  tile_wallet: "Wallet",
  tile_health: "Kalusugan",
  tile_jobs: "Trabaho",
  home_sos_label: "SOS — EMERGENCY",
  home_sos_hint: "I-tap po para humingi ng tulong sa tanod at mga responder.",
  home_participate: "Bumoto sa participatory budgeting →",

  // --- services / certificates ---
  services_title: "Mga Serbisyo",
  services_sub: "Mag-request ng Barangay Clearance at iba pang sertipiko",
  services_parity_note:
    "Ang mga sertipiko ay katulad ng BIMS-BCIS sub-system. Ang online self-service ay CBMS-exclusive.",
  svc_available: "Mga available na sertipiko",
  svc_fee: "Bayad",
  svc_free: "Libre",
  svc_how_much: "Ilan po ang bayad?",
  svc_requirements: "Mga kailangan",
  svc_no_requirements: "Walang kailangang dokumento.",
  svc_validity: "Valid po ng {days} araw",
  svc_request: "I-request po ito",
  svc_request_title: "Mag-request ng {name}",
  svc_purpose: "Layunin ng request",
  svc_purpose_ph: "hal. Aplikasyon sa trabaho, scholarship, bank account",
  svc_purpose_short: "Pakilagay po ang layunin (hindi bababa sa 3 letra).",
  svc_submit: "Ipadala",
  svc_created: "Naipadala na po. Reference {ref}.",
  svc_pay_now: "Bayaran gamit ang wallet",
  svc_paying: "Binabayaran po…",
  svc_paid_ok: "Bayad na po. Official receipt {or}.",
  svc_pay_waived: "Libre po ito — walang babayaran.",
  svc_my_requests: "Mga request ko",
  svc_no_requests: "Wala pa po kayong request.",
  svc_view_doc: "Tingnan / I-download",
  svc_hide_doc: "Itago ang dokumento",
  svc_verify_code: "Verification code",
  svc_verify_open: "Buksan ang public verification page",
  svc_verify_hint:
    "Puwedeng i-check ninuman ang code na ito sa verification page ng barangay.",
  svc_issued: "Petsa ng issue",
  svc_expires: "Valid hanggang",
  svc_or_number: "Official receipt",
  svc_timeline: "Katayuan",
  svc_rate: "I-rate ang serbisyo",
  svc_download_txt: "I-download bilang text",

  // --- request statuses ---
  st_draft: "Draft",
  st_submitted: "Naipasa na",
  st_awaiting_payment: "Hinihintay ang bayad",
  st_paid: "Bayad na",
  st_for_approval: "Para sa aprubahan",
  st_approved: "Aprubado",
  st_released: "Nailabas na",
  st_rejected: "Hindi tinanggap",
  st_cancelled: "Kinansela",

  // --- report a concern ---
  report_title: "Mag-report ng Reklamo",
  report_sub: "Barangay 311 — sasagutin sa loob ng 3 araw ng trabaho",
  rep_category: "Ano po ang reklamo?",
  cat_streetlight: "Sirang ilaw sa kalye",
  cat_flooding: "Baha",
  cat_garbage: "Hindi nakolektang basura",
  cat_pothole: "Lubak / sirang kalsada",
  cat_noise: "Ingay",
  cat_stray_animal: "Ligaw na hayop",
  cat_other: "Iba pa",
  rep_description: "Ikuwento po kung ano ang nangyari",
  rep_description_ph: "Saan po ito at ano ang kailangang ayusin?",
  rep_description_short: "Pakisulat po ng hindi bababa sa 5 letra.",
  rep_purok: "Purok",
  rep_purok_ph: "hal. Purok 3",
  rep_use_location: "Gamitin ang lokasyon ko",
  rep_locating: "Kinukuha po ang lokasyon…",
  rep_location_set: "Naka-attach na ang lokasyon ({lat}, {lng})",
  rep_location_denied:
    "Hindi pinayagan ang lokasyon. Puwede pa rin pong ipadala ang report.",
  rep_location_unsupported: "Hindi kayang mag-share ng lokasyon ang device na ito.",
  rep_submit: "Ipadala",
  rep_sent: "Naipadala na po ang report. Reference {ref}.",
  rep_my_concerns: "Mga report ko",
  rep_none: "Wala pa po kayong naire-report.",
  rep_sla_due: "Deadline {when}",
  rep_sla_breached: "Lampas na sa 3-araw na deadline",
  rep_resolved_on: "Naayos noong {when}",
  rep_resolution: "Sagot ng barangay",

  // --- sos ---
  sos_title: "SOS",
  sos_sub: "Emergency alert sa barangay",
  sos_kind: "Anong klaseng emergency po?",
  kind_medical: "Medikal",
  kind_fire: "Sunog",
  kind_crime: "Krimen",
  kind_flood: "Baha",
  sos_note: "Maikling paalala",
  sos_note_ph: "hal. May matanda, hirap huminga, nasa 2nd floor",
  sos_test_mode: "Test mode",
  sos_test_hint:
    "Malinaw na nakatatak bilang TEST ang alert at HINDI po magpapadala ng responder.",
  sos_live_hint:
    "TOTOONG alert po ito. Maaabisuhan ang tanod at mga responder ng barangay.",
  sos_send: "IPADALA ANG SOS",
  sos_send_test: "IPADALA ANG TEST ALERT",
  sos_sending: "Ipinapadala po…",
  sos_sent_live: "Naipadala na po. Papunta na ang tulong.",
  sos_sent_test: "Naitala ang test alert. Walang responder na ipinadala.",
  sos_reference: "Reference",
  sos_location_used: "Naka-attach po ang lokasyon ninyo sa alert.",
  sos_location_missing:
    "Walang naka-attach na lokasyon — pakisabi po sa note kung nasaan kayo.",
  sos_another: "Magpadala ng panibagong alert",
  sos_call_hint:
    "Kung delikado po ang buhay, tumawag din sa hotline ng barangay.",

  // --- wallet ---
  wallet_title: "Wallet Ko",
  wallet_sub: "Barangay e-wallet",
  wallet_balance: "Available na balanse",
  wallet_status: "Katayuan",
  wallet_kyc: "KYC tier",
  wallet_recent: "Mga huling transaksyon",
  wallet_none: "Wala pa pong transaksyon.",
  wallet_in: "Natanggap",
  wallet_out: "Naipadala",
  wallet_fee: "bayad",
  wallet_aid_free:
    "LIBRE po ang cash-out ng ayuda ng gobyerno. Walang binabawas na bayad sa ayuda ninyo.",
  wallet_no_wallet:
    "Wala pa po kayong barangay wallet. Pumunta po sa barangay hall para mag-enroll — laging available pa rin ang cash sa counter.",
  wallet_cashout_note:
    "Puwede pong mag-cash out sa alinmang accredited na barangay agent. Dalhin ang digital barangay ID.",
  wallet_st_active: "Aktibo",
  wallet_st_frozen: "Naka-freeze",
  wallet_st_closed: "Sarado",
  kyc_tier1: "Tier 1 (basic)",
  kyc_tier2: "Tier 2 (buong KYC)",
  txn_disbursement: "Ayuda / disbursement",
  txn_fee_collection: "Bayad sa serbisyo",
  txn_bill_payment: "Bayad sa bill",
  txn_merchant_payment: "Bayad sa merchant",
  txn_p2p_transfer: "Padala",
  txn_cash_in: "Cash in",
  txn_cash_out: "Cash out",
  txn_reversal: "Ibinalik",
  txn_adjustment: "Adjustment",
  txn_pending: "Hinihintay",
  txn_failed: "Hindi natuloy",
  txn_reversed: "Ibinalik",

  // --- me ---
  me_title: "Ang Account Ko",
  me_sub: "Profile, ID at privacy",
  me_id_card: "Digital Barangay ID",
  me_id_number: "ID number",
  me_qr: "QR code",
  me_qr_hint: "Ipakita po ito sa barangay hall o sa accredited na agent.",
  me_id_valid_until: "Valid hanggang",
  me_id_none: "Wala pa pong na-issue na digital ID sa inyo.",
  me_id_revoked: "Na-revoke po ang ID na ito. Pakipunta sa barangay hall.",
  me_profile: "Mga detalye ko",
  me_name: "Pangalan",
  me_birthdate: "Petsa ng kapanganakan",
  me_age: "Edad",
  me_sex: "Kasarian",
  me_civil_status: "Civil status",
  me_phone: "Mobile number",
  me_email: "Email",
  me_address: "Tirahan",
  me_purok: "Purok",
  me_household: "Household no.",
  me_barangay: "Barangay",
  me_hotline: "Hotline ng barangay",
  me_consents: "Mga pahintulot ko sa data sharing",
  me_no_consents: "Wala pong nakatalang consent.",
  me_consent_granted: "Ibinigay noong {when} ni {who}",
  me_consent_withdrawn: "Binawi noong {when}",
  me_language: "Wika / Language",
  me_lang_fil: "Filipino",
  me_lang_en: "English",
  me_download: "I-download ang data ko",
  me_download_hint:
    "Karapatan ninyo sa ilalim ng Data Privacy Act (RA 10173). Ise-save bilang JSON file ang lahat ng hawak ng barangay tungkol sa inyo.",
  me_downloading: "Inihahanda po ang file…",
  me_download_done: "Na-save bilang my-cbms-data.json",
  me_logout: "Mag-sign out",
  me_feedback_link: "I-rate ang serbisyo ng barangay",
  me_participate_link: "Participatory budgeting",

  // --- feedback ---
  fb_title: "Feedback sa serbisyo",
  fb_sub: "Client Satisfaction Measurement (RA 11032)",
  fb_question: "Kumusta po ang serbisyo?",
  fb_star_1: "Napakasama",
  fb_star_2: "Hindi maganda",
  fb_star_3: "Okay lang",
  fb_star_4: "Maganda",
  fb_star_5: "Napakahusay",
  fb_comment: "Komento",
  fb_comment_ph: "Ano po ang maganda o dapat pagbutihin?",
  fb_submit: "Ipadala ang feedback",
  fb_thanks: "Salamat po! Naitala na ang inyong feedback.",
  fb_pick_rating: "Pakipili po muna ng bituin.",
  fb_for_request: "Para sa request {ref}",
  fb_another: "Magpadala ng panibagong rating",
  fb_low_note:
    "Ang 1–2 bituin ay ipinapasa sa Punong Barangay bilang reklamo (grievance).",

  // --- participatory budgeting ---
  pb_title: "Participatory Budgeting",
  pb_sub: "Piliin po ang susunod na proyekto ng barangay",
  pb_no_cycle: "Wala pong bukas na botohan sa ngayon.",
  pb_closes: "Magsasara ang botohan {when}",
  pb_options: "Pumili po ng isang proyekto",
  pb_votes: "{n} boto",
  pb_vote: "Ipadala ang boto ko",
  pb_voting: "Ipinapadala po…",
  pb_thanks: "Salamat, naitala na ang boto mo!",
  pb_already: "Nakaboto na po kayo sa cycle na ito.",
  pb_pick_first: "Pakipili po muna ng proyekto.",
  pb_one_vote: "Isang boto lang po bawat residente. Hindi na ito mababago.",

  // --- appointments ---
  appt_title: "Mga Appointment",
  appt_sub: "Mag-book ng schedule sa barangay hall",
  appt_book: "Mag-book ng appointment",
  appt_service: "Serbisyo",
  appt_svc_certificate: "Pagkuha ng sertipiko",
  appt_svc_kp_hearing: "KP hearing",
  appt_svc_health: "Serbisyong pangkalusugan",
  appt_svc_general: "Pangkalahatang tanong",
  appt_when: "Petsa at oras",
  appt_submit: "I-book",
  appt_booked: "Naka-book na po. Kita-kits sa barangay hall.",
  appt_mine: "Mga appointment ko",
  appt_none: "Wala po kayong appointment.",
  appt_queue: "Queue no.",
  appt_pick_time: "Pakipili po ng petsa at oras.",
  appt_st_booked: "Naka-book",
  appt_st_checked_in: "Naka-check in",
  appt_st_serving: "Tinatawag na",
  appt_st_completed: "Tapos na",
  appt_st_no_show: "Hindi dumating",
  appt_st_cancelled: "Kinansela",

  // --- health ---
  health_title: "Serbisyong pangkalusugan",
  health_sub: "Mga programa ng barangay health centre",
  health_none: "Wala pong tumatakbong health campaign ngayon.",
  health_active: "Kasalukuyan",
  health_ended: "Tapos na",
  health_starts: "Sisimulan {when}",
  health_until: "Hanggang {when}",

  // --- jobs ---
  jobs_title: "Trabaho at kabuhayan",
  jobs_sub: "Mga bakante, training at scholarship",
  jobs_none: "Wala pong posting sa ngayon.",
  jobs_employer: "Employer",
  jobs_location: "Lokasyon",
  jobs_salary: "Sahod",
  jobs_contact: "Contact",
  jobs_closes: "Magsasara {when}",
  jobs_kind_job: "Trabaho",
  jobs_kind_training: "Training",
  jobs_kind_scholarship: "Scholarship",
};

export const dictionaries: Record<Lang, Record<TKey, string>> = { en, fil };

// ---------------------------------------------------------------
// Tiny external store so a toggle in /me re-renders every screen
// ---------------------------------------------------------------

const listeners = new Set<() => void>();

export function readLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY);
    return raw === "en" || raw === "fil" ? raw : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function writeLang(lang: Lang): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* private mode — fall back to in-memory only */
    }
  }
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export type Vars = Record<string, string | number>;
export type Translate = (key: TKey, vars?: Vars) => string;

export function translate(lang: Lang, key: TKey, vars?: Vars): string {
  let out: string = dictionaries[lang][key] ?? en[key] ?? String(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{${k}}`).join(String(v));
    }
  }
  return out;
}

/**
 * Reads the stored language after mount (never during SSR) so the server and
 * the first client render always agree on the default.
 */
export function useT(): { t: Translate; lang: Lang; setLang: (lang: Lang) => void } {
  const [lang, setLangState] = React.useState<Lang>(DEFAULT_LANG);

  React.useEffect(() => {
    setLangState(readLang());
    return subscribe(() => setLangState(readLang()));
  }, []);

  const t = React.useCallback<Translate>((key, vars) => translate(lang, key, vars), [lang]);

  const setLang = React.useCallback((next: Lang) => {
    writeLang(next);
  }, []);

  return { t, lang, setLang };
}
