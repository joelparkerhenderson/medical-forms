#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::cervical_screenings::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub care_setting: String,
    pub sample_taker_role: String,
    pub sample_taken_at: Option<DateTimeWithTimeZone>,
    pub patient_identifier: String,
    pub age: Option<i32>,
    pub recall_interval: String,
    pub screen_due_date: Option<Date>,
    pub last_screen_date: Option<Date>,
    pub overdue: String,
    pub previously_ceased: String,
    pub consent_given: String,
    pub symptomatic: String,
    pub symptom_detail: String,
    pub sample_adequacy: String,
    pub inadequate_reason: String,
    pub hpv_result: String,
    pub cytology_grade: String,
    pub clinical_context: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.care_setting = Set(self.care_setting.clone());
      item.sample_taker_role = Set(self.sample_taker_role.clone());
      item.sample_taken_at = Set(self.sample_taken_at);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age = Set(self.age);
      item.recall_interval = Set(self.recall_interval.clone());
      item.screen_due_date = Set(self.screen_due_date);
      item.last_screen_date = Set(self.last_screen_date);
      item.overdue = Set(self.overdue.clone());
      item.previously_ceased = Set(self.previously_ceased.clone());
      item.consent_given = Set(self.consent_given.clone());
      item.symptomatic = Set(self.symptomatic.clone());
      item.symptom_detail = Set(self.symptom_detail.clone());
      item.sample_adequacy = Set(self.sample_adequacy.clone());
      item.inadequate_reason = Set(self.inadequate_reason.clone());
      item.hpv_result = Set(self.hpv_result.clone());
      item.cytology_grade = Set(self.cytology_grade.clone());
      item.clinical_context = Set(self.clinical_context.clone());
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
        .prefix("api/cervical_screenings/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
