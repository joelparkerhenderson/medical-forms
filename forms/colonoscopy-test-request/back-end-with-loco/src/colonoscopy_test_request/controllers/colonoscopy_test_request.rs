#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::colonoscopy_test_requests::{ActiveModel, Entity, Model};

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
    pub procedure: String,
    pub primary_indication: String,
    pub clinical_question: String,
    pub relevant_history: String,
    pub red_flag_weight_loss: bool,
    pub red_flag_anaemia: bool,
    pub red_flag_abdominal_mass: bool,
    pub red_flag_rectal_bleeding: bool,
    pub fit_result_ug_g: Option<f64>,
    pub haemoglobin_g_l: Option<f64>,
    pub taking_anticoagulant: bool,
    pub anticoagulant_agent: String,
    pub taking_antiplatelet: bool,
    pub antiplatelet_agent: String,
    pub diabetes_medication: String,
    pub fit_for_bowel_prep: bool,
    pub bowel_prep_agent: String,
    pub chronic_kidney_disease: bool,
    pub egfr_ml_min: Option<f64>,
    pub asa_grade: String,
    pub urgency: String,
    pub supervising_consultant: String,
    pub requester_contact: String,
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
      item.procedure = Set(self.procedure.clone());
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_question = Set(self.clinical_question.clone());
      item.relevant_history = Set(self.relevant_history.clone());
      item.red_flag_weight_loss = Set(self.red_flag_weight_loss);
      item.red_flag_anaemia = Set(self.red_flag_anaemia);
      item.red_flag_abdominal_mass = Set(self.red_flag_abdominal_mass);
      item.red_flag_rectal_bleeding = Set(self.red_flag_rectal_bleeding);
      item.fit_result_ug_g = Set(self.fit_result_ug_g);
      item.haemoglobin_g_l = Set(self.haemoglobin_g_l);
      item.taking_anticoagulant = Set(self.taking_anticoagulant);
      item.anticoagulant_agent = Set(self.anticoagulant_agent.clone());
      item.taking_antiplatelet = Set(self.taking_antiplatelet);
      item.antiplatelet_agent = Set(self.antiplatelet_agent.clone());
      item.diabetes_medication = Set(self.diabetes_medication.clone());
      item.fit_for_bowel_prep = Set(self.fit_for_bowel_prep);
      item.bowel_prep_agent = Set(self.bowel_prep_agent.clone());
      item.chronic_kidney_disease = Set(self.chronic_kidney_disease);
      item.egfr_ml_min = Set(self.egfr_ml_min);
      item.asa_grade = Set(self.asa_grade.clone());
      item.urgency = Set(self.urgency.clone());
      item.supervising_consultant = Set(self.supervising_consultant.clone());
      item.requester_contact = Set(self.requester_contact.clone());
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
        .prefix("api/colonoscopy_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
