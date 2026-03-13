use super::types::AssessmentData;

/// Returns a human-readable label for a risk level.
pub fn risk_level_label(level: &str) -> &str {
    match level {
        "confirmed" => "Confirmed",
        "highRisk" => "High Risk",
        "moderateRisk" => "Moderate Risk",
        "lowRisk" => "Low Risk",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Count the number of family members (parents, grandparents) with cancer entries.
pub fn count_affected_family_cancers(data: &AssessmentData) -> usize {
    let cancer_fields = [
        &data.family_pedigree.maternal_grandmother_cancers,
        &data.family_pedigree.maternal_grandfather_cancers,
        &data.family_pedigree.paternal_grandmother_cancers,
        &data.family_pedigree.paternal_grandfather_cancers,
        &data.family_pedigree.mother_cancers,
        &data.family_pedigree.father_cancers,
    ];
    cancer_fields.iter().filter(|c| !c.trim().is_empty()).count()
}

/// Count affected relatives diagnosed under age 50 based on pedigree age-at-diagnosis fields.
/// Parses the age string and checks if any relative was diagnosed before 50.
pub fn count_affected_relatives_under50(data: &AssessmentData) -> usize {
    let entries = [
        (&data.family_pedigree.maternal_grandmother_cancers, &data.family_pedigree.maternal_grandmother_age_at_diagnosis),
        (&data.family_pedigree.maternal_grandfather_cancers, &data.family_pedigree.maternal_grandfather_age_at_diagnosis),
        (&data.family_pedigree.paternal_grandmother_cancers, &data.family_pedigree.paternal_grandmother_age_at_diagnosis),
        (&data.family_pedigree.paternal_grandfather_cancers, &data.family_pedigree.paternal_grandfather_age_at_diagnosis),
        (&data.family_pedigree.mother_cancers, &data.family_pedigree.mother_age_at_diagnosis),
        (&data.family_pedigree.father_cancers, &data.family_pedigree.father_age_at_diagnosis),
    ];
    entries
        .iter()
        .filter(|(cancers, age_str)| {
            !cancers.trim().is_empty()
                && age_str.parse::<u32>().is_ok_and(|age| age < 50)
        })
        .count()
}

/// Determine a family pattern summary for dashboard display.
pub fn family_pattern_summary(data: &AssessmentData) -> String {
    let cancer_count = count_affected_family_cancers(data);
    let under50_count = count_affected_relatives_under50(data);

    let has_cardiac = data.cardiac_genetic_risk.sudden_cardiac_death == "yes"
        || data.cardiac_genetic_risk.cardiomyopathy == "yes"
        || data.cardiac_genetic_risk.familial_hypercholesterolemia == "yes";

    let has_repro = data.reproductive_genetics.consanguinity == "yes"
        || data.reproductive_genetics.previous_affected_child == "yes"
        || data.reproductive_genetics.carrier_status == "yes";

    let mut parts = Vec::new();
    if cancer_count > 0 {
        parts.push(format!("{cancer_count} cancer"));
    }
    if under50_count > 0 {
        parts.push(format!("{under50_count} <50y"));
    }
    if has_cardiac {
        parts.push("cardiac".to_string());
    }
    if has_repro {
        parts.push("reproductive".to_string());
    }
    if parts.is_empty() {
        "No significant pattern".to_string()
    } else {
        parts.join(", ")
    }
}

/// Determine testing status for dashboard display.
pub fn testing_status_summary(data: &AssessmentData) -> String {
    if data.cancer_risk_assessment.brca_result == "positive"
        || data.cancer_risk_assessment.lynch_result == "positive"
        || data.cardiac_genetic_risk.cardiac_gene_result == "positive"
    {
        return "Positive".to_string();
    }
    if data.genetic_testing_status.previous_genetic_tests == "yes" {
        if data.genetic_testing_status.variants_of_uncertain_significance == "yes" {
            return "VUS".to_string();
        }
        return "Tested".to_string();
    }
    if data.genetic_testing_status.known_familial_variant == "yes" {
        return "Untested".to_string();
    }
    "Pending".to_string()
}
