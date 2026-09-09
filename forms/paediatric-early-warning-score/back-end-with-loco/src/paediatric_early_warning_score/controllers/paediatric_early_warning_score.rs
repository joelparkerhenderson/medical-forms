#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::paediatric_early_warning_scores::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub status: String,
    pub observation_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub age_band: String,
    pub respiratory_rate: Option<i32>,
    pub respiratory_effort: String,
    pub oxygen_saturation: Option<i32>,
    pub supplemental_oxygen: String,
    pub heart_rate: Option<i32>,
    pub capillary_refill: String,
    pub consciousness_acvpu: String,
    pub nurse_concern: String,
    pub parent_concern: String,
    pub clinical_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.observation_at = Set(self.observation_at);
      item.care_setting = Set(self.care_setting.clone());
      item.age_band = Set(self.age_band.clone());
      item.respiratory_rate = Set(self.respiratory_rate);
      item.respiratory_effort = Set(self.respiratory_effort.clone());
      item.oxygen_saturation = Set(self.oxygen_saturation);
      item.supplemental_oxygen = Set(self.supplemental_oxygen.clone());
      item.heart_rate = Set(self.heart_rate);
      item.capillary_refill = Set(self.capillary_refill.clone());
      item.consciousness_acvpu = Set(self.consciousness_acvpu.clone());
      item.nurse_concern = Set(self.nurse_concern.clone());
      item.parent_concern = Set(self.parent_concern.clone());
      item.clinical_notes = Set(self.clinical_notes.clone());
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
        .prefix("api/paediatric_early_warning_scores/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
