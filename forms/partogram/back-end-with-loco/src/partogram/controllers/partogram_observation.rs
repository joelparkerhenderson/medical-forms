#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::partogram_observations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub partogram_id: i64,
    pub observed_at: Option<DateTimeWithTimeZone>,
    pub cervical_dilatation_cm: Option<f64>,
    pub descent_fifths: Option<f64>,
    pub contractions_per_10_min: Option<f64>,
    pub contraction_duration_band: String,
    pub contraction_strength: String,
    pub fetal_heart_rate: Option<i32>,
    pub liquor_state: String,
    pub moulding: String,
    pub systolic_blood_pressure: Option<i32>,
    pub diastolic_blood_pressure: Option<i32>,
    pub pulse: Option<i32>,
    pub temperature: Option<f64>,
    pub urine_volume_ml: Option<f64>,
    pub urine_protein: String,
    pub urine_ketones: String,
    pub urine_glucose: String,
    pub oxytocin_rate: Option<f64>,
    pub drugs_and_fluids: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.partogram_id = Set(self.partogram_id);
      item.observed_at = Set(self.observed_at);
      item.cervical_dilatation_cm = Set(self.cervical_dilatation_cm);
      item.descent_fifths = Set(self.descent_fifths);
      item.contractions_per_10_min = Set(self.contractions_per_10_min);
      item.contraction_duration_band = Set(self.contraction_duration_band.clone());
      item.contraction_strength = Set(self.contraction_strength.clone());
      item.fetal_heart_rate = Set(self.fetal_heart_rate);
      item.liquor_state = Set(self.liquor_state.clone());
      item.moulding = Set(self.moulding.clone());
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.diastolic_blood_pressure = Set(self.diastolic_blood_pressure);
      item.pulse = Set(self.pulse);
      item.temperature = Set(self.temperature);
      item.urine_volume_ml = Set(self.urine_volume_ml);
      item.urine_protein = Set(self.urine_protein.clone());
      item.urine_ketones = Set(self.urine_ketones.clone());
      item.urine_glucose = Set(self.urine_glucose.clone());
      item.oxytocin_rate = Set(self.oxytocin_rate);
      item.drugs_and_fluids = Set(self.drugs_and_fluids.clone());
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
        .prefix("api/partogram_observations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
