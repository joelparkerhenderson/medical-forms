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
    pub surname: String,
    pub given_names: String,
    pub birth_date: Option<Date>,
    pub sex: String,
    pub nationality_as_iso_3166_1_alpha_3: String,
    pub travel_document_kind: String,
    pub travel_document_number: String,
    pub travel_document_issuer_as_iso_3166_1_alpha_3: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub postal_address_as_full_text: Option<String>,
    pub country_as_iso_3166_1_alpha_2: Option<String>,
    pub postcode: Option<String>,
    pub consented_to_data_sharing: String,
    pub signature_image_data_url: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.surname = Set(self.surname.clone());
      item.given_names = Set(self.given_names.clone());
      item.birth_date = Set(self.birth_date);
      item.sex = Set(self.sex.clone());
      item.nationality_as_iso_3166_1_alpha_3 = Set(self.nationality_as_iso_3166_1_alpha_3.clone());
      item.travel_document_kind = Set(self.travel_document_kind.clone());
      item.travel_document_number = Set(self.travel_document_number.clone());
      item.travel_document_issuer_as_iso_3166_1_alpha_3 = Set(self.travel_document_issuer_as_iso_3166_1_alpha_3.clone());
      item.email = Set(self.email.clone());
      item.phone = Set(self.phone.clone());
      item.postal_address_as_full_text = Set(self.postal_address_as_full_text.clone());
      item.country_as_iso_3166_1_alpha_2 = Set(self.country_as_iso_3166_1_alpha_2.clone());
      item.postcode = Set(self.postcode.clone());
      item.consented_to_data_sharing = Set(self.consented_to_data_sharing.clone());
      item.signature_image_data_url = Set(self.signature_image_data_url.clone());
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
