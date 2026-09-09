//! Inpatient clinical note medication change controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::inpatient_clinical_note_medication_changes::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a inpatient clinical note medication change record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Deleted at.
    pub deleted_at: Option<DateTimeWithTimeZone>,
    /// Sort order.
    pub sort_order: i32,
    /// Drug name.
    pub drug_name: String,
    /// Action.
    pub action: String,
    /// Dose.
    pub dose: String,
    /// Route.
    pub route: String,
    /// Frequency.
    pub frequency: String,
    /// Indication.
    pub indication: String,
    /// Is antimicrobial.
    pub is_antimicrobial: String,
    /// Review date.
    pub review_date: Option<Date>,
    /// Stop date.
    pub stop_date: Option<Date>,
    /// Dmd code.
    pub dmd_code: String,
    /// Notes.
    pub notes: String,
    /// Inpatient clinical note ID.
    pub inpatient_clinical_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.sort_order = Set(self.sort_order);
      item.drug_name = Set(self.drug_name.clone());
      item.action = Set(self.action.clone());
      item.dose = Set(self.dose.clone());
      item.route = Set(self.route.clone());
      item.frequency = Set(self.frequency.clone());
      item.indication = Set(self.indication.clone());
      item.is_antimicrobial = Set(self.is_antimicrobial.clone());
      item.review_date = Set(self.review_date);
      item.stop_date = Set(self.stop_date);
      item.dmd_code = Set(self.dmd_code.clone());
      item.notes = Set(self.notes.clone());
      item.inpatient_clinical_note_id = Set(self.inpatient_clinical_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every inpatient clinical note medication change record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new inpatient clinical note medication change record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the inpatient clinical note medication change record identified by `id`.
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

/// Remove the inpatient clinical note medication change record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single inpatient clinical note medication change record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the inpatient clinical note medication changes resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/inpatient_clinical_note_medication_changes/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
