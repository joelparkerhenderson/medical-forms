//! Inpatient clinical note grade controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::inpatient_clinical_note_grades::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a inpatient clinical note grade record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Deleted at.
    pub deleted_at: Option<DateTimeWithTimeZone>,
    /// Status.
    pub status: String,
    /// Completeness percent.
    pub completeness_percent: Option<i32>,
    /// Required component count.
    pub required_component_count: Option<i32>,
    /// Documented component count.
    pub documented_component_count: Option<i32>,
    /// Acuity band.
    pub acuity_band: String,
    /// Computed acuity band.
    pub computed_acuity_band: String,
    /// News2 total.
    pub news2_total: Option<i32>,
    /// Header documented.
    pub header_documented: String,
    /// Interval history documented.
    pub interval_history_documented: String,
    /// Observations documented.
    pub observations_documented: String,
    /// Examination documented.
    pub examination_documented: String,
    /// Investigations documented.
    pub investigations_documented: String,
    /// Problems documented.
    pub problems_documented: String,
    /// Medications documented.
    pub medications_documented: String,
    /// Risk assessments documented.
    pub risk_assessments_documented: String,
    /// Impression documented.
    pub impression_documented: String,
    /// Plan documented.
    pub plan_documented: String,
    /// Escalation documented.
    pub escalation_documented: String,
    /// Communication documented.
    pub communication_documented: String,
    /// Graded at.
    pub graded_at: DateTimeWithTimeZone,
    /// Inpatient clinical note ID.
    pub inpatient_clinical_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.status = Set(self.status.clone());
      item.completeness_percent = Set(self.completeness_percent);
      item.required_component_count = Set(self.required_component_count);
      item.documented_component_count = Set(self.documented_component_count);
      item.acuity_band = Set(self.acuity_band.clone());
      item.computed_acuity_band = Set(self.computed_acuity_band.clone());
      item.news2_total = Set(self.news2_total);
      item.header_documented = Set(self.header_documented.clone());
      item.interval_history_documented = Set(self.interval_history_documented.clone());
      item.observations_documented = Set(self.observations_documented.clone());
      item.examination_documented = Set(self.examination_documented.clone());
      item.investigations_documented = Set(self.investigations_documented.clone());
      item.problems_documented = Set(self.problems_documented.clone());
      item.medications_documented = Set(self.medications_documented.clone());
      item.risk_assessments_documented = Set(self.risk_assessments_documented.clone());
      item.impression_documented = Set(self.impression_documented.clone());
      item.plan_documented = Set(self.plan_documented.clone());
      item.escalation_documented = Set(self.escalation_documented.clone());
      item.communication_documented = Set(self.communication_documented.clone());
      item.graded_at = Set(self.graded_at);
      item.inpatient_clinical_note_id = Set(self.inpatient_clinical_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every inpatient clinical note grade record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new inpatient clinical note grade record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the inpatient clinical note grade record identified by `id`.
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

/// Remove the inpatient clinical note grade record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single inpatient clinical note grade record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the inpatient clinical note grades resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/inpatient_clinical_note_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
