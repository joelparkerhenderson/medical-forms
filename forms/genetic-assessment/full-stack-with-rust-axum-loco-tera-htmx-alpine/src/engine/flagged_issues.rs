use super::types::{AdditionalFlag, AssessmentData};
use super::utils::count_affected_family_cancers;

/// Detects additional flags that should be highlighted for the genetic counsellor,
/// independent of the risk score. These are safety-critical or clinically
/// significant alerts. 14 flags total.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-GEN-001: Urgent cancer genetics referral ────────
    if data.referral_reason.urgency == "emergency"
        && !data.personal_medical_history.cancer_type.trim().is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-001".to_string(),
            category: "Urgent Referral".to_string(),
            message: "Emergency cancer genetics referral - expedited assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-002: Cascade testing needed ─────────────────
    if data.clinical_review.cascade_testing_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-002".to_string(),
            category: "Cascade Testing".to_string(),
            message: "Cascade testing required for at-risk family members".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-003: Reproductive counselling needed ────────
    if data.reproductive_genetics.prenatal_testing_wishes == "yes"
        || data.reproductive_genetics.previous_affected_child == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-003".to_string(),
            category: "Reproductive Counselling".to_string(),
            message: "Reproductive genetic counselling indicated - prenatal or preimplantation testing may be relevant".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-004: Psychological support needed ───────────
    if data.psychological_impact.psychological_readiness == "notReady"
        || data.psychological_impact.support_needs == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-004".to_string(),
            category: "Psychological Support".to_string(),
            message: "Patient may need psychological support before or during genetic testing process".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-GEN-005: Insurance implications discussed ───────
    if data.psychological_impact.insurance_implications == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-005".to_string(),
            category: "Insurance Implications".to_string(),
            message: format!(
                "Insurance implications concern reported: {} - ensure Genetic Information Nondiscrimination provisions discussed",
                if data.psychological_impact.insurance_implications_details.trim().is_empty() {
                    "details not specified"
                } else {
                    &data.psychological_impact.insurance_implications_details
                }
            ),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-GEN-006: Predictive testing without support ─────
    if data.psychological_impact.genetic_counselling != "yes"
        && data.genetic_testing_status.known_familial_variant == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-006".to_string(),
            category: "Predictive Testing".to_string(),
            message: "Predictive testing considered without prior genetic counselling - counselling strongly recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-007: Confirmed pathogenic BRCA variant ──────
    if data.cancer_risk_assessment.brca_result == "positive" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-007".to_string(),
            category: "BRCA Positive".to_string(),
            message: "BRCA1/2 pathogenic variant confirmed - initiate risk management protocol and cascade testing".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-008: Lynch syndrome confirmed ───────────────
    if data.cancer_risk_assessment.lynch_result == "positive" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-008".to_string(),
            category: "Lynch Positive".to_string(),
            message: "Lynch syndrome confirmed - initiate colonoscopy surveillance and cascade testing".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-009: Consanguinity ──────────────────────────
    if data.reproductive_genetics.consanguinity == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-009".to_string(),
            category: "Consanguinity".to_string(),
            message: "Consanguineous relationship reported - increased risk of autosomal recessive conditions".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-GEN-010: Sudden cardiac death in family ─────────
    if data.cardiac_genetic_risk.sudden_cardiac_death == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-010".to_string(),
            category: "Cardiac Genetics".to_string(),
            message: "Sudden cardiac death in family - urgent cardiac genetic evaluation recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-011: VUS requiring periodic review ──────────
    if data.genetic_testing_status.variants_of_uncertain_significance == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-011".to_string(),
            category: "VUS Review".to_string(),
            message: format!(
                "Variant of uncertain significance: {} - periodic reclassification review recommended",
                if data.genetic_testing_status.vus_details.trim().is_empty() {
                    "details not specified"
                } else {
                    &data.genetic_testing_status.vus_details
                }
            ),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-GEN-012: Family cancer cluster ──────────────────
    if count_affected_family_cancers(data) >= 3 {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-012".to_string(),
            category: "Family Cancer Cluster".to_string(),
            message: format!(
                "{} family members with cancer history - consider hereditary cancer syndrome evaluation",
                count_affected_family_cancers(data)
            ),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-013: Bilateral cancer ───────────────────────
    if data.personal_medical_history.bilateral_cancer == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-013".to_string(),
            category: "Bilateral Cancer".to_string(),
            message: "Bilateral cancer reported - high suspicion for hereditary cancer predisposition".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GEN-014: Family communication concerns ──────────
    if data.psychological_impact.family_communication == "difficult" {
        flags.push(AdditionalFlag {
            id: "FLAG-GEN-014".to_string(),
            category: "Family Communication".to_string(),
            message: "Patient reports difficulty communicating genetic information to family - support with disclosure recommended".to_string(),
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
