#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::qrisk3_cardiovascular_disease_risk_scores::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub patient_identifier: String,
    pub age: Option<f64>,
    pub sex: String,
    pub ethnicity: String,
    pub townsend_score: Option<f64>,
    pub postcode: String,
    pub smoking_status: String,
    pub body_mass_index: Option<f64>,
    pub diabetes_status: String,
    pub cholesterol_hdl_ratio: Option<f64>,
    pub systolic_blood_pressure: Option<f64>,
    pub systolic_blood_pressure_sd: Option<f64>,
    pub on_blood_pressure_treatment: String,
    pub family_history_chd: String,
    pub atrial_fibrillation: String,
    pub chronic_kidney_disease_stage: String,
    pub migraine: String,
    pub rheumatoid_arthritis: String,
    pub systemic_lupus_erythematosus: String,
    pub severe_mental_illness: String,
    pub erectile_dysfunction: String,
    pub on_atypical_antipsychotics: String,
    pub on_corticosteroids: String,
    pub has_established_cvd: String,
    pub has_familial_hypercholesterolaemia: String,
    pub clinical_note: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age = Set(self.age);
      item.sex = Set(self.sex.clone());
      item.ethnicity = Set(self.ethnicity.clone());
      item.townsend_score = Set(self.townsend_score);
      item.postcode = Set(self.postcode.clone());
      item.smoking_status = Set(self.smoking_status.clone());
      item.body_mass_index = Set(self.body_mass_index);
      item.diabetes_status = Set(self.diabetes_status.clone());
      item.cholesterol_hdl_ratio = Set(self.cholesterol_hdl_ratio);
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.systolic_blood_pressure_sd = Set(self.systolic_blood_pressure_sd);
      item.on_blood_pressure_treatment = Set(self.on_blood_pressure_treatment.clone());
      item.family_history_chd = Set(self.family_history_chd.clone());
      item.atrial_fibrillation = Set(self.atrial_fibrillation.clone());
      item.chronic_kidney_disease_stage = Set(self.chronic_kidney_disease_stage.clone());
      item.migraine = Set(self.migraine.clone());
      item.rheumatoid_arthritis = Set(self.rheumatoid_arthritis.clone());
      item.systemic_lupus_erythematosus = Set(self.systemic_lupus_erythematosus.clone());
      item.severe_mental_illness = Set(self.severe_mental_illness.clone());
      item.erectile_dysfunction = Set(self.erectile_dysfunction.clone());
      item.on_atypical_antipsychotics = Set(self.on_atypical_antipsychotics.clone());
      item.on_corticosteroids = Set(self.on_corticosteroids.clone());
      item.has_established_cvd = Set(self.has_established_cvd.clone());
      item.has_familial_hypercholesterolaemia = Set(self.has_familial_hypercholesterolaemia.clone());
      item.clinical_note = Set(self.clinical_note.clone());
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
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
        .prefix("api/qrisk3_cardiovascular_disease_risk_scores/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
