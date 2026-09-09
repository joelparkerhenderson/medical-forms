#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::padua_venous_thromboembolism_risk_assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub admission_reason: String,
    pub patient_identifier: String,
    pub age_years: Option<f64>,
    pub sex: String,
    pub active_cancer: String,
    pub previous_vte: String,
    pub reduced_mobility: String,
    pub known_thrombophilia: String,
    pub recent_trauma_or_surgery: String,
    pub heart_or_respiratory_failure: String,
    pub acute_mi_or_ischaemic_stroke: String,
    pub acute_infection_or_rheumatological: String,
    pub body_mass_index: Option<f64>,
    pub ongoing_hormonal_treatment: String,
    pub active_bleeding: String,
    pub high_bleeding_risk: String,
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
      item.admission_reason = Set(self.admission_reason.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_years = Set(self.age_years);
      item.sex = Set(self.sex.clone());
      item.active_cancer = Set(self.active_cancer.clone());
      item.previous_vte = Set(self.previous_vte.clone());
      item.reduced_mobility = Set(self.reduced_mobility.clone());
      item.known_thrombophilia = Set(self.known_thrombophilia.clone());
      item.recent_trauma_or_surgery = Set(self.recent_trauma_or_surgery.clone());
      item.heart_or_respiratory_failure = Set(self.heart_or_respiratory_failure.clone());
      item.acute_mi_or_ischaemic_stroke = Set(self.acute_mi_or_ischaemic_stroke.clone());
      item.acute_infection_or_rheumatological = Set(self.acute_infection_or_rheumatological.clone());
      item.body_mass_index = Set(self.body_mass_index);
      item.ongoing_hormonal_treatment = Set(self.ongoing_hormonal_treatment.clone());
      item.active_bleeding = Set(self.active_bleeding.clone());
      item.high_bleeding_risk = Set(self.high_bleeding_risk.clone());
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
        .prefix("api/padua_venous_thromboembolism_risk_assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
