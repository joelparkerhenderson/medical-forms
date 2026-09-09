#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pre_operative_assessment_by_clinician_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub pre_operative_assessment_by_clinician_id: i64,
    pub computed_asa_grade: String,
    pub final_asa_grade: String,
    pub asa_emergency_suffix: String,
    pub override_reason: String,
    pub mallampati_class: String,
    pub rcri_score: Option<i32>,
    pub stopbang_score: Option<i32>,
    pub frailty_scale: Option<i32>,
    pub fried_phenotype_score: Option<i32>,
    pub fried_frailty_category: String,
    pub composite_risk: String,
    pub recommendation: String,
    pub clinician_notes: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.pre_operative_assessment_by_clinician_id = Set(self.pre_operative_assessment_by_clinician_id);
      item.computed_asa_grade = Set(self.computed_asa_grade.clone());
      item.final_asa_grade = Set(self.final_asa_grade.clone());
      item.asa_emergency_suffix = Set(self.asa_emergency_suffix.clone());
      item.override_reason = Set(self.override_reason.clone());
      item.mallampati_class = Set(self.mallampati_class.clone());
      item.rcri_score = Set(self.rcri_score);
      item.stopbang_score = Set(self.stopbang_score);
      item.frailty_scale = Set(self.frailty_scale);
      item.fried_phenotype_score = Set(self.fried_phenotype_score);
      item.fried_frailty_category = Set(self.fried_frailty_category.clone());
      item.composite_risk = Set(self.composite_risk.clone());
      item.recommendation = Set(self.recommendation.clone());
      item.clinician_notes = Set(self.clinician_notes.clone());
      item.signed_at = Set(self.signed_at);
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
        .prefix("api/pre_operative_assessment_by_clinician_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
