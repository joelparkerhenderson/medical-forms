#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::nerve_conduction_study_test_results::{ActiveModel, Entity, Model};

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
    pub study_type: String,
    pub region: String,
    pub laterality: String,
    pub study_adequacy: String,
    pub clinical_history: String,
    pub comparison_with_previous: String,
    pub nerve_conduction_findings: String,
    pub emg_findings: String,
    pub carpal_tunnel_syndrome: bool,
    pub peripheral_neuropathy: bool,
    pub radiculopathy: bool,
    pub motor_neurone_disease_features: bool,
    pub myopathy: bool,
    pub neuromuscular_junction_disorder: bool,
    pub normal_study: bool,
    pub severity: String,
    pub pattern: String,
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
      item.study_type = Set(self.study_type.clone());
      item.region = Set(self.region.clone());
      item.laterality = Set(self.laterality.clone());
      item.study_adequacy = Set(self.study_adequacy.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.nerve_conduction_findings = Set(self.nerve_conduction_findings.clone());
      item.emg_findings = Set(self.emg_findings.clone());
      item.carpal_tunnel_syndrome = Set(self.carpal_tunnel_syndrome);
      item.peripheral_neuropathy = Set(self.peripheral_neuropathy);
      item.radiculopathy = Set(self.radiculopathy);
      item.motor_neurone_disease_features = Set(self.motor_neurone_disease_features);
      item.myopathy = Set(self.myopathy);
      item.neuromuscular_junction_disorder = Set(self.neuromuscular_junction_disorder);
      item.normal_study = Set(self.normal_study);
      item.severity = Set(self.severity.clone());
      item.pattern = Set(self.pattern.clone());
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
        .prefix("api/nerve_conduction_study_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
