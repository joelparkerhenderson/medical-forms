#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::paediatric_early_warning_score_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub paediatric_early_warning_score_id: i64,
    pub aggregate_score: Option<i32>,
    pub max_parameter_score: Option<i32>,
    pub respiratory_rate_score: Option<i32>,
    pub respiratory_effort_score: Option<i32>,
    pub oxygen_saturation_score: Option<i32>,
    pub supplemental_oxygen_score: Option<i32>,
    pub heart_rate_score: Option<i32>,
    pub capillary_refill_score: Option<i32>,
    pub consciousness_score: Option<i32>,
    pub risk_band: String,
    pub single_parameter_trigger: String,
    pub concern_trigger: String,
    pub monitoring_frequency: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.paediatric_early_warning_score_id = Set(self.paediatric_early_warning_score_id);
      item.aggregate_score = Set(self.aggregate_score);
      item.max_parameter_score = Set(self.max_parameter_score);
      item.respiratory_rate_score = Set(self.respiratory_rate_score);
      item.respiratory_effort_score = Set(self.respiratory_effort_score);
      item.oxygen_saturation_score = Set(self.oxygen_saturation_score);
      item.supplemental_oxygen_score = Set(self.supplemental_oxygen_score);
      item.heart_rate_score = Set(self.heart_rate_score);
      item.capillary_refill_score = Set(self.capillary_refill_score);
      item.consciousness_score = Set(self.consciousness_score);
      item.risk_band = Set(self.risk_band.clone());
      item.single_parameter_trigger = Set(self.single_parameter_trigger.clone());
      item.concern_trigger = Set(self.concern_trigger.clone());
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
        .prefix("api/paediatric_early_warning_score_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
