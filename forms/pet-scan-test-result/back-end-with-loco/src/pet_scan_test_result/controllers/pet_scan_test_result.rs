#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pet_scan_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub scan_type: String,
    pub report_status: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub clinical_history: String,
    pub blood_glucose_mmol_l: Option<f64>,
    pub injected_activity_mbq: Option<f64>,
    pub examination_adequacy: String,
    pub findings_narrative: String,
    pub hypermetabolic_lesion: bool,
    pub nodal_uptake: bool,
    pub distant_metastasis: bool,
    pub no_abnormal_uptake: bool,
    pub physiological_uptake_only: bool,
    pub incidental_finding: bool,
    pub suv_max: Option<f64>,
    pub largest_lesion_size_mm: Option<f64>,
    pub comparison_with_previous: String,
    pub treatment_response: String,
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
      item.scan_type = Set(self.scan_type.clone());
      item.report_status = Set(self.report_status.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.clinical_history = Set(self.clinical_history.clone());
      item.blood_glucose_mmol_l = Set(self.blood_glucose_mmol_l);
      item.injected_activity_mbq = Set(self.injected_activity_mbq);
      item.examination_adequacy = Set(self.examination_adequacy.clone());
      item.findings_narrative = Set(self.findings_narrative.clone());
      item.hypermetabolic_lesion = Set(self.hypermetabolic_lesion);
      item.nodal_uptake = Set(self.nodal_uptake);
      item.distant_metastasis = Set(self.distant_metastasis);
      item.no_abnormal_uptake = Set(self.no_abnormal_uptake);
      item.physiological_uptake_only = Set(self.physiological_uptake_only);
      item.incidental_finding = Set(self.incidental_finding);
      item.suv_max = Set(self.suv_max);
      item.largest_lesion_size_mm = Set(self.largest_lesion_size_mm);
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.treatment_response = Set(self.treatment_response.clone());
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
        .prefix("api/pet_scan_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
