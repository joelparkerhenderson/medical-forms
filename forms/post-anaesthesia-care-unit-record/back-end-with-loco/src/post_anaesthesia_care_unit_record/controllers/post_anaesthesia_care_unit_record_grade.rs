#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::post_anaesthesia_care_unit_record_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub post_anaesthesia_care_unit_record_id: i64,
    pub activity_score: Option<i32>,
    pub respiration_score: Option<i32>,
    pub circulation_score: Option<i32>,
    pub consciousness_score: Option<i32>,
    pub oxygen_saturation_score: Option<i32>,
    pub aldrete_total: Option<i32>,
    pub discharge_ready: String,
    pub padss_total: Option<i32>,
    pub padss_street_fit: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.post_anaesthesia_care_unit_record_id = Set(self.post_anaesthesia_care_unit_record_id);
      item.activity_score = Set(self.activity_score);
      item.respiration_score = Set(self.respiration_score);
      item.circulation_score = Set(self.circulation_score);
      item.consciousness_score = Set(self.consciousness_score);
      item.oxygen_saturation_score = Set(self.oxygen_saturation_score);
      item.aldrete_total = Set(self.aldrete_total);
      item.discharge_ready = Set(self.discharge_ready.clone());
      item.padss_total = Set(self.padss_total);
      item.padss_street_fit = Set(self.padss_street_fit.clone());
      item.graded_at = Set(self.graded_at);
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
        .prefix("api/post_anaesthesia_care_unit_record_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
