#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::general_practitioner_referral_letters::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub patient_identifier: String,
    pub referrer_role: String,
    pub referring_practice: String,
    pub referral_date: Option<Date>,
    pub access_needs: String,
    pub referral_specialty: String,
    pub named_clinician: String,
    pub receiving_organisation: String,
    pub urgency: String,
    pub urgency_reason: String,
    pub suspected_cancer_criterion: String,
    pub suspected_cancer_pathway: String,
    pub reason_for_referral: String,
    pub relevant_history: String,
    pub presenting_problem: String,
    pub symptom_duration: String,
    pub red_flag_symptoms: String,
    pub examination_findings: String,
    pub investigation_results: String,
    pub current_medications: String,
    pub allergies: String,
    pub patient_expectations: String,
    pub consent_to_share: String,
    pub safety_netting: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.referrer_role = Set(self.referrer_role.clone());
      item.referring_practice = Set(self.referring_practice.clone());
      item.referral_date = Set(self.referral_date);
      item.access_needs = Set(self.access_needs.clone());
      item.referral_specialty = Set(self.referral_specialty.clone());
      item.named_clinician = Set(self.named_clinician.clone());
      item.receiving_organisation = Set(self.receiving_organisation.clone());
      item.urgency = Set(self.urgency.clone());
      item.urgency_reason = Set(self.urgency_reason.clone());
      item.suspected_cancer_criterion = Set(self.suspected_cancer_criterion.clone());
      item.suspected_cancer_pathway = Set(self.suspected_cancer_pathway.clone());
      item.reason_for_referral = Set(self.reason_for_referral.clone());
      item.relevant_history = Set(self.relevant_history.clone());
      item.presenting_problem = Set(self.presenting_problem.clone());
      item.symptom_duration = Set(self.symptom_duration.clone());
      item.red_flag_symptoms = Set(self.red_flag_symptoms.clone());
      item.examination_findings = Set(self.examination_findings.clone());
      item.investigation_results = Set(self.investigation_results.clone());
      item.current_medications = Set(self.current_medications.clone());
      item.allergies = Set(self.allergies.clone());
      item.patient_expectations = Set(self.patient_expectations.clone());
      item.consent_to_share = Set(self.consent_to_share.clone());
      item.safety_netting = Set(self.safety_netting.clone());
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
        .prefix("api/general_practitioner_referral_letters/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
