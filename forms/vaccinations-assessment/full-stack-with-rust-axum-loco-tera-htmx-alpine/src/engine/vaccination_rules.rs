use super::types::AssessmentData;
use super::utils::{childhood_score, adult_score, consent_score};

/// A declarative vaccination concern rule.
pub struct VaccinationRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All vaccination rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<VaccinationRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        VaccinationRule {
            id: "VAX-001",
            category: "Childhood",
            description: "MMR vaccination not given (0) - measles risk",
            concern_level: "high",
            evaluate: |d| d.childhood_vaccinations.mmr == Some(0),
        },
        VaccinationRule {
            id: "VAX-002",
            category: "Childhood",
            description: "Childhood vaccination completeness below 40%",
            concern_level: "high",
            evaluate: |d| childhood_score(d).is_some_and(|s| s < 40.0),
        },
        VaccinationRule {
            id: "VAX-003",
            category: "Contraindication",
            description: "Previous anaphylaxis to vaccine reported",
            concern_level: "high",
            evaluate: |d| d.contraindications_allergies.previous_anaphylaxis == "yes",
        },
        VaccinationRule {
            id: "VAX-004",
            category: "Clinical",
            description: "Immediate adverse reaction reported post-vaccination",
            concern_level: "high",
            evaluate: |d| d.clinical_review.immediate_reaction == "yes",
        },
        VaccinationRule {
            id: "VAX-005",
            category: "Consent",
            description: "Consent not given for vaccination",
            concern_level: "high",
            evaluate: |d| d.consent_information.consent_given == "no",
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        VaccinationRule {
            id: "VAX-006",
            category: "Childhood",
            description: "DTaP/IPV/Hib/HepB vaccination incomplete (partial)",
            concern_level: "medium",
            evaluate: |d| d.childhood_vaccinations.dtap_ipv_hib_hepb == Some(1),
        },
        VaccinationRule {
            id: "VAX-007",
            category: "Adult",
            description: "Influenza vaccination not current",
            concern_level: "medium",
            evaluate: |d| matches!(d.adult_vaccinations.influenza_annual, Some(0)),
        },
        VaccinationRule {
            id: "VAX-008",
            category: "Adult",
            description: "COVID-19 vaccination not given",
            concern_level: "medium",
            evaluate: |d| d.adult_vaccinations.covid19 == Some(0),
        },
        VaccinationRule {
            id: "VAX-009",
            category: "Adult",
            description: "Adult vaccination completeness below 40%",
            concern_level: "medium",
            evaluate: |d| adult_score(d).is_some_and(|s| s < 40.0),
        },
        VaccinationRule {
            id: "VAX-010",
            category: "Travel",
            description: "Travel planned but no travel vaccinations recorded",
            concern_level: "medium",
            evaluate: |d| {
                d.travel_vaccinations.travel_planned == "yes"
                    && d.travel_vaccinations.hepatitis_a.is_none()
                    && d.travel_vaccinations.hepatitis_b.is_none()
                    && d.travel_vaccinations.typhoid.is_none()
                    && d.travel_vaccinations.yellow_fever.is_none()
                    && d.travel_vaccinations.rabies.is_none()
                    && d.travel_vaccinations.japanese_encephalitis.is_none()
            },
        },
        VaccinationRule {
            id: "VAX-011",
            category: "Occupational",
            description: "Healthcare worker without hepatitis B vaccination",
            concern_level: "medium",
            evaluate: |d| {
                d.occupational_vaccinations.healthcare_worker == "yes"
                    && d.occupational_vaccinations.hepatitis_b_occupational == Some(0)
            },
        },
        VaccinationRule {
            id: "VAX-012",
            category: "Contraindication",
            description: "Patient is pregnant - live vaccine contraindication",
            concern_level: "medium",
            evaluate: |d| d.contraindications_allergies.pregnant == "yes",
        },
        VaccinationRule {
            id: "VAX-013",
            category: "History",
            description: "Patient is immunocompromised - requires specialist review",
            concern_level: "medium",
            evaluate: |d| d.immunization_history.immunocompromised == "yes",
        },
        VaccinationRule {
            id: "VAX-014",
            category: "Consent",
            description: "Consent quality score below 50% - inadequate information provision",
            concern_level: "medium",
            evaluate: |d| consent_score(d).is_some_and(|s| s < 50.0),
        },
        VaccinationRule {
            id: "VAX-015",
            category: "Clinical",
            description: "Catch-up schedule needed but no referral made",
            concern_level: "medium",
            evaluate: |d| {
                d.clinical_review.catch_up_schedule_needed == "yes"
                    && d.clinical_review.referral_needed != "yes"
            },
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        VaccinationRule {
            id: "VAX-016",
            category: "Childhood",
            description: "All childhood vaccinations complete",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.childhood_vaccinations.dtap_ipv_hib_hepb,
                    d.childhood_vaccinations.pneumococcal,
                    d.childhood_vaccinations.rotavirus,
                    d.childhood_vaccinations.meningitis_b,
                    d.childhood_vaccinations.mmr,
                    d.childhood_vaccinations.hib_menc,
                    d.childhood_vaccinations.preschool_booster,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v == 2)
            },
        },
        VaccinationRule {
            id: "VAX-017",
            category: "Adult",
            description: "All adult vaccinations complete",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.adult_vaccinations.td_ipv_booster,
                    d.adult_vaccinations.hpv,
                    d.adult_vaccinations.meningitis_acwy,
                    d.adult_vaccinations.influenza_annual,
                    d.adult_vaccinations.covid19,
                    d.adult_vaccinations.shingles,
                    d.adult_vaccinations.pneumococcal_ppv,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v == 2)
            },
        },
        VaccinationRule {
            id: "VAX-018",
            category: "Consent",
            description: "All consent quality items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.consent_information.information_provided,
                    d.consent_information.risks_explained,
                    d.consent_information.benefits_explained,
                    d.consent_information.questions_answered,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        VaccinationRule {
            id: "VAX-019",
            category: "History",
            description: "Vaccination record available and verified",
            concern_level: "low",
            evaluate: |d| d.immunization_history.has_vaccination_record == "yes",
        },
        VaccinationRule {
            id: "VAX-020",
            category: "Clinical",
            description: "Post-vaccination observation completed satisfactorily (rated 4-5)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.post_vaccination_observation, Some(4..=5)),
        },
    ]
}
