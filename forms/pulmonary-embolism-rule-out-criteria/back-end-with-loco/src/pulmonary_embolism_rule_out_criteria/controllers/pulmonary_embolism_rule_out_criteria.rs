#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pulmonary_embolism_rule_out_criteria::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub status: String,
    pub patient_identifier: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub presenting_complaint: String,
    pub age: Option<f64>,
    pub heart_rate: Option<f64>,
    pub oxygen_saturation: Option<f64>,
    pub pretest_probability: String,
    pub age_under_50: String,
    pub heart_rate_under_100: String,
    pub spo2_at_least_95: String,
    pub no_unilateral_leg_swelling: String,
    pub no_haemoptysis: String,
    pub no_recent_surgery_trauma: String,
    pub no_prior_dvt_pe: String,
    pub no_oestrogen_use: String,
    pub clinical_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.presenting_complaint = Set(self.presenting_complaint.clone());
      item.age = Set(self.age);
      item.heart_rate = Set(self.heart_rate);
      item.oxygen_saturation = Set(self.oxygen_saturation);
      item.pretest_probability = Set(self.pretest_probability.clone());
      item.age_under_50 = Set(self.age_under_50.clone());
      item.heart_rate_under_100 = Set(self.heart_rate_under_100.clone());
      item.spo2_at_least_95 = Set(self.spo2_at_least_95.clone());
      item.no_unilateral_leg_swelling = Set(self.no_unilateral_leg_swelling.clone());
      item.no_haemoptysis = Set(self.no_haemoptysis.clone());
      item.no_recent_surgery_trauma = Set(self.no_recent_surgery_trauma.clone());
      item.no_prior_dvt_pe = Set(self.no_prior_dvt_pe.clone());
      item.no_oestrogen_use = Set(self.no_oestrogen_use.clone());
      item.clinical_notes = Set(self.clinical_notes.clone());
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
        .prefix("api/pulmonary_embolism_rule_out_criteria/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
