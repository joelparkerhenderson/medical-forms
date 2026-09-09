#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::ottawa_knee_rules::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub status: String,
    pub patient_identifier: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub injury_mechanism: String,
    pub hours_since_injury: Option<f64>,
    pub sex: String,
    pub injured_side: String,
    pub age_years: Option<i32>,
    pub patellar_tenderness: String,
    pub other_bony_tenderness: String,
    pub fibular_head_tenderness: String,
    pub unable_to_flex_90: String,
    pub unable_to_bear_weight: String,
    pub clinical_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.injury_mechanism = Set(self.injury_mechanism.clone());
      item.hours_since_injury = Set(self.hours_since_injury);
      item.sex = Set(self.sex.clone());
      item.injured_side = Set(self.injured_side.clone());
      item.age_years = Set(self.age_years);
      item.patellar_tenderness = Set(self.patellar_tenderness.clone());
      item.other_bony_tenderness = Set(self.other_bony_tenderness.clone());
      item.fibular_head_tenderness = Set(self.fibular_head_tenderness.clone());
      item.unable_to_flex_90 = Set(self.unable_to_flex_90.clone());
      item.unable_to_bear_weight = Set(self.unable_to_bear_weight.clone());
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
        .prefix("api/ottawa_knee_rules/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
