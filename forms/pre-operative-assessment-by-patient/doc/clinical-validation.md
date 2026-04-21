# Clinical Validation Guide

This document provides test scenarios, expected outcomes, and procedures for validating the ASA grading engine against known clinical cases. It is intended for use during development testing, clinical acceptance testing, and ongoing quality assurance.

## Validation Principles

1. **Every rule must be independently testable.** Each of the 42 ASA rules should be testable in isolation by constructing a patient profile that triggers only that rule.
2. **Combination scenarios must be tested.** Real patients typically have multiple comorbidities; tests should verify that the maximum-grade algorithm works correctly.
3. **Boundary conditions must be tested.** Values at the exact boundary of rule thresholds (e.g., BMI 30.0, age exactly 80) should be tested.
4. **Negative testing is essential.** Healthy patient profiles must consistently return ASA I with zero fired rules.

---

## Automated Test Suite

The system includes 12 automated unit tests in `src/lib/engine/asa-grader.test.ts`. These can be run with:

```bash
npx vitest run
```

### Existing Automated Tests

| Test | Expected Outcome |
|------|-----------------|
| Healthy patient (no comorbidities) | ASA I, 0 fired rules |
| Controlled hypertension + mild asthma | ASA II, >= 2 fired rules |
| COPD + uncontrolled diabetes + morbid obesity | ASA III, >= 3 fired rules |
| Recent MI + NYHA IV heart failure | ASA IV |
| All rule IDs are unique | 42 unique IDs |
| Healthy patient flags | 0 flags |
| Difficult airway flag | FLAG-AIRWAY-001 present |
| Anaphylaxis allergy flag | High-priority allergy flag |
| Anticoagulant flag | FLAG-ANTICOAG-001 present |
| Family MH history flag | FLAG-MH-001 present |
| Pregnancy flag | FLAG-PREG-001 present |
| Flag priority sorting | High before medium before low |

---

## Manual Test Scenarios

### Scenario 1: Healthy Young Adult (Expected: ASA I)

**Patient Profile:**
- Male, 30 years old, 75 kg, 175 cm (BMI 24.5)
- Elective inguinal hernia repair
- No medical history, no medications, no allergies
- Non-smoker, no alcohol, vigorous exercise capacity (10 METs)
- No previous anaesthetic problems

**Expected Result:**
- ASA Grade: I
- Fired Rules: 0
- Additional Flags: 0

**Validates:** Default healthy patient classification, absence of false positives.

---

### Scenario 2: Well-Controlled Hypertensive Smoker (Expected: ASA II)

**Patient Profile:**
- Female, 55 years old, 82 kg, 165 cm (BMI 30.1)
- Elective cholecystectomy
- Controlled hypertension on amlodipine 5mg daily
- Current smoker, 15 pack-years
- No other medical history
- Exercise tolerance: can climb stairs (4 METs)

**Expected Result:**
- ASA Grade: II
- Fired Rules: CV-001 (controlled HTN), RS-007 (current smoker), OB-001 (BMI 30-39)
- Additional Flags: 0

**Validates:** Multiple ASA II conditions correctly produce ASA II (not higher).

---

### Scenario 3: Moderate COPD with Poorly Controlled Diabetes (Expected: ASA III)

**Patient Profile:**
- Male, 68 years old, 110 kg, 170 cm (BMI 38.1)
- Elective knee replacement
- Moderate COPD on inhalers
- Type 2 diabetes, poorly controlled, on insulin
- Exercise tolerance: light housework only (2 METs)
- Previous anaesthetic without problems

**Expected Result:**
- ASA Grade: III
- Fired Rules should include: RS-004 (moderate COPD), EN-002 (poorly controlled diabetes), OB-001 (BMI 30-39), FC-001 (poor functional capacity)
- Additional Flags: FLAG-INSULIN-001 (on insulin)

**Validates:** ASA III from multiple organ systems, functional capacity rule, insulin flag.

---

### Scenario 4: Recent MI with NYHA IV Heart Failure (Expected: ASA IV)

**Patient Profile:**
- Male, 72 years old, 85 kg, 178 cm (BMI 26.8)
- Urgent bowel surgery
- Recent MI 4 weeks ago
- Heart failure NYHA class IV
- Severe valvular disease (aortic stenosis)
- On warfarin for AF
- Exercise tolerance: unable (1 MET)

**Expected Result:**
- ASA Grade: IV
- Fired Rules should include: CV-004 (recent MI), CV-007 (NYHA IV), CV-008 (valvular disease), CV-009 (arrhythmia), HM-002 (anticoagulants), FC-001 (poor functional capacity)
- Additional Flags should include: FLAG-CARDIAC-002 (recent MI), FLAG-ANTICOAG-001 (on warfarin)

**Validates:** ASA IV classification, multiple cardiovascular rules, anticoagulant flagging.

---

### Scenario 5: Decompensated Liver Cirrhosis (Expected: ASA IV)

**Patient Profile:**
- Female, 58 years old, 60 kg, 162 cm (BMI 22.9)
- Urgent surgery for perforated viscus
- Cirrhosis Child-Pugh C
- On no anticoagulants
- Hepatitis C positive
- Exercise tolerance: light housework (2 METs)

**Expected Result:**
- ASA Grade: IV
- Fired Rules should include: HP-003 (Child-Pugh B/C), FC-001 (poor functional capacity)
- Additional Flags: 0 specific liver flags (captured by ASA grade)

**Validates:** Hepatic rules, Child-Pugh grading.

---

### Scenario 6: Difficult Airway with Multiple Predictors (Expected: ASA II + Flags)

**Patient Profile:**
- Male, 45 years old, 130 kg, 175 cm (BMI 42.4)
- Elective tonsillectomy
- Previous documented difficult intubation
- Limited mouth opening, limited neck movement
- Mallampati class 4
- Rheumatoid arthritis
- OSA on CPAP

**Expected Result:**
- ASA Grade: III (morbid obesity + poor functional capacity if applicable)
- Fired Rules: OB-002 (morbid obesity), RS-006 (OSA)
- Additional Flags should include:
  - FLAG-AIRWAY-001 (previous difficult airway) - HIGH
  - FLAG-AIRWAY-002 (limited mouth opening) - HIGH
  - FLAG-AIRWAY-003 (limited neck movement) - HIGH
  - FLAG-AIRWAY-004 (Mallampati 4) - HIGH
  - FLAG-AIRWAY-006 (RA - atlanto-axial) - MEDIUM
  - FLAG-OSA-001 (OSA on CPAP) - MEDIUM

**Validates:** Multiple airway flags, flag priority sorting, airway flag independence from ASA grade.

---

### Scenario 7: Malignant Hyperthermia Susceptible Patient (Expected: Flags)

**Patient Profile:**
- Female, 25 years old, 65 kg, 168 cm (BMI 23.0)
- Elective appendicectomy
- No medical comorbidities
- Family history of malignant hyperthermia (father)
- Previous anaesthetic without problems (but was TIVA)

**Expected Result:**
- ASA Grade: I (MH susceptibility alone does not change ASA grade)
- Fired Rules: 0
- Additional Flags: FLAG-MH-001 (family MH history) - HIGH

**Validates:** Flag generation independent of ASA grading, MH flag priority.

---

### Scenario 8: Pregnant Patient with Allergies (Expected: ASA I + Flags)

**Patient Profile:**
- Female, 28 years old, 70 kg, 165 cm (BMI 25.7)
- Urgent appendicectomy
- Confirmed pregnancy, 20 weeks gestation
- Allergies: Penicillin (anaphylaxis), Latex (moderate rash)
- No other medical history

**Expected Result:**
- ASA Grade: I (pregnancy alone does not change ASA grade in this implementation)
- Fired Rules: 0
- Additional Flags should include:
  - FLAG-ALLERGY-ANAPH-Penicillin (HIGH)
  - FLAG-PREG-001 - Confirmed pregnancy 20 weeks (HIGH)
  - FLAG-ALLERGY-001 - 2 allergies documented (MEDIUM)

**Validates:** Pregnancy flagging, per-allergen anaphylaxis flags, allergy count flag.

---

### Scenario 9: Emergency Surgery with Anticoagulation (Expected: Multiple Flags)

**Patient Profile:**
- Male, 75 years old, 78 kg, 170 cm (BMI 27.0)
- Emergency laparotomy
- Atrial fibrillation on rivaroxaban
- Controlled hypertension
- Recent URTI
- GORD

**Expected Result:**
- ASA Grade: II
- Fired Rules: CV-001 (controlled HTN), CV-009 (arrhythmia), HM-002 (anticoagulants)
- Additional Flags should include:
  - FLAG-ANTICOAG-001 (on rivaroxaban) - HIGH
  - FLAG-EMERG-001 (emergency procedure) - HIGH
  - FLAG-GI-001 (GORD - aspiration risk) - MEDIUM
  - FLAG-URTI-001 (recent URTI) - MEDIUM

**Validates:** Emergency flag, anticoagulant + emergency combination, aspiration risk flag.

---

### Scenario 10: Elderly Patient with Maximum Comorbidities (Expected: ASA IV)

**Patient Profile:**
- Female, 85 years old, 95 kg, 155 cm (BMI 39.5)
- Elective hip replacement
- Uncontrolled hypertension
- Heart failure NYHA IV
- Moderate COPD
- CKD Stage 4
- Type 2 diabetes, poorly controlled, on insulin
- Previous stroke with residual weakness
- On warfarin
- Bleeding disorder (von Willebrand)
- Sickle cell trait
- Previous difficult airway
- Limited neck movement
- Family MH history
- Allergies: Morphine (anaphylaxis), Latex (moderate)
- Heavy alcohol use
- Exercise tolerance: unable (1 MET)
- GORD

**Expected Result:**
- ASA Grade: IV (from CV-007: Heart failure NYHA IV)
- Fired Rules: Should fire a large number of rules across multiple systems
- Additional Flags: Should generate many high-priority flags

**Validates:** Maximum comorbidity scenario, flag accumulation, priority sorting under high flag count.

---

## Boundary Condition Tests

| Condition | Boundary Value | Expected Behaviour |
|-----------|---------------|-------------------|
| BMI exactly 30.0 | 30.0 | Triggers OB-001 (BMI >= 30) |
| BMI exactly 40.0 | 40.0 | Triggers OB-002 (BMI >= 40) |
| Age exactly 80 | 80 | Does NOT trigger AG-001 (requires > 80) |
| Age 81 | 81 | Triggers AG-001 |
| MI 12 weeks ago | 12 | Does NOT trigger CV-004 (requires < 12) |
| MI 11 weeks ago | 11 | Triggers CV-004 |
| METs exactly 4 | 4 | Does NOT trigger FC-001 (requires < 4) |
| METs 3 | 3 | Triggers FC-001 |
| Female age 12 | 12 | Pregnancy step shown |
| Female age 55 | 55 | Pregnancy step shown |
| Female age 56 | 56 | Pregnancy step hidden |
| Male any age | any | Pregnancy step hidden |

---

## Regression Testing Checklist

When modifying any ASA rule or flag logic, re-run the following:

- [ ] `npx vitest run` - all 12 automated tests pass
- [ ] Scenario 1 - healthy patient returns ASA I
- [ ] Scenario 2 - ASA II multi-condition
- [ ] Scenario 3 - ASA III multi-system
- [ ] Scenario 4 - ASA IV cardiac
- [ ] Scenario 7 - MH flag without grade change
- [ ] Boundary condition for the modified rule
- [ ] No new TypeScript errors (`npx svelte-check`)

---

## Acceptance Criteria for Clinical Sign-Off

Before the system is deployed in a clinical environment, the following acceptance criteria should be met:

1. **All automated tests pass** with no failures.
2. **All 10 manual scenarios** produce the documented expected results.
3. **All boundary conditions** produce the documented expected behaviour.
4. **A qualified anaesthetist** has reviewed and approved the rule catalogue.
5. **The rule catalogue has been cross-referenced** against current ASA classification examples and national guidelines.
6. **Edge cases identified during clinical review** have been added to the test suite.
7. **The PDF report** accurately reflects all fired rules and flags.
8. **No patient data is persisted** beyond the browser session (privacy verification).
