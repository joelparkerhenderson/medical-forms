#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pre_operative_assessment_by_patients::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub weight: Option<f64>,
    pub height: Option<f64>,
    pub bmi: Option<f64>,
    pub planned_procedure: String,
    pub procedure_urgency: String,
    pub status: String,
    pub hypertension: String,
    pub hypertension_controlled: String,
    pub ischemic_heart_disease: String,
    pub ihd_details: String,
    pub heart_failure: String,
    pub heart_failure_nyha: String,
    pub valvular_disease: String,
    pub valvular_details: String,
    pub arrhythmia: String,
    pub arrhythmia_type: String,
    pub pacemaker: String,
    pub recent_mi: String,
    pub recent_mi_weeks: Option<i32>,
    pub asthma: String,
    pub asthma_frequency: String,
    pub copd: String,
    pub copd_severity: String,
    pub osa: String,
    pub osa_cpap: String,
    pub smoking: String,
    pub smoking_pack_years: Option<i32>,
    pub recent_urti: String,
    pub ckd: String,
    pub ckd_stage: String,
    pub dialysis: String,
    pub dialysis_type: String,
    pub liver_disease: String,
    pub cirrhosis: String,
    pub child_pugh_score: String,
    pub hepatitis: String,
    pub hepatitis_type: String,
    pub diabetes: String,
    pub diabetes_control: String,
    pub diabetes_on_insulin: String,
    pub thyroid_disease: String,
    pub thyroid_type: String,
    pub adrenal_insufficiency: String,
    pub stroke_or_tia: String,
    pub stroke_details: String,
    pub epilepsy: String,
    pub epilepsy_controlled: String,
    pub neuromuscular_disease: String,
    pub neuromuscular_details: String,
    pub raised_icp: String,
    pub bleeding_disorder: String,
    pub bleeding_details: String,
    pub on_anticoagulants: String,
    pub anticoagulant_type: String,
    pub sickle_cell_disease: String,
    pub sickle_cell_trait: String,
    pub anaemia: String,
    pub rheumatoid_arthritis: String,
    pub cervical_spine_issues: String,
    pub limited_neck_movement: String,
    pub limited_mouth_opening: String,
    pub dental_issues: String,
    pub dental_details: String,
    pub previous_difficult_airway: String,
    pub mallampati_score: String,
    pub gord: String,
    pub hiatus_hernia: String,
    pub nausea: String,
    pub name: String,
    pub dose: String,
    pub frequency: String,
    pub sort_order: i32,
    pub allergen: String,
    pub reaction: String,
    pub severity: String,
    pub allergy_sort_order: i32,
    pub previous_anaesthesia: String,
    pub anaesthesia_problems: String,
    pub anaesthesia_problem_details: String,
    pub family_mh_history: String,
    pub family_mh_details: String,
    pub ponv: String,
    pub alcohol: String,
    pub alcohol_units_per_week: Option<i32>,
    pub recreational_drugs: String,
    pub drug_details: String,
    pub exercise_tolerance: String,
    pub estimated_mets: Option<f64>,
    pub mobility_aids: String,
    pub recent_decline: String,
    pub possibly_pregnant: String,
    pub pregnancy_confirmed: String,
    pub gestation_weeks: Option<i32>,
    pub cancer_history: String,
    pub cancer_history_details: String,
    pub mrsa_history: String,
    pub recent_hospital_or_care_home_admission: String,
    pub palpitations_or_blackouts: String,
    pub heart_or_artery_surgery: String,
    pub swollen_ankles: String,
    pub snoring: String,
    pub snoring_loud: String,
    pub collar_size_inches: Option<f64>,
    pub daytime_sleepiness: String,
    pub observed_apnoea_episodes: String,
    pub urinary_symptoms: String,
    pub urinary_catheter_history: String,
    pub prostate_problems: String,
    pub personal_vte_history: String,
    pub family_vte_history: String,
    pub blood_transfusion_history: String,
    pub joint_or_arthritis_problems: String,
    pub back_or_neck_problems: String,
    pub skin_conditions: String,
    pub pressure_sore_risk: String,
    pub bowel_problems: String,
    pub food_intolerances: String,
    pub food_intolerances_details: String,
    pub blood_donor: String,
    pub body_piercings: String,
    pub hearing_problems: String,
    pub vision_problems: String,
    pub balance_issues: String,
    pub contraceptive_or_hrt_use: String,
    pub last_menstrual_period: String,
    pub head_injury_requiring_hospitalisation: String,
    pub memory_concerns: String,
    pub dementia_diagnosis: String,
    pub depression_or_anxiety_history: String,
    pub depression_anxiety_impacts_daily_life: String,
    pub depression_anxiety_seen_doctor: String,
    pub learning_difficulties: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.weight = Set(self.weight);
      item.height = Set(self.height);
      item.bmi = Set(self.bmi);
      item.planned_procedure = Set(self.planned_procedure.clone());
      item.procedure_urgency = Set(self.procedure_urgency.clone());
      item.status = Set(self.status.clone());
      item.hypertension = Set(self.hypertension.clone());
      item.hypertension_controlled = Set(self.hypertension_controlled.clone());
      item.ischemic_heart_disease = Set(self.ischemic_heart_disease.clone());
      item.ihd_details = Set(self.ihd_details.clone());
      item.heart_failure = Set(self.heart_failure.clone());
      item.heart_failure_nyha = Set(self.heart_failure_nyha.clone());
      item.valvular_disease = Set(self.valvular_disease.clone());
      item.valvular_details = Set(self.valvular_details.clone());
      item.arrhythmia = Set(self.arrhythmia.clone());
      item.arrhythmia_type = Set(self.arrhythmia_type.clone());
      item.pacemaker = Set(self.pacemaker.clone());
      item.recent_mi = Set(self.recent_mi.clone());
      item.recent_mi_weeks = Set(self.recent_mi_weeks);
      item.asthma = Set(self.asthma.clone());
      item.asthma_frequency = Set(self.asthma_frequency.clone());
      item.copd = Set(self.copd.clone());
      item.copd_severity = Set(self.copd_severity.clone());
      item.osa = Set(self.osa.clone());
      item.osa_cpap = Set(self.osa_cpap.clone());
      item.smoking = Set(self.smoking.clone());
      item.smoking_pack_years = Set(self.smoking_pack_years);
      item.recent_urti = Set(self.recent_urti.clone());
      item.ckd = Set(self.ckd.clone());
      item.ckd_stage = Set(self.ckd_stage.clone());
      item.dialysis = Set(self.dialysis.clone());
      item.dialysis_type = Set(self.dialysis_type.clone());
      item.liver_disease = Set(self.liver_disease.clone());
      item.cirrhosis = Set(self.cirrhosis.clone());
      item.child_pugh_score = Set(self.child_pugh_score.clone());
      item.hepatitis = Set(self.hepatitis.clone());
      item.hepatitis_type = Set(self.hepatitis_type.clone());
      item.diabetes = Set(self.diabetes.clone());
      item.diabetes_control = Set(self.diabetes_control.clone());
      item.diabetes_on_insulin = Set(self.diabetes_on_insulin.clone());
      item.thyroid_disease = Set(self.thyroid_disease.clone());
      item.thyroid_type = Set(self.thyroid_type.clone());
      item.adrenal_insufficiency = Set(self.adrenal_insufficiency.clone());
      item.stroke_or_tia = Set(self.stroke_or_tia.clone());
      item.stroke_details = Set(self.stroke_details.clone());
      item.epilepsy = Set(self.epilepsy.clone());
      item.epilepsy_controlled = Set(self.epilepsy_controlled.clone());
      item.neuromuscular_disease = Set(self.neuromuscular_disease.clone());
      item.neuromuscular_details = Set(self.neuromuscular_details.clone());
      item.raised_icp = Set(self.raised_icp.clone());
      item.bleeding_disorder = Set(self.bleeding_disorder.clone());
      item.bleeding_details = Set(self.bleeding_details.clone());
      item.on_anticoagulants = Set(self.on_anticoagulants.clone());
      item.anticoagulant_type = Set(self.anticoagulant_type.clone());
      item.sickle_cell_disease = Set(self.sickle_cell_disease.clone());
      item.sickle_cell_trait = Set(self.sickle_cell_trait.clone());
      item.anaemia = Set(self.anaemia.clone());
      item.rheumatoid_arthritis = Set(self.rheumatoid_arthritis.clone());
      item.cervical_spine_issues = Set(self.cervical_spine_issues.clone());
      item.limited_neck_movement = Set(self.limited_neck_movement.clone());
      item.limited_mouth_opening = Set(self.limited_mouth_opening.clone());
      item.dental_issues = Set(self.dental_issues.clone());
      item.dental_details = Set(self.dental_details.clone());
      item.previous_difficult_airway = Set(self.previous_difficult_airway.clone());
      item.mallampati_score = Set(self.mallampati_score.clone());
      item.gord = Set(self.gord.clone());
      item.hiatus_hernia = Set(self.hiatus_hernia.clone());
      item.nausea = Set(self.nausea.clone());
      item.name = Set(self.name.clone());
      item.dose = Set(self.dose.clone());
      item.frequency = Set(self.frequency.clone());
      item.sort_order = Set(self.sort_order);
      item.allergen = Set(self.allergen.clone());
      item.reaction = Set(self.reaction.clone());
      item.severity = Set(self.severity.clone());
      item.allergy_sort_order = Set(self.allergy_sort_order);
      item.previous_anaesthesia = Set(self.previous_anaesthesia.clone());
      item.anaesthesia_problems = Set(self.anaesthesia_problems.clone());
      item.anaesthesia_problem_details = Set(self.anaesthesia_problem_details.clone());
      item.family_mh_history = Set(self.family_mh_history.clone());
      item.family_mh_details = Set(self.family_mh_details.clone());
      item.ponv = Set(self.ponv.clone());
      item.alcohol = Set(self.alcohol.clone());
      item.alcohol_units_per_week = Set(self.alcohol_units_per_week);
      item.recreational_drugs = Set(self.recreational_drugs.clone());
      item.drug_details = Set(self.drug_details.clone());
      item.exercise_tolerance = Set(self.exercise_tolerance.clone());
      item.estimated_mets = Set(self.estimated_mets);
      item.mobility_aids = Set(self.mobility_aids.clone());
      item.recent_decline = Set(self.recent_decline.clone());
      item.possibly_pregnant = Set(self.possibly_pregnant.clone());
      item.pregnancy_confirmed = Set(self.pregnancy_confirmed.clone());
      item.gestation_weeks = Set(self.gestation_weeks);
      item.cancer_history = Set(self.cancer_history.clone());
      item.cancer_history_details = Set(self.cancer_history_details.clone());
      item.mrsa_history = Set(self.mrsa_history.clone());
      item.recent_hospital_or_care_home_admission = Set(self.recent_hospital_or_care_home_admission.clone());
      item.palpitations_or_blackouts = Set(self.palpitations_or_blackouts.clone());
      item.heart_or_artery_surgery = Set(self.heart_or_artery_surgery.clone());
      item.swollen_ankles = Set(self.swollen_ankles.clone());
      item.snoring = Set(self.snoring.clone());
      item.snoring_loud = Set(self.snoring_loud.clone());
      item.collar_size_inches = Set(self.collar_size_inches);
      item.daytime_sleepiness = Set(self.daytime_sleepiness.clone());
      item.observed_apnoea_episodes = Set(self.observed_apnoea_episodes.clone());
      item.urinary_symptoms = Set(self.urinary_symptoms.clone());
      item.urinary_catheter_history = Set(self.urinary_catheter_history.clone());
      item.prostate_problems = Set(self.prostate_problems.clone());
      item.personal_vte_history = Set(self.personal_vte_history.clone());
      item.family_vte_history = Set(self.family_vte_history.clone());
      item.blood_transfusion_history = Set(self.blood_transfusion_history.clone());
      item.joint_or_arthritis_problems = Set(self.joint_or_arthritis_problems.clone());
      item.back_or_neck_problems = Set(self.back_or_neck_problems.clone());
      item.skin_conditions = Set(self.skin_conditions.clone());
      item.pressure_sore_risk = Set(self.pressure_sore_risk.clone());
      item.bowel_problems = Set(self.bowel_problems.clone());
      item.food_intolerances = Set(self.food_intolerances.clone());
      item.food_intolerances_details = Set(self.food_intolerances_details.clone());
      item.blood_donor = Set(self.blood_donor.clone());
      item.body_piercings = Set(self.body_piercings.clone());
      item.hearing_problems = Set(self.hearing_problems.clone());
      item.vision_problems = Set(self.vision_problems.clone());
      item.balance_issues = Set(self.balance_issues.clone());
      item.contraceptive_or_hrt_use = Set(self.contraceptive_or_hrt_use.clone());
      item.last_menstrual_period = Set(self.last_menstrual_period.clone());
      item.head_injury_requiring_hospitalisation = Set(self.head_injury_requiring_hospitalisation.clone());
      item.memory_concerns = Set(self.memory_concerns.clone());
      item.dementia_diagnosis = Set(self.dementia_diagnosis.clone());
      item.depression_or_anxiety_history = Set(self.depression_or_anxiety_history.clone());
      item.depression_anxiety_impacts_daily_life = Set(self.depression_anxiety_impacts_daily_life.clone());
      item.depression_anxiety_seen_doctor = Set(self.depression_anxiety_seen_doctor.clone());
      item.learning_difficulties = Set(self.learning_difficulties.clone());
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
        .prefix("api/pre_operative_assessment_by_patients/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
