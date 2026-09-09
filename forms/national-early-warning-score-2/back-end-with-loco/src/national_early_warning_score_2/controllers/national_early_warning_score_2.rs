#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::national_early_warning_score_2s::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub status: String,
    pub observation_at: Option<DateTimeWithTimeZone>,
    pub ward_or_location: String,
    pub spo2_scale: String,
    pub spo2_scale2_endorsed: String,
    pub respiratory_rate: Option<i32>,
    pub spo2: Option<i32>,
    pub on_oxygen: String,
    pub oxygen_device: String,
    pub oxygen_flow_rate_l_min: Option<f64>,
    pub inspired_oxygen_fraction_percent: Option<i32>,
    pub systolic_blood_pressure: Option<i32>,
    pub pulse: Option<i32>,
    pub consciousness_acvpu: String,
    pub temperature: Option<f64>,
    pub is_under_16: String,
    pub is_pregnant: String,
    pub has_spinal_cord_injury: String,
    pub clinical_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.observation_at = Set(self.observation_at);
      item.ward_or_location = Set(self.ward_or_location.clone());
      item.spo2_scale = Set(self.spo2_scale.clone());
      item.spo2_scale2_endorsed = Set(self.spo2_scale2_endorsed.clone());
      item.respiratory_rate = Set(self.respiratory_rate);
      item.spo2 = Set(self.spo2);
      item.on_oxygen = Set(self.on_oxygen.clone());
      item.oxygen_device = Set(self.oxygen_device.clone());
      item.oxygen_flow_rate_l_min = Set(self.oxygen_flow_rate_l_min);
      item.inspired_oxygen_fraction_percent = Set(self.inspired_oxygen_fraction_percent);
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.pulse = Set(self.pulse);
      item.consciousness_acvpu = Set(self.consciousness_acvpu.clone());
      item.temperature = Set(self.temperature);
      item.is_under_16 = Set(self.is_under_16.clone());
      item.is_pregnant = Set(self.is_pregnant.clone());
      item.has_spinal_cord_injury = Set(self.has_spinal_cord_injury.clone());
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
        .prefix("api/national_early_warning_score_2s/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
