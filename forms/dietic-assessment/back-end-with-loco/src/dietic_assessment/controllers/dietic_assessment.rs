#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::dietic_assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub dietitian_id: i64,
    pub status: String,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<String>,
    pub site_name: String,
    pub service_name: String,
    pub setting: String,
    pub appointment_type: String,
    pub planned_duration_minutes: Option<i32>,
    pub interpreter_required: String,
    pub interpreter_language: String,
    pub referral_source: String,
    pub referral_date: Option<Date>,
    pub referral_reason: String,
    pub primary_condition: String,
    pub consent_to_record: String,
    pub accompanied_by: String,
    pub condition_diabetes: String,
    pub condition_coeliac: String,
    pub condition_inflammatory_bowel_disease: String,
    pub condition_chronic_kidney_disease: String,
    pub condition_liver_disease: String,
    pub condition_cancer: String,
    pub condition_cardiovascular_disease: String,
    pub condition_respiratory_disease: String,
    pub condition_stroke: String,
    pub condition_dementia: String,
    pub condition_eating_disorder: String,
    pub condition_other: String,
    pub recent_surgery: String,
    pub recent_surgery_type: String,
    pub recent_surgery_date: Option<Date>,
    pub gastrointestinal_surgery: String,
    pub current_symptoms: String,
    pub family_history: String,
    pub pregnancy_status: String,
    pub takes_prescription_medicines: String,
    pub takes_over_the_counter_medicines: String,
    pub takes_vitamin_supplements: String,
    pub takes_mineral_supplements: String,
    pub takes_herbal_products: String,
    pub takes_oral_nutritional_supplements: String,
    pub oral_nutritional_supplement_detail: String,
    pub enteral_nutrition: String,
    pub enteral_route: String,
    pub enteral_tube_problem: String,
    pub parenteral_nutrition: String,
    pub drug_nutrient_interaction: String,
    pub drug_nutrient_interaction_detail: String,
    pub medication_adherence: String,
    pub medication_notes: String,
    pub measurement_method: String,
    pub height_as_cm: Option<f64>,
    pub weight_as_kg: Option<f64>,
    pub body_mass_index: Option<f64>,
    pub mid_upper_arm_circumference_as_cm: Option<f64>,
    pub calf_circumference_as_cm: Option<f64>,
    pub waist_as_cm: Option<f64>,
    pub usual_weight_as_kg: Option<f64>,
    pub weight_3_months_ago_as_kg: Option<f64>,
    pub weight_6_months_ago_as_kg: Option<f64>,
    pub weight_loss_percent: Option<f64>,
    pub weight_loss_is_intentional: String,
    pub weight_trend: String,
    pub clothes_or_jewellery_looser: String,
    pub oedema_present: String,
    pub oedema_adjustment_kg: Option<f64>,
    pub ascites_present: String,
    pub amputation_present: String,
    pub amputation_adjustment_percent: Option<f64>,
    pub anthropometry_notes: String,
    pub bloods_sample_date: Option<Date>,
    pub albumin_g_per_l: Option<f64>,
    pub c_reactive_protein_mg_per_l: Option<f64>,
    pub haemoglobin_g_per_l: Option<f64>,
    pub ferritin_ug_per_l: Option<f64>,
    pub vitamin_b12_ng_per_l: Option<f64>,
    pub folate_ug_per_l: Option<f64>,
    pub vitamin_d_nmol_per_l: Option<f64>,
    pub hba1c_mmol_per_mol: Option<f64>,
    pub sodium_mmol_per_l: Option<f64>,
    pub potassium_mmol_per_l: Option<f64>,
    pub magnesium_mmol_per_l: Option<f64>,
    pub phosphate_mmol_per_l: Option<f64>,
    pub corrected_calcium_mmol_per_l: Option<f64>,
    pub urea_mmol_per_l: Option<f64>,
    pub creatinine_umol_per_l: Option<f64>,
    pub egfr_ml_per_min: Option<f64>,
    pub alanine_aminotransferase_u_per_l: Option<f64>,
    pub bilirubin_umol_per_l: Option<f64>,
    pub total_cholesterol_mmol_per_l: Option<f64>,
    pub triglycerides_mmol_per_l: Option<f64>,
    pub biochemistry_notes: String,
    pub subcutaneous_fat_loss: String,
    pub muscle_wasting_temples: String,
    pub muscle_wasting_clavicles: String,
    pub muscle_wasting_quadriceps: String,
    pub muscle_wasting_severity: String,
    pub peripheral_oedema_severity: String,
    pub oral_health: String,
    pub dentition: String,
    pub chewing_ability: String,
    pub tongue_and_mucosa: String,
    pub skin_condition: String,
    pub hair_condition: String,
    pub nail_condition: String,
    pub pressure_ulcer_present: String,
    pub pressure_ulcer_category: String,
    pub hand_grip_strength_kg: Option<f64>,
    pub physical_exam_notes: String,
    pub meals_per_day: Option<i32>,
    pub snacks_per_day: Option<i32>,
    pub recall_breakfast: String,
    pub recall_mid_morning: String,
    pub recall_lunch: String,
    pub recall_afternoon: String,
    pub recall_dinner: String,
    pub recall_evening: String,
    pub portion_size: String,
    pub appetite: String,
    pub appetite_score_0_10: Option<i32>,
    pub proportion_of_usual_intake_percent: Option<i32>,
    pub meals_out_per_week: Option<i32>,
    pub takeaways_per_week: Option<i32>,
    pub food_diary_completed: String,
    pub estimated_energy_intake_kcal: Option<i32>,
    pub estimated_protein_intake_g: Option<i32>,
    pub eats_alone: String,
    pub dietary_recall_notes: String,
    pub fluid_intake_ml_per_day: Option<i32>,
    pub fluid_types: String,
    pub caffeinated_drinks_per_day: Option<i32>,
    pub alcohol_units_per_week: Option<f64>,
    pub thickened_fluids: String,
    pub thickened_fluids_iddsi_level: String,
    pub hydration_signs: String,
    pub fluid_restriction: String,
    pub fluid_restriction_ml_per_day: Option<i32>,
    pub hydration_notes: String,
    pub has_food_allergy: String,
    pub has_food_intolerance: String,
    pub foods_avoided: String,
    pub avoidance_reason: String,
    pub dislikes: String,
    pub therapeutic_diet: String,
    pub dietary_pattern: String,
    pub religious_or_cultural_requirement: String,
    pub fasting_practice: String,
    pub texture_modified_diet: String,
    pub texture_modified_iddsi_level: String,
    pub preferences_notes: String,
    pub appetite_change: String,
    pub early_satiety: String,
    pub nausea: String,
    pub vomiting: String,
    pub dysphagia: String,
    pub dysphagia_screen_outcome: String,
    pub speech_and_language_therapy: String,
    pub reflux: String,
    pub abdominal_pain: String,
    pub bloating: String,
    pub bowel_frequency_per_week: Option<i32>,
    pub bristol_stool_type: String,
    pub constipation: String,
    pub diarrhoea: String,
    pub stoma_present: String,
    pub stoma_output_ml_per_day: Option<i32>,
    pub malabsorption_signs: String,
    pub gastrointestinal_notes: String,
    pub living_situation: String,
    pub who_shops: String,
    pub who_cooks: String,
    pub cooking_skills: String,
    pub cooking_confidence_0_10: Option<i32>,
    pub has_cooker: String,
    pub has_fridge: String,
    pub has_freezer: String,
    pub has_microwave: String,
    pub food_budget_per_week: Option<f64>,
    pub worried_food_would_run_out: String,
    pub skipped_meals_for_money: String,
    pub uses_food_bank: String,
    pub access_to_shops: String,
    pub has_transport: String,
    pub work_pattern: String,
    pub meal_support: String,
    pub social_support: String,
    pub environment_notes: String,
    pub activity_level: String,
    pub exercise_type: String,
    pub exercise_minutes_per_week: Option<i32>,
    pub sedentary_hours_per_day: Option<f64>,
    pub mobility: String,
    pub falls_in_last_12_months: Option<i32>,
    pub sarcf_strength: Option<i32>,
    pub sarcf_walking: Option<i32>,
    pub sarcf_rising_from_chair: Option<i32>,
    pub sarcf_climbing_stairs: Option<i32>,
    pub sarcf_falls: Option<i32>,
    pub eats_independently: String,
    pub feeding_assistance_required: String,
    pub function_notes: String,
    pub motivation_0_10: Option<i32>,
    pub stage_of_change: String,
    pub self_efficacy_0_10: Option<i32>,
    pub previous_attempts: String,
    pub barriers: String,
    pub scoff_make_yourself_sick: String,
    pub scoff_lost_control: String,
    pub scoff_lost_one_stone: String,
    pub scoff_believe_yourself_fat: String,
    pub scoff_food_dominates: String,
    pub mood: String,
    pub anxiety: String,
    pub cognitive_impairment: String,
    pub capacity_concern: String,
    pub safeguarding_concern: String,
    pub health_literacy: String,
    pub preferred_learning_style: String,
    pub patient_goal_in_own_words: String,
    pub acutely_ill: String,
    pub no_nutritional_intake_over_5_days: String,
    pub days_of_negligible_intake: Option<i32>,
    pub nrs_2002_score: Option<i32>,
    pub energy_requirement_kcal: Option<i32>,
    pub protein_requirement_g: Option<i32>,
    pub fluid_requirement_ml: Option<i32>,
    pub requirement_equation: String,
    pub pes_problem: String,
    pub pes_etiology: String,
    pub pes_signs_symptoms: String,
    pub intervention_type: String,
    pub prescribed_supplement: String,
    pub prescribed_supplement_dose: String,
    pub texture_modification_plan: String,
    pub goal_1: String,
    pub goal_2: String,
    pub goal_3: String,
    pub education_provided: String,
    pub resources_given: String,
    pub monitoring_indicators: String,
    pub review_interval_weeks: Option<i32>,
    pub review_date: Option<Date>,
    pub onward_referral: String,
    pub additional_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.dietitian_id = Set(self.dietitian_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time.clone());
      item.site_name = Set(self.site_name.clone());
      item.service_name = Set(self.service_name.clone());
      item.setting = Set(self.setting.clone());
      item.appointment_type = Set(self.appointment_type.clone());
      item.planned_duration_minutes = Set(self.planned_duration_minutes);
      item.interpreter_required = Set(self.interpreter_required.clone());
      item.interpreter_language = Set(self.interpreter_language.clone());
      item.referral_source = Set(self.referral_source.clone());
      item.referral_date = Set(self.referral_date);
      item.referral_reason = Set(self.referral_reason.clone());
      item.primary_condition = Set(self.primary_condition.clone());
      item.consent_to_record = Set(self.consent_to_record.clone());
      item.accompanied_by = Set(self.accompanied_by.clone());
      item.condition_diabetes = Set(self.condition_diabetes.clone());
      item.condition_coeliac = Set(self.condition_coeliac.clone());
      item.condition_inflammatory_bowel_disease = Set(self.condition_inflammatory_bowel_disease.clone());
      item.condition_chronic_kidney_disease = Set(self.condition_chronic_kidney_disease.clone());
      item.condition_liver_disease = Set(self.condition_liver_disease.clone());
      item.condition_cancer = Set(self.condition_cancer.clone());
      item.condition_cardiovascular_disease = Set(self.condition_cardiovascular_disease.clone());
      item.condition_respiratory_disease = Set(self.condition_respiratory_disease.clone());
      item.condition_stroke = Set(self.condition_stroke.clone());
      item.condition_dementia = Set(self.condition_dementia.clone());
      item.condition_eating_disorder = Set(self.condition_eating_disorder.clone());
      item.condition_other = Set(self.condition_other.clone());
      item.recent_surgery = Set(self.recent_surgery.clone());
      item.recent_surgery_type = Set(self.recent_surgery_type.clone());
      item.recent_surgery_date = Set(self.recent_surgery_date);
      item.gastrointestinal_surgery = Set(self.gastrointestinal_surgery.clone());
      item.current_symptoms = Set(self.current_symptoms.clone());
      item.family_history = Set(self.family_history.clone());
      item.pregnancy_status = Set(self.pregnancy_status.clone());
      item.takes_prescription_medicines = Set(self.takes_prescription_medicines.clone());
      item.takes_over_the_counter_medicines = Set(self.takes_over_the_counter_medicines.clone());
      item.takes_vitamin_supplements = Set(self.takes_vitamin_supplements.clone());
      item.takes_mineral_supplements = Set(self.takes_mineral_supplements.clone());
      item.takes_herbal_products = Set(self.takes_herbal_products.clone());
      item.takes_oral_nutritional_supplements = Set(self.takes_oral_nutritional_supplements.clone());
      item.oral_nutritional_supplement_detail = Set(self.oral_nutritional_supplement_detail.clone());
      item.enteral_nutrition = Set(self.enteral_nutrition.clone());
      item.enteral_route = Set(self.enteral_route.clone());
      item.enteral_tube_problem = Set(self.enteral_tube_problem.clone());
      item.parenteral_nutrition = Set(self.parenteral_nutrition.clone());
      item.drug_nutrient_interaction = Set(self.drug_nutrient_interaction.clone());
      item.drug_nutrient_interaction_detail = Set(self.drug_nutrient_interaction_detail.clone());
      item.medication_adherence = Set(self.medication_adherence.clone());
      item.medication_notes = Set(self.medication_notes.clone());
      item.measurement_method = Set(self.measurement_method.clone());
      item.height_as_cm = Set(self.height_as_cm);
      item.weight_as_kg = Set(self.weight_as_kg);
      item.body_mass_index = Set(self.body_mass_index);
      item.mid_upper_arm_circumference_as_cm = Set(self.mid_upper_arm_circumference_as_cm);
      item.calf_circumference_as_cm = Set(self.calf_circumference_as_cm);
      item.waist_as_cm = Set(self.waist_as_cm);
      item.usual_weight_as_kg = Set(self.usual_weight_as_kg);
      item.weight_3_months_ago_as_kg = Set(self.weight_3_months_ago_as_kg);
      item.weight_6_months_ago_as_kg = Set(self.weight_6_months_ago_as_kg);
      item.weight_loss_percent = Set(self.weight_loss_percent);
      item.weight_loss_is_intentional = Set(self.weight_loss_is_intentional.clone());
      item.weight_trend = Set(self.weight_trend.clone());
      item.clothes_or_jewellery_looser = Set(self.clothes_or_jewellery_looser.clone());
      item.oedema_present = Set(self.oedema_present.clone());
      item.oedema_adjustment_kg = Set(self.oedema_adjustment_kg);
      item.ascites_present = Set(self.ascites_present.clone());
      item.amputation_present = Set(self.amputation_present.clone());
      item.amputation_adjustment_percent = Set(self.amputation_adjustment_percent);
      item.anthropometry_notes = Set(self.anthropometry_notes.clone());
      item.bloods_sample_date = Set(self.bloods_sample_date);
      item.albumin_g_per_l = Set(self.albumin_g_per_l);
      item.c_reactive_protein_mg_per_l = Set(self.c_reactive_protein_mg_per_l);
      item.haemoglobin_g_per_l = Set(self.haemoglobin_g_per_l);
      item.ferritin_ug_per_l = Set(self.ferritin_ug_per_l);
      item.vitamin_b12_ng_per_l = Set(self.vitamin_b12_ng_per_l);
      item.folate_ug_per_l = Set(self.folate_ug_per_l);
      item.vitamin_d_nmol_per_l = Set(self.vitamin_d_nmol_per_l);
      item.hba1c_mmol_per_mol = Set(self.hba1c_mmol_per_mol);
      item.sodium_mmol_per_l = Set(self.sodium_mmol_per_l);
      item.potassium_mmol_per_l = Set(self.potassium_mmol_per_l);
      item.magnesium_mmol_per_l = Set(self.magnesium_mmol_per_l);
      item.phosphate_mmol_per_l = Set(self.phosphate_mmol_per_l);
      item.corrected_calcium_mmol_per_l = Set(self.corrected_calcium_mmol_per_l);
      item.urea_mmol_per_l = Set(self.urea_mmol_per_l);
      item.creatinine_umol_per_l = Set(self.creatinine_umol_per_l);
      item.egfr_ml_per_min = Set(self.egfr_ml_per_min);
      item.alanine_aminotransferase_u_per_l = Set(self.alanine_aminotransferase_u_per_l);
      item.bilirubin_umol_per_l = Set(self.bilirubin_umol_per_l);
      item.total_cholesterol_mmol_per_l = Set(self.total_cholesterol_mmol_per_l);
      item.triglycerides_mmol_per_l = Set(self.triglycerides_mmol_per_l);
      item.biochemistry_notes = Set(self.biochemistry_notes.clone());
      item.subcutaneous_fat_loss = Set(self.subcutaneous_fat_loss.clone());
      item.muscle_wasting_temples = Set(self.muscle_wasting_temples.clone());
      item.muscle_wasting_clavicles = Set(self.muscle_wasting_clavicles.clone());
      item.muscle_wasting_quadriceps = Set(self.muscle_wasting_quadriceps.clone());
      item.muscle_wasting_severity = Set(self.muscle_wasting_severity.clone());
      item.peripheral_oedema_severity = Set(self.peripheral_oedema_severity.clone());
      item.oral_health = Set(self.oral_health.clone());
      item.dentition = Set(self.dentition.clone());
      item.chewing_ability = Set(self.chewing_ability.clone());
      item.tongue_and_mucosa = Set(self.tongue_and_mucosa.clone());
      item.skin_condition = Set(self.skin_condition.clone());
      item.hair_condition = Set(self.hair_condition.clone());
      item.nail_condition = Set(self.nail_condition.clone());
      item.pressure_ulcer_present = Set(self.pressure_ulcer_present.clone());
      item.pressure_ulcer_category = Set(self.pressure_ulcer_category.clone());
      item.hand_grip_strength_kg = Set(self.hand_grip_strength_kg);
      item.physical_exam_notes = Set(self.physical_exam_notes.clone());
      item.meals_per_day = Set(self.meals_per_day);
      item.snacks_per_day = Set(self.snacks_per_day);
      item.recall_breakfast = Set(self.recall_breakfast.clone());
      item.recall_mid_morning = Set(self.recall_mid_morning.clone());
      item.recall_lunch = Set(self.recall_lunch.clone());
      item.recall_afternoon = Set(self.recall_afternoon.clone());
      item.recall_dinner = Set(self.recall_dinner.clone());
      item.recall_evening = Set(self.recall_evening.clone());
      item.portion_size = Set(self.portion_size.clone());
      item.appetite = Set(self.appetite.clone());
      item.appetite_score_0_10 = Set(self.appetite_score_0_10);
      item.proportion_of_usual_intake_percent = Set(self.proportion_of_usual_intake_percent);
      item.meals_out_per_week = Set(self.meals_out_per_week);
      item.takeaways_per_week = Set(self.takeaways_per_week);
      item.food_diary_completed = Set(self.food_diary_completed.clone());
      item.estimated_energy_intake_kcal = Set(self.estimated_energy_intake_kcal);
      item.estimated_protein_intake_g = Set(self.estimated_protein_intake_g);
      item.eats_alone = Set(self.eats_alone.clone());
      item.dietary_recall_notes = Set(self.dietary_recall_notes.clone());
      item.fluid_intake_ml_per_day = Set(self.fluid_intake_ml_per_day);
      item.fluid_types = Set(self.fluid_types.clone());
      item.caffeinated_drinks_per_day = Set(self.caffeinated_drinks_per_day);
      item.alcohol_units_per_week = Set(self.alcohol_units_per_week);
      item.thickened_fluids = Set(self.thickened_fluids.clone());
      item.thickened_fluids_iddsi_level = Set(self.thickened_fluids_iddsi_level.clone());
      item.hydration_signs = Set(self.hydration_signs.clone());
      item.fluid_restriction = Set(self.fluid_restriction.clone());
      item.fluid_restriction_ml_per_day = Set(self.fluid_restriction_ml_per_day);
      item.hydration_notes = Set(self.hydration_notes.clone());
      item.has_food_allergy = Set(self.has_food_allergy.clone());
      item.has_food_intolerance = Set(self.has_food_intolerance.clone());
      item.foods_avoided = Set(self.foods_avoided.clone());
      item.avoidance_reason = Set(self.avoidance_reason.clone());
      item.dislikes = Set(self.dislikes.clone());
      item.therapeutic_diet = Set(self.therapeutic_diet.clone());
      item.dietary_pattern = Set(self.dietary_pattern.clone());
      item.religious_or_cultural_requirement = Set(self.religious_or_cultural_requirement.clone());
      item.fasting_practice = Set(self.fasting_practice.clone());
      item.texture_modified_diet = Set(self.texture_modified_diet.clone());
      item.texture_modified_iddsi_level = Set(self.texture_modified_iddsi_level.clone());
      item.preferences_notes = Set(self.preferences_notes.clone());
      item.appetite_change = Set(self.appetite_change.clone());
      item.early_satiety = Set(self.early_satiety.clone());
      item.nausea = Set(self.nausea.clone());
      item.vomiting = Set(self.vomiting.clone());
      item.dysphagia = Set(self.dysphagia.clone());
      item.dysphagia_screen_outcome = Set(self.dysphagia_screen_outcome.clone());
      item.speech_and_language_therapy = Set(self.speech_and_language_therapy.clone());
      item.reflux = Set(self.reflux.clone());
      item.abdominal_pain = Set(self.abdominal_pain.clone());
      item.bloating = Set(self.bloating.clone());
      item.bowel_frequency_per_week = Set(self.bowel_frequency_per_week);
      item.bristol_stool_type = Set(self.bristol_stool_type.clone());
      item.constipation = Set(self.constipation.clone());
      item.diarrhoea = Set(self.diarrhoea.clone());
      item.stoma_present = Set(self.stoma_present.clone());
      item.stoma_output_ml_per_day = Set(self.stoma_output_ml_per_day);
      item.malabsorption_signs = Set(self.malabsorption_signs.clone());
      item.gastrointestinal_notes = Set(self.gastrointestinal_notes.clone());
      item.living_situation = Set(self.living_situation.clone());
      item.who_shops = Set(self.who_shops.clone());
      item.who_cooks = Set(self.who_cooks.clone());
      item.cooking_skills = Set(self.cooking_skills.clone());
      item.cooking_confidence_0_10 = Set(self.cooking_confidence_0_10);
      item.has_cooker = Set(self.has_cooker.clone());
      item.has_fridge = Set(self.has_fridge.clone());
      item.has_freezer = Set(self.has_freezer.clone());
      item.has_microwave = Set(self.has_microwave.clone());
      item.food_budget_per_week = Set(self.food_budget_per_week);
      item.worried_food_would_run_out = Set(self.worried_food_would_run_out.clone());
      item.skipped_meals_for_money = Set(self.skipped_meals_for_money.clone());
      item.uses_food_bank = Set(self.uses_food_bank.clone());
      item.access_to_shops = Set(self.access_to_shops.clone());
      item.has_transport = Set(self.has_transport.clone());
      item.work_pattern = Set(self.work_pattern.clone());
      item.meal_support = Set(self.meal_support.clone());
      item.social_support = Set(self.social_support.clone());
      item.environment_notes = Set(self.environment_notes.clone());
      item.activity_level = Set(self.activity_level.clone());
      item.exercise_type = Set(self.exercise_type.clone());
      item.exercise_minutes_per_week = Set(self.exercise_minutes_per_week);
      item.sedentary_hours_per_day = Set(self.sedentary_hours_per_day);
      item.mobility = Set(self.mobility.clone());
      item.falls_in_last_12_months = Set(self.falls_in_last_12_months);
      item.sarcf_strength = Set(self.sarcf_strength);
      item.sarcf_walking = Set(self.sarcf_walking);
      item.sarcf_rising_from_chair = Set(self.sarcf_rising_from_chair);
      item.sarcf_climbing_stairs = Set(self.sarcf_climbing_stairs);
      item.sarcf_falls = Set(self.sarcf_falls);
      item.eats_independently = Set(self.eats_independently.clone());
      item.feeding_assistance_required = Set(self.feeding_assistance_required.clone());
      item.function_notes = Set(self.function_notes.clone());
      item.motivation_0_10 = Set(self.motivation_0_10);
      item.stage_of_change = Set(self.stage_of_change.clone());
      item.self_efficacy_0_10 = Set(self.self_efficacy_0_10);
      item.previous_attempts = Set(self.previous_attempts.clone());
      item.barriers = Set(self.barriers.clone());
      item.scoff_make_yourself_sick = Set(self.scoff_make_yourself_sick.clone());
      item.scoff_lost_control = Set(self.scoff_lost_control.clone());
      item.scoff_lost_one_stone = Set(self.scoff_lost_one_stone.clone());
      item.scoff_believe_yourself_fat = Set(self.scoff_believe_yourself_fat.clone());
      item.scoff_food_dominates = Set(self.scoff_food_dominates.clone());
      item.mood = Set(self.mood.clone());
      item.anxiety = Set(self.anxiety.clone());
      item.cognitive_impairment = Set(self.cognitive_impairment.clone());
      item.capacity_concern = Set(self.capacity_concern.clone());
      item.safeguarding_concern = Set(self.safeguarding_concern.clone());
      item.health_literacy = Set(self.health_literacy.clone());
      item.preferred_learning_style = Set(self.preferred_learning_style.clone());
      item.patient_goal_in_own_words = Set(self.patient_goal_in_own_words.clone());
      item.acutely_ill = Set(self.acutely_ill.clone());
      item.no_nutritional_intake_over_5_days = Set(self.no_nutritional_intake_over_5_days.clone());
      item.days_of_negligible_intake = Set(self.days_of_negligible_intake);
      item.nrs_2002_score = Set(self.nrs_2002_score);
      item.energy_requirement_kcal = Set(self.energy_requirement_kcal);
      item.protein_requirement_g = Set(self.protein_requirement_g);
      item.fluid_requirement_ml = Set(self.fluid_requirement_ml);
      item.requirement_equation = Set(self.requirement_equation.clone());
      item.pes_problem = Set(self.pes_problem.clone());
      item.pes_etiology = Set(self.pes_etiology.clone());
      item.pes_signs_symptoms = Set(self.pes_signs_symptoms.clone());
      item.intervention_type = Set(self.intervention_type.clone());
      item.prescribed_supplement = Set(self.prescribed_supplement.clone());
      item.prescribed_supplement_dose = Set(self.prescribed_supplement_dose.clone());
      item.texture_modification_plan = Set(self.texture_modification_plan.clone());
      item.goal_1 = Set(self.goal_1.clone());
      item.goal_2 = Set(self.goal_2.clone());
      item.goal_3 = Set(self.goal_3.clone());
      item.education_provided = Set(self.education_provided.clone());
      item.resources_given = Set(self.resources_given.clone());
      item.monitoring_indicators = Set(self.monitoring_indicators.clone());
      item.review_interval_weeks = Set(self.review_interval_weeks);
      item.review_date = Set(self.review_date);
      item.onward_referral = Set(self.onward_referral.clone());
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
        .prefix("api/dietic_assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
