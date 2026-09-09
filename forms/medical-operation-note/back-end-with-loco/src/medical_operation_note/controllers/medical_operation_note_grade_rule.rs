//! Medical operation note grade rule controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_operation_note_grade_rules::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a medical operation note grade rule record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Rule ID.
    pub rule_id: String,
    /// Instrument.
    pub instrument: String,
    /// Band.
    pub band: String,
    /// Category.
    pub category: String,
    /// Description.
    pub description: String,
    /// Medical operation note grade ID.
    pub medical_operation_note_grade_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.rule_id = Set(self.rule_id.clone());
      item.instrument = Set(self.instrument.clone());
      item.band = Set(self.band.clone());
      item.category = Set(self.category.clone());
      item.description = Set(self.description.clone());
      item.medical_operation_note_grade_id = Set(self.medical_operation_note_grade_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every medical operation note grade rule record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new medical operation note grade rule record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the medical operation note grade rule record identified by `id`.
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

/// Remove the medical operation note grade rule record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single medical operation note grade rule record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the medical operation note grade rules resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/medical_operation_note_grade_rules/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
