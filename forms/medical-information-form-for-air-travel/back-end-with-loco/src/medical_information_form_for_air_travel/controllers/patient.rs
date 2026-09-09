#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::patients::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub name: String,
    pub birth_date: Option<Date>,
    pub sex_at_birth: String,
    pub nationality_as_iso_3166_1_alpha_2: Option<String>,
    pub passport_number: String,
    pub united_kingdom_nhs_number: Option<String>,
    pub national_health_id: String,
    pub email: String,
    pub phone: String,
    pub postal_address_as_full_text: String,
    pub country_as_iso_3166_1_alpha_2: Option<String>,
    pub postcode: String,
    pub emergency_contact_name: String,
    pub emergency_contact_relationship: String,
    pub emergency_contact_phone: String,
    pub weight_as_kg: Option<f64>,
    pub height_as_cm: Option<f64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.name = Set(self.name.clone());
      item.birth_date = Set(self.birth_date);
      item.sex_at_birth = Set(self.sex_at_birth.clone());
      item.nationality_as_iso_3166_1_alpha_2 = Set(self.nationality_as_iso_3166_1_alpha_2.clone());
      item.passport_number = Set(self.passport_number.clone());
      item.united_kingdom_nhs_number = Set(self.united_kingdom_nhs_number.clone());
      item.national_health_id = Set(self.national_health_id.clone());
      item.email = Set(self.email.clone());
      item.phone = Set(self.phone.clone());
      item.postal_address_as_full_text = Set(self.postal_address_as_full_text.clone());
      item.country_as_iso_3166_1_alpha_2 = Set(self.country_as_iso_3166_1_alpha_2.clone());
      item.postcode = Set(self.postcode.clone());
      item.emergency_contact_name = Set(self.emergency_contact_name.clone());
      item.emergency_contact_relationship = Set(self.emergency_contact_relationship.clone());
      item.emergency_contact_phone = Set(self.emergency_contact_phone.clone());
      item.weight_as_kg = Set(self.weight_as_kg);
      item.height_as_cm = Set(self.height_as_cm);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

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

#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

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
