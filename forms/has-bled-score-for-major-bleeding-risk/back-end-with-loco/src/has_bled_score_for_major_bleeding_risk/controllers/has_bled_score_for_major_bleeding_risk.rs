#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::has_bled_score_for_major_bleeding_risks::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub anticoagulation_status: String,
    pub cha_ds_vasc_score: Option<i32>,
    pub patient_identifier: String,
    pub age_years: Option<i32>,
    pub sex: String,
    pub hypertension_uncontrolled: String,
    pub abnormal_renal_function: String,
    pub abnormal_liver_function: String,
    pub stroke_history: String,
    pub bleeding_history: String,
    pub labile_inr: String,
    pub antiplatelet_or_nsaid: String,
    pub alcohol_units_per_week: Option<f64>,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.anticoagulation_status = Set(self.anticoagulation_status.clone());
      item.cha_ds_vasc_score = Set(self.cha_ds_vasc_score);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_years = Set(self.age_years);
      item.sex = Set(self.sex.clone());
      item.hypertension_uncontrolled = Set(self.hypertension_uncontrolled.clone());
      item.abnormal_renal_function = Set(self.abnormal_renal_function.clone());
      item.abnormal_liver_function = Set(self.abnormal_liver_function.clone());
      item.stroke_history = Set(self.stroke_history.clone());
      item.bleeding_history = Set(self.bleeding_history.clone());
      item.labile_inr = Set(self.labile_inr.clone());
      item.antiplatelet_or_nsaid = Set(self.antiplatelet_or_nsaid.clone());
      item.alcohol_units_per_week = Set(self.alcohol_units_per_week);
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
        .prefix("api/has_bled_score_for_major_bleeding_risks/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
