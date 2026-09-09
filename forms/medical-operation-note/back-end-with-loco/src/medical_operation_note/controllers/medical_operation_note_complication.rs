//! Medical operation note complication controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_operation_note_complications::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a medical operation note complication record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Category.
    pub category: String,
    /// Description.
    pub description: String,
    /// Clavien dindo grade.
    pub clavien_dindo_grade: String,
    /// Onset at.
    pub onset_at: Option<DateTimeWithTimeZone>,
    /// Action taken.
    pub action_taken: String,
    /// Resolved in theatre.
    pub resolved_in_theatre: String,
    /// Reported to governance.
    pub reported_to_governance: String,
    /// Medical operation note ID.
    pub medical_operation_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.category = Set(self.category.clone());
      item.description = Set(self.description.clone());
      item.clavien_dindo_grade = Set(self.clavien_dindo_grade.clone());
      item.onset_at = Set(self.onset_at);
      item.action_taken = Set(self.action_taken.clone());
      item.resolved_in_theatre = Set(self.resolved_in_theatre.clone());
      item.reported_to_governance = Set(self.reported_to_governance.clone());
      item.medical_operation_note_id = Set(self.medical_operation_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every medical operation note complication record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new medical operation note complication record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the medical operation note complication record identified by `id`.
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

/// Remove the medical operation note complication record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single medical operation note complication record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the medical operation note complications resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/medical_operation_note_complications/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
