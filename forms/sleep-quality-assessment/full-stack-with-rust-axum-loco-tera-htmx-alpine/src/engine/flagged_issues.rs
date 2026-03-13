use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{calculate_stop_bang_score, calculate_ess_score};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the sleep quality score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── High STOP-BANG score ────────────────────────────────
    if calculate_stop_bang_score(data) >= 5 {
        flags.push(AdditionalFlag {
            id: "FLAG-APNOEA-001".to_string(),
            category: "Apnoea".to_string(),
            message: "High STOP-BANG score - sleep study referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Witnessed apnoeas ───────────────────────────────────
    if data.sleep_apnoea_screening.witnessed_apnoeas == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-APNOEA-002".to_string(),
            category: "Apnoea".to_string(),
            message: "Witnessed apnoeas reported - urgent assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Driving safety concern ──────────────────────────────
    if matches!(data.impact_assessment.driving_safety, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-DRIVE-001".to_string(),
            category: "Safety".to_string(),
            message: "Sleepiness affecting driving safety - DVLA guidance review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Very poor sleep quality ─────────────────────────────
    let psqi = super::utils::calculate_psqi_score(data);
    if psqi > 15 {
        flags.push(AdditionalFlag {
            id: "FLAG-PSQI-001".to_string(),
            category: "PSQI".to_string(),
            message: "Very poor sleep quality (PSQI >15) - comprehensive sleep assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe excessive sleepiness ─────────────────────────
    if calculate_ess_score(data) >= 16 {
        flags.push(AdditionalFlag {
            id: "FLAG-ESS-001".to_string(),
            category: "ESS".to_string(),
            message: "Severe excessive daytime sleepiness (ESS >=16)".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Long-term hypnotic use ──────────────────────────────
    if !data.medical_medications.sleep_medications.is_empty()
        && data.medical_medications.sleep_medications != "none"
        && (data.medical_medications.medication_duration == "moreThan6Months"
            || data.medical_medications.medication_duration == "moreThan12Months")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Long-term hypnotic use - consider gradual withdrawal plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Multiple sleep medications ──────────────────────────
    if data.medical_medications.sleep_medications.contains(',') {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medication".to_string(),
            message: "Multiple sleep medications reported - polypharmacy review needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Mental health comorbidity ───────────────────────────
    if data.medical_medications.mental_health_condition == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MOOD-001".to_string(),
            category: "Mental Health".to_string(),
            message: "Sleep disorder with mental health comorbidity - integrated care approach needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Chronic pain disrupting sleep ───────────────────────
    if data.medical_medications.chronic_pain_condition == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain".to_string(),
            message: "Chronic pain disrupting sleep - pain management referral may be needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Significant restless legs ───────────────────────────
    if matches!(data.sleep_disturbances.leg_restlessness, Some(2..=3)) {
        flags.push(AdditionalFlag {
            id: "FLAG-RLS-001".to_string(),
            category: "Restless Legs".to_string(),
            message: "Significant restless legs symptoms - consider iron studies and neurology referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Shift work sleep disorder ───────────────────────────
    if data.medical_medications.shift_work == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-WORK-001".to_string(),
            category: "Shift Work".to_string(),
            message: "Shift work affecting sleep - occupational health review recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Accident risk from sleepiness ───────────────────────
    if data.impact_assessment.accident_risk == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SAFETY-001".to_string(),
            category: "Safety".to_string(),
            message: "Patient reports increased accident risk from sleepiness".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Paediatric sleep disorder ───────────────────────────
    // Flagged if date of birth suggests age < 18 (simplified: check if field contains indication)
    if data.patient_information.date_of_birth.contains("child")
        || data.patient_information.date_of_birth.contains("paediatric")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CHILD-001".to_string(),
            category: "Paediatric".to_string(),
            message: "Paediatric patient - specialist paediatric sleep service referral needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Chronic insomnia ────────────────────────────────────
    if data.sleep_disturbances.difficulty_falling_asleep == Some(3)
        && data.sleep_habits.sleep_latency_minutes.is_some_and(|m| m > 30)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-INSOMNIA-001".to_string(),
            category: "Insomnia".to_string(),
            message: "Chronic insomnia pattern - consider CBT-I referral".to_string(),
            priority: "medium".to_string(),
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
