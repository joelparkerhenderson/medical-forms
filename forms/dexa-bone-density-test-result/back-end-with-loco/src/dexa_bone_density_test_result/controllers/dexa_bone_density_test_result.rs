#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::dexa_bone_density_test_results::{ActiveModel, Entity, Model};

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
    pub scan_region: String,
    pub examination_adequacy: String,
    pub clinical_history: String,
    pub lumbar_spine_t_score: Option<f64>,
    pub lumbar_spine_z_score: Option<f64>,
    pub femoral_neck_t_score: Option<f64>,
    pub femoral_neck_z_score: Option<f64>,
    pub total_hip_t_score: Option<f64>,
    pub lowest_t_score: Option<f64>,
    pub bone_mineral_density_g_cm2: Option<f64>,
    pub who_classification: String,
    pub frax_major_fracture_percent: Option<f64>,
    pub frax_hip_fracture_percent: Option<f64>,
    pub vertebral_fracture_identified: bool,
    pub comparison_with_previous: String,
    pub percent_change_since_previous: Option<f64>,
    pub impression: String,
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
      item.scan_region = Set(self.scan_region.clone());
      item.examination_adequacy = Set(self.examination_adequacy.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.lumbar_spine_t_score = Set(self.lumbar_spine_t_score);
      item.lumbar_spine_z_score = Set(self.lumbar_spine_z_score);
      item.femoral_neck_t_score = Set(self.femoral_neck_t_score);
      item.femoral_neck_z_score = Set(self.femoral_neck_z_score);
      item.total_hip_t_score = Set(self.total_hip_t_score);
      item.lowest_t_score = Set(self.lowest_t_score);
      item.bone_mineral_density_g_cm2 = Set(self.bone_mineral_density_g_cm2);
      item.who_classification = Set(self.who_classification.clone());
      item.frax_major_fracture_percent = Set(self.frax_major_fracture_percent);
      item.frax_hip_fracture_percent = Set(self.frax_hip_fracture_percent);
      item.vertebral_fracture_identified = Set(self.vertebral_fracture_identified);
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.percent_change_since_previous = Set(self.percent_change_since_previous);
      item.impression = Set(self.impression.clone());
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
        .prefix("api/dexa_bone_density_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
