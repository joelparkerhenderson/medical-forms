#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::eye_vision_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub report_status: String,
    pub test_type: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub clinical_history: String,
    pub visual_acuity_right: String,
    pub visual_acuity_left: String,
    pub intraocular_pressure_right_mmhg: Option<f64>,
    pub intraocular_pressure_left_mmhg: Option<f64>,
    pub visual_field_result: String,
    pub reduced_visual_acuity: bool,
    pub visual_field_defect: bool,
    pub raised_intraocular_pressure: bool,
    pub diabetic_retinopathy: bool,
    pub optic_disc_abnormality: bool,
    pub macular_abnormality: bool,
    pub normal_examination: bool,
    pub retinopathy_grade: String,
    pub findings_narrative: String,
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
      item.test_type = Set(self.test_type.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.clinical_history = Set(self.clinical_history.clone());
      item.visual_acuity_right = Set(self.visual_acuity_right.clone());
      item.visual_acuity_left = Set(self.visual_acuity_left.clone());
      item.intraocular_pressure_right_mmhg = Set(self.intraocular_pressure_right_mmhg);
      item.intraocular_pressure_left_mmhg = Set(self.intraocular_pressure_left_mmhg);
      item.visual_field_result = Set(self.visual_field_result.clone());
      item.reduced_visual_acuity = Set(self.reduced_visual_acuity);
      item.visual_field_defect = Set(self.visual_field_defect);
      item.raised_intraocular_pressure = Set(self.raised_intraocular_pressure);
      item.diabetic_retinopathy = Set(self.diabetic_retinopathy);
      item.optic_disc_abnormality = Set(self.optic_disc_abnormality);
      item.macular_abnormality = Set(self.macular_abnormality);
      item.normal_examination = Set(self.normal_examination);
      item.retinopathy_grade = Set(self.retinopathy_grade.clone());
      item.findings_narrative = Set(self.findings_narrative.clone());
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
        .prefix("api/eye_vision_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
