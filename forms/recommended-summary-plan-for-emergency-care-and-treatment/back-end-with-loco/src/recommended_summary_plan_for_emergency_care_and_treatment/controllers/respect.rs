#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::respect::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub person_name: String,
    pub date_of_birth: Option<Date>,
    pub identifier: String,
    pub address: String,
    pub key_contact: String,
    pub health_summary: String,
    pub diagnoses: String,
    pub existing_documents: String,
    pub what_matters: String,
    pub care_preferences: String,
    pub priority_balance: String,
    pub recommended_interventions: String,
    pub not_recommended_interventions: String,
    pub cpr_recommendation: String,
    pub cpr_rationale: String,
    pub cpr_discussed: String,
    pub hospital_transfer: String,
    pub critical_care_admission: String,
    pub treatment_ceilings: String,
    pub has_capacity: String,
    pub capacity_assessment: String,
    pub involvement: String,
    pub proxy_details: String,
    pub clinician_name: String,
    pub clinician_role: String,
    pub clinician_registration: String,
    pub signature: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    pub senior_endorsement: String,
    pub emergency_contacts: String,
    pub review_date: Option<Date>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.person_name = Set(self.person_name.clone());
      item.date_of_birth = Set(self.date_of_birth);
      item.identifier = Set(self.identifier.clone());
      item.address = Set(self.address.clone());
      item.key_contact = Set(self.key_contact.clone());
      item.health_summary = Set(self.health_summary.clone());
      item.diagnoses = Set(self.diagnoses.clone());
      item.existing_documents = Set(self.existing_documents.clone());
      item.what_matters = Set(self.what_matters.clone());
      item.care_preferences = Set(self.care_preferences.clone());
      item.priority_balance = Set(self.priority_balance.clone());
      item.recommended_interventions = Set(self.recommended_interventions.clone());
      item.not_recommended_interventions = Set(self.not_recommended_interventions.clone());
      item.cpr_recommendation = Set(self.cpr_recommendation.clone());
      item.cpr_rationale = Set(self.cpr_rationale.clone());
      item.cpr_discussed = Set(self.cpr_discussed.clone());
      item.hospital_transfer = Set(self.hospital_transfer.clone());
      item.critical_care_admission = Set(self.critical_care_admission.clone());
      item.treatment_ceilings = Set(self.treatment_ceilings.clone());
      item.has_capacity = Set(self.has_capacity.clone());
      item.capacity_assessment = Set(self.capacity_assessment.clone());
      item.involvement = Set(self.involvement.clone());
      item.proxy_details = Set(self.proxy_details.clone());
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.clinician_registration = Set(self.clinician_registration.clone());
      item.signature = Set(self.signature.clone());
      item.signed_at = Set(self.signed_at);
      item.senior_endorsement = Set(self.senior_endorsement.clone());
      item.emergency_contacts = Set(self.emergency_contacts.clone());
      item.review_date = Set(self.review_date);
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
        .prefix("api/respect/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
