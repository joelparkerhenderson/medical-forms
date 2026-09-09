//! Inpatient clinical note investigation controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::inpatient_clinical_note_investigations::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a inpatient clinical note investigation record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Deleted at.
    pub deleted_at: Option<DateTimeWithTimeZone>,
    /// Sort order.
    pub sort_order: i32,
    /// Test name.
    pub test_name: String,
    /// Category.
    pub category: String,
    /// Requested date.
    pub requested_date: Option<Date>,
    /// Result date.
    pub result_date: Option<Date>,
    /// Result summary.
    pub result_summary: String,
    /// Abnormal.
    pub abnormal: String,
    /// Actioned.
    pub actioned: String,
    /// Action taken.
    pub action_taken: String,
    /// Inpatient clinical note ID.
    pub inpatient_clinical_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.sort_order = Set(self.sort_order);
      item.test_name = Set(self.test_name.clone());
      item.category = Set(self.category.clone());
      item.requested_date = Set(self.requested_date);
      item.result_date = Set(self.result_date);
      item.result_summary = Set(self.result_summary.clone());
      item.abnormal = Set(self.abnormal.clone());
      item.actioned = Set(self.actioned.clone());
      item.action_taken = Set(self.action_taken.clone());
      item.inpatient_clinical_note_id = Set(self.inpatient_clinical_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every inpatient clinical note investigation record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new inpatient clinical note investigation record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the inpatient clinical note investigation record identified by `id`.
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

/// Remove the inpatient clinical note investigation record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single inpatient clinical note investigation record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the inpatient clinical note investigations resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/inpatient_clinical_note_investigations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
