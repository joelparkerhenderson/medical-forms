#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_certificate_of_cause_of_deaths::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub certifying_doctor_name: String,
    pub certifying_doctor_grade: String,
    pub gmc_reference: String,
    pub place_of_certification: String,
    pub certification_date: Option<Date>,
    pub attended_deceased: String,
    pub last_seen_alive_date: Option<Date>,
    pub deceased_name: String,
    pub sex: String,
    pub date_of_birth: Option<Date>,
    pub age_years: Option<i32>,
    pub patient_identifier: String,
    pub date_of_death: Option<Date>,
    pub time_of_death: Option<String>,
    pub place_of_death: String,
    pub seen_after_death_by: String,
    pub cause_ia_condition: String,
    pub cause_ia_interval: String,
    pub cause_ib_condition: String,
    pub cause_ib_interval: String,
    pub cause_ic_condition: String,
    pub cause_ic_interval: String,
    pub part_ii_conditions: String,
    pub part_ii_interval: String,
    pub referred_to_coroner: String,
    pub coroner_reason: String,
    pub medical_examiner_status: String,
    pub certifier_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.certifying_doctor_name = Set(self.certifying_doctor_name.clone());
      item.certifying_doctor_grade = Set(self.certifying_doctor_grade.clone());
      item.gmc_reference = Set(self.gmc_reference.clone());
      item.place_of_certification = Set(self.place_of_certification.clone());
      item.certification_date = Set(self.certification_date);
      item.attended_deceased = Set(self.attended_deceased.clone());
      item.last_seen_alive_date = Set(self.last_seen_alive_date);
      item.deceased_name = Set(self.deceased_name.clone());
      item.sex = Set(self.sex.clone());
      item.date_of_birth = Set(self.date_of_birth);
      item.age_years = Set(self.age_years);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.date_of_death = Set(self.date_of_death);
      item.time_of_death = Set(self.time_of_death.clone());
      item.place_of_death = Set(self.place_of_death.clone());
      item.seen_after_death_by = Set(self.seen_after_death_by.clone());
      item.cause_ia_condition = Set(self.cause_ia_condition.clone());
      item.cause_ia_interval = Set(self.cause_ia_interval.clone());
      item.cause_ib_condition = Set(self.cause_ib_condition.clone());
      item.cause_ib_interval = Set(self.cause_ib_interval.clone());
      item.cause_ic_condition = Set(self.cause_ic_condition.clone());
      item.cause_ic_interval = Set(self.cause_ic_interval.clone());
      item.part_ii_conditions = Set(self.part_ii_conditions.clone());
      item.part_ii_interval = Set(self.part_ii_interval.clone());
      item.referred_to_coroner = Set(self.referred_to_coroner.clone());
      item.coroner_reason = Set(self.coroner_reason.clone());
      item.medical_examiner_status = Set(self.medical_examiner_status.clone());
      item.certifier_note = Set(self.certifier_note.clone());
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
        .prefix("api/medical_certificate_of_cause_of_deaths/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
