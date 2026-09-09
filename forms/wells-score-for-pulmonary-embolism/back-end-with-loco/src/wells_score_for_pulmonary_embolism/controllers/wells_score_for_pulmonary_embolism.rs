#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::wells_score_for_pulmonary_embolisms::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub status: String,
    pub patient_identifier: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub age_band: String,
    pub haemodynamic_status: String,
    pub clinical_signs_of_dvt: String,
    pub pe_most_likely: String,
    pub heart_rate_over_100: String,
    pub immobilisation_or_surgery: String,
    pub previous_dvt_pe: String,
    pub haemoptysis: String,
    pub malignancy: String,
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
      item.age_band = Set(self.age_band.clone());
      item.haemodynamic_status = Set(self.haemodynamic_status.clone());
      item.clinical_signs_of_dvt = Set(self.clinical_signs_of_dvt.clone());
      item.pe_most_likely = Set(self.pe_most_likely.clone());
      item.heart_rate_over_100 = Set(self.heart_rate_over_100.clone());
      item.immobilisation_or_surgery = Set(self.immobilisation_or_surgery.clone());
      item.previous_dvt_pe = Set(self.previous_dvt_pe.clone());
      item.haemoptysis = Set(self.haemoptysis.clone());
      item.malignancy = Set(self.malignancy.clone());
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
        .prefix("api/wells_score_for_pulmonary_embolisms/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
