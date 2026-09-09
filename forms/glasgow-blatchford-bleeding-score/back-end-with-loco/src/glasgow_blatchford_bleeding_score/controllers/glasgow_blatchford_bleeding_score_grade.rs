#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::glasgow_blatchford_bleeding_score_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub glasgow_blatchford_bleeding_score_id: i64,
    pub blood_urea_points: Option<i32>,
    pub haemoglobin_points: Option<i32>,
    pub systolic_blood_pressure_points: Option<i32>,
    pub pulse_point: Option<i32>,
    pub melaena_point: Option<i32>,
    pub syncope_point: Option<i32>,
    pub hepatic_disease_point: Option<i32>,
    pub cardiac_failure_point: Option<i32>,
    pub total_score: Option<i32>,
    pub risk_band: String,
    pub recommended_management: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.glasgow_blatchford_bleeding_score_id = Set(self.glasgow_blatchford_bleeding_score_id);
      item.blood_urea_points = Set(self.blood_urea_points);
      item.haemoglobin_points = Set(self.haemoglobin_points);
      item.systolic_blood_pressure_points = Set(self.systolic_blood_pressure_points);
      item.pulse_point = Set(self.pulse_point);
      item.melaena_point = Set(self.melaena_point);
      item.syncope_point = Set(self.syncope_point);
      item.hepatic_disease_point = Set(self.hepatic_disease_point);
      item.cardiac_failure_point = Set(self.cardiac_failure_point);
      item.total_score = Set(self.total_score);
      item.risk_band = Set(self.risk_band.clone());
      item.recommended_management = Set(self.recommended_management.clone());
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
        .prefix("api/glasgow_blatchford_bleeding_score_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
