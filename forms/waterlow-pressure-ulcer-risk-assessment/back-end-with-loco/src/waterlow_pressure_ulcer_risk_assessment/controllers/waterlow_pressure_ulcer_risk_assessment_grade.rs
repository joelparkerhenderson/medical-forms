#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::waterlow_pressure_ulcer_risk_assessment_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub waterlow_pressure_ulcer_risk_assessment_id: i64,
    pub build_points: Option<i32>,
    pub skin_points: Option<i32>,
    pub sex_points: Option<i32>,
    pub age_points: Option<i32>,
    pub continence_points: Option<i32>,
    pub mobility_points: Option<i32>,
    pub tissue_malnutrition_points: Option<i32>,
    pub neurological_deficit_points: Option<i32>,
    pub major_surgery_trauma_points: Option<i32>,
    pub medication_points: Option<i32>,
    pub total_score: Option<i32>,
    pub risk_band: String,
    pub prevention_actions: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.waterlow_pressure_ulcer_risk_assessment_id = Set(self.waterlow_pressure_ulcer_risk_assessment_id);
      item.build_points = Set(self.build_points);
      item.skin_points = Set(self.skin_points);
      item.sex_points = Set(self.sex_points);
      item.age_points = Set(self.age_points);
      item.continence_points = Set(self.continence_points);
      item.mobility_points = Set(self.mobility_points);
      item.tissue_malnutrition_points = Set(self.tissue_malnutrition_points);
      item.neurological_deficit_points = Set(self.neurological_deficit_points);
      item.major_surgery_trauma_points = Set(self.major_surgery_trauma_points);
      item.medication_points = Set(self.medication_points);
      item.total_score = Set(self.total_score);
      item.risk_band = Set(self.risk_band.clone());
      item.prevention_actions = Set(self.prevention_actions.clone());
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
        .prefix("api/waterlow_pressure_ulcer_risk_assessment_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
