//! Inpatient clinical note grade flag controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::inpatient_clinical_note_grade_flags::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a inpatient clinical note grade flag record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Deleted at.
    pub deleted_at: Option<DateTimeWithTimeZone>,
    /// Flag ID.
    pub flag_id: String,
    /// Category.
    pub category: String,
    /// Priority.
    pub priority: String,
    /// Description.
    pub description: String,
    /// Suggested action.
    pub suggested_action: String,
    /// Inpatient clinical note grade ID.
    pub inpatient_clinical_note_grade_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.flag_id = Set(self.flag_id.clone());
      item.category = Set(self.category.clone());
      item.priority = Set(self.priority.clone());
      item.description = Set(self.description.clone());
      item.suggested_action = Set(self.suggested_action.clone());
      item.inpatient_clinical_note_grade_id = Set(self.inpatient_clinical_note_grade_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every inpatient clinical note grade flag record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new inpatient clinical note grade flag record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the inpatient clinical note grade flag record identified by `id`.
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

/// Remove the inpatient clinical note grade flag record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single inpatient clinical note grade flag record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the inpatient clinical note grade flags resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/inpatient_clinical_note_grade_flags/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
