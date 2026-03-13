use serde::{Deserialize, Serialize};

// Type aliases matching frontend union types.
// Empty string means unanswered.
pub type YesNo = String;
pub type Severity = String;
pub type SmokingStatus = String;
pub type DiabetesType = String;
pub type DiabetesControl = String;
pub type AlcoholFrequency = String;
pub type Sex = String;
pub type AllergySeverity = String;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Demographics {
    pub nhs_number: String,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub sex: Sex,
    pub weight: Option<f64>,
    pub height: Option<f64>,
    pub bmi: Option<f64>,
    pub planned_procedure: String,
    pub procedure_urgency: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Cardiovascular {
    pub hypertension: YesNo,
    pub hypertension_controlled: YesNo,
    pub ischemic_heart_disease: YesNo,
    pub ihd_details: String,
    pub heart_failure: YesNo,
    #[serde(rename = "heartFailureNYHA")]
    pub heart_failure_nyha: String,
    pub valvular_disease: YesNo,
    pub valvular_details: String,
    pub arrhythmia: YesNo,
    pub arrhythmia_type: String,
    pub pacemaker: YesNo,
    #[serde(rename = "recentMI")]
    pub recent_mi: YesNo,
    #[serde(rename = "recentMIWeeks")]
    pub recent_mi_weeks: Option<f64>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Respiratory {
    pub asthma: YesNo,
    pub asthma_frequency: String,
    pub copd: YesNo,
    pub copd_severity: Severity,
    pub osa: YesNo,
    #[serde(rename = "osaCPAP")]
    pub osa_cpap: YesNo,
    pub smoking: SmokingStatus,
    pub smoking_pack_years: Option<f64>,
    #[serde(rename = "recentURTI")]
    pub recent_urti: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Renal {
    pub ckd: YesNo,
    pub ckd_stage: String,
    pub dialysis: YesNo,
    pub dialysis_type: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Hepatic {
    pub liver_disease: YesNo,
    pub cirrhosis: YesNo,
    pub child_pugh_score: String,
    pub hepatitis: YesNo,
    pub hepatitis_type: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Endocrine {
    pub diabetes: DiabetesType,
    pub diabetes_control: DiabetesControl,
    pub diabetes_on_insulin: YesNo,
    pub thyroid_disease: YesNo,
    pub thyroid_type: String,
    pub adrenal_insufficiency: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Neurological {
    #[serde(rename = "strokeOrTIA")]
    pub stroke_or_tia: YesNo,
    pub stroke_details: String,
    pub epilepsy: YesNo,
    pub epilepsy_controlled: YesNo,
    pub neuromuscular_disease: YesNo,
    pub neuromuscular_details: String,
    #[serde(rename = "raisedICP")]
    pub raised_icp: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Haematological {
    pub bleeding_disorder: YesNo,
    pub bleeding_details: String,
    pub on_anticoagulants: YesNo,
    pub anticoagulant_type: String,
    pub sickle_cell_disease: YesNo,
    pub sickle_cell_trait: YesNo,
    pub anaemia: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MusculoskeletalAirway {
    pub rheumatoid_arthritis: YesNo,
    pub cervical_spine_issues: YesNo,
    pub limited_neck_movement: YesNo,
    pub limited_mouth_opening: YesNo,
    pub dental_issues: YesNo,
    pub dental_details: String,
    pub previous_difficult_airway: YesNo,
    pub mallampati_score: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Gastrointestinal {
    pub gord: YesNo,
    pub hiatus_hernia: YesNo,
    pub nausea: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Medication {
    pub name: String,
    pub dose: String,
    pub frequency: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Allergy {
    pub allergen: String,
    pub reaction: String,
    pub severity: AllergySeverity,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PreviousAnaesthesia {
    pub previous_anaesthesia: YesNo,
    pub anaesthesia_problems: YesNo,
    pub anaesthesia_problem_details: String,
    #[serde(rename = "familyMHHistory")]
    pub family_mh_history: YesNo,
    #[serde(rename = "familyMHDetails")]
    pub family_mh_details: String,
    pub ponv: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SocialHistory {
    pub alcohol: AlcoholFrequency,
    pub alcohol_units_per_week: Option<f64>,
    pub recreational_drugs: YesNo,
    pub drug_details: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalCapacity {
    pub exercise_tolerance: String,
    #[serde(rename = "estimatedMETs")]
    pub estimated_mets: Option<f64>,
    pub mobility_aids: YesNo,
    pub recent_decline: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Pregnancy {
    pub possibly_pregnant: YesNo,
    pub pregnancy_confirmed: YesNo,
    pub gestation_weeks: Option<f64>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub demographics: Demographics,
    pub cardiovascular: Cardiovascular,
    pub respiratory: Respiratory,
    pub renal: Renal,
    pub hepatic: Hepatic,
    pub endocrine: Endocrine,
    pub neurological: Neurological,
    pub haematological: Haematological,
    pub musculoskeletal_airway: MusculoskeletalAirway,
    pub gastrointestinal: Gastrointestinal,
    pub medications: Vec<Medication>,
    pub allergies: Vec<Allergy>,
    pub previous_anaesthesia: PreviousAnaesthesia,
    pub social_history: SocialHistory,
    pub functional_capacity: FunctionalCapacity,
    pub pregnancy: Pregnancy,
}

pub type AsaGrade = u8;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub system: String,
    pub description: String,
    pub grade: AsaGrade,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdditionalFlag {
    pub id: String,
    pub category: String,
    pub message: String,
    pub priority: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradingResult {
    pub asa_grade: AsaGrade,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
