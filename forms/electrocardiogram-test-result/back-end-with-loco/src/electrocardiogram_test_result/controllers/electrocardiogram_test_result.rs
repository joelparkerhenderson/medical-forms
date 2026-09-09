#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::electrocardiogram_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub report_status: String,
    pub ecg_type: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub recording_quality: String,
    pub clinical_history: String,
    pub ventricular_rate_bpm: Option<i32>,
    pub rhythm: String,
    pub pr_interval_ms: Option<i32>,
    pub qrs_duration_ms: Option<i32>,
    pub qt_interval_ms: Option<i32>,
    pub qtc_ms: Option<i32>,
    pub cardiac_axis: String,
    pub st_elevation: bool,
    pub st_depression: bool,
    pub t_wave_inversion: bool,
    pub pathological_q_waves: bool,
    pub left_ventricular_hypertrophy: bool,
    pub bundle_branch_block: bool,
    pub ischaemia: bool,
    pub normal_ecg: bool,
    pub interpretation: String,
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
      item.ecg_type = Set(self.ecg_type.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.recording_quality = Set(self.recording_quality.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.ventricular_rate_bpm = Set(self.ventricular_rate_bpm);
      item.rhythm = Set(self.rhythm.clone());
      item.pr_interval_ms = Set(self.pr_interval_ms);
      item.qrs_duration_ms = Set(self.qrs_duration_ms);
      item.qt_interval_ms = Set(self.qt_interval_ms);
      item.qtc_ms = Set(self.qtc_ms);
      item.cardiac_axis = Set(self.cardiac_axis.clone());
      item.st_elevation = Set(self.st_elevation);
      item.st_depression = Set(self.st_depression);
      item.t_wave_inversion = Set(self.t_wave_inversion);
      item.pathological_q_waves = Set(self.pathological_q_waves);
      item.left_ventricular_hypertrophy = Set(self.left_ventricular_hypertrophy);
      item.bundle_branch_block = Set(self.bundle_branch_block);
      item.ischaemia = Set(self.ischaemia);
      item.normal_ecg = Set(self.normal_ecg);
      item.interpretation = Set(self.interpretation.clone());
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
        .prefix("api/electrocardiogram_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
