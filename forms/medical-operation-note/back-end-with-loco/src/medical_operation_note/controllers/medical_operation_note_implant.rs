//! Medical operation note implant controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_operation_note_implants::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a medical operation note implant record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Category.
    pub category: String,
    /// Name.
    pub name: String,
    /// Size or gauge.
    pub size_or_gauge: String,
    /// Quantity.
    pub quantity: i32,
    /// Manufacturer.
    pub manufacturer: String,
    /// Lot number.
    pub lot_number: String,
    /// Serial number.
    pub serial_number: String,
    /// Batch number.
    pub batch_number: String,
    /// Expiry date.
    pub expiry_date: Option<Date>,
    /// Udi di.
    pub udi_di: String,
    /// Implant site.
    pub implant_site: String,
    /// Registry required.
    pub registry_required: String,
    /// Registry submitted.
    pub registry_submitted: String,
    /// Notes.
    pub notes: String,
    /// Medical operation note ID.
    pub medical_operation_note_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.category = Set(self.category.clone());
      item.name = Set(self.name.clone());
      item.size_or_gauge = Set(self.size_or_gauge.clone());
      item.quantity = Set(self.quantity);
      item.manufacturer = Set(self.manufacturer.clone());
      item.lot_number = Set(self.lot_number.clone());
      item.serial_number = Set(self.serial_number.clone());
      item.batch_number = Set(self.batch_number.clone());
      item.expiry_date = Set(self.expiry_date);
      item.udi_di = Set(self.udi_di.clone());
      item.implant_site = Set(self.implant_site.clone());
      item.registry_required = Set(self.registry_required.clone());
      item.registry_submitted = Set(self.registry_submitted.clone());
      item.notes = Set(self.notes.clone());
      item.medical_operation_note_id = Set(self.medical_operation_note_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every medical operation note implant record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new medical operation note implant record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the medical operation note implant record identified by `id`.
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

/// Remove the medical operation note implant record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single medical operation note implant record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the medical operation note implants resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/medical_operation_note_implants/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
