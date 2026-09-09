#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::recurring_rules::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub meeting_id: i64,
    pub frequency: String,
    pub interval_count: i32,
    pub by_day_of_week: String,
    pub by_day_of_month: Option<i32>,
    pub by_set_position: Option<i32>,
    pub by_month_of_year: Option<i32>,
    pub series_count: Option<i32>,
    pub series_until: Option<DateTimeWithTimeZone>,
    pub timezone: String,
    pub rrule_text: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.meeting_id = Set(self.meeting_id);
      item.frequency = Set(self.frequency.clone());
      item.interval_count = Set(self.interval_count);
      item.by_day_of_week = Set(self.by_day_of_week.clone());
      item.by_day_of_month = Set(self.by_day_of_month);
      item.by_set_position = Set(self.by_set_position);
      item.by_month_of_year = Set(self.by_month_of_year);
      item.series_count = Set(self.series_count);
      item.series_until = Set(self.series_until);
      item.timezone = Set(self.timezone.clone());
      item.rrule_text = Set(self.rrule_text.clone());
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
        .prefix("api/recurring_rules/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
