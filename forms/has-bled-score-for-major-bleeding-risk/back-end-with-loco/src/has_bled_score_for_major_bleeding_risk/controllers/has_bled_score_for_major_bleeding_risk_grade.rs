#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::has_bled_score_for_major_bleeding_risk_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub has_bled_score_for_major_bleeding_risk_id: i64,
    pub hypertension_points: Option<i32>,
    pub renal_points: Option<i32>,
    pub liver_points: Option<i32>,
    pub stroke_points: Option<i32>,
    pub bleeding_points: Option<i32>,
    pub labile_inr_points: Option<i32>,
    pub elderly_points: Option<i32>,
    pub drugs_points: Option<i32>,
    pub alcohol_points: Option<i32>,
    pub total_score: Option<i32>,
    pub risk_band: String,
    pub modifiable_factors: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.has_bled_score_for_major_bleeding_risk_id = Set(self.has_bled_score_for_major_bleeding_risk_id);
      item.hypertension_points = Set(self.hypertension_points);
      item.renal_points = Set(self.renal_points);
      item.liver_points = Set(self.liver_points);
      item.stroke_points = Set(self.stroke_points);
      item.bleeding_points = Set(self.bleeding_points);
      item.labile_inr_points = Set(self.labile_inr_points);
      item.elderly_points = Set(self.elderly_points);
      item.drugs_points = Set(self.drugs_points);
      item.alcohol_points = Set(self.alcohol_points);
      item.total_score = Set(self.total_score);
      item.risk_band = Set(self.risk_band.clone());
      item.modifiable_factors = Set(self.modifiable_factors.clone());
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
        .prefix("api/has_bled_score_for_major_bleeding_risk_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
