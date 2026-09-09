#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::heart_failure_reviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub review_date: Option<Date>,
    pub care_setting: String,
    pub review_type: String,
    pub last_review_date: Option<Date>,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub year_of_diagnosis: Option<i32>,
    pub heart_failure_type: String,
    pub latest_lvef: Option<f64>,
    pub last_echo_date: Option<Date>,
    pub aetiology: String,
    pub nyha_class: Option<i32>,
    pub breathlessness: String,
    pub orthopnoea: String,
    pub paroxysmal_nocturnal_dyspnoea: String,
    pub fatigue: String,
    pub change_since_last_review: String,
    pub decompensation: String,
    pub weight_kg: Option<f64>,
    pub weight_change_kg: Option<f64>,
    pub peripheral_oedema: String,
    pub raised_jvp: String,
    pub lung_crackles: String,
    pub systolic_blood_pressure: Option<i32>,
    pub diastolic_blood_pressure: Option<i32>,
    pub heart_rate: Option<i32>,
    pub heart_rhythm: String,
    pub nt_pro_bnp: Option<f64>,
    pub sodium: Option<f64>,
    pub potassium: Option<f64>,
    pub urea: Option<f64>,
    pub creatinine: Option<f64>,
    pub egfr: Option<f64>,
    pub haemoglobin: Option<f64>,
    pub ferritin: Option<f64>,
    pub transferrin_saturation: Option<f64>,
    pub hba1c: Option<f64>,
    pub bloods_date: Option<Date>,
    pub raas_inhibitor_status: String,
    pub raas_inhibitor_agent: String,
    pub raas_inhibitor_dose: String,
    pub raas_inhibitor_at_target_dose: String,
    pub raas_inhibitor_adherence: String,
    pub beta_blocker_status: String,
    pub beta_blocker_agent: String,
    pub beta_blocker_dose: String,
    pub beta_blocker_at_target_dose: String,
    pub beta_blocker_adherence: String,
    pub mra_status: String,
    pub mra_agent: String,
    pub mra_dose: String,
    pub mra_at_target_dose: String,
    pub mra_adherence: String,
    pub sglt2_inhibitor_status: String,
    pub sglt2_inhibitor_agent: String,
    pub sglt2_inhibitor_dose: String,
    pub sglt2_inhibitor_at_target_dose: String,
    pub sglt2_inhibitor_adherence: String,
    pub loop_diuretic_agent: String,
    pub loop_diuretic_dose: String,
    pub other_medications: String,
    pub icd: String,
    pub crt: String,
    pub pacemaker: String,
    pub device_check_status: String,
    pub influenza_vaccination: String,
    pub pneumococcal_vaccination: String,
    pub covid_vaccination: String,
    pub smoking_status: String,
    pub alcohol_status: String,
    pub daily_weights: String,
    pub self_management_plan: String,
    pub cardiac_rehab: String,
    pub review_context: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.review_date = Set(self.review_date);
      item.care_setting = Set(self.care_setting.clone());
      item.review_type = Set(self.review_type.clone());
      item.last_review_date = Set(self.last_review_date);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.year_of_diagnosis = Set(self.year_of_diagnosis);
      item.heart_failure_type = Set(self.heart_failure_type.clone());
      item.latest_lvef = Set(self.latest_lvef);
      item.last_echo_date = Set(self.last_echo_date);
      item.aetiology = Set(self.aetiology.clone());
      item.nyha_class = Set(self.nyha_class);
      item.breathlessness = Set(self.breathlessness.clone());
      item.orthopnoea = Set(self.orthopnoea.clone());
      item.paroxysmal_nocturnal_dyspnoea = Set(self.paroxysmal_nocturnal_dyspnoea.clone());
      item.fatigue = Set(self.fatigue.clone());
      item.change_since_last_review = Set(self.change_since_last_review.clone());
      item.decompensation = Set(self.decompensation.clone());
      item.weight_kg = Set(self.weight_kg);
      item.weight_change_kg = Set(self.weight_change_kg);
      item.peripheral_oedema = Set(self.peripheral_oedema.clone());
      item.raised_jvp = Set(self.raised_jvp.clone());
      item.lung_crackles = Set(self.lung_crackles.clone());
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.diastolic_blood_pressure = Set(self.diastolic_blood_pressure);
      item.heart_rate = Set(self.heart_rate);
      item.heart_rhythm = Set(self.heart_rhythm.clone());
      item.nt_pro_bnp = Set(self.nt_pro_bnp);
      item.sodium = Set(self.sodium);
      item.potassium = Set(self.potassium);
      item.urea = Set(self.urea);
      item.creatinine = Set(self.creatinine);
      item.egfr = Set(self.egfr);
      item.haemoglobin = Set(self.haemoglobin);
      item.ferritin = Set(self.ferritin);
      item.transferrin_saturation = Set(self.transferrin_saturation);
      item.hba1c = Set(self.hba1c);
      item.bloods_date = Set(self.bloods_date);
      item.raas_inhibitor_status = Set(self.raas_inhibitor_status.clone());
      item.raas_inhibitor_agent = Set(self.raas_inhibitor_agent.clone());
      item.raas_inhibitor_dose = Set(self.raas_inhibitor_dose.clone());
      item.raas_inhibitor_at_target_dose = Set(self.raas_inhibitor_at_target_dose.clone());
      item.raas_inhibitor_adherence = Set(self.raas_inhibitor_adherence.clone());
      item.beta_blocker_status = Set(self.beta_blocker_status.clone());
      item.beta_blocker_agent = Set(self.beta_blocker_agent.clone());
      item.beta_blocker_dose = Set(self.beta_blocker_dose.clone());
      item.beta_blocker_at_target_dose = Set(self.beta_blocker_at_target_dose.clone());
      item.beta_blocker_adherence = Set(self.beta_blocker_adherence.clone());
      item.mra_status = Set(self.mra_status.clone());
      item.mra_agent = Set(self.mra_agent.clone());
      item.mra_dose = Set(self.mra_dose.clone());
      item.mra_at_target_dose = Set(self.mra_at_target_dose.clone());
      item.mra_adherence = Set(self.mra_adherence.clone());
      item.sglt2_inhibitor_status = Set(self.sglt2_inhibitor_status.clone());
      item.sglt2_inhibitor_agent = Set(self.sglt2_inhibitor_agent.clone());
      item.sglt2_inhibitor_dose = Set(self.sglt2_inhibitor_dose.clone());
      item.sglt2_inhibitor_at_target_dose = Set(self.sglt2_inhibitor_at_target_dose.clone());
      item.sglt2_inhibitor_adherence = Set(self.sglt2_inhibitor_adherence.clone());
      item.loop_diuretic_agent = Set(self.loop_diuretic_agent.clone());
      item.loop_diuretic_dose = Set(self.loop_diuretic_dose.clone());
      item.other_medications = Set(self.other_medications.clone());
      item.icd = Set(self.icd.clone());
      item.crt = Set(self.crt.clone());
      item.pacemaker = Set(self.pacemaker.clone());
      item.device_check_status = Set(self.device_check_status.clone());
      item.influenza_vaccination = Set(self.influenza_vaccination.clone());
      item.pneumococcal_vaccination = Set(self.pneumococcal_vaccination.clone());
      item.covid_vaccination = Set(self.covid_vaccination.clone());
      item.smoking_status = Set(self.smoking_status.clone());
      item.alcohol_status = Set(self.alcohol_status.clone());
      item.daily_weights = Set(self.daily_weights.clone());
      item.self_management_plan = Set(self.self_management_plan.clone());
      item.cardiac_rehab = Set(self.cardiac_rehab.clone());
      item.review_context = Set(self.review_context.clone());
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
        .prefix("api/heart_failure_reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
