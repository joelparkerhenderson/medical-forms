#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::blood_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub report_status: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub specimen_type: String,
    pub specimen_condition: String,
    pub clinical_history: String,
    pub haemoglobin_g_l: Option<f64>,
    pub white_cell_count: Option<f64>,
    pub platelets: Option<f64>,
    pub neutrophils: Option<f64>,
    pub sodium_mmol_l: Option<f64>,
    pub potassium_mmol_l: Option<f64>,
    pub urea_mmol_l: Option<f64>,
    pub creatinine_umol_l: Option<f64>,
    pub egfr: Option<f64>,
    pub alt_u_l: Option<f64>,
    pub alkaline_phosphatase: Option<f64>,
    pub bilirubin_umol_l: Option<f64>,
    pub albumin_g_l: Option<f64>,
    pub c_reactive_protein: Option<f64>,
    pub hba1c_mmol_mol: Option<f64>,
    pub glucose_mmol_l: Option<f64>,
    pub tsh: Option<f64>,
    pub ferritin: Option<f64>,
    pub inr: Option<f64>,
    pub overall_result_status: String,
    pub abnormal_results_present: bool,
    pub critical_value_present: bool,
    pub critical_value_detail: String,
    pub findings_narrative: String,
    pub comparison_with_previous: String,
    pub impression: String,
    pub reporting_category: String,
    pub recommended_follow_up: String,
    pub critical_result_communicated: bool,
    pub reported_to: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.originating_request_reference = Set(self.originating_request_reference.clone());
      item.report_status = Set(self.report_status.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.specimen_type = Set(self.specimen_type.clone());
      item.specimen_condition = Set(self.specimen_condition.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.haemoglobin_g_l = Set(self.haemoglobin_g_l);
      item.white_cell_count = Set(self.white_cell_count);
      item.platelets = Set(self.platelets);
      item.neutrophils = Set(self.neutrophils);
      item.sodium_mmol_l = Set(self.sodium_mmol_l);
      item.potassium_mmol_l = Set(self.potassium_mmol_l);
      item.urea_mmol_l = Set(self.urea_mmol_l);
      item.creatinine_umol_l = Set(self.creatinine_umol_l);
      item.egfr = Set(self.egfr);
      item.alt_u_l = Set(self.alt_u_l);
      item.alkaline_phosphatase = Set(self.alkaline_phosphatase);
      item.bilirubin_umol_l = Set(self.bilirubin_umol_l);
      item.albumin_g_l = Set(self.albumin_g_l);
      item.c_reactive_protein = Set(self.c_reactive_protein);
      item.hba1c_mmol_mol = Set(self.hba1c_mmol_mol);
      item.glucose_mmol_l = Set(self.glucose_mmol_l);
      item.tsh = Set(self.tsh);
      item.ferritin = Set(self.ferritin);
      item.inr = Set(self.inr);
      item.overall_result_status = Set(self.overall_result_status.clone());
      item.abnormal_results_present = Set(self.abnormal_results_present);
      item.critical_value_present = Set(self.critical_value_present);
      item.critical_value_detail = Set(self.critical_value_detail.clone());
      item.findings_narrative = Set(self.findings_narrative.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.impression = Set(self.impression.clone());
      item.reporting_category = Set(self.reporting_category.clone());
      item.recommended_follow_up = Set(self.recommended_follow_up.clone());
      item.critical_result_communicated = Set(self.critical_result_communicated);
      item.reported_to = Set(self.reported_to.clone());
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
        .prefix("api/blood_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
