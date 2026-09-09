#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::cha2ds2_vasc_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub cha2ds2_vasc_id: i64,
    pub congestive_heart_failure_points: Option<i32>,
    pub hypertension_points: Option<i32>,
    pub age_points: Option<i32>,
    pub diabetes_points: Option<i32>,
    pub stroke_points: Option<i32>,
    pub vascular_disease_points: Option<i32>,
    pub sex_points: Option<i32>,
    pub total_score: Option<i32>,
    pub risk_band: String,
    pub annual_stroke_risk_percent: Option<f64>,
    pub anticoagulation_recommendation: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.cha2ds2_vasc_id = Set(self.cha2ds2_vasc_id);
      item.congestive_heart_failure_points = Set(self.congestive_heart_failure_points);
      item.hypertension_points = Set(self.hypertension_points);
      item.age_points = Set(self.age_points);
      item.diabetes_points = Set(self.diabetes_points);
      item.stroke_points = Set(self.stroke_points);
      item.vascular_disease_points = Set(self.vascular_disease_points);
      item.sex_points = Set(self.sex_points);
      item.total_score = Set(self.total_score);
      item.risk_band = Set(self.risk_band.clone());
      item.annual_stroke_risk_percent = Set(self.annual_stroke_risk_percent);
      item.anticoagulation_recommendation = Set(self.anticoagulation_recommendation.clone());
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
        .prefix("api/cha2ds2_vasc_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
