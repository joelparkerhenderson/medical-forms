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
    pub inhaler_use: String,
    pub inhaler_technique_assessed: String,
    pub inhaler_technique_adequate: String,
    pub short_acting_bronchodilator: String,
    pub saba_frequency: String,
    pub long_acting_bronchodilator: String,
    pub inhaled_corticosteroid: String,
    pub combination_inhaler: String,
    pub long_term_oxygen_therapy: String,
    pub oxygen_flow_rate_lmin: Option<f64>,
    pub oxygen_hours_per_day: Option<i32>,
    pub nebuliser_use: String,
    pub oral_medications: String,
    pub medication_adherence: String,
    pub additional_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.assessment_id = Set(self.assessment_id);
      item.inhaler_use = Set(self.inhaler_use.clone());
      item.inhaler_technique_assessed = Set(self.inhaler_technique_assessed.clone());
      item.inhaler_technique_adequate = Set(self.inhaler_technique_adequate.clone());
      item.short_acting_bronchodilator = Set(self.short_acting_bronchodilator.clone());
      item.saba_frequency = Set(self.saba_frequency.clone());
      item.long_acting_bronchodilator = Set(self.long_acting_bronchodilator.clone());
      item.inhaled_corticosteroid = Set(self.inhaled_corticosteroid.clone());
      item.combination_inhaler = Set(self.combination_inhaler.clone());
      item.long_term_oxygen_therapy = Set(self.long_term_oxygen_therapy.clone());
      item.oxygen_flow_rate_lmin = Set(self.oxygen_flow_rate_lmin);
      item.oxygen_hours_per_day = Set(self.oxygen_hours_per_day);
      item.nebuliser_use = Set(self.nebuliser_use.clone());
      item.oral_medications = Set(self.oral_medications.clone());
      item.medication_adherence = Set(self.medication_adherence.clone());
      item.additional_notes = Set(self.additional_notes.clone());
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
