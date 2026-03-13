# Heart Health Check: Documentation

## Overview

The NHS Heart Health Check is a cardiovascular risk assessment programme for adults aged 40–74 in England. This implementation uses a simplified QRISK3-based scoring system to estimate 10-year cardiovascular disease (CVD) risk and calculate heart age.

## Risk assessment methodology

The scoring engine assigns points based on clinical and lifestyle risk factors, then maps the total to a 10-year CVD risk percentage via an exponential function calibrated so ~8 points maps to ~3%, ~15 points to ~6%, ~25 points to ~12%, and ~35+ points to ~25%+. The result is clamped to 0.1–95.0%.

### Risk categories

| Category | 10-Year Risk | Clinical action                            |
| -------- | ------------ | ------------------------------------------ |
| Low      | <10%         | Lifestyle advice                           |
| Moderate | 10–19.9%     | Lifestyle modification, consider statin    |
| High     | >=20%        | Statin therapy, intensive risk management  |

### Heart age

Heart age is the age at which an otherwise-average person (non-smoker, systolic BP 120 mmHg, TC/HDL ratio 4.0, same sex) would have the same 10-year risk. A heart age significantly above chronological age motivates behaviour change.

## Data model

The assessment data is structured into 10 sections matching the 10-step wizard:

1. **Patient Information** - name, DOB, NHS number, contact, GP details
2. **Demographics & Ethnicity** - age, sex, ethnicity, Townsend deprivation score
3. **Blood Pressure** - systolic, diastolic, SD, treatment status
4. **Cholesterol** - total cholesterol, HDL, TC/HDL ratio, statin status
5. **Medical Conditions** - diabetes, AF, RA, CKD, migraine, SMI, ED, medications
6. **Family History** - CVD under 60, relationship, diabetes history
7. **Smoking & Alcohol** - smoking status, quantity, alcohol use, AUDIT
8. **Physical Activity & Diet** - activity minutes, intensity, diet quality
9. **Body Measurements** - height, weight, BMI, waist circumference
10. **Review & Calculate** - clinician name, date, notes, AUDIT score

## References

- [NHS Health Check programme](https://www.nhs.uk/conditions/nhs-health-check/)
- [QRISK3 algorithm](https://qrisk.org/three/)
- [NICE CG181: Cardiovascular disease risk assessment](https://www.nice.org.uk/guidance/cg181)
