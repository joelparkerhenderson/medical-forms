#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::dietic_assessment_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub dietic_assessment_id: i64,
    pub must_bmi_score: Option<i32>,
    pub must_weight_loss_score: Option<i32>,
    pub must_acute_disease_score: Option<i32>,
    pub must_score: Option<i32>,
    pub computed_must_risk: String,
    pub final_must_risk: String,
    pub must_is_estimated: bool,
    pub glim_phenotypic_criteria: String,
    pub glim_etiologic_criteria: String,
    pub glim_diagnosis: String,
    pub nrs_2002_score: Option<i32>,
    pub sarcf_score: Option<i32>,
    pub scoff_score: Option<i32>,
    pub refeeding_risk: String,
    pub energy_requirement_kcal: Option<i32>,
    pub protein_requirement_g: Option<i32>,
    pub computed_composite_risk: String,
    pub final_composite_risk: String,
    pub override_reason: String,
    pub recommendation: String,
    pub dietitian_notes: String,
    pub signed_by_name: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.dietic_assessment_id = Set(self.dietic_assessment_id);
      item.must_bmi_score = Set(self.must_bmi_score);
      item.must_weight_loss_score = Set(self.must_weight_loss_score);
      item.must_acute_disease_score = Set(self.must_acute_disease_score);
      item.must_score = Set(self.must_score);
      item.computed_must_risk = Set(self.computed_must_risk.clone());
      item.final_must_risk = Set(self.final_must_risk.clone());
      item.must_is_estimated = Set(self.must_is_estimated);
      item.glim_phenotypic_criteria = Set(self.glim_phenotypic_criteria.clone());
      item.glim_etiologic_criteria = Set(self.glim_etiologic_criteria.clone());
      item.glim_diagnosis = Set(self.glim_diagnosis.clone());
      item.nrs_2002_score = Set(self.nrs_2002_score);
      item.sarcf_score = Set(self.sarcf_score);
      item.scoff_score = Set(self.scoff_score);
      item.refeeding_risk = Set(self.refeeding_risk.clone());
      item.energy_requirement_kcal = Set(self.energy_requirement_kcal);
      item.protein_requirement_g = Set(self.protein_requirement_g);
      item.computed_composite_risk = Set(self.computed_composite_risk.clone());
      item.final_composite_risk = Set(self.final_composite_risk.clone());
      item.override_reason = Set(self.override_reason.clone());
      item.recommendation = Set(self.recommendation.clone());
      item.dietitian_notes = Set(self.dietitian_notes.clone());
      item.signed_by_name = Set(self.signed_by_name.clone());
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
        .prefix("api/dietic_assessment_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
