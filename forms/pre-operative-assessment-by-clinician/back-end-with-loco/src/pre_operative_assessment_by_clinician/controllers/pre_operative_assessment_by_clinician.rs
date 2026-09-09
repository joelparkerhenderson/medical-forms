#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pre_operative_assessment_by_clinicians::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub site_name: String,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<String>,
    pub planned_procedure: String,
    pub surgical_specialty: String,
    pub urgency: String,
    pub laterality: String,
    pub surgical_severity: String,
    pub anticipated_blood_loss_ml: Option<i32>,
    pub anticipated_duration_minutes: Option<i32>,
    pub consultant_surgeon: String,
    pub planned_date: Option<Date>,
    pub systolic_bp: Option<i32>,
    pub diastolic_bp: Option<i32>,
    pub heart_rate: Option<i32>,
    pub respiratory_rate: Option<i32>,
    pub spo2_percent: Option<f64>,
    pub temperature_celsius: Option<f64>,
    pub capillary_refill_seconds: Option<f64>,
    pub pain_score_0_10: Option<i32>,
    pub on_room_air: String,
    pub supplemental_oxygen_litres: Option<f64>,
    pub mallampati_class: String,
    pub thyromental_distance_cm: Option<f64>,
    pub mouth_opening_cm: Option<f64>,
    pub inter_incisor_gap_cm: Option<f64>,
    pub neck_rom: String,
    pub cervical_spine_stability: String,
    pub dentition: String,
    pub beard: String,
    pub upper_lip_bite_test: String,
    pub prior_difficult_intubation: String,
    pub stopbang_snoring: String,
    pub stopbang_tired: String,
    pub stopbang_observed_apnoea: String,
    pub stopbang_pressure: String,
    pub stopbang_bmi_gt35: String,
    pub stopbang_age_gt50: String,
    pub stopbang_neck_gt40: String,
    pub stopbang_male: String,
    pub airway_notes: String,
    pub heart_rhythm: String,
    pub murmur_present: String,
    pub murmur_description: String,
    pub peripheral_pulses: String,
    pub jvp_raised: String,
    pub peripheral_oedema: String,
    pub ecg_performed: String,
    pub ecg_rhythm: String,
    pub ecg_rate_bpm: Option<i32>,
    pub ecg_axis: String,
    pub ecg_ischaemic_changes: String,
    pub ecg_notes: String,
    pub echo_performed: String,
    pub echo_ef_percent: Option<i32>,
    pub echo_notes: String,
    pub history_ihd: String,
    pub history_chf: String,
    pub history_stroke_tia: String,
    pub recent_mi_within_3_months: String,
    pub pacemaker_or_icd: String,
    pub severe_valve_dysfunction: String,
    pub active_angina: String,
    pub breath_sounds: String,
    pub wheeze: String,
    pub crackles: String,
    pub crepitations: String,
    pub chest_wall_deformity: String,
    pub asthma: String,
    pub copd: String,
    pub cxr_performed: String,
    pub cxr_findings: String,
    pub pft_performed: String,
    pub pft_fev1_percent_predicted: Option<f64>,
    pub pft_fev1_fvc_ratio: Option<f64>,
    pub smoking_status: String,
    pub pack_years: Option<f64>,
    pub covid_history: String,
    pub days_since_covid: Option<i32>,
    pub covid_unresolved_symptoms: String,
    pub gcs_total: Option<i32>,
    pub gcs_eye: Option<i32>,
    pub gcs_verbal: Option<i32>,
    pub gcs_motor: Option<i32>,
    pub cognition_tool: String,
    pub cognition_score: Option<i32>,
    pub cognitive_impairment: String,
    pub capacity_concern: String,
    pub cranial_nerves_notes: String,
    pub motor_power: String,
    pub sensory_notes: String,
    pub reflexes: String,
    pub recent_stroke_tia: String,
    pub days_since_stroke_tia: Option<i32>,
    pub seizure_disorder: String,
    pub creatinine_umol_l: Option<i32>,
    pub egfr_ml_min_1_73m2: Option<i32>,
    pub urea_mmol_l: Option<f64>,
    pub potassium_mmol_l: Option<f64>,
    pub sodium_mmol_l: Option<f64>,
    pub dialysis_status: String,
    pub ckd_stage: String,
    pub bilirubin_umol_l: Option<i32>,
    pub alt_u_l: Option<i32>,
    pub ast_u_l: Option<i32>,
    pub alp_u_l: Option<i32>,
    pub albumin_g_l: Option<f64>,
    pub chronic_liver_disease: String,
    pub child_pugh_class: String,
    pub hb_g_l: Option<i32>,
    pub wcc_10_9_l: Option<f64>,
    pub platelets_10_9_l: Option<i32>,
    pub mcv_fl: Option<f64>,
    pub ferritin_ug_l: Option<i32>,
    pub transferrin_saturation_percent: Option<f64>,
    pub inr: Option<f64>,
    pub aptt_seconds: Option<f64>,
    pub fibrinogen_g_l: Option<f64>,
    pub on_anticoagulant: String,
    pub anticoagulant_type: String,
    pub anticoagulant_hold_plan: String,
    pub group_and_save: String,
    pub crossmatch_units: Option<i32>,
    pub last_transfusion_date: Option<Date>,
    pub anaemia_severity: String,
    pub diabetes_type: String,
    pub diabetes_on_insulin: String,
    pub hba1c_mmol_mol: Option<i32>,
    pub fasting_glucose_mmol_l: Option<f64>,
    pub random_glucose_mmol_l: Option<f64>,
    pub diabetes_control: String,
    pub diabetes_complications: String,
    pub thyroid_status: String,
    pub tsh_mu_l: Option<f64>,
    pub adrenal_status: String,
    pub on_long_term_steroids: String,
    pub steroid_dose_mg: Option<f64>,
    pub steroid_cover_plan: String,
    pub abdominal_exam: String,
    pub abdominal_notes: String,
    pub reflux_symptoms: String,
    pub hiatus_hernia: String,
    pub previous_gastric_surgery: String,
    pub ng_tube: String,
    pub stoma: String,
    pub fasting_confirmed: String,
    pub last_solid_food_at: Option<DateTimeWithTimeZone>,
    pub last_clear_fluid_at: Option<DateTimeWithTimeZone>,
    pub rapid_sequence_induction_needed: String,
    pub spine_exam: String,
    pub spine_notes: String,
    pub neuraxial_suitable: String,
    pub joint_rom_hip: String,
    pub joint_rom_shoulder: String,
    pub joint_rom_neck: String,
    pub skin_iv_access: String,
    pub skin_block_site: String,
    pub pressure_ulcer_risk: String,
    pub name: String,
    pub dose: String,
    pub route: String,
    pub frequency: String,
    pub indication: String,
    pub class: String,
    pub perioperative_action: String,
    pub perioperative_notes: String,
    pub last_dose_at: Option<DateTimeWithTimeZone>,
    pub on_glp1_receptor_agonist: String,
    pub glp1_agonist_name: String,
    pub glp1_formulation: String,
    pub glp1_last_dose_at: Option<DateTimeWithTimeZone>,
    pub glp1_held_per_guideline: String,
    pub glp1_extended_clear_fluids_confirmed: String,
    pub glp1_gi_symptoms: String,
    pub glp1_gi_symptoms_details: String,
    pub glp1_gastric_ultrasound_performed: String,
    pub glp1_gastric_ultrasound_findings: String,
    pub glp1_full_stomach_precautions_planned: String,
    pub glp1_notes: String,
    pub allergen: String,
    pub category: String,
    pub reaction_type: String,
    pub reaction_severity: String,
    pub reaction_notes: String,
    pub verified: String,
    pub mets_estimate: Option<f64>,
    pub dasi_score: Option<f64>,
    pub ecog_performance_status: Option<i32>,
    pub clinical_frailty_scale: Option<i32>,
    pub six_minute_walk_metres: Option<i32>,
    pub sts_one_minute_reps: Option<i32>,
    pub tug_seconds: Option<f64>,
    pub cpet_performed: String,
    pub cpet_vo2_peak_ml_kg_min: Option<f64>,
    pub cpet_anaerobic_threshold_ml_kg_min: Option<f64>,
    pub cpet_notes: String,
    pub malnutrition_risk: String,
    pub unintentional_weight_loss_kg: Option<f64>,
    pub fried_weakness: String,
    pub fried_slowness: String,
    pub fried_low_physical_activity: String,
    pub fried_exhaustion: String,
    pub fried_unintentional_weight_loss: String,
    pub risk_analysis_index_score: Option<i32>,
    pub mini_cog_performed: String,
    pub mini_cog_score: Option<i32>,
    pub prehabilitation_indicated: String,
    pub prehabilitation_type: String,
    pub prehabilitation_start_date: Option<Date>,
    pub protein_supplementation_recommended: String,
    pub technique: String,
    pub airway_plan: String,
    pub rsi_planned: String,
    pub monitoring_level: String,
    pub analgesia_plan: String,
    pub regional_block_planned: String,
    pub dvt_prophylaxis: String,
    pub antibiotic_prophylaxis: String,
    pub post_op_disposition: String,
    pub anticipated_length_of_stay_days: Option<i32>,
    pub special_equipment: String,
    pub blood_products_required: String,
    pub hospital_number: String,
    pub indication_for_surgery: String,
    pub anaesthetist_name: String,
    pub previous_surgeries: String,
    pub previous_anaesthetic_issues: String,
    pub previous_anaesthetic_issues_details: String,
    pub family_history_anaesthetic_complications: String,
    pub family_history_anaesthetic_complications_details: String,
    pub urinalysis_findings: String,
    pub living_situation: String,
    pub support_at_home: String,
    pub mobility_status: String,
    pub falls_risk_within_year: String,
    pub vte_risk_level: String,
    pub covid_screening_result: String,
    pub discharge_destination: String,
    pub follow_up_requirements: String,
    pub social_services_involvement: String,
    pub reablement_physiotherapy_needs: String,
    pub consent_status: String,
    pub interpreter_required: String,
    pub discussion_procedure: String,
    pub discussion_anaesthetic: String,
    pub discussion_risks_benefits: String,
    pub discussion_alternatives: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.site_name = Set(self.site_name.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time.clone());
      item.planned_procedure = Set(self.planned_procedure.clone());
      item.surgical_specialty = Set(self.surgical_specialty.clone());
      item.urgency = Set(self.urgency.clone());
      item.laterality = Set(self.laterality.clone());
      item.surgical_severity = Set(self.surgical_severity.clone());
      item.anticipated_blood_loss_ml = Set(self.anticipated_blood_loss_ml);
      item.anticipated_duration_minutes = Set(self.anticipated_duration_minutes);
      item.consultant_surgeon = Set(self.consultant_surgeon.clone());
      item.planned_date = Set(self.planned_date);
      item.systolic_bp = Set(self.systolic_bp);
      item.diastolic_bp = Set(self.diastolic_bp);
      item.heart_rate = Set(self.heart_rate);
      item.respiratory_rate = Set(self.respiratory_rate);
      item.spo2_percent = Set(self.spo2_percent);
      item.temperature_celsius = Set(self.temperature_celsius);
      item.capillary_refill_seconds = Set(self.capillary_refill_seconds);
      item.pain_score_0_10 = Set(self.pain_score_0_10);
      item.on_room_air = Set(self.on_room_air.clone());
      item.supplemental_oxygen_litres = Set(self.supplemental_oxygen_litres);
      item.mallampati_class = Set(self.mallampati_class.clone());
      item.thyromental_distance_cm = Set(self.thyromental_distance_cm);
      item.mouth_opening_cm = Set(self.mouth_opening_cm);
      item.inter_incisor_gap_cm = Set(self.inter_incisor_gap_cm);
      item.neck_rom = Set(self.neck_rom.clone());
      item.cervical_spine_stability = Set(self.cervical_spine_stability.clone());
      item.dentition = Set(self.dentition.clone());
      item.beard = Set(self.beard.clone());
      item.upper_lip_bite_test = Set(self.upper_lip_bite_test.clone());
      item.prior_difficult_intubation = Set(self.prior_difficult_intubation.clone());
      item.stopbang_snoring = Set(self.stopbang_snoring.clone());
      item.stopbang_tired = Set(self.stopbang_tired.clone());
      item.stopbang_observed_apnoea = Set(self.stopbang_observed_apnoea.clone());
      item.stopbang_pressure = Set(self.stopbang_pressure.clone());
      item.stopbang_bmi_gt35 = Set(self.stopbang_bmi_gt35.clone());
      item.stopbang_age_gt50 = Set(self.stopbang_age_gt50.clone());
      item.stopbang_neck_gt40 = Set(self.stopbang_neck_gt40.clone());
      item.stopbang_male = Set(self.stopbang_male.clone());
      item.airway_notes = Set(self.airway_notes.clone());
      item.heart_rhythm = Set(self.heart_rhythm.clone());
      item.murmur_present = Set(self.murmur_present.clone());
      item.murmur_description = Set(self.murmur_description.clone());
      item.peripheral_pulses = Set(self.peripheral_pulses.clone());
      item.jvp_raised = Set(self.jvp_raised.clone());
      item.peripheral_oedema = Set(self.peripheral_oedema.clone());
      item.ecg_performed = Set(self.ecg_performed.clone());
      item.ecg_rhythm = Set(self.ecg_rhythm.clone());
      item.ecg_rate_bpm = Set(self.ecg_rate_bpm);
      item.ecg_axis = Set(self.ecg_axis.clone());
      item.ecg_ischaemic_changes = Set(self.ecg_ischaemic_changes.clone());
      item.ecg_notes = Set(self.ecg_notes.clone());
      item.echo_performed = Set(self.echo_performed.clone());
      item.echo_ef_percent = Set(self.echo_ef_percent);
      item.echo_notes = Set(self.echo_notes.clone());
      item.history_ihd = Set(self.history_ihd.clone());
      item.history_chf = Set(self.history_chf.clone());
      item.history_stroke_tia = Set(self.history_stroke_tia.clone());
      item.recent_mi_within_3_months = Set(self.recent_mi_within_3_months.clone());
      item.pacemaker_or_icd = Set(self.pacemaker_or_icd.clone());
      item.severe_valve_dysfunction = Set(self.severe_valve_dysfunction.clone());
      item.active_angina = Set(self.active_angina.clone());
      item.breath_sounds = Set(self.breath_sounds.clone());
      item.wheeze = Set(self.wheeze.clone());
      item.crackles = Set(self.crackles.clone());
      item.crepitations = Set(self.crepitations.clone());
      item.chest_wall_deformity = Set(self.chest_wall_deformity.clone());
      item.asthma = Set(self.asthma.clone());
      item.copd = Set(self.copd.clone());
      item.cxr_performed = Set(self.cxr_performed.clone());
      item.cxr_findings = Set(self.cxr_findings.clone());
      item.pft_performed = Set(self.pft_performed.clone());
      item.pft_fev1_percent_predicted = Set(self.pft_fev1_percent_predicted);
      item.pft_fev1_fvc_ratio = Set(self.pft_fev1_fvc_ratio);
      item.smoking_status = Set(self.smoking_status.clone());
      item.pack_years = Set(self.pack_years);
      item.covid_history = Set(self.covid_history.clone());
      item.days_since_covid = Set(self.days_since_covid);
      item.covid_unresolved_symptoms = Set(self.covid_unresolved_symptoms.clone());
      item.gcs_total = Set(self.gcs_total);
      item.gcs_eye = Set(self.gcs_eye);
      item.gcs_verbal = Set(self.gcs_verbal);
      item.gcs_motor = Set(self.gcs_motor);
      item.cognition_tool = Set(self.cognition_tool.clone());
      item.cognition_score = Set(self.cognition_score);
      item.cognitive_impairment = Set(self.cognitive_impairment.clone());
      item.capacity_concern = Set(self.capacity_concern.clone());
      item.cranial_nerves_notes = Set(self.cranial_nerves_notes.clone());
      item.motor_power = Set(self.motor_power.clone());
      item.sensory_notes = Set(self.sensory_notes.clone());
      item.reflexes = Set(self.reflexes.clone());
      item.recent_stroke_tia = Set(self.recent_stroke_tia.clone());
      item.days_since_stroke_tia = Set(self.days_since_stroke_tia);
      item.seizure_disorder = Set(self.seizure_disorder.clone());
      item.creatinine_umol_l = Set(self.creatinine_umol_l);
      item.egfr_ml_min_1_73m2 = Set(self.egfr_ml_min_1_73m2);
      item.urea_mmol_l = Set(self.urea_mmol_l);
      item.potassium_mmol_l = Set(self.potassium_mmol_l);
      item.sodium_mmol_l = Set(self.sodium_mmol_l);
      item.dialysis_status = Set(self.dialysis_status.clone());
      item.ckd_stage = Set(self.ckd_stage.clone());
      item.bilirubin_umol_l = Set(self.bilirubin_umol_l);
      item.alt_u_l = Set(self.alt_u_l);
      item.ast_u_l = Set(self.ast_u_l);
      item.alp_u_l = Set(self.alp_u_l);
      item.albumin_g_l = Set(self.albumin_g_l);
      item.chronic_liver_disease = Set(self.chronic_liver_disease.clone());
      item.child_pugh_class = Set(self.child_pugh_class.clone());
      item.hb_g_l = Set(self.hb_g_l);
      item.wcc_10_9_l = Set(self.wcc_10_9_l);
      item.platelets_10_9_l = Set(self.platelets_10_9_l);
      item.mcv_fl = Set(self.mcv_fl);
      item.ferritin_ug_l = Set(self.ferritin_ug_l);
      item.transferrin_saturation_percent = Set(self.transferrin_saturation_percent);
      item.inr = Set(self.inr);
      item.aptt_seconds = Set(self.aptt_seconds);
      item.fibrinogen_g_l = Set(self.fibrinogen_g_l);
      item.on_anticoagulant = Set(self.on_anticoagulant.clone());
      item.anticoagulant_type = Set(self.anticoagulant_type.clone());
      item.anticoagulant_hold_plan = Set(self.anticoagulant_hold_plan.clone());
      item.group_and_save = Set(self.group_and_save.clone());
      item.crossmatch_units = Set(self.crossmatch_units);
      item.last_transfusion_date = Set(self.last_transfusion_date);
      item.anaemia_severity = Set(self.anaemia_severity.clone());
      item.diabetes_type = Set(self.diabetes_type.clone());
      item.diabetes_on_insulin = Set(self.diabetes_on_insulin.clone());
      item.hba1c_mmol_mol = Set(self.hba1c_mmol_mol);
      item.fasting_glucose_mmol_l = Set(self.fasting_glucose_mmol_l);
      item.random_glucose_mmol_l = Set(self.random_glucose_mmol_l);
      item.diabetes_control = Set(self.diabetes_control.clone());
      item.diabetes_complications = Set(self.diabetes_complications.clone());
      item.thyroid_status = Set(self.thyroid_status.clone());
      item.tsh_mu_l = Set(self.tsh_mu_l);
      item.adrenal_status = Set(self.adrenal_status.clone());
      item.on_long_term_steroids = Set(self.on_long_term_steroids.clone());
      item.steroid_dose_mg = Set(self.steroid_dose_mg);
      item.steroid_cover_plan = Set(self.steroid_cover_plan.clone());
      item.abdominal_exam = Set(self.abdominal_exam.clone());
      item.abdominal_notes = Set(self.abdominal_notes.clone());
      item.reflux_symptoms = Set(self.reflux_symptoms.clone());
      item.hiatus_hernia = Set(self.hiatus_hernia.clone());
      item.previous_gastric_surgery = Set(self.previous_gastric_surgery.clone());
      item.ng_tube = Set(self.ng_tube.clone());
      item.stoma = Set(self.stoma.clone());
      item.fasting_confirmed = Set(self.fasting_confirmed.clone());
      item.last_solid_food_at = Set(self.last_solid_food_at);
      item.last_clear_fluid_at = Set(self.last_clear_fluid_at);
      item.rapid_sequence_induction_needed = Set(self.rapid_sequence_induction_needed.clone());
      item.spine_exam = Set(self.spine_exam.clone());
      item.spine_notes = Set(self.spine_notes.clone());
      item.neuraxial_suitable = Set(self.neuraxial_suitable.clone());
      item.joint_rom_hip = Set(self.joint_rom_hip.clone());
      item.joint_rom_shoulder = Set(self.joint_rom_shoulder.clone());
      item.joint_rom_neck = Set(self.joint_rom_neck.clone());
      item.skin_iv_access = Set(self.skin_iv_access.clone());
      item.skin_block_site = Set(self.skin_block_site.clone());
      item.pressure_ulcer_risk = Set(self.pressure_ulcer_risk.clone());
      item.name = Set(self.name.clone());
      item.dose = Set(self.dose.clone());
      item.route = Set(self.route.clone());
      item.frequency = Set(self.frequency.clone());
      item.indication = Set(self.indication.clone());
      item.class = Set(self.class.clone());
      item.perioperative_action = Set(self.perioperative_action.clone());
      item.perioperative_notes = Set(self.perioperative_notes.clone());
      item.last_dose_at = Set(self.last_dose_at);
      item.on_glp1_receptor_agonist = Set(self.on_glp1_receptor_agonist.clone());
      item.glp1_agonist_name = Set(self.glp1_agonist_name.clone());
      item.glp1_formulation = Set(self.glp1_formulation.clone());
      item.glp1_last_dose_at = Set(self.glp1_last_dose_at);
      item.glp1_held_per_guideline = Set(self.glp1_held_per_guideline.clone());
      item.glp1_extended_clear_fluids_confirmed = Set(self.glp1_extended_clear_fluids_confirmed.clone());
      item.glp1_gi_symptoms = Set(self.glp1_gi_symptoms.clone());
      item.glp1_gi_symptoms_details = Set(self.glp1_gi_symptoms_details.clone());
      item.glp1_gastric_ultrasound_performed = Set(self.glp1_gastric_ultrasound_performed.clone());
      item.glp1_gastric_ultrasound_findings = Set(self.glp1_gastric_ultrasound_findings.clone());
      item.glp1_full_stomach_precautions_planned = Set(self.glp1_full_stomach_precautions_planned.clone());
      item.glp1_notes = Set(self.glp1_notes.clone());
      item.allergen = Set(self.allergen.clone());
      item.category = Set(self.category.clone());
      item.reaction_type = Set(self.reaction_type.clone());
      item.reaction_severity = Set(self.reaction_severity.clone());
      item.reaction_notes = Set(self.reaction_notes.clone());
      item.verified = Set(self.verified.clone());
      item.mets_estimate = Set(self.mets_estimate);
      item.dasi_score = Set(self.dasi_score);
      item.ecog_performance_status = Set(self.ecog_performance_status);
      item.clinical_frailty_scale = Set(self.clinical_frailty_scale);
      item.six_minute_walk_metres = Set(self.six_minute_walk_metres);
      item.sts_one_minute_reps = Set(self.sts_one_minute_reps);
      item.tug_seconds = Set(self.tug_seconds);
      item.cpet_performed = Set(self.cpet_performed.clone());
      item.cpet_vo2_peak_ml_kg_min = Set(self.cpet_vo2_peak_ml_kg_min);
      item.cpet_anaerobic_threshold_ml_kg_min = Set(self.cpet_anaerobic_threshold_ml_kg_min);
      item.cpet_notes = Set(self.cpet_notes.clone());
      item.malnutrition_risk = Set(self.malnutrition_risk.clone());
      item.unintentional_weight_loss_kg = Set(self.unintentional_weight_loss_kg);
      item.fried_weakness = Set(self.fried_weakness.clone());
      item.fried_slowness = Set(self.fried_slowness.clone());
      item.fried_low_physical_activity = Set(self.fried_low_physical_activity.clone());
      item.fried_exhaustion = Set(self.fried_exhaustion.clone());
      item.fried_unintentional_weight_loss = Set(self.fried_unintentional_weight_loss.clone());
      item.risk_analysis_index_score = Set(self.risk_analysis_index_score);
      item.mini_cog_performed = Set(self.mini_cog_performed.clone());
      item.mini_cog_score = Set(self.mini_cog_score);
      item.prehabilitation_indicated = Set(self.prehabilitation_indicated.clone());
      item.prehabilitation_type = Set(self.prehabilitation_type.clone());
      item.prehabilitation_start_date = Set(self.prehabilitation_start_date);
      item.protein_supplementation_recommended = Set(self.protein_supplementation_recommended.clone());
      item.technique = Set(self.technique.clone());
      item.airway_plan = Set(self.airway_plan.clone());
      item.rsi_planned = Set(self.rsi_planned.clone());
      item.monitoring_level = Set(self.monitoring_level.clone());
      item.analgesia_plan = Set(self.analgesia_plan.clone());
      item.regional_block_planned = Set(self.regional_block_planned.clone());
      item.dvt_prophylaxis = Set(self.dvt_prophylaxis.clone());
      item.antibiotic_prophylaxis = Set(self.antibiotic_prophylaxis.clone());
      item.post_op_disposition = Set(self.post_op_disposition.clone());
      item.anticipated_length_of_stay_days = Set(self.anticipated_length_of_stay_days);
      item.special_equipment = Set(self.special_equipment.clone());
      item.blood_products_required = Set(self.blood_products_required.clone());
      item.hospital_number = Set(self.hospital_number.clone());
      item.indication_for_surgery = Set(self.indication_for_surgery.clone());
      item.anaesthetist_name = Set(self.anaesthetist_name.clone());
      item.previous_surgeries = Set(self.previous_surgeries.clone());
      item.previous_anaesthetic_issues = Set(self.previous_anaesthetic_issues.clone());
      item.previous_anaesthetic_issues_details = Set(self.previous_anaesthetic_issues_details.clone());
      item.family_history_anaesthetic_complications = Set(self.family_history_anaesthetic_complications.clone());
      item.family_history_anaesthetic_complications_details = Set(self.family_history_anaesthetic_complications_details.clone());
      item.urinalysis_findings = Set(self.urinalysis_findings.clone());
      item.living_situation = Set(self.living_situation.clone());
      item.support_at_home = Set(self.support_at_home.clone());
      item.mobility_status = Set(self.mobility_status.clone());
      item.falls_risk_within_year = Set(self.falls_risk_within_year.clone());
      item.vte_risk_level = Set(self.vte_risk_level.clone());
      item.covid_screening_result = Set(self.covid_screening_result.clone());
      item.discharge_destination = Set(self.discharge_destination.clone());
      item.follow_up_requirements = Set(self.follow_up_requirements.clone());
      item.social_services_involvement = Set(self.social_services_involvement.clone());
      item.reablement_physiotherapy_needs = Set(self.reablement_physiotherapy_needs.clone());
      item.consent_status = Set(self.consent_status.clone());
      item.interpreter_required = Set(self.interpreter_required.clone());
      item.discussion_procedure = Set(self.discussion_procedure.clone());
      item.discussion_anaesthetic = Set(self.discussion_anaesthetic.clone());
      item.discussion_risks_benefits = Set(self.discussion_risks_benefits.clone());
      item.discussion_alternatives = Set(self.discussion_alternatives.clone());
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
        .prefix("api/pre_operative_assessment_by_clinicians/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
