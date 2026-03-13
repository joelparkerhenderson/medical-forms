use super::types::AssessmentData;

/// Returns a human-readable label for an abnormality level.
pub fn abnormality_level_label(level: &str) -> &str {
    match level {
        "critical" => "Critical",
        "severeAbnormality" => "Severe Abnormality",
        "moderateAbnormality" => "Moderate Abnormality",
        "mildAbnormality" => "Mild Abnormality",
        "normal" => "Normal",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all numeric lab values from the assessment data as Option<f64>.
/// These are used to determine whether enough data has been entered.
pub fn collect_numeric_items(data: &AssessmentData) -> Vec<Option<f64>> {
    vec![
        // Blood Count Analysis (8 items)
        data.blood_count_analysis.hemoglobin,
        data.blood_count_analysis.hematocrit,
        data.blood_count_analysis.red_blood_cell_count,
        data.blood_count_analysis.white_blood_cell_count,
        data.blood_count_analysis.platelet_count,
        data.blood_count_analysis.mean_corpuscular_volume,
        data.blood_count_analysis.mean_corpuscular_hemoglobin,
        data.blood_count_analysis.red_cell_distribution_width,
        // Coagulation Studies (6 items)
        data.coagulation_studies.prothrombin_time,
        data.coagulation_studies.inr,
        data.coagulation_studies.activated_partial_thromboplastin_time,
        data.coagulation_studies.fibrinogen,
        data.coagulation_studies.d_dimer,
        data.coagulation_studies.bleeding_time,
        // Iron Studies (5 items)
        data.iron_studies.serum_iron,
        data.iron_studies.total_iron_binding_capacity,
        data.iron_studies.transferrin_saturation,
        data.iron_studies.serum_ferritin,
        data.iron_studies.reticulocyte_count,
    ]
}

/// Calculate a composite abnormality score (0-100) from lab values.
///
/// The score is based on how far each lab value deviates from its normal range.
/// 0 = all values normal, 100 = maximally abnormal.
///
/// Returns None if no numeric items are answered.
pub fn calculate_abnormality_score(data: &AssessmentData) -> Option<f64> {
    let mut deviations = Vec::new();

    // Helper: calculate deviation from normal range as a 0-1 value.
    // 0 = within normal range, 1 = severely outside range.
    fn deviation(value: Option<f64>, low: f64, high: f64, severe_low: f64, severe_high: f64) -> Option<f64> {
        value.map(|v| {
            if v >= low && v <= high {
                0.0
            } else if v < low {
                let dist = (low - v) / (low - severe_low).max(0.01);
                dist.min(1.0)
            } else {
                let dist = (v - high) / (severe_high - high).max(0.01);
                dist.min(1.0)
            }
        })
    }

    // Hemoglobin: normal 12-17 g/dL, severe <6 or >22
    if let Some(d) = deviation(data.blood_count_analysis.hemoglobin, 12.0, 17.0, 6.0, 22.0) {
        deviations.push(d);
    }
    // Hematocrit: normal 36-52%, severe <20 or >65
    if let Some(d) = deviation(data.blood_count_analysis.hematocrit, 36.0, 52.0, 20.0, 65.0) {
        deviations.push(d);
    }
    // RBC: normal 4.0-6.0 x10^12/L, severe <2.0 or >8.0
    if let Some(d) = deviation(data.blood_count_analysis.red_blood_cell_count, 4.0, 6.0, 2.0, 8.0) {
        deviations.push(d);
    }
    // WBC: normal 4.0-11.0 x10^9/L, severe <1.0 or >30.0
    if let Some(d) = deviation(data.blood_count_analysis.white_blood_cell_count, 4.0, 11.0, 1.0, 30.0) {
        deviations.push(d);
    }
    // Platelets: normal 150-400 x10^9/L, severe <20 or >1000
    if let Some(d) = deviation(data.blood_count_analysis.platelet_count, 150.0, 400.0, 20.0, 1000.0) {
        deviations.push(d);
    }
    // MCV: normal 80-100 fL, severe <50 or >130
    if let Some(d) = deviation(data.blood_count_analysis.mean_corpuscular_volume, 80.0, 100.0, 50.0, 130.0) {
        deviations.push(d);
    }
    // MCH: normal 27-33 pg, severe <15 or >45
    if let Some(d) = deviation(data.blood_count_analysis.mean_corpuscular_hemoglobin, 27.0, 33.0, 15.0, 45.0) {
        deviations.push(d);
    }
    // RDW: normal 11.5-14.5%, severe <8 or >25
    if let Some(d) = deviation(data.blood_count_analysis.red_cell_distribution_width, 11.5, 14.5, 8.0, 25.0) {
        deviations.push(d);
    }
    // PT: normal 11-13.5 seconds, severe <8 or >30
    if let Some(d) = deviation(data.coagulation_studies.prothrombin_time, 11.0, 13.5, 8.0, 30.0) {
        deviations.push(d);
    }
    // INR: normal 0.8-1.2, severe <0.5 or >5.0
    if let Some(d) = deviation(data.coagulation_studies.inr, 0.8, 1.2, 0.5, 5.0) {
        deviations.push(d);
    }
    // aPTT: normal 25-35 seconds, severe <15 or >80
    if let Some(d) = deviation(data.coagulation_studies.activated_partial_thromboplastin_time, 25.0, 35.0, 15.0, 80.0) {
        deviations.push(d);
    }
    // Fibrinogen: normal 200-400 mg/dL, severe <50 or >800
    if let Some(d) = deviation(data.coagulation_studies.fibrinogen, 200.0, 400.0, 50.0, 800.0) {
        deviations.push(d);
    }
    // D-dimer: normal 0-0.5 mg/L, severe >5.0
    if let Some(d) = deviation(data.coagulation_studies.d_dimer, 0.0, 0.5, 0.0, 5.0) {
        deviations.push(d);
    }
    // Serum iron: normal 60-170 mcg/dL, severe <10 or >300
    if let Some(d) = deviation(data.iron_studies.serum_iron, 60.0, 170.0, 10.0, 300.0) {
        deviations.push(d);
    }
    // TIBC: normal 250-370 mcg/dL, severe <100 or >600
    if let Some(d) = deviation(data.iron_studies.total_iron_binding_capacity, 250.0, 370.0, 100.0, 600.0) {
        deviations.push(d);
    }
    // Transferrin saturation: normal 20-50%, severe <5 or >90
    if let Some(d) = deviation(data.iron_studies.transferrin_saturation, 20.0, 50.0, 5.0, 90.0) {
        deviations.push(d);
    }
    // Ferritin: normal 20-250 ng/mL, severe <5 or >1000
    if let Some(d) = deviation(data.iron_studies.serum_ferritin, 20.0, 250.0, 5.0, 1000.0) {
        deviations.push(d);
    }
    // Reticulocyte count: normal 0.5-2.5%, severe <0.1 or >10
    if let Some(d) = deviation(data.iron_studies.reticulocyte_count, 0.5, 2.5, 0.1, 10.0) {
        deviations.push(d);
    }

    if deviations.is_empty() {
        return None;
    }

    let sum: f64 = deviations.iter().sum();
    let avg = sum / deviations.len() as f64;
    let score = (avg * 100.0).round();
    Some(score.min(100.0))
}

/// Calculate the blood count dimension score (0-100) representing deviation.
pub fn blood_count_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_numeric_items(data);
    // Only blood count items (first 8)
    let answered: Vec<f64> = items[..8].iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    // Use the abnormality score calculation for just these items
    calculate_abnormality_score(&AssessmentData {
        blood_count_analysis: data.blood_count_analysis.clone(),
        ..AssessmentData::default()
    })
}

/// Calculate the coagulation dimension score (0-100) representing deviation.
pub fn coagulation_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_numeric_items(data);
    // Only coagulation items (items 8-13)
    let answered: Vec<f64> = items[8..14].iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    calculate_abnormality_score(&AssessmentData {
        coagulation_studies: data.coagulation_studies.clone(),
        ..AssessmentData::default()
    })
}

/// Calculate the iron studies dimension score (0-100) representing deviation.
pub fn iron_studies_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_numeric_items(data);
    // Only iron studies items (items 14-18)
    let answered: Vec<f64> = items[14..19].iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    calculate_abnormality_score(&AssessmentData {
        iron_studies: data.iron_studies.clone(),
        ..AssessmentData::default()
    })
}
