#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::wells_score_for_deep_vein_thromboses::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub status: String,
    pub patient_identifier: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub age_band: String,
    pub symptomatic_leg: String,
    pub active_cancer: String,
    pub paralysis_or_immobilisation: String,
    pub recently_bedridden_or_surgery: String,
    pub localised_tenderness: String,
    pub entire_leg_swollen: String,
    pub calf_swelling_over_3cm: String,
    pub pitting_oedema: String,
    pub collateral_superficial_veins: String,
    pub previously_documented_dvt: String,
    pub alternative_diagnosis_as_likely: String,
    pub clinical_notes: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.status = Set(self.status.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.age_band = Set(self.age_band.clone());
      item.symptomatic_leg = Set(self.symptomatic_leg.clone());
      item.active_cancer = Set(self.active_cancer.clone());
      item.paralysis_or_immobilisation = Set(self.paralysis_or_immobilisation.clone());
      item.recently_bedridden_or_surgery = Set(self.recently_bedridden_or_surgery.clone());
      item.localised_tenderness = Set(self.localised_tenderness.clone());
      item.entire_leg_swollen = Set(self.entire_leg_swollen.clone());
      item.calf_swelling_over_3cm = Set(self.calf_swelling_over_3cm.clone());
      item.pitting_oedema = Set(self.pitting_oedema.clone());
      item.collateral_superficial_veins = Set(self.collateral_superficial_veins.clone());
      item.previously_documented_dvt = Set(self.previously_documented_dvt.clone());
      item.alternative_diagnosis_as_likely = Set(self.alternative_diagnosis_as_likely.clone());
      item.clinical_notes = Set(self.clinical_notes.clone());
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
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
        .prefix("api/wells_score_for_deep_vein_thromboses/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
