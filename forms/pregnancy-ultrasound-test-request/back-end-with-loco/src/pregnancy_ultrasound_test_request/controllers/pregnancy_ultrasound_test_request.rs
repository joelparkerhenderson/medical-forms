#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pregnancy_ultrasound_test_requests::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub site_name: String,
    pub setting: String,
    pub referral_date: Option<Date>,
    pub requested_by_date: Option<Date>,
    pub last_menstrual_period_date: Option<Date>,
    pub last_menstrual_period_reliability: String,
    pub estimated_due_date: Option<Date>,
    pub estimated_due_date_method: String,
    pub gestational_age_weeks: Option<i32>,
    pub gestational_age_days: Option<i32>,
    pub gravida: Option<i32>,
    pub para: Option<i32>,
    pub plurality: String,
    pub chorionicity: String,
    pub conception_method: String,
    pub rhesus_status: String,
    pub body_mass_index: Option<f64>,
    pub requested_scan_type: String,
    pub primary_indication: String,
    pub clinical_question: String,
    pub relevant_history: String,
    pub previous_scan_finding: String,
    pub previous_scan_date: Option<Date>,
    pub vaginal_bleeding: String,
    pub abdominal_pain: String,
    pub reduced_fetal_movements: bool,
    pub suspected_ectopic: bool,
    pub haemodynamically_unstable: bool,
    pub hypertension: bool,
    pub diabetes: bool,
    pub previous_growth_restriction: bool,
    pub previous_preterm_birth: bool,
    pub previous_caesarean: bool,
    pub smoker: bool,
    pub urgency: String,
    pub supervising_consultant: String,
    pub requester_contact: String,
    pub interpreter_required: bool,
    pub notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.site_name = Set(self.site_name.clone());
      item.setting = Set(self.setting.clone());
      item.referral_date = Set(self.referral_date);
      item.requested_by_date = Set(self.requested_by_date);
      item.last_menstrual_period_date = Set(self.last_menstrual_period_date);
      item.last_menstrual_period_reliability = Set(self.last_menstrual_period_reliability.clone());
      item.estimated_due_date = Set(self.estimated_due_date);
      item.estimated_due_date_method = Set(self.estimated_due_date_method.clone());
      item.gestational_age_weeks = Set(self.gestational_age_weeks);
      item.gestational_age_days = Set(self.gestational_age_days);
      item.gravida = Set(self.gravida);
      item.para = Set(self.para);
      item.plurality = Set(self.plurality.clone());
      item.chorionicity = Set(self.chorionicity.clone());
      item.conception_method = Set(self.conception_method.clone());
      item.rhesus_status = Set(self.rhesus_status.clone());
      item.body_mass_index = Set(self.body_mass_index);
      item.requested_scan_type = Set(self.requested_scan_type.clone());
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_question = Set(self.clinical_question.clone());
      item.relevant_history = Set(self.relevant_history.clone());
      item.previous_scan_finding = Set(self.previous_scan_finding.clone());
      item.previous_scan_date = Set(self.previous_scan_date);
      item.vaginal_bleeding = Set(self.vaginal_bleeding.clone());
      item.abdominal_pain = Set(self.abdominal_pain.clone());
      item.reduced_fetal_movements = Set(self.reduced_fetal_movements);
      item.suspected_ectopic = Set(self.suspected_ectopic);
      item.haemodynamically_unstable = Set(self.haemodynamically_unstable);
      item.hypertension = Set(self.hypertension);
      item.diabetes = Set(self.diabetes);
      item.previous_growth_restriction = Set(self.previous_growth_restriction);
      item.previous_preterm_birth = Set(self.previous_preterm_birth);
      item.previous_caesarean = Set(self.previous_caesarean);
      item.smoker = Set(self.smoker);
      item.urgency = Set(self.urgency.clone());
      item.supervising_consultant = Set(self.supervising_consultant.clone());
      item.requester_contact = Set(self.requester_contact.clone());
      item.interpreter_required = Set(self.interpreter_required);
      item.notes = Set(self.notes.clone());
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
        .prefix("api/pregnancy_ultrasound_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
