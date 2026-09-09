#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::curb_65_pneumonia_severity_score_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub curb_65_pneumonia_severity_score_id: i64,
    pub confusion_score: Option<i32>,
    pub urea_score: Option<i32>,
    pub respiratory_rate_score: Option<i32>,
    pub blood_pressure_score: Option<i32>,
    pub age_score: Option<i32>,
    pub total_score: Option<i32>,
    pub score_variant: String,
    pub risk_band: String,
    pub recommended_setting: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.curb_65_pneumonia_severity_score_id = Set(self.curb_65_pneumonia_severity_score_id);
      item.confusion_score = Set(self.confusion_score);
      item.urea_score = Set(self.urea_score);
      item.respiratory_rate_score = Set(self.respiratory_rate_score);
      item.blood_pressure_score = Set(self.blood_pressure_score);
      item.age_score = Set(self.age_score);
      item.total_score = Set(self.total_score);
      item.score_variant = Set(self.score_variant.clone());
      item.risk_band = Set(self.risk_band.clone());
      item.recommended_setting = Set(self.recommended_setting.clone());
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
        .prefix("api/curb_65_pneumonia_severity_score_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
