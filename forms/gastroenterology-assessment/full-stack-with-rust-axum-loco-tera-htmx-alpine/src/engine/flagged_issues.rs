use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable clinical alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-TWW-001: Two-week wait cancer pathway ──────────
    if (data.alarm_features.dysphagia_present == "yes"
        || data.alarm_features.gi_bleeding == "yes"
        || data.alarm_features.palpable_mass == "yes")
        && data.alarm_features.age_over_50_new_symptoms == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-TWW-001".to_string(),
            category: "Cancer Pathway".to_string(),
            message: "Two-week wait cancer pathway referral indicated - alarm features in patient over 50".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-ENDO-001: Urgent endoscopy ─────────────────────
    if matches!(data.upper_gi_symptoms.dysphagia_grade, Some(3..=4))
        || (data.alarm_features.gi_bleeding == "yes"
            && data.alarm_features.gi_bleeding_type == "haematemesis")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ENDO-001".to_string(),
            category: "Endoscopy".to_string(),
            message: "Urgent endoscopy indicated - progressive dysphagia or haematemesis".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-COEL-001: Coeliac screening ────────────────────
    if data.lower_gi_symptoms.bowel_habit_change == "diarrhoea"
        && data.alarm_features.iron_deficiency_anaemia == "yes"
        && data.investigations.coeliac_screen != "done"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-COEL-001".to_string(),
            category: "Coeliac".to_string(),
            message: "Coeliac screening recommended - diarrhoea with iron deficiency anaemia".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-HP-001: H. pylori testing ──────────────────────
    if (data.upper_gi_symptoms.epigastric_pain.is_some_and(|v| v >= 2)
        || data.upper_gi_symptoms.heartburn_severity.is_some_and(|v| v >= 2))
        && data.investigations.h_pylori_test != "done"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-HP-001".to_string(),
            category: "H. pylori".to_string(),
            message: "H. pylori testing recommended for persistent upper GI symptoms".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CIRR-001: Liver cirrhosis concern ──────────────
    if data.liver_assessment.ascites == "yes"
        || (data.liver_assessment.alt_u_l.is_some_and(|v| v > 100.0)
            && data.liver_assessment.bilirubin_umol_l.is_some_and(|v| v > 40.0))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CIRR-001".to_string(),
            category: "Liver".to_string(),
            message: "Liver cirrhosis indicators present - specialist hepatology review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-NUTR-001: Malnutrition risk ────────────────────
    if data.nutritional_assessment.must_screening_score.is_some_and(|v| v >= 2)
        || data.nutritional_assessment.albumin_g_l.is_some_and(|v| v < 30.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-NUTR-001".to_string(),
            category: "Nutrition".to_string(),
            message: "High malnutrition risk - dietitian referral recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-IBD-001: IBD flare ─────────────────────────────
    if data.clinical_review.ibd_activity_index.is_some_and(|v| v >= 3)
        && (data.lower_gi_symptoms.rectal_bleeding == "yes"
            || data.lower_gi_symptoms.nocturnal_symptoms == "yes")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-IBD-001".to_string(),
            category: "IBD".to_string(),
            message: "IBD flare suspected - elevated activity index with rectal bleeding or nocturnal symptoms".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-OBST-001: Bowel obstruction concern ────────────
    if data.upper_gi_symptoms.vomiting_frequency.is_some_and(|v| v >= 3)
        && data.lower_gi_symptoms.bowel_habit_change == "constipation"
        && data.lower_gi_symptoms.abdominal_pain_severity.is_some_and(|v| v >= 3)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-OBST-001".to_string(),
            category: "Obstruction".to_string(),
            message: "Bowel obstruction concern - vomiting with constipation and severe abdominal pain".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-ALC-001: Alcohol-related liver disease ─────────
    if data.liver_assessment.alcohol_units_per_week.is_some_and(|v| v > 14)
        && (data.liver_assessment.alt_u_l.is_some_and(|v| v > 40.0)
            || data.liver_assessment.ggt_u_l.is_some_and(|v| v > 60.0))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ALC-001".to_string(),
            category: "Alcohol".to_string(),
            message: "Alcohol-related liver disease risk - elevated alcohol intake with abnormal liver enzymes".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-NSAID-001: NSAID gastropathy risk ──────────────
    if data.current_treatment.nsaid_use == "yes"
        && (data.upper_gi_symptoms.epigastric_pain.is_some_and(|v| v >= 2)
            || data.alarm_features.gi_bleeding == "yes")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-NSAID-001".to_string(),
            category: "Medication".to_string(),
            message: "NSAID gastropathy risk - consider stopping NSAIDs and adding PPI cover".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-ANTICOAG-001: Anticoagulant with GI bleeding ───
    if data.current_treatment.anticoagulant_use == "yes"
        && data.alarm_features.gi_bleeding == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ANTICOAG-001".to_string(),
            category: "Medication".to_string(),
            message: "GI bleeding on anticoagulant therapy - urgent haematology and GI review".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FHX-001: Family cancer history ─────────────────
    if data.gi_history.family_cancer_history == "yes"
        && data.lower_gi_symptoms.bowel_habit_change != ""
        && data.lower_gi_symptoms.bowel_habit_change != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FHX-001".to_string(),
            category: "Family History".to_string(),
            message: "Family history of GI cancer with bowel habit change - consider surveillance".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BMI-001: Low BMI ───────────────────────────────
    if data.nutritional_assessment.bmi.is_some_and(|v| v < 18.5) {
        flags.push(AdditionalFlag {
            id: "FLAG-BMI-001".to_string(),
            category: "Nutrition".to_string(),
            message: "BMI below 18.5 - underweight, nutritional support needed".to_string(),
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
