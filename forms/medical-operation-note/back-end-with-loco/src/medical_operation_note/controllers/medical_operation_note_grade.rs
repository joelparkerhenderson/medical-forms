//! Medical operation note grade controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_operation_note_grades::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a medical operation note grade record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Computed composite risk.
    pub computed_composite_risk: String,
    /// Final composite risk.
    pub final_composite_risk: String,
    /// Override reason.
    pub override_reason: String,
    /// Worst clavien dindo grade.
    pub worst_clavien_dindo_grade: String,
    /// Asa physical status.
    pub asa_physical_status: String,
    /// Blood loss band.
    pub blood_loss_band: String,
    /// Counts agreed.
    pub counts_agreed: String,
    /// Never event suspected.
    pub never_event_suspected: String,
    /// Recommendation.
    pub recommendation: String,
    /// Surgeon notes.
    pub surgeon_notes: String,
    /// Signed at.
    pub signed_at: Option<DateTimeWithTimeZone>,
    /// Graded at.
    pub graded_at: DateTimeWithTimeZone,
    /// Medical operation note ID.
    pub medical_operation_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.computed_composite_risk = Set(self.computed_composite_risk.clone());
      item.final_composite_risk = Set(self.final_composite_risk.clone());
      item.override_reason = Set(self.override_reason.clone());
      item.worst_clavien_dindo_grade = Set(self.worst_clavien_dindo_grade.clone());
      item.asa_physical_status = Set(self.asa_physical_status.clone());
      item.blood_loss_band = Set(self.blood_loss_band.clone());
      item.counts_agreed = Set(self.counts_agreed.clone());
      item.never_event_suspected = Set(self.never_event_suspected.clone());
      item.recommendation = Set(self.recommendation.clone());
      item.surgeon_notes = Set(self.surgeon_notes.clone());
      item.signed_at = Set(self.signed_at);
      item.graded_at = Set(self.graded_at);
      item.medical_operation_note_id = Set(self.medical_operation_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every medical operation note grade record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new medical operation note grade record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the medical operation note grade record identified by `id`.
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

/// Remove the medical operation note grade record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single medical operation note grade record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the medical operation note grades resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/medical_operation_note_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
