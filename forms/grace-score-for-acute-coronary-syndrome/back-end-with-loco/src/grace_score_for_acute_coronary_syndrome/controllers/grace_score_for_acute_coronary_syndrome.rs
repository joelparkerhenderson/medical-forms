#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::grace_score_for_acute_coronary_syndromes::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub presentation_type: String,
    pub patient_identifier: String,
    pub age_years: Option<i32>,
    pub sex: String,
    pub heart_rate: Option<i32>,
    pub systolic_blood_pressure: Option<i32>,
    pub serum_creatinine: Option<f64>,
    pub serum_creatinine_unit: String,
    pub killip_class: String,
    pub cardiac_arrest_at_admission: String,
    pub st_segment_deviation: String,
    pub elevated_cardiac_enzymes: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.presentation_type = Set(self.presentation_type.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_years = Set(self.age_years);
      item.sex = Set(self.sex.clone());
      item.heart_rate = Set(self.heart_rate);
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.serum_creatinine = Set(self.serum_creatinine);
      item.serum_creatinine_unit = Set(self.serum_creatinine_unit.clone());
      item.killip_class = Set(self.killip_class.clone());
      item.cardiac_arrest_at_admission = Set(self.cardiac_arrest_at_admission.clone());
      item.st_segment_deviation = Set(self.st_segment_deviation.clone());
      item.elevated_cardiac_enzymes = Set(self.elevated_cardiac_enzymes.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/grace_score_for_acute_coronary_syndromes/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
