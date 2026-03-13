use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{calculate_pta, pta_asymmetry, has_air_bone_gap};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the hearing level grading. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-AUD-001: Sudden hearing loss - urgent ENT ──────
    if data.hearing_history.onset_type == "sudden" {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-001".to_string(),
            category: "Hearing Loss".to_string(),
            message: "Sudden onset hearing loss - urgent ENT referral within 72 hours".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-AUD-002: Acoustic neuroma screening ────────────
    if pta_asymmetry(data).is_some_and(|a| a > 15.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-002".to_string(),
            category: "Hearing Loss".to_string(),
            message: "Asymmetric hearing loss >15 dB - MRI screening for acoustic neuroma recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-AUD-003: Occupational noise exposure ───────────
    if data.hearing_history.noise_exposure_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-003".to_string(),
            category: "Noise Exposure".to_string(),
            message: "Occupational noise exposure history - hearing conservation programme review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-AUD-004: Ototoxic medication ───────────────────
    if data.hearing_history.ototoxic_medication == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-004".to_string(),
            category: "Medication".to_string(),
            message: "Ototoxic medication use - baseline and serial monitoring recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-AUD-005: Falls risk from vestibular disorder ───
    if data.balance_assessment.dizziness_present == "yes"
        && data.balance_assessment.falls_history == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-005".to_string(),
            category: "Balance".to_string(),
            message: "Falls risk from vestibular disorder - multidisciplinary falls prevention needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-AUD-006: Unilateral tinnitus ───────────────────
    if data.tinnitus.tinnitus_present == "yes"
        && (data.tinnitus.tinnitus_ear == "right" || data.tinnitus.tinnitus_ear == "left")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-006".to_string(),
            category: "Tinnitus".to_string(),
            message: "Unilateral tinnitus - retrocochlear pathology evaluation recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-AUD-007: Active ear infection ──────────────────
    if data.otoscopic_examination.active_infection == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-007".to_string(),
            category: "Otoscopy".to_string(),
            message: "Active ear infection detected - medical treatment required before fitting".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-AUD-008: Poor word recognition ─────────────────
    if matches!(data.audiometric_results.right_wrs, Some(0..=50))
        || matches!(data.audiometric_results.left_wrs, Some(0..=50))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-008".to_string(),
            category: "Speech Audiometry".to_string(),
            message: "Poor word recognition score - limited hearing aid benefit expected".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-AUD-009: Severe tinnitus impact ────────────────
    if matches!(data.tinnitus.tinnitus_severity, Some(8..=10)) {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-009".to_string(),
            category: "Tinnitus".to_string(),
            message: "Severe tinnitus impact - specialist tinnitus management referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-AUD-010: Cerumen impaction ─────────────────────
    if data.otoscopic_examination.right_cerumen == "impacted"
        || data.otoscopic_examination.left_cerumen == "impacted"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-010".to_string(),
            category: "Otoscopy".to_string(),
            message: "Cerumen impaction - removal needed before reliable audiometry".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-AUD-011: Family history of hearing loss ────────
    if data.hearing_history.family_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-011".to_string(),
            category: "Risk Factor".to_string(),
            message: "Family history of hearing loss - genetic counselling may be appropriate".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── FLAG-AUD-012: Hearing aid candidate not interested ──
    if data.hearing_aid_assessment.current_hearing_aid == "no"
        && data.hearing_aid_assessment.interest_in_hearing_aid == "no"
    {
        let right = calculate_pta(
            data.audiometric_results.right_ac_500,
            data.audiometric_results.right_ac_1000,
            data.audiometric_results.right_ac_2000,
            data.audiometric_results.right_ac_4000,
        );
        let left = calculate_pta(
            data.audiometric_results.left_ac_500,
            data.audiometric_results.left_ac_1000,
            data.audiometric_results.left_ac_2000,
            data.audiometric_results.left_ac_4000,
        );
        let better = match (right, left) {
            (Some(r), Some(l)) => Some(r.min(l)),
            (Some(r), None) => Some(r),
            (None, Some(l)) => Some(l),
            _ => None,
        };
        if better.is_some_and(|p| p > 40.0) {
            flags.push(AdditionalFlag {
                id: "FLAG-AUD-012".to_string(),
                category: "Hearing Aid".to_string(),
                message: "Hearing aid candidate declined - motivational counselling recommended".to_string(),
                priority: "medium".to_string(),
            });
        }
    }

    // ─── FLAG-AUD-013: Ear discharge reported ────────────────
    if data.symptoms_assessment.ear_discharge == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-013".to_string(),
            category: "Symptoms".to_string(),
            message: "Ear discharge reported - ENT assessment recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-AUD-014: Conductive component detected ─────────
    if has_air_bone_gap(
        data.audiometric_results.right_ac_500,
        data.audiometric_results.right_ac_1000,
        data.audiometric_results.right_ac_2000,
        data.audiometric_results.right_ac_4000,
        data.audiometric_results.right_bc_500,
        data.audiometric_results.right_bc_1000,
        data.audiometric_results.right_bc_2000,
        data.audiometric_results.right_bc_4000,
    ) || has_air_bone_gap(
        data.audiometric_results.left_ac_500,
        data.audiometric_results.left_ac_1000,
        data.audiometric_results.left_ac_2000,
        data.audiometric_results.left_ac_4000,
        data.audiometric_results.left_bc_500,
        data.audiometric_results.left_bc_1000,
        data.audiometric_results.left_bc_2000,
        data.audiometric_results.left_bc_4000,
    ) {
        flags.push(AdditionalFlag {
            id: "FLAG-AUD-014".to_string(),
            category: "Hearing Loss".to_string(),
            message: "Air-bone gap detected - conductive component, ENT evaluation recommended".to_string(),
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
