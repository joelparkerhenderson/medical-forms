#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::patient_rights_acknowledgements::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub hipaa_authorization_id: i64,
    pub acknowledged_right_to_revoke: String,
    pub acknowledged_revocation_procedure: String,
    pub acknowledged_no_conditioning: String,
    pub acknowledged_redisclosure_warning: String,
    pub acknowledged_right_to_copy: String,
    pub acknowledged_right_to_inspect_disclosed: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.hipaa_authorization_id = Set(self.hipaa_authorization_id);
      item.acknowledged_right_to_revoke = Set(self.acknowledged_right_to_revoke.clone());
      item.acknowledged_revocation_procedure = Set(self.acknowledged_revocation_procedure.clone());
      item.acknowledged_no_conditioning = Set(self.acknowledged_no_conditioning.clone());
      item.acknowledged_redisclosure_warning = Set(self.acknowledged_redisclosure_warning.clone());
      item.acknowledged_right_to_copy = Set(self.acknowledged_right_to_copy.clone());
      item.acknowledged_right_to_inspect_disclosed = Set(self.acknowledged_right_to_inspect_disclosed.clone());
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
        .prefix("api/patient_rights_acknowledgements/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
