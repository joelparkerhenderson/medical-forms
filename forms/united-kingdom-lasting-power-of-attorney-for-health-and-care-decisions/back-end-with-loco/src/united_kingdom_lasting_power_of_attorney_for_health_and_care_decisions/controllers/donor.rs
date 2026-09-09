#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::donors::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub title: String,
    pub given_names: String,
    pub family_name: String,
    pub other_names_used: String,
    pub birth_date: Option<Date>,
    pub email: String,
    pub phone: String,
    pub postal_address_as_full_text: String,
    pub country_as_iso_3166_1_alpha_2: String,
    pub postcode: String,
    pub united_kingdom_nhs_number: Option<String>,
    pub jurisdiction: String,
    pub preferred_language: String,
    pub capacity_declared: String,
    pub capacity_declared_at: Option<DateTimeWithTimeZone>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.title = Set(self.title.clone());
      item.given_names = Set(self.given_names.clone());
      item.family_name = Set(self.family_name.clone());
      item.other_names_used = Set(self.other_names_used.clone());
      item.birth_date = Set(self.birth_date);
      item.email = Set(self.email.clone());
      item.phone = Set(self.phone.clone());
      item.postal_address_as_full_text = Set(self.postal_address_as_full_text.clone());
      item.country_as_iso_3166_1_alpha_2 = Set(self.country_as_iso_3166_1_alpha_2.clone());
      item.postcode = Set(self.postcode.clone());
      item.united_kingdom_nhs_number = Set(self.united_kingdom_nhs_number.clone());
      item.jurisdiction = Set(self.jurisdiction.clone());
      item.preferred_language = Set(self.preferred_language.clone());
      item.capacity_declared = Set(self.capacity_declared.clone());
      item.capacity_declared_at = Set(self.capacity_declared_at);
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
        .prefix("api/donors/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
