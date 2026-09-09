#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::agile_checklist_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub agile_checklist_id: i64,
    pub answered_count: i32,
    pub teams_yes_count: i32,
    pub teams_applicable_count: i32,
    pub teams_percent: Option<f64>,
    pub stakeholders_yes_count: i32,
    pub stakeholders_applicable_count: i32,
    pub stakeholders_percent: Option<f64>,
    pub practices_yes_count: i32,
    pub practices_applicable_count: i32,
    pub practices_percent: Option<f64>,
    pub overall_percent: Option<f64>,
    pub teams_band: String,
    pub stakeholders_band: String,
    pub practices_band: String,
    pub maturity: String,
    pub top_action_1: String,
    pub top_action_2: String,
    pub top_action_3: String,
    pub coach_notes: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.agile_checklist_id = Set(self.agile_checklist_id);
      item.answered_count = Set(self.answered_count);
      item.teams_yes_count = Set(self.teams_yes_count);
      item.teams_applicable_count = Set(self.teams_applicable_count);
      item.teams_percent = Set(self.teams_percent);
      item.stakeholders_yes_count = Set(self.stakeholders_yes_count);
      item.stakeholders_applicable_count = Set(self.stakeholders_applicable_count);
      item.stakeholders_percent = Set(self.stakeholders_percent);
      item.practices_yes_count = Set(self.practices_yes_count);
      item.practices_applicable_count = Set(self.practices_applicable_count);
      item.practices_percent = Set(self.practices_percent);
      item.overall_percent = Set(self.overall_percent);
      item.teams_band = Set(self.teams_band.clone());
      item.stakeholders_band = Set(self.stakeholders_band.clone());
      item.practices_band = Set(self.practices_band.clone());
      item.maturity = Set(self.maturity.clone());
      item.top_action_1 = Set(self.top_action_1.clone());
      item.top_action_2 = Set(self.top_action_2.clone());
      item.top_action_3 = Set(self.top_action_3.clone());
      item.coach_notes = Set(self.coach_notes.clone());
      item.signed_at = Set(self.signed_at);
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
        .prefix("api/agile_checklist_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
