//! Medical operation note drain controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_operation_note_drains::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a medical operation note drain record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Device type.
    pub device_type: String,
    /// Name.
    pub name: String,
    /// Site.
    pub site: String,
    /// Size or gauge.
    pub size_or_gauge: String,
    /// Output target.
    pub output_target: String,
    /// Removal plan.
    pub removal_plan: String,
    /// Removal by date.
    pub removal_by_date: Option<Date>,
    /// Quantity.
    pub quantity: i32,
    /// Notes.
    pub notes: String,
    /// Medical operation note ID.
    pub medical_operation_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.device_type = Set(self.device_type.clone());
      item.name = Set(self.name.clone());
      item.site = Set(self.site.clone());
      item.size_or_gauge = Set(self.size_or_gauge.clone());
      item.output_target = Set(self.output_target.clone());
      item.removal_plan = Set(self.removal_plan.clone());
      item.removal_by_date = Set(self.removal_by_date);
      item.quantity = Set(self.quantity);
      item.notes = Set(self.notes.clone());
      item.medical_operation_note_id = Set(self.medical_operation_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every medical operation note drain record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new medical operation note drain record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the medical operation note drain record identified by `id`.
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

/// Remove the medical operation note drain record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single medical operation note drain record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the medical operation note drains resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/medical_operation_note_drains/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
