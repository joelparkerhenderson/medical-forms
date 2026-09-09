#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::sequential_organ_failure_assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub assessor_name: String,
    pub assessor_role: String,
    pub assessor_registration_number: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_location: String,
    pub hours_since_admission: Option<i32>,
    pub patient_identifier: String,
    pub age_years: Option<i32>,
    pub sex: String,
    pub admission_diagnosis: String,
    pub suspected_infection: String,
    pub baseline_sofa_total: Option<i32>,
    pub pao2: Option<f64>,
    pub fio2: Option<f64>,
    pub pao2_fio2_ratio: Option<f64>,
    pub respiratory_support: String,
    pub platelets: Option<f64>,
    pub bilirubin: Option<f64>,
    pub map: Option<f64>,
    pub vasopressor: String,
    pub vasopressor_dose: Option<f64>,
    pub glasgow_coma_scale: Option<i32>,
    pub sedated: bool,
    pub creatinine: Option<f64>,
    pub urine_output: Option<i32>,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.assessor_name = Set(self.assessor_name.clone());
      item.assessor_role = Set(self.assessor_role.clone());
      item.assessor_registration_number = Set(self.assessor_registration_number.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_location = Set(self.care_location.clone());
      item.hours_since_admission = Set(self.hours_since_admission);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_years = Set(self.age_years);
      item.sex = Set(self.sex.clone());
      item.admission_diagnosis = Set(self.admission_diagnosis.clone());
      item.suspected_infection = Set(self.suspected_infection.clone());
      item.baseline_sofa_total = Set(self.baseline_sofa_total);
      item.pao2 = Set(self.pao2);
      item.fio2 = Set(self.fio2);
      item.pao2_fio2_ratio = Set(self.pao2_fio2_ratio);
      item.respiratory_support = Set(self.respiratory_support.clone());
      item.platelets = Set(self.platelets);
      item.bilirubin = Set(self.bilirubin);
      item.map = Set(self.map);
      item.vasopressor = Set(self.vasopressor.clone());
      item.vasopressor_dose = Set(self.vasopressor_dose);
      item.glasgow_coma_scale = Set(self.glasgow_coma_scale);
      item.sedated = Set(self.sedated);
      item.creatinine = Set(self.creatinine);
      item.urine_output = Set(self.urine_output);
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
        .prefix("api/sequential_organ_failure_assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
