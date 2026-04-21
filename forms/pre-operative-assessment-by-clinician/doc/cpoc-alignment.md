# CPOC Alignment

Cross-walk between this form and the Centre for Perioperative Care
*Preoperative Assessment and Optimisation for Adult Surgery* (June 2021)
guidance. The source PDF is in `seeds/`.

| CPOC section | Recommendation | Where handled in this form |
| --- | --- | --- |
| 1. Shared decision making & consent | BRAN framework, Montgomery consent, GMC seven principles | Step 2 (patient identification + planned procedure), step 16 (recommendation + override + notes), PDF report includes SDM statement |
| 2. Self-screening questionnaires / ePOA | patient-facing screening precedes clinician assessment | Out of scope — this form is the clinician-operated record; a sibling patient-self-report form feeds in where available |
| 3. Preoperative assessment clinic | formal POA for every patient, nurse-led with anaesthetist support | The whole form is the POA record |
| 4. Risk scoring | SORT mortality estimate; ASA for hub selection; > 1 % risk → enhanced care; > 5 % → critical care | Step 16 (overall recommendation); safety flags raise composite risk to High/Critical |
| 5. COVID-19 | avoid surgery 7 weeks post-infection; refer persistent symptoms | Step 6 (respiratory) captures recent COVID-19 status, days since acute infection, unresolved symptoms; fires `recent-covid-19` flag if < 7 weeks |
| 6. Other comorbidities | specific evaluation for DM, endocrine, CV, anaemia, HF, lung, renal, liver, sleep-disordered breathing, pacemaker, opioids, learning disability, safeguarding | Steps 5, 6, 8, 9, 10, 11, 13 each collect system-specific objective data |
| 7. Functional capacity | screen with DASI / Godin / IPAQ; CPET / 6MWT / ISWT / STS / TUG | Step 14 (functional capacity & frailty) |
| 8. Exercise interventions | universal vs targeted vs specialist prehabilitation | Step 16 recommendation can include prehabilitation signposting |
| 9. Mental health & cognition | MOCA, PHQ9, GAD7, HADS; screen for cognitive impairment | Step 7 (neurological) captures cognitive score; step 16 flag for capacity concern |
| 10. Nutrition | MUST / NRS 2002; ONS for malnourished cancer patients | Step 14 captures BMI-derived nutritional status; step 16 recommendation |
| 11. Surgery School | invite all major / inpatient elective patients | Step 16 recommendation |
| 12. Waiting-list surveillance | active clinical surveillance for patients waiting > 3 months | Out of scope for a single assessment event; handled by trust waiting-list processes |
| 13. Emergency surgery | NELA / Nottingham Hip Fracture Score; SDM + TEP in limited time | Step 2 (urgency = emergency adds E suffix); step 16 TEP section |

## Screening tools referenced

- **STOP-BANG** (CPOC §3) — step 4 airway assessment collects all 8 items.
- **Clinical Frailty Scale** (CPOC §3, Appendix 4) — step 14.
- **MUST** (CPOC §10, Appendix 4) — implicitly covered by BMI and weight-loss
  capture in step 14; full MUST tool runs independently.
- **NRS 2002** (CPOC §10, Appendix 4) — as above.
- **DASI** (CPOC §7) — step 14 dedicated field.
- **MOCA / AMT-4** (CPOC §9) — step 7 cognitive score.
- **PHQ9 / GAD7 / HADS** (CPOC §9) — step 7 notes; referral pathway
  triggered by `cognitive-or-capacity` flag.

## CPOC-driven safety flags

- `recent-covid-19` — CPOC §5 recommends 7-week deferral.
- `severe-frailty` — CPOC §3 Comprehensive Geriatric Assessment (POPS).
- `malnutrition-risk` — CPOC §10.
- `high-risk-medication-conflict` — CPOC §3 and §6 (anticoagulants, steroids,
  biologics); consults UKCPA handbook rules.
- `safeguarding-concern` — CPOC §6 vulnerable adults.

## Output destinations aligned with CPOC

- PDF clinician report with SDM statement and BRAN-framed risk discussion.
- FHIR R5 Bundle for primary-/secondary-care interface (CPOC §2).
- Risk band printed on WHO Safer Surgery Checklist handover.
