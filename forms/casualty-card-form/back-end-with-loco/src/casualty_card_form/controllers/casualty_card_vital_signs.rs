#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::casualty_card_vital_signs::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub casualty_card_id: i64,
    pub heart_rate: Option<i32>,
    pub systolic_bp: Option<i32>,
    pub diastolic_bp: Option<i32>,
    pub respiratory_rate: Option<i32>,
    pub oxygen_saturation: Option<i32>,
    pub supplemental_oxygen: String,
    pub oxygen_flow_rate: String,
    pub temperature: Option<f64>,
    pub blood_glucose: Option<f64>,
    pub consciousness_level: String,
    pub pupil_left_size: Option<i32>,
    pub pupil_left_reactive: String,
    pub pupil_right_size: Option<i32>,
    pub pupil_right_reactive: String,
    pub capillary_refill_time: String,
    pub weight: Option<f64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.casualty_card_id = Set(self.casualty_card_id);
      item.heart_rate = Set(self.heart_rate);
      item.systolic_bp = Set(self.systolic_bp);
      item.diastolic_bp = Set(self.diastolic_bp);
      item.respiratory_rate = Set(self.respiratory_rate);
      item.oxygen_saturation = Set(self.oxygen_saturation);
      item.supplemental_oxygen = Set(self.supplemental_oxygen.clone());
      item.oxygen_flow_rate = Set(self.oxygen_flow_rate.clone());
      item.temperature = Set(self.temperature);
      item.blood_glucose = Set(self.blood_glucose);
      item.consciousness_level = Set(self.consciousness_level.clone());
      item.pupil_left_size = Set(self.pupil_left_size);
      item.pupil_left_reactive = Set(self.pupil_left_reactive.clone());
      item.pupil_right_size = Set(self.pupil_right_size);
      item.pupil_right_reactive = Set(self.pupil_right_reactive.clone());
      item.capillary_refill_time = Set(self.capillary_refill_time.clone());
      item.weight = Set(self.weight);
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
        .prefix("api/casualty_card_vital_signs/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
