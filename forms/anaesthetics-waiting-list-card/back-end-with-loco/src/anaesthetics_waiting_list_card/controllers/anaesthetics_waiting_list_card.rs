#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::anaesthetics_waiting_list_cards::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub practitioner_id: i64,
    pub status: String,
    pub entry_date: Option<Date>,
    pub entry_time: Option<String>,
    pub referral_source: String,
    pub referral_date: Option<Date>,
    pub referral_letter_reference: String,
    pub reason_for_referral: String,
    pub presenting_condition: String,
    pub icd_10_code: String,
    pub snomed_ct_code: String,
    pub suspected_cancer: String,
    pub list_name: String,
    pub specialty: String,
    pub sub_specialty: String,
    pub procedure_description: String,
    pub opcs_4_code: String,
    pub clinical_priority: String,
    pub rtt_clock_start_date: Option<Date>,
    pub expected_procedure_type: String,
    pub expected_wait_weeks: Option<i32>,
    pub consent_to_reminders: String,
    pub communication_notes: String,
    pub additional_notes: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.practitioner_id = Set(self.practitioner_id);
      item.status = Set(self.status.clone());
      item.entry_date = Set(self.entry_date);
      item.entry_time = Set(self.entry_time.clone());
      item.referral_source = Set(self.referral_source.clone());
      item.referral_date = Set(self.referral_date);
      item.referral_letter_reference = Set(self.referral_letter_reference.clone());
      item.reason_for_referral = Set(self.reason_for_referral.clone());
      item.presenting_condition = Set(self.presenting_condition.clone());
      item.icd_10_code = Set(self.icd_10_code.clone());
      item.snomed_ct_code = Set(self.snomed_ct_code.clone());
      item.suspected_cancer = Set(self.suspected_cancer.clone());
      item.list_name = Set(self.list_name.clone());
      item.specialty = Set(self.specialty.clone());
      item.sub_specialty = Set(self.sub_specialty.clone());
      item.procedure_description = Set(self.procedure_description.clone());
      item.opcs_4_code = Set(self.opcs_4_code.clone());
      item.clinical_priority = Set(self.clinical_priority.clone());
      item.rtt_clock_start_date = Set(self.rtt_clock_start_date);
      item.expected_procedure_type = Set(self.expected_procedure_type.clone());
      item.expected_wait_weeks = Set(self.expected_wait_weeks);
      item.consent_to_reminders = Set(self.consent_to_reminders.clone());
      item.communication_notes = Set(self.communication_notes.clone());
      item.additional_notes = Set(self.additional_notes.clone());
      item.signed_at = Set(self.signed_at);
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
        .prefix("api/anaesthetics_waiting_list_cards/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
