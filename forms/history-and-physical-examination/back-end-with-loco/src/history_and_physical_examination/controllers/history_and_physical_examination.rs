#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::history_and_physical_examinations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clerked_at: Option<DateTimeWithTimeZone>,
    pub clinician_role: String,
    pub registration_number: String,
    pub care_setting: String,
    pub admission_source: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub presenting_complaint: String,
    pub history_of_presenting_complaint: String,
    pub past_medical_surgical_history: String,
    pub drug_history: String,
    pub allergy_status: String,
    pub allergy_detail: String,
    pub family_history: String,
    pub social_history: String,
    pub systems_review: String,
    pub temperature: Option<f64>,
    pub heart_rate: Option<i32>,
    pub respiratory_rate: Option<i32>,
    pub systolic_blood_pressure: Option<i32>,
    pub oxygen_saturation: Option<i32>,
    pub consciousness_level: String,
    pub exam_cardiovascular: String,
    pub exam_respiratory: String,
    pub exam_abdominal: String,
    pub exam_neurological: String,
    pub exam_other: String,
    pub investigations: String,
    pub impression: String,
    pub red_flag_findings: String,
    pub management_plan: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clerked_at = Set(self.clerked_at);
      item.clinician_role = Set(self.clinician_role.clone());
      item.registration_number = Set(self.registration_number.clone());
      item.care_setting = Set(self.care_setting.clone());
      item.admission_source = Set(self.admission_source.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.presenting_complaint = Set(self.presenting_complaint.clone());
      item.history_of_presenting_complaint = Set(self.history_of_presenting_complaint.clone());
      item.past_medical_surgical_history = Set(self.past_medical_surgical_history.clone());
      item.drug_history = Set(self.drug_history.clone());
      item.allergy_status = Set(self.allergy_status.clone());
      item.allergy_detail = Set(self.allergy_detail.clone());
      item.family_history = Set(self.family_history.clone());
      item.social_history = Set(self.social_history.clone());
      item.systems_review = Set(self.systems_review.clone());
      item.temperature = Set(self.temperature);
      item.heart_rate = Set(self.heart_rate);
      item.respiratory_rate = Set(self.respiratory_rate);
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.oxygen_saturation = Set(self.oxygen_saturation);
      item.consciousness_level = Set(self.consciousness_level.clone());
      item.exam_cardiovascular = Set(self.exam_cardiovascular.clone());
      item.exam_respiratory = Set(self.exam_respiratory.clone());
      item.exam_abdominal = Set(self.exam_abdominal.clone());
      item.exam_neurological = Set(self.exam_neurological.clone());
      item.exam_other = Set(self.exam_other.clone());
      item.investigations = Set(self.investigations.clone());
      item.impression = Set(self.impression.clone());
      item.red_flag_findings = Set(self.red_flag_findings.clone());
      item.management_plan = Set(self.management_plan.clone());
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
        .prefix("api/history_and_physical_examinations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
