#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::assessment_current_medications::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub assessment_id: i64,
    pub takes_regular_medications: String,
    pub current_hrt: String,
    pub current_hrt_type: String,
    pub current_hrt_route: String,
    pub current_hrt_duration: String,
    pub previous_hrt: String,
    pub previous_hrt_details: String,
    pub reason_for_stopping_hrt: String,
    pub takes_herbal_supplements: String,
    pub herbal_supplement_details: String,
    pub takes_anticoagulants: String,
    pub anticoagulant_details: String,
    pub medication_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.assessment_id = Set(self.assessment_id);
      item.takes_regular_medications = Set(self.takes_regular_medications.clone());
      item.current_hrt = Set(self.current_hrt.clone());
      item.current_hrt_type = Set(self.current_hrt_type.clone());
      item.current_hrt_route = Set(self.current_hrt_route.clone());
      item.current_hrt_duration = Set(self.current_hrt_duration.clone());
      item.previous_hrt = Set(self.previous_hrt.clone());
      item.previous_hrt_details = Set(self.previous_hrt_details.clone());
      item.reason_for_stopping_hrt = Set(self.reason_for_stopping_hrt.clone());
      item.takes_herbal_supplements = Set(self.takes_herbal_supplements.clone());
      item.herbal_supplement_details = Set(self.herbal_supplement_details.clone());
      item.takes_anticoagulants = Set(self.takes_anticoagulants.clone());
      item.anticoagulant_details = Set(self.anticoagulant_details.clone());
      item.medication_notes = Set(self.medication_notes.clone());
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
        .prefix("api/assessment_current_medications/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
