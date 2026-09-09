#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::chronic_kidney_disease_review_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub chronic_kidney_disease_review_id: i64,
    pub gfr_category: String,
    pub albuminuria_category: String,
    pub kdigo_risk_zone: String,
    pub review_status: String,
    pub blood_pressure_target_systolic: Option<i32>,
    pub blood_pressure_target_diastolic: Option<i32>,
    pub blood_pressure_at_target: Option<bool>,
    pub completeness_score: Option<i32>,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.chronic_kidney_disease_review_id = Set(self.chronic_kidney_disease_review_id);
      item.gfr_category = Set(self.gfr_category.clone());
      item.albuminuria_category = Set(self.albuminuria_category.clone());
      item.kdigo_risk_zone = Set(self.kdigo_risk_zone.clone());
      item.review_status = Set(self.review_status.clone());
      item.blood_pressure_target_systolic = Set(self.blood_pressure_target_systolic);
      item.blood_pressure_target_diastolic = Set(self.blood_pressure_target_diastolic);
      item.blood_pressure_at_target = Set(self.blood_pressure_at_target);
      item.completeness_score = Set(self.completeness_score);
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
        .prefix("api/chronic_kidney_disease_review_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
