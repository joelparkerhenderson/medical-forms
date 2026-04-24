//! Clinician pre-op ASA + composite-risk + safety-flag engine.
//!
//! Pure functions over [`ClinicianAssessment`]; no I/O, no time-dependent
//! logic. The TypeScript engine at
//! `../front-end-form-with-svelte/src/lib/engine/` is authoritative; rule
//! IDs kept in parity with that catalogue.

use crate::types::{
    ClinicianAssessment, CompositeRisk, FiredRule, GradingResult, SafetyFlag,
};

/// Run the composite grader: ASA rules, override, composite-risk band, and
/// safety flags.
pub fn grade(data: &ClinicianAssessment) -> GradingResult {
    let fired_rules = fire_asa_rules(data);
    let computed_asa = fired_rules.iter().map(|r| r.asa_grade).max().unwrap_or(1);
    let override_asa = data.clinician_asa_override.filter(|g| (1..=6).contains(g));
    let final_asa = override_asa.unwrap_or(computed_asa);

    let safety_flags = detect_safety_flags(data);
    let composite_risk = compute_composite(final_asa, data, &safety_flags);

    GradingResult {
        asa_grade: computed_asa,
        asa_grade_override: override_asa,
        final_asa_grade: final_asa,
        composite_risk,
        fired_rules,
        safety_flags,
    }
}

fn fire_asa_rules(d: &ClinicianAssessment) -> Vec<FiredRule> {
    let mut out: Vec<FiredRule> = Vec::new();

    // ASA II — mild systemic disease (one common trigger: controlled IHD).
    if d.ischaemic_heart_disease == "yes" {
        out.push(FiredRule {
            rule_id: "R-ASA-II-01",
            description: "History of ischaemic heart disease",
            asa_grade: 2,
        });
    }
    if d.diabetes == "controlled" {
        out.push(FiredRule {
            rule_id: "R-ASA-II-02",
            description: "Well-controlled diabetes",
            asa_grade: 2,
        });
    }

    // ASA III — severe systemic disease.
    if d.heart_failure == "yes" {
        out.push(FiredRule {
            rule_id: "R-ASA-III-01",
            description: "Symptomatic heart failure",
            asa_grade: 3,
        });
    }
    if d.copd == "severe" {
        out.push(FiredRule {
            rule_id: "R-ASA-III-02",
            description: "Severe COPD",
            asa_grade: 3,
        });
    }
    if let Some(hba1c) = d.hba1c_percent {
        if hba1c > 9.0 {
            out.push(FiredRule {
                rule_id: "R-ASA-III-03",
                description: "Uncontrolled diabetes (HbA1c > 9%)",
                asa_grade: 3,
            });
        }
    }
    if let Some(egfr) = d.egfr {
        if egfr < 30 {
            out.push(FiredRule {
                rule_id: "R-ASA-III-04",
                description: "Severe renal impairment (eGFR < 30)",
                asa_grade: 3,
            });
        }
    }

    // ASA IV — severe systemic disease that is a constant threat to life.
    if let Some(ef) = d.echo_ef_percent {
        if ef < 40 {
            out.push(FiredRule {
                rule_id: "R-ASA-IV-01",
                description: "Ejection fraction < 40%",
                asa_grade: 4,
            });
        }
    }
    if let Some(hb) = d.haemoglobin_g_per_l {
        if hb < 80 {
            out.push(FiredRule {
                rule_id: "R-ASA-IV-02",
                description: "Severe anaemia (Hb < 80 g/L)",
                asa_grade: 4,
            });
        }
    }

    out
}

fn detect_safety_flags(d: &ClinicianAssessment) -> Vec<SafetyFlag> {
    let mut out: Vec<SafetyFlag> = Vec::new();

    if matches!(d.mallampati_class, Some(c) if c >= 3) || d.difficult_intubation_history == "yes" {
        out.push(SafetyFlag {
            flag_id: "F-AIRWAY",
            description: "Predicted difficult airway",
            priority: "high",
        });
    }
    if matches!(d.spo2, Some(v) if v < 92) {
        out.push(SafetyFlag {
            flag_id: "F-RESP-SPO2",
            description: "SpO₂ < 92% on room air",
            priority: "high",
        });
    }
    if matches!(d.echo_ef_percent, Some(v) if v < 40) {
        out.push(SafetyFlag {
            flag_id: "F-CARDIAC-EF",
            description: "Severe cardiac: ejection fraction < 40%",
            priority: "high",
        });
    }
    if matches!(d.inr, Some(v) if v > 1.5) && d.on_anticoagulant != "yes" {
        out.push(SafetyFlag {
            flag_id: "F-COAG",
            description: "Coagulopathy (INR > 1.5 off anticoagulants)",
            priority: "high",
        });
    }
    if matches!(d.haemoglobin_g_per_l, Some(v) if v < 80) {
        out.push(SafetyFlag {
            flag_id: "F-ANAEMIA",
            description: "Severe anaemia (Hb < 80 g/L)",
            priority: "high",
        });
    }
    if matches!(d.clinical_frailty_scale, Some(v) if v >= 7) {
        out.push(SafetyFlag {
            flag_id: "F-FRAILTY",
            description: "Severe frailty (CFS ≥ 7)",
            priority: "high",
        });
    }
    if matches!(d.recent_covid_weeks, Some(w) if w < 7) {
        out.push(SafetyFlag {
            flag_id: "F-COVID",
            description: "Recent COVID-19 (< 7 weeks)",
            priority: "high",
        });
    }
    if d.adequately_fasted == "no" {
        out.push(SafetyFlag {
            flag_id: "F-FAST",
            description: "Not adequately fasted",
            priority: "high",
        });
    }
    if d.latex_allergy == "yes" {
        out.push(SafetyFlag {
            flag_id: "F-LATEX",
            description: "Latex allergy",
            priority: "medium",
        });
    }

    out
}

fn compute_composite(
    asa: u8,
    d: &ClinicianAssessment,
    flags: &[SafetyFlag],
) -> CompositeRisk {
    if asa >= 4
        || matches!(d.clinical_frailty_scale, Some(v) if v >= 7)
        || flags.iter().any(|f| f.flag_id == "F-AIRWAY")
            && flags.iter().any(|f| f.flag_id == "F-CARDIAC-EF")
    {
        return CompositeRisk::Critical;
    }
    if asa == 3 || matches!(d.mallampati_class, Some(c) if c >= 3) {
        return CompositeRisk::High;
    }
    if asa == 2 || flags.iter().any(|f| f.priority == "medium") {
        return CompositeRisk::Moderate;
    }
    CompositeRisk::Low
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn healthy_patient_is_asa_i_low_risk() {
        let d = ClinicianAssessment::default();
        let r = grade(&d);
        assert_eq!(r.asa_grade, 1);
        assert_eq!(r.final_asa_grade, 1);
        assert_eq!(r.composite_risk, CompositeRisk::Low);
        assert!(r.fired_rules.is_empty());
    }

    #[test]
    fn low_ef_fires_asa_iv_and_critical_composite() {
        let mut d = ClinicianAssessment::default();
        d.echo_ef_percent = Some(30);
        let r = grade(&d);
        assert_eq!(r.final_asa_grade, 4);
        assert_eq!(r.composite_risk, CompositeRisk::Critical);
        assert!(r.safety_flags.iter().any(|f| f.flag_id == "F-CARDIAC-EF"));
    }

    #[test]
    fn clinician_override_wins() {
        let mut d = ClinicianAssessment::default();
        d.ischaemic_heart_disease = "yes".into();
        d.clinician_asa_override = Some(3);
        let r = grade(&d);
        assert_eq!(r.asa_grade, 2);
        assert_eq!(r.final_asa_grade, 3);
    }

    #[test]
    fn mallampati_iv_fires_airway_flag_and_high_composite() {
        let mut d = ClinicianAssessment::default();
        d.mallampati_class = Some(4);
        let r = grade(&d);
        assert!(r.safety_flags.iter().any(|f| f.flag_id == "F-AIRWAY"));
        assert_eq!(r.composite_risk, CompositeRisk::High);
    }

    #[test]
    fn rule_ids_are_unique() {
        let mut d = ClinicianAssessment::default();
        d.ischaemic_heart_disease = "yes".into();
        d.heart_failure = "yes".into();
        d.copd = "severe".into();
        d.echo_ef_percent = Some(20);
        let r = grade(&d);
        let ids: Vec<&str> = r.fired_rules.iter().map(|r| r.rule_id).collect();
        let mut dedup = ids.clone();
        dedup.sort();
        dedup.dedup();
        assert_eq!(ids.len(), dedup.len());
    }
}
