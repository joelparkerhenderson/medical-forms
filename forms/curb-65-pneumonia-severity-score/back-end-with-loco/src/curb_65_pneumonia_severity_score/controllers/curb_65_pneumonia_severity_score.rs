#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::curb_65_pneumonia_severity_scores::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub patient_identifier: String,
    pub sex: String,
    pub age_years: Option<i32>,
    pub confusion_present: String,
    pub amt_score: Option<i32>,
    pub urea_measured: String,
    pub urea_mmol_l: Option<f64>,
    pub respiratory_rate: Option<i32>,
    pub systolic_bp: Option<i32>,
    pub diastolic_bp: Option<i32>,
    pub oxygen_saturation: Option<i32>,
    pub temperature_c: Option<f64>,
    pub significant_comorbidity: String,
    pub multilobar_changes: String,
    pub clinician_override_band: String,
    pub override_reason: String,
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
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.sex = Set(self.sex.clone());
      item.age_years = Set(self.age_years);
      item.confusion_present = Set(self.confusion_present.clone());
      item.amt_score = Set(self.amt_score);
      item.urea_measured = Set(self.urea_measured.clone());
      item.urea_mmol_l = Set(self.urea_mmol_l);
      item.respiratory_rate = Set(self.respiratory_rate);
      item.systolic_bp = Set(self.systolic_bp);
      item.diastolic_bp = Set(self.diastolic_bp);
      item.oxygen_saturation = Set(self.oxygen_saturation);
      item.temperature_c = Set(self.temperature_c);
      item.significant_comorbidity = Set(self.significant_comorbidity.clone());
      item.multilobar_changes = Set(self.multilobar_changes.clone());
      item.clinician_override_band = Set(self.clinician_override_band.clone());
      item.override_reason = Set(self.override_reason.clone());
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
        .prefix("api/curb_65_pneumonia_severity_scores/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
