#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::soap_notes::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub encountered_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub encounter_type: String,
    pub clinician_role: String,
    pub patient_identifier: String,
    pub presenting_complaint: String,
    pub history_of_presenting_complaint: String,
    pub patient_reported_symptoms: String,
    pub relevant_history: String,
    pub red_flag_symptoms: String,
    pub examination_findings: String,
    pub vital_signs: String,
    pub abnormal_vitals_present: String,
    pub investigation_results: String,
    pub primary_diagnosis: String,
    pub problem_list: String,
    pub differential: String,
    pub clinical_impression: String,
    pub investigations_plan: String,
    pub treatment_plan: String,
    pub referrals: String,
    pub follow_up: String,
    pub safety_netting: String,
    pub managed_at_home: String,
    pub clinical_note: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.encountered_at = Set(self.encountered_at);
      item.care_setting = Set(self.care_setting.clone());
      item.encounter_type = Set(self.encounter_type.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.presenting_complaint = Set(self.presenting_complaint.clone());
      item.history_of_presenting_complaint = Set(self.history_of_presenting_complaint.clone());
      item.patient_reported_symptoms = Set(self.patient_reported_symptoms.clone());
      item.relevant_history = Set(self.relevant_history.clone());
      item.red_flag_symptoms = Set(self.red_flag_symptoms.clone());
      item.examination_findings = Set(self.examination_findings.clone());
      item.vital_signs = Set(self.vital_signs.clone());
      item.abnormal_vitals_present = Set(self.abnormal_vitals_present.clone());
      item.investigation_results = Set(self.investigation_results.clone());
      item.primary_diagnosis = Set(self.primary_diagnosis.clone());
      item.problem_list = Set(self.problem_list.clone());
      item.differential = Set(self.differential.clone());
      item.clinical_impression = Set(self.clinical_impression.clone());
      item.investigations_plan = Set(self.investigations_plan.clone());
      item.treatment_plan = Set(self.treatment_plan.clone());
      item.referrals = Set(self.referrals.clone());
      item.follow_up = Set(self.follow_up.clone());
      item.safety_netting = Set(self.safety_netting.clone());
      item.managed_at_home = Set(self.managed_at_home.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/soap_notes/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
