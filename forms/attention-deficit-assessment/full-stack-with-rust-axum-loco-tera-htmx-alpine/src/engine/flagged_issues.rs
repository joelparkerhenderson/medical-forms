use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the likelihood score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-DRIVE-001: Driving safety concern ─────────────
    if matches!(data.functional_impact.driving_safety_concern, Some(3..=4)) {
        flags.push(AdditionalFlag {
            id: "FLAG-DRIVE-001".to_string(),
            category: "Safety".to_string(),
            message: "Driving safety concern - consider DVLA notification guidance".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SUBST-001: Active substance misuse ────────────
    if data.comorbidities.substance_use_current == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SUBST-001".to_string(),
            category: "Substance Use".to_string(),
            message: "Current substance use - assess for self-medication and consider impact on ADHD management".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MOOD-001: Mood disorder comorbidity ───────────
    if data.comorbidities.mood_disorder_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MOOD-001".to_string(),
            category: "Comorbidity".to_string(),
            message: "Mood disorder history - differential diagnosis required before ADHD treatment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-ANX-001: Anxiety comorbidity ───────────────────
    if data.comorbidities.anxiety_symptoms == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ANX-001".to_string(),
            category: "Comorbidity".to_string(),
            message: "Anxiety symptoms present - stimulants may exacerbate anxiety".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CARD-001: Cardiac screening for stimulants ────
    if data.current_management.cardiac_history == "yes"
        || data.current_management.family_cardiac_history == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CARD-001".to_string(),
            category: "Cardiac".to_string(),
            message: "Cardiac history present - ECG and cardiac assessment required before stimulant prescribing".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SLEEP-001: Sleep disorder ─────────────────────
    if data.comorbidities.sleep_disorder == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SLEEP-001".to_string(),
            category: "Comorbidity".to_string(),
            message: "Sleep disorder reported - assess contribution to attention difficulties".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-WORK-001: Academic/occupational impact ────────
    if matches!(data.functional_impact.work_performance_impact, Some(3..=4))
        || matches!(data.functional_impact.academic_impact, Some(3..=4))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-WORK-001".to_string(),
            category: "Functional Impact".to_string(),
            message: "Significant academic/occupational impairment - consider workplace/educational support referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-REL-001: Relationship impact ──────────────────
    if matches!(data.functional_impact.relationship_impact, Some(3..=4)) {
        flags.push(AdditionalFlag {
            id: "FLAG-REL-001".to_string(),
            category: "Functional Impact".to_string(),
            message: "Significant relationship impact - consider couples/family support".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-DEP-001: Depression comorbidity ───────────────
    if data.comorbidities.depression_symptoms == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DEP-001".to_string(),
            category: "Comorbidity".to_string(),
            message: "Depression symptoms present - consider concurrent treatment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-SUBHX-001: Substance use history ──────────────
    if data.comorbidities.substance_use_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SUBHX-001".to_string(),
            category: "Substance Use".to_string(),
            message: "History of substance use - consider non-stimulant options first".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-ASD-001: Autism spectrum traits ───────────────
    if data.comorbidities.autism_spectrum_traits == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ASD-001".to_string(),
            category: "Comorbidity".to_string(),
            message: "Autism spectrum traits reported - consider neurodevelopmental assessment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BP-001: Blood pressure concern ────────────────
    if data.current_management.blood_pressure_status == "elevated"
        || data.current_management.blood_pressure_status == "high"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Cardiac".to_string(),
            message: "Elevated blood pressure - monitor closely if starting stimulant medication".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CHILD-001: Childhood onset not confirmed ──────
    if data.developmental_history.childhood_symptoms_present != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CHILD-001".to_string(),
            category: "Developmental".to_string(),
            message: "Childhood symptom onset not confirmed - DSM-5 requires symptoms before age 12".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── FLAG-COLLAT-001: No collateral history ─────────────
    if data.clinical_review.collateral_history_obtained != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-COLLAT-001".to_string(),
            category: "Assessment Quality".to_string(),
            message: "No collateral history obtained - NICE guidelines recommend informant corroboration".to_string(),
            priority: "low".to_string(),
        });
    }

    // Sort: high > medium > low
    flags.sort_by_key(|f| match f.priority.as_str() {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });

    flags
}
