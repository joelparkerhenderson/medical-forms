#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::padua_venous_thromboembolism_risk_assessment_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub padua_venous_thromboembolism_risk_assessment_id: i64,
    pub active_cancer_points: Option<i32>,
    pub previous_vte_points: Option<i32>,
    pub reduced_mobility_points: Option<i32>,
    pub known_thrombophilia_points: Option<i32>,
    pub recent_trauma_or_surgery_points: Option<i32>,
    pub elderly_age_points: Option<i32>,
    pub heart_or_respiratory_failure_points: Option<i32>,
    pub acute_mi_or_ischaemic_stroke_points: Option<i32>,
    pub acute_infection_or_rheumatological_points: Option<i32>,
    pub obesity_points: Option<i32>,
    pub ongoing_hormonal_treatment_points: Option<i32>,
    pub total_score: Option<i32>,
    pub risk_band: String,
    pub prophylaxis_recommendation: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.padua_venous_thromboembolism_risk_assessment_id = Set(self.padua_venous_thromboembolism_risk_assessment_id);
      item.active_cancer_points = Set(self.active_cancer_points);
      item.previous_vte_points = Set(self.previous_vte_points);
      item.reduced_mobility_points = Set(self.reduced_mobility_points);
      item.known_thrombophilia_points = Set(self.known_thrombophilia_points);
      item.recent_trauma_or_surgery_points = Set(self.recent_trauma_or_surgery_points);
      item.elderly_age_points = Set(self.elderly_age_points);
      item.heart_or_respiratory_failure_points = Set(self.heart_or_respiratory_failure_points);
      item.acute_mi_or_ischaemic_stroke_points = Set(self.acute_mi_or_ischaemic_stroke_points);
      item.acute_infection_or_rheumatological_points = Set(self.acute_infection_or_rheumatological_points);
      item.obesity_points = Set(self.obesity_points);
      item.ongoing_hormonal_treatment_points = Set(self.ongoing_hormonal_treatment_points);
      item.total_score = Set(self.total_score);
      item.risk_band = Set(self.risk_band.clone());
      item.prophylaxis_recommendation = Set(self.prophylaxis_recommendation.clone());
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
        .prefix("api/padua_venous_thromboembolism_risk_assessment_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
