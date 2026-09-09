#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::modified_early_warning_score_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub modified_early_warning_score_id: i64,
    pub aggregate_score: Option<i32>,
    pub systolic_blood_pressure_score: Option<i32>,
    pub heart_rate_score: Option<i32>,
    pub respiratory_rate_score: Option<i32>,
    pub temperature_score: Option<i32>,
    pub avpu_score: Option<i32>,
    pub single_parameter_trigger: String,
    pub risk_band: String,
    pub monitoring_frequency: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.modified_early_warning_score_id = Set(self.modified_early_warning_score_id);
      item.aggregate_score = Set(self.aggregate_score);
      item.systolic_blood_pressure_score = Set(self.systolic_blood_pressure_score);
      item.heart_rate_score = Set(self.heart_rate_score);
      item.respiratory_rate_score = Set(self.respiratory_rate_score);
      item.temperature_score = Set(self.temperature_score);
      item.avpu_score = Set(self.avpu_score);
      item.single_parameter_trigger = Set(self.single_parameter_trigger.clone());
      item.risk_band = Set(self.risk_band.clone());
      item.monitoring_frequency = Set(self.monitoring_frequency.clone());
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
        .prefix("api/modified_early_warning_score_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
