#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::united_kingdom_statement_of_fitness_for_work_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub united_kingdom_statement_of_fitness_for_work_id: i64,
    pub fitness_category: String,
    pub adaptation_intensity: String,
    pub adaptation_count: i32,
    pub period_days: Option<i32>,
    pub period_compliance: String,
    pub recommendation: String,
    pub is_within_first_six_months_of_condition: String,
    pub is_valid: String,
    pub grader_notes: String,
    pub graded_at: DateTimeWithTimeZone,
    pub clinician_override: String,
    pub clinician_override_reason: String,
    pub clinician_final_recommendation: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.united_kingdom_statement_of_fitness_for_work_id = Set(self.united_kingdom_statement_of_fitness_for_work_id);
      item.fitness_category = Set(self.fitness_category.clone());
      item.adaptation_intensity = Set(self.adaptation_intensity.clone());
      item.adaptation_count = Set(self.adaptation_count);
      item.period_days = Set(self.period_days);
      item.period_compliance = Set(self.period_compliance.clone());
      item.recommendation = Set(self.recommendation.clone());
      item.is_within_first_six_months_of_condition = Set(self.is_within_first_six_months_of_condition.clone());
      item.is_valid = Set(self.is_valid.clone());
      item.grader_notes = Set(self.grader_notes.clone());
      item.graded_at = Set(self.graded_at);
      item.clinician_override = Set(self.clinician_override.clone());
      item.clinician_override_reason = Set(self.clinician_override_reason.clone());
      item.clinician_final_recommendation = Set(self.clinician_final_recommendation.clone());
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
        .prefix("api/united_kingdom_statement_of_fitness_for_work_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
