#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::perioperative_optimization_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub perioperative_optimization_id: i64,
    pub weeks_to_surgery: Option<i32>,
    pub gating_applied: bool,
    pub must_score: Option<i32>,
    pub must_risk: String,
    pub audit_c_score: Option<i32>,
    pub stop_bang_score: Option<i32>,
    pub duke_activity_status_index: Option<f64>,
    pub clinical_frailty_scale: Option<i32>,
    pub fried_phenotype_score: Option<i32>,
    pub fried_frailty_category: String,
    pub domains_optimized: Option<i32>,
    pub domains_in_progress: Option<i32>,
    pub domains_action_required: Option<i32>,
    pub domains_insufficient_time: Option<i32>,
    pub computed_readiness: String,
    pub final_readiness: String,
    pub override_reason: String,
    pub gate_decision: String,
    pub recommended_earliest_surgery_date: Option<Date>,
    pub clinician_notes: String,
    pub signed_by_name: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.perioperative_optimization_id = Set(self.perioperative_optimization_id);
      item.weeks_to_surgery = Set(self.weeks_to_surgery);
      item.gating_applied = Set(self.gating_applied);
      item.must_score = Set(self.must_score);
      item.must_risk = Set(self.must_risk.clone());
      item.audit_c_score = Set(self.audit_c_score);
      item.stop_bang_score = Set(self.stop_bang_score);
      item.duke_activity_status_index = Set(self.duke_activity_status_index);
      item.clinical_frailty_scale = Set(self.clinical_frailty_scale);
      item.fried_phenotype_score = Set(self.fried_phenotype_score);
      item.fried_frailty_category = Set(self.fried_frailty_category.clone());
      item.domains_optimized = Set(self.domains_optimized);
      item.domains_in_progress = Set(self.domains_in_progress);
      item.domains_action_required = Set(self.domains_action_required);
      item.domains_insufficient_time = Set(self.domains_insufficient_time);
      item.computed_readiness = Set(self.computed_readiness.clone());
      item.final_readiness = Set(self.final_readiness.clone());
      item.override_reason = Set(self.override_reason.clone());
      item.gate_decision = Set(self.gate_decision.clone());
      item.recommended_earliest_surgery_date = Set(self.recommended_earliest_surgery_date);
      item.clinician_notes = Set(self.clinician_notes.clone());
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
        .prefix("api/perioperative_optimization_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
