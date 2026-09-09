#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::rad_onc_waiting_list_card_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub rad_onc_waiting_list_card_id: i64,
    pub waiting_time_status: String,
    pub clinical_priority: String,
    pub target_wait_weeks: Option<f64>,
    pub days_waited: Option<i32>,
    pub weeks_waited: Option<f64>,
    pub days_to_target: Option<i32>,
    pub days_to_breach: Option<i32>,
    pub days_to_appointment: Option<i32>,
    pub grader_notes: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.rad_onc_waiting_list_card_id = Set(self.rad_onc_waiting_list_card_id);
      item.waiting_time_status = Set(self.waiting_time_status.clone());
      item.clinical_priority = Set(self.clinical_priority.clone());
      item.target_wait_weeks = Set(self.target_wait_weeks);
      item.days_waited = Set(self.days_waited);
      item.weeks_waited = Set(self.weeks_waited);
      item.days_to_target = Set(self.days_to_target);
      item.days_to_breach = Set(self.days_to_breach);
      item.days_to_appointment = Set(self.days_to_appointment);
      item.grader_notes = Set(self.grader_notes.clone());
      item.graded_at = Set(self.graded_at);
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
        .prefix("api/rad_onc_waiting_list_card_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
