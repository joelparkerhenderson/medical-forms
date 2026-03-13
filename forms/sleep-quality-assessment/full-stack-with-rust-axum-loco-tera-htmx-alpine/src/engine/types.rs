use serde::{Deserialize, Serialize};

pub type SleepQuality = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub full_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub telephone: String,
    pub email: String,
    pub gp_name: String,
    pub gp_practice: String,
}

// ─── Sleep Habits (Step 2) ──────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SleepHabits {
    pub bedtime: String,
    pub wake_time: String,
    pub sleep_latency_minutes: Option<u8>,
    pub total_sleep_hours: Option<f64>,
    pub sleep_efficiency: Option<u8>,
    pub naps_per_day: Option<u8>,
    pub nap_duration_minutes: Option<u8>,
    pub weekend_sleep_difference: String,
}

// ─── Sleep Quality PSQI (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SleepQualityPsqi {
    pub subjective_quality: Option<u8>,
    pub sleep_latency: Option<u8>,
    pub sleep_duration: Option<u8>,
    pub sleep_efficiency_score: Option<u8>,
    pub sleep_disturbances: Option<u8>,
    pub sleep_medication: Option<u8>,
    pub daytime_dysfunction: Option<u8>,
}

// ─── Daytime Sleepiness ESS (Step 4) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DaytimeSleepiness {
    pub ess_sitting: Option<u8>,
    pub ess_watching: Option<u8>,
    pub ess_sitting_inactive: Option<u8>,
    pub ess_passenger: Option<u8>,
    pub ess_lying_down: Option<u8>,
    pub ess_talking: Option<u8>,
    pub ess_after_lunch: Option<u8>,
    pub ess_traffic: Option<u8>,
}

// ─── Sleep Disturbances (Step 5) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SleepDisturbances {
    pub difficulty_falling_asleep: Option<u8>,
    pub night_wakings: Option<u8>,
    pub early_morning_waking: Option<u8>,
    pub nightmares: Option<u8>,
    pub leg_restlessness: Option<u8>,
    pub snoring: Option<u8>,
    pub breathing_pauses: Option<u8>,
    pub pain_disturbance: Option<u8>,
}

// ─── Sleep Apnoea Screening (Step 6) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SleepApnoeaScreening {
    pub loud_snoring: String,
    pub witnessed_apnoeas: String,
    pub tiredness: String,
    pub treated_hypertension: String,
    pub bmi_over35: String,
    pub age_over50: String,
    pub neck_circumference_over40: String,
    pub male: String,
    pub stop_bang_score: Option<u8>,
}

// ─── Sleep Hygiene (Step 7) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SleepHygiene {
    pub regular_schedule: String,
    pub screen_time_before_bed: String,
    pub caffeine_late_use: String,
    pub alcohol_before_bed: String,
    pub exercise_timing: String,
    pub bedroom_environment: Option<u8>,
    pub bed_used_for_sleep_only: String,
    pub relaxation_technique: String,
}

// ─── Medical & Medications (Step 8) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicalMedications {
    pub sleep_medications: String,
    pub medication_duration: String,
    pub mental_health_condition: String,
    pub chronic_pain_condition: String,
    pub respiratory_condition: String,
    pub neurological_condition: String,
    pub menopausal: String,
    pub shift_work: String,
}

// ─── Impact Assessment (Step 9) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImpactAssessment {
    pub work_performance: Option<u8>,
    pub driving_safety: Option<u8>,
    pub social_functioning: Option<u8>,
    pub mood_impact: Option<u8>,
    pub concentration_impact: Option<u8>,
    pub accident_risk: String,
    pub quality_of_life: Option<u8>,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub psqi_total: Option<u8>,
    pub ess_total: Option<u8>,
    pub stop_bang_total: Option<u8>,
    pub clinical_notes: String,
    pub diagnosis: String,
    pub treatment_plan: String,
    pub referral_needed: String,
    pub referral_destination: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub sleep_habits: SleepHabits,
    pub sleep_quality_psqi: SleepQualityPsqi,
    pub daytime_sleepiness: DaytimeSleepiness,
    pub sleep_disturbances: SleepDisturbances,
    pub sleep_apnoea_screening: SleepApnoeaScreening,
    pub sleep_hygiene: SleepHygiene,
    pub medical_medications: MedicalMedications,
    pub impact_assessment: ImpactAssessment,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ──────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub category: String,
    pub description: String,
    pub concern_level: String,
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
    pub sleep_quality: SleepQuality,
    pub psqi_score: u8,
    pub ess_score: u8,
    pub stop_bang_score: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
