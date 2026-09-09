//! Inpatient clinical note job controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::inpatient_clinical_note_jobs::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a inpatient clinical note job record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Deleted at.
    pub deleted_at: Option<DateTimeWithTimeZone>,
    /// Sort order.
    pub sort_order: i32,
    /// Job.
    pub job: String,
    /// Category.
    pub category: String,
    /// Owner.
    pub owner: String,
    /// Priority.
    pub priority: String,
    /// Due at.
    pub due_at: Option<DateTimeWithTimeZone>,
    /// Status.
    pub status: String,
    /// Completed at.
    pub completed_at: Option<DateTimeWithTimeZone>,
    /// Notes.
    pub notes: String,
    /// Inpatient clinical note ID.
    pub inpatient_clinical_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.sort_order = Set(self.sort_order);
      item.job = Set(self.job.clone());
      item.category = Set(self.category.clone());
      item.owner = Set(self.owner.clone());
      item.priority = Set(self.priority.clone());
      item.due_at = Set(self.due_at);
      item.status = Set(self.status.clone());
      item.completed_at = Set(self.completed_at);
      item.notes = Set(self.notes.clone());
      item.inpatient_clinical_note_id = Set(self.inpatient_clinical_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every inpatient clinical note job record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new inpatient clinical note job record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the inpatient clinical note job record identified by `id`.
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

/// Remove the inpatient clinical note job record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single inpatient clinical note job record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the inpatient clinical note jobs resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/inpatient_clinical_note_jobs/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
