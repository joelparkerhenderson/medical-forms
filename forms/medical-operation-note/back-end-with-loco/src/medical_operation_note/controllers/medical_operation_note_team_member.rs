//! Medical operation note team member controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_operation_note_team_members::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a medical operation note team member record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Team role.
    pub team_role: String,
    /// Arrived at.
    pub arrived_at: Option<DateTimeWithTimeZone>,
    /// Left at.
    pub left_at: Option<DateTimeWithTimeZone>,
    /// Notes.
    pub notes: String,
    /// Medical operation note ID.
    pub medical_operation_note_id: i64,
    /// Clinician ID.
    pub clinician_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.team_role = Set(self.team_role.clone());
      item.arrived_at = Set(self.arrived_at);
      item.left_at = Set(self.left_at);
      item.notes = Set(self.notes.clone());
      item.medical_operation_note_id = Set(self.medical_operation_note_id);
      item.clinician_id = Set(self.clinician_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every medical operation note team member record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new medical operation note team member record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the medical operation note team member record identified by `id`.
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

/// Remove the medical operation note team member record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single medical operation note team member record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the medical operation note team members resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/medical_operation_note_team_members/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
