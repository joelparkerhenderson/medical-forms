#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::signature_witnesses::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub hipaa_authorization_id: i64,
    pub individual_signature_confirmed: String,
    pub individual_signature_image_uri: String,
    pub signature_date: Option<Date>,
    pub signed_at_location: String,
    pub parent_guardian_co_signature_required: String,
    pub parent_guardian_name: String,
    pub parent_guardian_signature_confirmed: String,
    pub parent_guardian_signature_date: Option<Date>,
    pub witness_name: String,
    pub witness_signature_confirmed: String,
    pub witness_date: Option<Date>,
    pub witness_role: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.hipaa_authorization_id = Set(self.hipaa_authorization_id);
      item.individual_signature_confirmed = Set(self.individual_signature_confirmed.clone());
      item.individual_signature_image_uri = Set(self.individual_signature_image_uri.clone());
      item.signature_date = Set(self.signature_date);
      item.signed_at_location = Set(self.signed_at_location.clone());
      item.parent_guardian_co_signature_required = Set(self.parent_guardian_co_signature_required.clone());
      item.parent_guardian_name = Set(self.parent_guardian_name.clone());
      item.parent_guardian_signature_confirmed = Set(self.parent_guardian_signature_confirmed.clone());
      item.parent_guardian_signature_date = Set(self.parent_guardian_signature_date);
      item.witness_name = Set(self.witness_name.clone());
      item.witness_signature_confirmed = Set(self.witness_signature_confirmed.clone());
      item.witness_date = Set(self.witness_date);
      item.witness_role = Set(self.witness_role.clone());
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
        .prefix("api/signature_witnesses/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
