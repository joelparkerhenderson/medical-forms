#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::echocardiogram_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub echo_type: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub report_status: String,
    pub study_quality: String,
    pub clinical_history: String,
    pub lv_ejection_fraction_percent: Option<f64>,
    pub lv_function: String,
    pub lv_internal_diameter_diastole_mm: Option<f64>,
    pub aortic_stenosis: String,
    pub aortic_regurgitation: String,
    pub mitral_stenosis: String,
    pub mitral_regurgitation: String,
    pub pulmonary_artery_systolic_pressure_mmhg: Option<f64>,
    pub lv_hypertrophy: bool,
    pub regional_wall_motion_abnormality: bool,
    pub pericardial_effusion: bool,
    pub vegetation: bool,
    pub intracardiac_thrombus: bool,
    pub normal_study: bool,
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
      item.echo_type = Set(self.echo_type.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.report_status = Set(self.report_status.clone());
      item.study_quality = Set(self.study_quality.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.lv_ejection_fraction_percent = Set(self.lv_ejection_fraction_percent);
      item.lv_function = Set(self.lv_function.clone());
      item.lv_internal_diameter_diastole_mm = Set(self.lv_internal_diameter_diastole_mm);
      item.aortic_stenosis = Set(self.aortic_stenosis.clone());
      item.aortic_regurgitation = Set(self.aortic_regurgitation.clone());
      item.mitral_stenosis = Set(self.mitral_stenosis.clone());
      item.mitral_regurgitation = Set(self.mitral_regurgitation.clone());
      item.pulmonary_artery_systolic_pressure_mmhg = Set(self.pulmonary_artery_systolic_pressure_mmhg);
      item.lv_hypertrophy = Set(self.lv_hypertrophy);
      item.regional_wall_motion_abnormality = Set(self.regional_wall_motion_abnormality);
      item.pericardial_effusion = Set(self.pericardial_effusion);
      item.vegetation = Set(self.vegetation);
      item.intracardiac_thrombus = Set(self.intracardiac_thrombus);
      item.normal_study = Set(self.normal_study);
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
        .prefix("api/echocardiogram_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
