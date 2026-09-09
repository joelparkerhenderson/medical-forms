#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::hypertension_reviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub clinician_role: String,
    pub reviewed_at: Option<Date>,
    pub practice_site: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub ethnicity: String,
    pub diagnosis_date: Option<Date>,
    pub type2_diabetes: String,
    pub chronic_kidney_disease: String,
    pub established_cvd: String,
    pub atrial_fibrillation: String,
    pub clinic_systolic: Option<i32>,
    pub clinic_diastolic: Option<i32>,
    pub home_systolic: Option<i32>,
    pub home_diastolic: Option<i32>,
    pub monitoring_method: String,
    pub postural_drop: String,
    pub antihypertensive_agents: Option<i32>,
    pub adherence: String,
    pub side_effects: String,
    pub qrisk_percent: Option<f64>,
    pub smoking_status: String,
    pub statin_therapy: String,
    pub bmi: Option<f64>,
    pub lifestyle_advice: String,
    pub serum_creatinine: Option<f64>,
    pub egfr: Option<f64>,
    pub serum_potassium: Option<f64>,
    pub hba1c: Option<f64>,
    pub total_cholesterol: Option<f64>,
    pub hdl_cholesterol: Option<f64>,
    pub urine_acr: Option<f64>,
    pub complications: String,
    pub review_context: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.clinician_role = Set(self.clinician_role.clone());
      item.reviewed_at = Set(self.reviewed_at);
      item.practice_site = Set(self.practice_site.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.ethnicity = Set(self.ethnicity.clone());
      item.diagnosis_date = Set(self.diagnosis_date);
      item.type2_diabetes = Set(self.type2_diabetes.clone());
      item.chronic_kidney_disease = Set(self.chronic_kidney_disease.clone());
      item.established_cvd = Set(self.established_cvd.clone());
      item.atrial_fibrillation = Set(self.atrial_fibrillation.clone());
      item.clinic_systolic = Set(self.clinic_systolic);
      item.clinic_diastolic = Set(self.clinic_diastolic);
      item.home_systolic = Set(self.home_systolic);
      item.home_diastolic = Set(self.home_diastolic);
      item.monitoring_method = Set(self.monitoring_method.clone());
      item.postural_drop = Set(self.postural_drop.clone());
      item.antihypertensive_agents = Set(self.antihypertensive_agents);
      item.adherence = Set(self.adherence.clone());
      item.side_effects = Set(self.side_effects.clone());
      item.qrisk_percent = Set(self.qrisk_percent);
      item.smoking_status = Set(self.smoking_status.clone());
      item.statin_therapy = Set(self.statin_therapy.clone());
      item.bmi = Set(self.bmi);
      item.lifestyle_advice = Set(self.lifestyle_advice.clone());
      item.serum_creatinine = Set(self.serum_creatinine);
      item.egfr = Set(self.egfr);
      item.serum_potassium = Set(self.serum_potassium);
      item.hba1c = Set(self.hba1c);
      item.total_cholesterol = Set(self.total_cholesterol);
      item.hdl_cholesterol = Set(self.hdl_cholesterol);
      item.urine_acr = Set(self.urine_acr);
      item.complications = Set(self.complications.clone());
      item.review_context = Set(self.review_context.clone());
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
        .prefix("api/hypertension_reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
