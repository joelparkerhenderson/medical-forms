#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::centers::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub name: String,
    pub who_designation_reference: String,
    pub national_authority_reference: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub postal_address_as_full_text: Option<String>,
    pub country_as_iso_3166_1_alpha_2: Option<String>,
    pub country_as_iso_3166_1_alpha_3: Option<String>,
    pub postcode: Option<String>,
    pub uniform_stamp_image_data_url: String,
    pub authorised_diseases: String,
    pub designation_valid_from: Option<Date>,
    pub designation_valid_until: Option<Date>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.name = Set(self.name.clone());
      item.who_designation_reference = Set(self.who_designation_reference.clone());
      item.national_authority_reference = Set(self.national_authority_reference.clone());
      item.email = Set(self.email.clone());
      item.phone = Set(self.phone.clone());
      item.postal_address_as_full_text = Set(self.postal_address_as_full_text.clone());
      item.country_as_iso_3166_1_alpha_2 = Set(self.country_as_iso_3166_1_alpha_2.clone());
      item.country_as_iso_3166_1_alpha_3 = Set(self.country_as_iso_3166_1_alpha_3.clone());
      item.postcode = Set(self.postcode.clone());
      item.uniform_stamp_image_data_url = Set(self.uniform_stamp_image_data_url.clone());
      item.authorised_diseases = Set(self.authorised_diseases.clone());
      item.designation_valid_from = Set(self.designation_valid_from);
      item.designation_valid_until = Set(self.designation_valid_until);
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
        .prefix("api/centers/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
