#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::perioperative_optimizations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<String>,
    pub site_name: String,
    pub service_name: String,
    pub pathway_stage: String,
    pub assessment_mode: String,
    pub referral_source: String,
    pub planned_procedure: String,
    pub surgical_specialty: String,
    pub consultant_surgeon: String,
    pub planned_surgery_date: Option<Date>,
    pub urgency: String,
    pub surgical_severity: String,
    pub laterality: String,
    pub anticipated_blood_loss_ml: Option<i32>,
    pub anticipated_length_of_stay_days: Option<i32>,
    pub interpreter_required: String,
    pub interpreter_language: String,
    pub condition_cardiac: String,
    pub condition_respiratory: String,
    pub condition_renal: String,
    pub condition_hepatic: String,
    pub condition_stroke: String,
    pub condition_cancer: String,
    pub condition_rheumatological: String,
    pub condition_thyroid: String,
    pub condition_other: String,
    pub previous_surgery: String,
    pub previous_surgery_detail: String,
    pub previous_anaesthetic_complication: String,
    pub previous_anaesthetic_complication_detail: String,
    pub postoperative_nausea_history: String,
    pub difficult_airway_history: String,
    pub malignant_hyperthermia_history: String,
    pub venous_thromboembolism_history: String,
    pub family_history: String,
    pub pregnancy_status: String,
    pub takes_prescription_medicines: String,
    pub takes_over_the_counter_medicines: String,
    pub takes_herbal_products: String,
    pub takes_anticoagulant: String,
    pub takes_antiplatelet: String,
    pub takes_ace_inhibitor_or_arb: String,
    pub takes_sglt2_inhibitor: String,
    pub takes_glp1_agonist: String,
    pub glp1_formulation: String,
    pub glp1_held_per_guideline: String,
    pub glp1_extended_clear_fluids_confirmed: String,
    pub glp1_gi_symptoms: String,
    pub glp1_gi_symptoms_details: String,
    pub glp1_gastric_ultrasound_performed: String,
    pub glp1_gastric_ultrasound_findings: String,
    pub takes_corticosteroid: String,
    pub takes_immunosuppressant: String,
    pub takes_hormone_therapy: String,
    pub medication_hold_plan_agreed: String,
    pub medication_hold_plan_agreed_by: String,
    pub medication_adherence: String,
    pub medication_notes: String,
    pub has_drug_allergy: String,
    pub drug_allergy_detail: String,
    pub has_food_allergy: String,
    pub food_allergy_detail: String,
    pub has_latex_allergy: String,
    pub has_adhesive_allergy: String,
    pub has_contrast_allergy: String,
    pub allergy_severity: String,
    pub adrenaline_auto_injector: String,
    pub allergy_notes: String,
    pub bloods_sample_date: Option<Date>,
    pub haemoglobin_g_per_l: Option<f64>,
    pub mean_cell_volume_fl: Option<f64>,
    pub ferritin_ug_per_l: Option<f64>,
    pub transferrin_saturation_percent: Option<f64>,
    pub vitamin_b12_ng_per_l: Option<f64>,
    pub folate_ug_per_l: Option<f64>,
    pub c_reactive_protein_mg_per_l: Option<f64>,
    pub creatinine_umol_per_l: Option<f64>,
    pub egfr_ml_per_min: Option<f64>,
    pub anaemia_known_cause: String,
    pub anaemia_treatment_started: String,
    pub anaemia_treatment_route: String,
    pub anaemia_treatment_start_date: Option<Date>,
    pub previous_transfusion: String,
    pub group_and_save_done: String,
    pub anaemia_notes: String,
    pub diabetes_type: String,
    pub diabetes_duration_years: Option<f64>,
    pub hba1c_mmol_per_mol: Option<f64>,
    pub hba1c_sample_date: Option<Date>,
    pub capillary_glucose_mmol_per_l: Option<f64>,
    pub diabetes_treatment: String,
    pub insulin_regimen: String,
    pub hypoglycaemia_awareness: String,
    pub diabetes_team_review: String,
    pub diabetes_team_review_date: Option<Date>,
    pub foot_check_done: String,
    pub glycaemic_notes: String,
    pub smoking_status: String,
    pub cigarettes_per_day: Option<i32>,
    pub pack_years: Option<f64>,
    pub quit_date: Option<Date>,
    pub smoking_cessation_offered: String,
    pub smoking_cessation_accepted: String,
    pub nicotine_replacement: String,
    pub vaping: String,
    pub smoking_notes: String,
    pub alcohol_units_per_week: Option<f64>,
    pub audit_c_frequency: Option<i32>,
    pub audit_c_typical_quantity: Option<i32>,
    pub audit_c_binge_frequency: Option<i32>,
    pub alcohol_dependence_features: String,
    pub alcohol_reduction_plan_agreed: String,
    pub alcohol_services_referral: String,
    pub recreational_drug_use: String,
    pub recreational_drug_detail: String,
    pub alcohol_notes: String,
    pub height_as_cm: Option<f64>,
    pub weight_as_kg: Option<f64>,
    pub body_mass_index: Option<f64>,
    pub usual_weight_as_kg: Option<f64>,
    pub weight_loss_percent: Option<f64>,
    pub weight_loss_is_intentional: String,
    pub acutely_ill: String,
    pub no_nutritional_intake_over_5_days: String,
    pub appetite: String,
    pub oral_nutritional_supplements: String,
    pub immunonutrition: String,
    pub dietitian_referral: String,
    pub nutrition_notes: String,
    pub usual_activity_level: String,
    pub climbs_flight_of_stairs: String,
    pub metabolic_equivalents: Option<f64>,
    pub duke_activity_status_index: Option<f64>,
    pub six_minute_walk_metres: Option<i32>,
    pub cpet_anaerobic_threshold: Option<f64>,
    pub cpet_peak_vo2: Option<f64>,
    pub grip_strength_kg: Option<f64>,
    pub prehabilitation_offered: String,
    pub prehabilitation_enrolled: String,
    pub prehabilitation_sessions_per_week: Option<i32>,
    pub prehabilitation_start_date: Option<Date>,
    pub protein_supplementation_recommended: String,
    pub fitness_notes: String,
    pub clinical_frailty_scale: Option<i32>,
    pub fried_weakness: String,
    pub fried_slowness: String,
    pub fried_low_physical_activity: String,
    pub fried_exhaustion: String,
    pub fried_unintentional_weight_loss: String,
    pub risk_analysis_index_score: Option<i32>,
    pub mini_cog_performed: String,
    pub mini_cog_score: Option<i32>,
    pub cognitive_screen_tool: String,
    pub cognitive_screen_score: Option<f64>,
    pub cognitive_impairment: String,
    pub capacity_concern: String,
    pub falls_in_last_12_months: Option<i32>,
    pub mobility_aid: String,
    pub living_situation: String,
    pub care_package: String,
    pub frailty_notes: String,
    pub systolic_bp: Option<i32>,
    pub diastolic_bp: Option<i32>,
    pub heart_rate: Option<i32>,
    pub heart_rhythm: String,
    pub murmur_present: String,
    pub exercise_tolerance: String,
    pub ejection_fraction_percent: Option<i32>,
    pub echo_date: Option<Date>,
    pub asthma_control: String,
    pub copd_control: String,
    pub inhaler_technique_checked: String,
    pub rescue_steroids: String,
    pub spirometry_fev1_percent: Option<f64>,
    pub stop_bang_score: Option<i32>,
    pub sleep_apnoea_diagnosis: String,
    pub cpap_use: String,
    pub oxygen_saturation_percent: Option<f64>,
    pub cardiorespiratory_notes: String,
    pub anxiety_level: String,
    pub depression_screen: String,
    pub understands_procedure: String,
    pub expectations_realistic: String,
    pub shared_decision_making_discussed: String,
    pub has_carer: String,
    pub transport_home_arranged: String,
    pub support_after_discharge: String,
    pub health_literacy: String,
    pub psychological_support_offered: String,
    pub social_notes: String,
    pub plan_anaemia: String,
    pub referral_anaemia: String,
    pub plan_glycaemic_control: String,
    pub referral_glycaemic_control: String,
    pub plan_smoking: String,
    pub referral_smoking: String,
    pub plan_alcohol: String,
    pub referral_alcohol: String,
    pub plan_nutrition: String,
    pub referral_nutrition: String,
    pub plan_physical_fitness: String,
    pub referral_physical_fitness: String,
    pub plan_medication: String,
    pub referral_medication: String,
    pub plan_cardiorespiratory: String,
    pub referral_cardiorespiratory: String,
    pub responsible_clinician: String,
    pub plan_agreed_with_patient: String,
    pub plan_shared_with_patient: String,
    pub next_review_date: Option<Date>,
    pub plan_notes: String,
    pub gate_decision: String,
    pub additional_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time.clone());
      item.site_name = Set(self.site_name.clone());
      item.service_name = Set(self.service_name.clone());
      item.pathway_stage = Set(self.pathway_stage.clone());
      item.assessment_mode = Set(self.assessment_mode.clone());
      item.referral_source = Set(self.referral_source.clone());
      item.planned_procedure = Set(self.planned_procedure.clone());
      item.surgical_specialty = Set(self.surgical_specialty.clone());
      item.consultant_surgeon = Set(self.consultant_surgeon.clone());
      item.planned_surgery_date = Set(self.planned_surgery_date);
      item.urgency = Set(self.urgency.clone());
      item.surgical_severity = Set(self.surgical_severity.clone());
      item.laterality = Set(self.laterality.clone());
      item.anticipated_blood_loss_ml = Set(self.anticipated_blood_loss_ml);
      item.anticipated_length_of_stay_days = Set(self.anticipated_length_of_stay_days);
      item.interpreter_required = Set(self.interpreter_required.clone());
      item.interpreter_language = Set(self.interpreter_language.clone());
      item.condition_cardiac = Set(self.condition_cardiac.clone());
      item.condition_respiratory = Set(self.condition_respiratory.clone());
      item.condition_renal = Set(self.condition_renal.clone());
      item.condition_hepatic = Set(self.condition_hepatic.clone());
      item.condition_stroke = Set(self.condition_stroke.clone());
      item.condition_cancer = Set(self.condition_cancer.clone());
      item.condition_rheumatological = Set(self.condition_rheumatological.clone());
      item.condition_thyroid = Set(self.condition_thyroid.clone());
      item.condition_other = Set(self.condition_other.clone());
      item.previous_surgery = Set(self.previous_surgery.clone());
      item.previous_surgery_detail = Set(self.previous_surgery_detail.clone());
      item.previous_anaesthetic_complication = Set(self.previous_anaesthetic_complication.clone());
      item.previous_anaesthetic_complication_detail = Set(self.previous_anaesthetic_complication_detail.clone());
      item.postoperative_nausea_history = Set(self.postoperative_nausea_history.clone());
      item.difficult_airway_history = Set(self.difficult_airway_history.clone());
      item.malignant_hyperthermia_history = Set(self.malignant_hyperthermia_history.clone());
      item.venous_thromboembolism_history = Set(self.venous_thromboembolism_history.clone());
      item.family_history = Set(self.family_history.clone());
      item.pregnancy_status = Set(self.pregnancy_status.clone());
      item.takes_prescription_medicines = Set(self.takes_prescription_medicines.clone());
      item.takes_over_the_counter_medicines = Set(self.takes_over_the_counter_medicines.clone());
      item.takes_herbal_products = Set(self.takes_herbal_products.clone());
      item.takes_anticoagulant = Set(self.takes_anticoagulant.clone());
      item.takes_antiplatelet = Set(self.takes_antiplatelet.clone());
      item.takes_ace_inhibitor_or_arb = Set(self.takes_ace_inhibitor_or_arb.clone());
      item.takes_sglt2_inhibitor = Set(self.takes_sglt2_inhibitor.clone());
      item.takes_glp1_agonist = Set(self.takes_glp1_agonist.clone());
      item.glp1_formulation = Set(self.glp1_formulation.clone());
      item.glp1_held_per_guideline = Set(self.glp1_held_per_guideline.clone());
      item.glp1_extended_clear_fluids_confirmed = Set(self.glp1_extended_clear_fluids_confirmed.clone());
      item.glp1_gi_symptoms = Set(self.glp1_gi_symptoms.clone());
      item.glp1_gi_symptoms_details = Set(self.glp1_gi_symptoms_details.clone());
      item.glp1_gastric_ultrasound_performed = Set(self.glp1_gastric_ultrasound_performed.clone());
      item.glp1_gastric_ultrasound_findings = Set(self.glp1_gastric_ultrasound_findings.clone());
      item.takes_corticosteroid = Set(self.takes_corticosteroid.clone());
      item.takes_immunosuppressant = Set(self.takes_immunosuppressant.clone());
      item.takes_hormone_therapy = Set(self.takes_hormone_therapy.clone());
      item.medication_hold_plan_agreed = Set(self.medication_hold_plan_agreed.clone());
      item.medication_hold_plan_agreed_by = Set(self.medication_hold_plan_agreed_by.clone());
      item.medication_adherence = Set(self.medication_adherence.clone());
      item.medication_notes = Set(self.medication_notes.clone());
      item.has_drug_allergy = Set(self.has_drug_allergy.clone());
      item.drug_allergy_detail = Set(self.drug_allergy_detail.clone());
      item.has_food_allergy = Set(self.has_food_allergy.clone());
      item.food_allergy_detail = Set(self.food_allergy_detail.clone());
      item.has_latex_allergy = Set(self.has_latex_allergy.clone());
      item.has_adhesive_allergy = Set(self.has_adhesive_allergy.clone());
      item.has_contrast_allergy = Set(self.has_contrast_allergy.clone());
      item.allergy_severity = Set(self.allergy_severity.clone());
      item.adrenaline_auto_injector = Set(self.adrenaline_auto_injector.clone());
      item.allergy_notes = Set(self.allergy_notes.clone());
      item.bloods_sample_date = Set(self.bloods_sample_date);
      item.haemoglobin_g_per_l = Set(self.haemoglobin_g_per_l);
      item.mean_cell_volume_fl = Set(self.mean_cell_volume_fl);
      item.ferritin_ug_per_l = Set(self.ferritin_ug_per_l);
      item.transferrin_saturation_percent = Set(self.transferrin_saturation_percent);
      item.vitamin_b12_ng_per_l = Set(self.vitamin_b12_ng_per_l);
      item.folate_ug_per_l = Set(self.folate_ug_per_l);
      item.c_reactive_protein_mg_per_l = Set(self.c_reactive_protein_mg_per_l);
      item.creatinine_umol_per_l = Set(self.creatinine_umol_per_l);
      item.egfr_ml_per_min = Set(self.egfr_ml_per_min);
      item.anaemia_known_cause = Set(self.anaemia_known_cause.clone());
      item.anaemia_treatment_started = Set(self.anaemia_treatment_started.clone());
      item.anaemia_treatment_route = Set(self.anaemia_treatment_route.clone());
      item.anaemia_treatment_start_date = Set(self.anaemia_treatment_start_date);
      item.previous_transfusion = Set(self.previous_transfusion.clone());
      item.group_and_save_done = Set(self.group_and_save_done.clone());
      item.anaemia_notes = Set(self.anaemia_notes.clone());
      item.diabetes_type = Set(self.diabetes_type.clone());
      item.diabetes_duration_years = Set(self.diabetes_duration_years);
      item.hba1c_mmol_per_mol = Set(self.hba1c_mmol_per_mol);
      item.hba1c_sample_date = Set(self.hba1c_sample_date);
      item.capillary_glucose_mmol_per_l = Set(self.capillary_glucose_mmol_per_l);
      item.diabetes_treatment = Set(self.diabetes_treatment.clone());
      item.insulin_regimen = Set(self.insulin_regimen.clone());
      item.hypoglycaemia_awareness = Set(self.hypoglycaemia_awareness.clone());
      item.diabetes_team_review = Set(self.diabetes_team_review.clone());
      item.diabetes_team_review_date = Set(self.diabetes_team_review_date);
      item.foot_check_done = Set(self.foot_check_done.clone());
      item.glycaemic_notes = Set(self.glycaemic_notes.clone());
      item.smoking_status = Set(self.smoking_status.clone());
      item.cigarettes_per_day = Set(self.cigarettes_per_day);
      item.pack_years = Set(self.pack_years);
      item.quit_date = Set(self.quit_date);
      item.smoking_cessation_offered = Set(self.smoking_cessation_offered.clone());
      item.smoking_cessation_accepted = Set(self.smoking_cessation_accepted.clone());
      item.nicotine_replacement = Set(self.nicotine_replacement.clone());
      item.vaping = Set(self.vaping.clone());
      item.smoking_notes = Set(self.smoking_notes.clone());
      item.alcohol_units_per_week = Set(self.alcohol_units_per_week);
      item.audit_c_frequency = Set(self.audit_c_frequency);
      item.audit_c_typical_quantity = Set(self.audit_c_typical_quantity);
      item.audit_c_binge_frequency = Set(self.audit_c_binge_frequency);
      item.alcohol_dependence_features = Set(self.alcohol_dependence_features.clone());
      item.alcohol_reduction_plan_agreed = Set(self.alcohol_reduction_plan_agreed.clone());
      item.alcohol_services_referral = Set(self.alcohol_services_referral.clone());
      item.recreational_drug_use = Set(self.recreational_drug_use.clone());
      item.recreational_drug_detail = Set(self.recreational_drug_detail.clone());
      item.alcohol_notes = Set(self.alcohol_notes.clone());
      item.height_as_cm = Set(self.height_as_cm);
      item.weight_as_kg = Set(self.weight_as_kg);
      item.body_mass_index = Set(self.body_mass_index);
      item.usual_weight_as_kg = Set(self.usual_weight_as_kg);
      item.weight_loss_percent = Set(self.weight_loss_percent);
      item.weight_loss_is_intentional = Set(self.weight_loss_is_intentional.clone());
      item.acutely_ill = Set(self.acutely_ill.clone());
      item.no_nutritional_intake_over_5_days = Set(self.no_nutritional_intake_over_5_days.clone());
      item.appetite = Set(self.appetite.clone());
      item.oral_nutritional_supplements = Set(self.oral_nutritional_supplements.clone());
      item.immunonutrition = Set(self.immunonutrition.clone());
      item.dietitian_referral = Set(self.dietitian_referral.clone());
      item.nutrition_notes = Set(self.nutrition_notes.clone());
      item.usual_activity_level = Set(self.usual_activity_level.clone());
      item.climbs_flight_of_stairs = Set(self.climbs_flight_of_stairs.clone());
      item.metabolic_equivalents = Set(self.metabolic_equivalents);
      item.duke_activity_status_index = Set(self.duke_activity_status_index);
      item.six_minute_walk_metres = Set(self.six_minute_walk_metres);
      item.cpet_anaerobic_threshold = Set(self.cpet_anaerobic_threshold);
      item.cpet_peak_vo2 = Set(self.cpet_peak_vo2);
      item.grip_strength_kg = Set(self.grip_strength_kg);
      item.prehabilitation_offered = Set(self.prehabilitation_offered.clone());
      item.prehabilitation_enrolled = Set(self.prehabilitation_enrolled.clone());
      item.prehabilitation_sessions_per_week = Set(self.prehabilitation_sessions_per_week);
      item.prehabilitation_start_date = Set(self.prehabilitation_start_date);
      item.protein_supplementation_recommended = Set(self.protein_supplementation_recommended.clone());
      item.fitness_notes = Set(self.fitness_notes.clone());
      item.clinical_frailty_scale = Set(self.clinical_frailty_scale);
      item.fried_weakness = Set(self.fried_weakness.clone());
      item.fried_slowness = Set(self.fried_slowness.clone());
      item.fried_low_physical_activity = Set(self.fried_low_physical_activity.clone());
      item.fried_exhaustion = Set(self.fried_exhaustion.clone());
      item.fried_unintentional_weight_loss = Set(self.fried_unintentional_weight_loss.clone());
      item.risk_analysis_index_score = Set(self.risk_analysis_index_score);
      item.mini_cog_performed = Set(self.mini_cog_performed.clone());
      item.mini_cog_score = Set(self.mini_cog_score);
      item.cognitive_screen_tool = Set(self.cognitive_screen_tool.clone());
      item.cognitive_screen_score = Set(self.cognitive_screen_score);
      item.cognitive_impairment = Set(self.cognitive_impairment.clone());
      item.capacity_concern = Set(self.capacity_concern.clone());
      item.falls_in_last_12_months = Set(self.falls_in_last_12_months);
      item.mobility_aid = Set(self.mobility_aid.clone());
      item.living_situation = Set(self.living_situation.clone());
      item.care_package = Set(self.care_package.clone());
      item.frailty_notes = Set(self.frailty_notes.clone());
      item.systolic_bp = Set(self.systolic_bp);
      item.diastolic_bp = Set(self.diastolic_bp);
      item.heart_rate = Set(self.heart_rate);
      item.heart_rhythm = Set(self.heart_rhythm.clone());
      item.murmur_present = Set(self.murmur_present.clone());
      item.exercise_tolerance = Set(self.exercise_tolerance.clone());
      item.ejection_fraction_percent = Set(self.ejection_fraction_percent);
      item.echo_date = Set(self.echo_date);
      item.asthma_control = Set(self.asthma_control.clone());
      item.copd_control = Set(self.copd_control.clone());
      item.inhaler_technique_checked = Set(self.inhaler_technique_checked.clone());
      item.rescue_steroids = Set(self.rescue_steroids.clone());
      item.spirometry_fev1_percent = Set(self.spirometry_fev1_percent);
      item.stop_bang_score = Set(self.stop_bang_score);
      item.sleep_apnoea_diagnosis = Set(self.sleep_apnoea_diagnosis.clone());
      item.cpap_use = Set(self.cpap_use.clone());
      item.oxygen_saturation_percent = Set(self.oxygen_saturation_percent);
      item.cardiorespiratory_notes = Set(self.cardiorespiratory_notes.clone());
      item.anxiety_level = Set(self.anxiety_level.clone());
      item.depression_screen = Set(self.depression_screen.clone());
      item.understands_procedure = Set(self.understands_procedure.clone());
      item.expectations_realistic = Set(self.expectations_realistic.clone());
      item.shared_decision_making_discussed = Set(self.shared_decision_making_discussed.clone());
      item.has_carer = Set(self.has_carer.clone());
      item.transport_home_arranged = Set(self.transport_home_arranged.clone());
      item.support_after_discharge = Set(self.support_after_discharge.clone());
      item.health_literacy = Set(self.health_literacy.clone());
      item.psychological_support_offered = Set(self.psychological_support_offered.clone());
      item.social_notes = Set(self.social_notes.clone());
      item.plan_anaemia = Set(self.plan_anaemia.clone());
      item.referral_anaemia = Set(self.referral_anaemia.clone());
      item.plan_glycaemic_control = Set(self.plan_glycaemic_control.clone());
      item.referral_glycaemic_control = Set(self.referral_glycaemic_control.clone());
      item.plan_smoking = Set(self.plan_smoking.clone());
      item.referral_smoking = Set(self.referral_smoking.clone());
      item.plan_alcohol = Set(self.plan_alcohol.clone());
      item.referral_alcohol = Set(self.referral_alcohol.clone());
      item.plan_nutrition = Set(self.plan_nutrition.clone());
      item.referral_nutrition = Set(self.referral_nutrition.clone());
      item.plan_physical_fitness = Set(self.plan_physical_fitness.clone());
      item.referral_physical_fitness = Set(self.referral_physical_fitness.clone());
      item.plan_medication = Set(self.plan_medication.clone());
      item.referral_medication = Set(self.referral_medication.clone());
      item.plan_cardiorespiratory = Set(self.plan_cardiorespiratory.clone());
      item.referral_cardiorespiratory = Set(self.referral_cardiorespiratory.clone());
      item.responsible_clinician = Set(self.responsible_clinician.clone());
      item.plan_agreed_with_patient = Set(self.plan_agreed_with_patient.clone());
      item.plan_shared_with_patient = Set(self.plan_shared_with_patient.clone());
      item.next_review_date = Set(self.next_review_date);
      item.plan_notes = Set(self.plan_notes.clone());
      item.gate_decision = Set(self.gate_decision.clone());
      item.additional_notes = Set(self.additional_notes.clone());
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i64>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/perioperative_optimizations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
