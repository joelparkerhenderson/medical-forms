//! Patient controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::patients::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a patient record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Deleted at.
    pub deleted_at: Option<DateTimeWithTimeZone>,
    /// Name.
    pub name: String,
    /// Birth date.
    pub birth_date: Date,
    /// Sex.
    pub sex: String,
    /// Email.
    pub email: Option<String>,
    /// Phone.
    pub phone: Option<String>,
    /// Postal address as full text.
    pub postal_address_as_full_text: Option<String>,
    /// Country as iso 3166 1 alpha 2.
    pub country_as_iso_3166_1_alpha_2: Option<String>,
    /// Postcode.
    pub postcode: Option<String>,
    /// United kingdom nhs number.
    pub united_kingdom_nhs_number: Option<String>,
    /// Hospital mrn.
    pub hospital_mrn: Option<String>,
    /// Height as cm.
    pub height_as_cm: Option<Decimal>,
    /// Weight as kg.
    pub weight_as_kg: Option<Decimal>,
    /// Body mass index.
    pub body_mass_index: Option<Decimal>,
    /// Allergies summary.
    pub allergies_summary: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.name = Set(self.name.clone());
      item.birth_date = Set(self.birth_date);
      item.sex = Set(self.sex.clone());
      item.email = Set(self.email.clone());
      item.phone = Set(self.phone.clone());
      item.postal_address_as_full_text = Set(self.postal_address_as_full_text.clone());
      item.country_as_iso_3166_1_alpha_2 = Set(self.country_as_iso_3166_1_alpha_2.clone());
      item.postcode = Set(self.postcode.clone());
      item.united_kingdom_nhs_number = Set(self.united_kingdom_nhs_number.clone());
      item.hospital_mrn = Set(self.hospital_mrn.clone());
      item.height_as_cm = Set(self.height_as_cm);
      item.weight_as_kg = Set(self.weight_as_kg);
      item.body_mass_index = Set(self.body_mass_index);
      item.allergies_summary = Set(self.allergies_summary.clone());
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every patient record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new patient record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the patient record identified by `id`.
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

/// Remove the patient record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single patient record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the patients resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/patients/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
