#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::nursing_care_plans::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub nurse_name: String,
    pub nurse_role: String,
    pub nmc_number: String,
    pub authored_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub plan_type: String,
    pub model_used: String,
    pub patient_identifier: String,
    pub patient_name: String,
    pub date_of_birth: Option<Date>,
    pub sex: String,
    pub ward_location: String,
    pub handover_note: String,
    pub review_date: Option<Date>,
    pub falls_risk_done: String,
    pub falls_risk_level: String,
    pub falls_risk_assessed_on: Option<Date>,
    pub falls_risk_actioned: String,
    pub pressure_ulcer_risk_done: String,
    pub pressure_ulcer_risk_level: String,
    pub pressure_ulcer_risk_assessed_on: Option<Date>,
    pub pressure_ulcer_risk_actioned: String,
    pub vte_risk_done: String,
    pub vte_risk_level: String,
    pub vte_risk_assessed_on: Option<Date>,
    pub vte_risk_actioned: String,
    pub nutrition_risk_done: String,
    pub nutrition_risk_level: String,
    pub nutrition_risk_assessed_on: Option<Date>,
    pub nutrition_risk_actioned: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.nurse_name = Set(self.nurse_name.clone());
      item.nurse_role = Set(self.nurse_role.clone());
      item.nmc_number = Set(self.nmc_number.clone());
      item.authored_at = Set(self.authored_at);
      item.care_setting = Set(self.care_setting.clone());
      item.plan_type = Set(self.plan_type.clone());
      item.model_used = Set(self.model_used.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.patient_name = Set(self.patient_name.clone());
      item.date_of_birth = Set(self.date_of_birth);
      item.sex = Set(self.sex.clone());
      item.ward_location = Set(self.ward_location.clone());
      item.handover_note = Set(self.handover_note.clone());
      item.review_date = Set(self.review_date);
      item.falls_risk_done = Set(self.falls_risk_done.clone());
      item.falls_risk_level = Set(self.falls_risk_level.clone());
      item.falls_risk_assessed_on = Set(self.falls_risk_assessed_on);
      item.falls_risk_actioned = Set(self.falls_risk_actioned.clone());
      item.pressure_ulcer_risk_done = Set(self.pressure_ulcer_risk_done.clone());
      item.pressure_ulcer_risk_level = Set(self.pressure_ulcer_risk_level.clone());
      item.pressure_ulcer_risk_assessed_on = Set(self.pressure_ulcer_risk_assessed_on);
      item.pressure_ulcer_risk_actioned = Set(self.pressure_ulcer_risk_actioned.clone());
      item.vte_risk_done = Set(self.vte_risk_done.clone());
      item.vte_risk_level = Set(self.vte_risk_level.clone());
      item.vte_risk_assessed_on = Set(self.vte_risk_assessed_on);
      item.vte_risk_actioned = Set(self.vte_risk_actioned.clone());
      item.nutrition_risk_done = Set(self.nutrition_risk_done.clone());
      item.nutrition_risk_level = Set(self.nutrition_risk_level.clone());
      item.nutrition_risk_assessed_on = Set(self.nutrition_risk_assessed_on);
      item.nutrition_risk_actioned = Set(self.nutrition_risk_actioned.clone());
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
        .prefix("api/nursing_care_plans/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
