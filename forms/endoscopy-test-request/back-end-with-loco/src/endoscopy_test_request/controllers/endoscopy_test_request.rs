#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::endoscopy_test_requests::{ActiveModel, Entity, Model};

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
    pub requested_procedure: String,
    pub primary_indication: String,
    pub clinical_question: String,
    pub relevant_history: String,
    pub red_flag_dysphagia: bool,
    pub red_flag_weight_loss: bool,
    pub red_flag_anaemia: bool,
    pub red_flag_gi_bleeding: bool,
    pub red_flag_abdominal_mass: bool,
    pub red_flag_age_over_55: bool,
    pub fit_result_ug_g: Option<f64>,
    pub haemoglobin_g_l: Option<f64>,
    pub ferritin_ug_l: Option<f64>,
    pub taking_anticoagulant: bool,
    pub anticoagulant_agent: String,
    pub taking_antiplatelet: bool,
    pub antiplatelet_agent: String,
    pub diabetes_medication: String,
    pub allergies: String,
    pub latex_allergy: bool,
    pub cardiac_nyha_class: String,
    pub pacemaker_icd: bool,
    pub chronic_kidney_disease: bool,
    pub egfr_ml_min: Option<f64>,
    pub sleep_apnoea: bool,
    pub neutropenia: bool,
    pub asa_grade: String,
    pub vcjd_risk: bool,
    pub cpe_carriage: bool,
    pub mrsa: bool,
    pub blood_borne_virus: bool,
    pub fit_for_bowel_prep: bool,
    pub bowel_prep_agent: String,
    pub sedation: String,
    pub escort_available: bool,
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
      item.requested_procedure = Set(self.requested_procedure.clone());
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_question = Set(self.clinical_question.clone());
      item.relevant_history = Set(self.relevant_history.clone());
      item.red_flag_dysphagia = Set(self.red_flag_dysphagia);
      item.red_flag_weight_loss = Set(self.red_flag_weight_loss);
      item.red_flag_anaemia = Set(self.red_flag_anaemia);
      item.red_flag_gi_bleeding = Set(self.red_flag_gi_bleeding);
      item.red_flag_abdominal_mass = Set(self.red_flag_abdominal_mass);
      item.red_flag_age_over_55 = Set(self.red_flag_age_over_55);
      item.fit_result_ug_g = Set(self.fit_result_ug_g);
      item.haemoglobin_g_l = Set(self.haemoglobin_g_l);
      item.ferritin_ug_l = Set(self.ferritin_ug_l);
      item.taking_anticoagulant = Set(self.taking_anticoagulant);
      item.anticoagulant_agent = Set(self.anticoagulant_agent.clone());
      item.taking_antiplatelet = Set(self.taking_antiplatelet);
      item.antiplatelet_agent = Set(self.antiplatelet_agent.clone());
      item.diabetes_medication = Set(self.diabetes_medication.clone());
      item.allergies = Set(self.allergies.clone());
      item.latex_allergy = Set(self.latex_allergy);
      item.cardiac_nyha_class = Set(self.cardiac_nyha_class.clone());
      item.pacemaker_icd = Set(self.pacemaker_icd);
      item.chronic_kidney_disease = Set(self.chronic_kidney_disease);
      item.egfr_ml_min = Set(self.egfr_ml_min);
      item.sleep_apnoea = Set(self.sleep_apnoea);
      item.neutropenia = Set(self.neutropenia);
      item.asa_grade = Set(self.asa_grade.clone());
      item.vcjd_risk = Set(self.vcjd_risk);
      item.cpe_carriage = Set(self.cpe_carriage);
      item.mrsa = Set(self.mrsa);
      item.blood_borne_virus = Set(self.blood_borne_virus);
      item.fit_for_bowel_prep = Set(self.fit_for_bowel_prep);
      item.bowel_prep_agent = Set(self.bowel_prep_agent.clone());
      item.sedation = Set(self.sedation.clone());
      item.escort_available = Set(self.escort_available);
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
        .prefix("api/endoscopy_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
