# United Kingdom Maternity Certificate MAT B1

Maternity certificate issued by doctors or registered midwives to enable pregnant women to claim statutory maternity benefits.

The MAT B1 form is a UK maternity certificate used to establish pregnancy, document the expected week of confinement (EWC), and record actual birth dates. It enables claims for Statutory Maternity Pay (SMP), Maternity Allowance (MA), and Sure Start Maternity Grant (SSMG).

## Source

- **Form**: MAT B1 — Maternity Certificate
- **Issuing authority**: Doctors or registered midwives (NHS and private)
- **Governing body**: Department for Work and Pensions (DWP)
- **Guidance URL**: <https://www.gov.uk/government/publications/maternity-certificate-mat-b1-guidance-for-health-professionals/maternity-certificate-form-mat-b1-guidance-on-completion>

## Purpose

The MAT B1 certificate enables three benefits:

1. **Statutory Maternity Pay (SMP)** — from the employer
2. **Maternity Allowance (MA)** — from Jobcentre Plus
3. **Sure Start Maternity Grant (SSMG)** — from Jobcentre Plus

## Who Completes It

- **Doctors** — using their name and address stamp
- **Registered midwives** — including their Nursing and Midwifery Council (NMC) personal identification number and the expiry date of their NMC registration

The certificate must be issued **free of charge** to pregnant patients receiving clinical care.

## Timing

- Must be issued only when the healthcare professional is satisfied the patient is pregnant
- Must not be issued more than **20 weeks before** the expected week of confinement (EWC)

## Structure

### Front Page

| Field | Type |
| --- | --- |
| Patient's name | Text |

### Part A: Pre-Confinement (issued while patient is still pregnant)

| Field | Type |
| --- | --- |
| Expected date of confinement | Date (estimated as accurately as possible) |

The EWC date determines qualifying conditions and payment periods for both SMP and MA.

### Part B: Post-Confinement (completed after birth)

| Field | Type |
| --- | --- |
| Baby's date of birth | Date |
| Expected confinement date | Date |

Note: Entitlement still depends on the EWC regardless of when benefits were claimed.

### Issuer Validation

**For midwives:**

| Field | Type |
| --- | --- |
| NMC personal identification number | Text |
| NMC registration expiry date | Date |

**For doctors:**

| Field | Type |
| --- | --- |
| Name and address stamp | Stamp/Text |

### Certificate Details

| Field | Type |
| --- | --- |
| Unique certificate number | Pre-printed |

## Rules

- Must be completed **in ink**
- Must use forms that contain a **unique certificate number**
- Patient's name must appear **above Part A on the front page**
- **Duplicates**: Only issued to replace a lost or incomplete original; must be marked "DUPLICATE"
- **International**: MAT B1 forms are not available for use outside of the UK; workers abroad with UK employers require a letter from their doctor/midwife on official letterhead

## Steps

| # | Step | Section |
| --- | --- | --- |
| 1 | Patient Identification | Patient name on front page |
| 2 | Pre-Confinement Certificate | Part A — expected date of confinement |
| 3 | Post-Confinement Certificate | Part B — actual date of birth and expected date |
| 4 | Issuer Validation | Healthcare professional credentials |

## Ordering

- Forms ordered through HH Global Client Services
- Contact: dwp@hhglobal.com
- Note: Order forms reject symbols, special characters, or hyphens

## Directory structure

```
united-kingdom-maternity-certificate-mat-b1/
  front-end-patient-form-with-svelte/     # Patient questionnaire
  front-end-clinician-dashboard-with-svelte/  # Clinician dashboard
  full-stack-with-rust-axum-loco-tera-htmx-alpine/    # Full-stack option
```

## Technology

See [root index.md](../index.md) for technology stacks.
