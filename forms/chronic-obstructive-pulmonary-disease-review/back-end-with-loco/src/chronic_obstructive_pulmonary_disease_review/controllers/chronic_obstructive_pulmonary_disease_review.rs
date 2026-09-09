#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::chronic_obstructive_pulmonary_disease_reviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub reviewed_at: Option<Date>,
    pub review_type: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub diagnosis_year: Option<i32>,
    pub spirometry_confirmed: String,
    pub exposure_notes: String,
    pub fev1_litres: Option<f64>,
    pub fev1_percent_predicted: Option<f64>,
    pub fvc_litres: Option<f64>,
    pub fev1_fvc_ratio: Option<f64>,
    pub spirometry_date: Option<Date>,
    pub mrc_grade: Option<i32>,
    pub mmrc_grade: Option<i32>,
    pub cat_score: Option<i32>,
    pub exacerbations_last_12m: Option<i32>,
    pub hospitalisations_last_12m: Option<i32>,
    pub last_exacerbation_date: Option<Date>,
    pub rescue_pack_courses: Option<i32>,
    pub smoking_status: String,
    pub pack_years: Option<f64>,
    pub cessation_support_offered: String,
    pub inhaled_therapy: String,
    pub device_type: String,
    pub inhaler_technique_checked: String,
    pub inhaler_technique_adequate: String,
    pub adherence: String,
    pub influenza_vaccine: String,
    pub pneumococcal_vaccine: String,
    pub covid_vaccine: String,
    pub pulmonary_rehab_status: String,
    pub oxygen_use: String,
    pub resting_spo2: Option<i32>,
    pub comorbidities: String,
    pub self_management_plan: String,
    pub rescue_pack_supplied: String,
    pub next_review_interval: String,
    pub clinician_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.reviewed_at = Set(self.reviewed_at);
      item.review_type = Set(self.review_type.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.diagnosis_year = Set(self.diagnosis_year);
      item.spirometry_confirmed = Set(self.spirometry_confirmed.clone());
      item.exposure_notes = Set(self.exposure_notes.clone());
      item.fev1_litres = Set(self.fev1_litres);
      item.fev1_percent_predicted = Set(self.fev1_percent_predicted);
      item.fvc_litres = Set(self.fvc_litres);
      item.fev1_fvc_ratio = Set(self.fev1_fvc_ratio);
      item.spirometry_date = Set(self.spirometry_date);
      item.mrc_grade = Set(self.mrc_grade);
      item.mmrc_grade = Set(self.mmrc_grade);
      item.cat_score = Set(self.cat_score);
      item.exacerbations_last_12m = Set(self.exacerbations_last_12m);
      item.hospitalisations_last_12m = Set(self.hospitalisations_last_12m);
      item.last_exacerbation_date = Set(self.last_exacerbation_date);
      item.rescue_pack_courses = Set(self.rescue_pack_courses);
      item.smoking_status = Set(self.smoking_status.clone());
      item.pack_years = Set(self.pack_years);
      item.cessation_support_offered = Set(self.cessation_support_offered.clone());
      item.inhaled_therapy = Set(self.inhaled_therapy.clone());
      item.device_type = Set(self.device_type.clone());
      item.inhaler_technique_checked = Set(self.inhaler_technique_checked.clone());
      item.inhaler_technique_adequate = Set(self.inhaler_technique_adequate.clone());
      item.adherence = Set(self.adherence.clone());
      item.influenza_vaccine = Set(self.influenza_vaccine.clone());
      item.pneumococcal_vaccine = Set(self.pneumococcal_vaccine.clone());
      item.covid_vaccine = Set(self.covid_vaccine.clone());
      item.pulmonary_rehab_status = Set(self.pulmonary_rehab_status.clone());
      item.oxygen_use = Set(self.oxygen_use.clone());
      item.resting_spo2 = Set(self.resting_spo2);
      item.comorbidities = Set(self.comorbidities.clone());
      item.self_management_plan = Set(self.self_management_plan.clone());
      item.rescue_pack_supplied = Set(self.rescue_pack_supplied.clone());
      item.next_review_interval = Set(self.next_review_interval.clone());
      item.clinician_note = Set(self.clinician_note.clone());
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
        .prefix("api/chronic_obstructive_pulmonary_disease_reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
