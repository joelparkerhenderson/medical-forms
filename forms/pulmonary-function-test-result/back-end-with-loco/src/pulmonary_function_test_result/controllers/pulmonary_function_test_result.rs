#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pulmonary_function_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub test_type: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub report_status: String,
    pub test_quality: String,
    pub clinical_history: String,
    pub fev1_litres: Option<f64>,
    pub fev1_percent_predicted: Option<f64>,
    pub fvc_litres: Option<f64>,
    pub fvc_percent_predicted: Option<f64>,
    pub fev1_fvc_ratio: Option<f64>,
    pub peak_expiratory_flow: Option<f64>,
    pub dlco_percent_predicted: Option<f64>,
    pub ventilatory_pattern: String,
    pub severity: String,
    pub bronchodilator_reversibility: String,
    pub airflow_obstruction: bool,
    pub restriction: bool,
    pub reduced_gas_transfer: bool,
    pub significant_reversibility: bool,
    pub normal_spirometry: bool,
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
      item.test_type = Set(self.test_type.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.report_status = Set(self.report_status.clone());
      item.test_quality = Set(self.test_quality.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.fev1_litres = Set(self.fev1_litres);
      item.fev1_percent_predicted = Set(self.fev1_percent_predicted);
      item.fvc_litres = Set(self.fvc_litres);
      item.fvc_percent_predicted = Set(self.fvc_percent_predicted);
      item.fev1_fvc_ratio = Set(self.fev1_fvc_ratio);
      item.peak_expiratory_flow = Set(self.peak_expiratory_flow);
      item.dlco_percent_predicted = Set(self.dlco_percent_predicted);
      item.ventilatory_pattern = Set(self.ventilatory_pattern.clone());
      item.severity = Set(self.severity.clone());
      item.bronchodilator_reversibility = Set(self.bronchodilator_reversibility.clone());
      item.airflow_obstruction = Set(self.airflow_obstruction);
      item.restriction = Set(self.restriction);
      item.reduced_gas_transfer = Set(self.reduced_gas_transfer);
      item.significant_reversibility = Set(self.significant_reversibility);
      item.normal_spirometry = Set(self.normal_spirometry);
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
        .prefix("api/pulmonary_function_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
