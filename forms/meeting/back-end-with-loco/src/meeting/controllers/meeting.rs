#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::meetings::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub organizer_id: i64,
    pub status: String,
    pub title: String,
    pub purpose: String,
    pub long_description: String,
    pub category: String,
    pub visibility: String,
    pub scheduled_start_at: Option<DateTimeWithTimeZone>,
    pub scheduled_end_at: Option<DateTimeWithTimeZone>,
    pub timezone: String,
    pub location: String,
    pub video_url: String,
    pub phone_number: String,
    pub dial_in_code: String,
    pub joining_instructions: String,
    pub calendar_uid: String,
    pub summary: String,
    pub actual_start_at: Option<DateTimeWithTimeZone>,
    pub actual_end_at: Option<DateTimeWithTimeZone>,
    pub overall_result: String,
    pub additional_notes: String,
    pub signed_by_name: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.organizer_id = Set(self.organizer_id);
      item.status = Set(self.status.clone());
      item.title = Set(self.title.clone());
      item.purpose = Set(self.purpose.clone());
      item.long_description = Set(self.long_description.clone());
      item.category = Set(self.category.clone());
      item.visibility = Set(self.visibility.clone());
      item.scheduled_start_at = Set(self.scheduled_start_at);
      item.scheduled_end_at = Set(self.scheduled_end_at);
      item.timezone = Set(self.timezone.clone());
      item.location = Set(self.location.clone());
      item.video_url = Set(self.video_url.clone());
      item.phone_number = Set(self.phone_number.clone());
      item.dial_in_code = Set(self.dial_in_code.clone());
      item.joining_instructions = Set(self.joining_instructions.clone());
      item.calendar_uid = Set(self.calendar_uid.clone());
      item.summary = Set(self.summary.clone());
      item.actual_start_at = Set(self.actual_start_at);
      item.actual_end_at = Set(self.actual_end_at);
      item.overall_result = Set(self.overall_result.clone());
      item.additional_notes = Set(self.additional_notes.clone());
      item.signed_by_name = Set(self.signed_by_name.clone());
      item.signed_at = Set(self.signed_at);
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
        .prefix("api/meetings/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
