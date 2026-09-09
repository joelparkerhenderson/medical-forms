#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::chronic_kidney_disease_reviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub reviewed_at: Option<Date>,
    pub care_setting: String,
    pub review_type: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub diabetes_status: String,
    pub primary_cause: String,
    pub months_since_diagnosis: Option<i32>,
    pub egfr: Option<f64>,
    pub egfr_sample_date: Option<Date>,
    pub previous_egfr: Option<f64>,
    pub previous_egfr_date: Option<Date>,
    pub acr: Option<f64>,
    pub acr_sample_date: Option<Date>,
    pub acr_measured: String,
    pub systolic_blood_pressure: Option<i32>,
    pub diastolic_blood_pressure: Option<i32>,
    pub acei_or_arb_prescribed: String,
    pub sglt2i_prescribed: String,
    pub statin_prescribed: String,
    pub nephrotoxic_drug_present: String,
    pub nephrotoxic_dose_adjusted: String,
    pub medication_review_completed: String,
    pub hba1c: Option<f64>,
    pub potassium: Option<f64>,
    pub bicarbonate: Option<f64>,
    pub calcium: Option<f64>,
    pub phosphate: Option<f64>,
    pub pth: Option<f64>,
    pub haemoglobin: Option<f64>,
    pub referral_decision: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.reviewed_at = Set(self.reviewed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.review_type = Set(self.review_type.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.diabetes_status = Set(self.diabetes_status.clone());
      item.primary_cause = Set(self.primary_cause.clone());
      item.months_since_diagnosis = Set(self.months_since_diagnosis);
      item.egfr = Set(self.egfr);
      item.egfr_sample_date = Set(self.egfr_sample_date);
      item.previous_egfr = Set(self.previous_egfr);
      item.previous_egfr_date = Set(self.previous_egfr_date);
      item.acr = Set(self.acr);
      item.acr_sample_date = Set(self.acr_sample_date);
      item.acr_measured = Set(self.acr_measured.clone());
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.diastolic_blood_pressure = Set(self.diastolic_blood_pressure);
      item.acei_or_arb_prescribed = Set(self.acei_or_arb_prescribed.clone());
      item.sglt2i_prescribed = Set(self.sglt2i_prescribed.clone());
      item.statin_prescribed = Set(self.statin_prescribed.clone());
      item.nephrotoxic_drug_present = Set(self.nephrotoxic_drug_present.clone());
      item.nephrotoxic_dose_adjusted = Set(self.nephrotoxic_dose_adjusted.clone());
      item.medication_review_completed = Set(self.medication_review_completed.clone());
      item.hba1c = Set(self.hba1c);
      item.potassium = Set(self.potassium);
      item.bicarbonate = Set(self.bicarbonate);
      item.calcium = Set(self.calcium);
      item.phosphate = Set(self.phosphate);
      item.pth = Set(self.pth);
      item.haemoglobin = Set(self.haemoglobin);
      item.referral_decision = Set(self.referral_decision.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/chronic_kidney_disease_reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
