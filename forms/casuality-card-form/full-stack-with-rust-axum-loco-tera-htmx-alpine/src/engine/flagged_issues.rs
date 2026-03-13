use crate::engine::types::{AdditionalFlag, AssessmentData};

/// Detect safety-critical flags for clinical review.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // NEWS2 >= 7 (critical) — checked at report time after scoring
    // (This function checks clinical data independent of NEWS2 score)

    // Safeguarding concerns
    if data.safeguarding.safeguarding_concern == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SAFEGUARD".to_string(),
            category: "Safeguarding".to_string(),
            message: "Safeguarding concern identified".to_string(),
            priority: "critical".to_string(),
        });
    }

    // Allergies with anaphylaxis history
    for allergy in &data.allergies {
        if allergy.severity.to_lowercase() == "anaphylaxis"
            || allergy.severity.to_lowercase() == "severe"
        {
            flags.push(AdditionalFlag {
                id: "FLAG-ALLERGY-SEVERE".to_string(),
                category: "Allergy".to_string(),
                message: format!("Severe/anaphylaxis allergy: {}", allergy.allergen),
                priority: "critical".to_string(),
            });
        }
    }

    // Any allergies present
    if !data.allergies.is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-ALLERGY".to_string(),
            category: "Allergy".to_string(),
            message: format!("{} allergy/allergies recorded", data.allergies.len()),
            priority: "medium".to_string(),
        });
    }

    // Anticoagulant use (check medications)
    for med in &data.medications {
        let name_lower = med.name.to_lowercase();
        if name_lower.contains("warfarin")
            || name_lower.contains("rivaroxaban")
            || name_lower.contains("apixaban")
            || name_lower.contains("edoxaban")
            || name_lower.contains("dabigatran")
            || name_lower.contains("heparin")
            || name_lower.contains("enoxaparin")
            || name_lower.contains("anticoagulant")
        {
            flags.push(AdditionalFlag {
                id: "FLAG-ANTICOAGULANT".to_string(),
                category: "Medication".to_string(),
                message: format!("On anticoagulant: {}", med.name),
                priority: "high".to_string(),
            });
        }
    }

    // GCS <= 8 (unconscious patient)
    if let Some(gcs) = data.primary_survey.gcs_total {
        if gcs <= 8 {
            flags.push(AdditionalFlag {
                id: "FLAG-GCS-LOW".to_string(),
                category: "Consciousness".to_string(),
                message: format!("GCS {} - unconscious patient", gcs),
                priority: "critical".to_string(),
            });
        }
    }

    // Abnormal pupil reactivity
    if data.vital_signs.pupil_left_reactive == "no" || data.vital_signs.pupil_right_reactive == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-PUPIL".to_string(),
            category: "Neurological".to_string(),
            message: "Abnormal pupil reactivity".to_string(),
            priority: "high".to_string(),
        });
    }

    // Active haemorrhage
    if data.primary_survey.haemorrhage == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-HAEMORRHAGE".to_string(),
            category: "Circulation".to_string(),
            message: "Active haemorrhage identified".to_string(),
            priority: "critical".to_string(),
        });
    }

    // Compromised/obstructed airway
    let airway = data.primary_survey.airway_status.to_lowercase();
    if airway == "compromised" || airway == "obstructed" {
        flags.push(AdditionalFlag {
            id: "FLAG-AIRWAY".to_string(),
            category: "Airway".to_string(),
            message: format!("Airway {}", data.primary_survey.airway_status),
            priority: "critical".to_string(),
        });
    }

    // Pregnancy
    if data.demographics.sex.to_lowercase() == "female" {
        if let Some(ref pregnancy_test) = Some(&data.investigations.pregnancy_test) {
            if pregnancy_test.to_lowercase() == "positive" {
                flags.push(AdditionalFlag {
                    id: "FLAG-PREGNANCY".to_string(),
                    category: "Pregnancy".to_string(),
                    message: "Positive pregnancy test".to_string(),
                    priority: "high".to_string(),
                });
            }
        }
    }

    // Mental Health Act section
    let mha = data.safeguarding.mental_health_act_status.to_lowercase();
    if !mha.is_empty() && mha != "none" && mha != "n/a" {
        flags.push(AdditionalFlag {
            id: "FLAG-MHA".to_string(),
            category: "Mental Health".to_string(),
            message: format!("Mental Health Act status: {}", data.safeguarding.mental_health_act_status),
            priority: "high".to_string(),
        });
    }

    // Non-reactive consciousness (AVPU not alert)
    let consciousness = data.vital_signs.consciousness_level.to_lowercase();
    if !consciousness.is_empty() && consciousness != "alert" {
        flags.push(AdditionalFlag {
            id: "FLAG-CONSCIOUSNESS".to_string(),
            category: "Consciousness".to_string(),
            message: format!("Consciousness level: {}", data.vital_signs.consciousness_level),
            priority: "high".to_string(),
        });
    }

    // C-spine immobilisation
    if data.primary_survey.c_spine_immobilised == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CSPINE".to_string(),
            category: "Trauma".to_string(),
            message: "C-spine immobilisation in place".to_string(),
            priority: "medium".to_string(),
        });
    }

    flags
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_flags_on_default() {
        let data = AssessmentData::default();
        let flags = detect_additional_flags(&data);
        assert!(flags.is_empty());
    }

    #[test]
    fn test_safeguarding_flag() {
        let mut data = AssessmentData::default();
        data.safeguarding.safeguarding_concern = "yes".to_string();
        let flags = detect_additional_flags(&data);
        assert!(flags.iter().any(|f| f.id == "FLAG-SAFEGUARD"));
    }

    #[test]
    fn test_severe_allergy_flag() {
        let mut data = AssessmentData::default();
        data.allergies.push(crate::engine::types::Allergy {
            allergen: "Penicillin".to_string(),
            reaction: "Anaphylaxis".to_string(),
            severity: "anaphylaxis".to_string(),
        });
        let flags = detect_additional_flags(&data);
        assert!(flags.iter().any(|f| f.id == "FLAG-ALLERGY-SEVERE"));
        assert!(flags.iter().any(|f| f.id == "FLAG-ALLERGY"));
    }

    #[test]
    fn test_gcs_low_flag() {
        let mut data = AssessmentData::default();
        data.primary_survey.gcs_total = Some(6);
        let flags = detect_additional_flags(&data);
        assert!(flags.iter().any(|f| f.id == "FLAG-GCS-LOW"));
    }

    #[test]
    fn test_airway_compromised_flag() {
        let mut data = AssessmentData::default();
        data.primary_survey.airway_status = "compromised".to_string();
        let flags = detect_additional_flags(&data);
        assert!(flags.iter().any(|f| f.id == "FLAG-AIRWAY"));
    }

    #[test]
    fn test_haemorrhage_flag() {
        let mut data = AssessmentData::default();
        data.primary_survey.haemorrhage = "yes".to_string();
        let flags = detect_additional_flags(&data);
        assert!(flags.iter().any(|f| f.id == "FLAG-HAEMORRHAGE"));
    }

    #[test]
    fn test_anticoagulant_flag() {
        let mut data = AssessmentData::default();
        data.medications.push(crate::engine::types::Medication {
            name: "Warfarin".to_string(),
            dose: "5mg".to_string(),
            frequency: "daily".to_string(),
        });
        let flags = detect_additional_flags(&data);
        assert!(flags.iter().any(|f| f.id == "FLAG-ANTICOAGULANT"));
    }
}
