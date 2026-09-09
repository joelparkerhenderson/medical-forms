#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::hearing_test_results::{ActiveModel, Entity, Model};

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
    pub test_type: String,
    pub test_reliability: String,
    pub clinical_history: String,
    pub pure_tone_average_right_db: Option<f64>,
    pub pure_tone_average_left_db: Option<f64>,
    pub hearing_loss_type_right: String,
    pub hearing_loss_type_left: String,
    pub hearing_loss_severity_right: String,
    pub hearing_loss_severity_left: String,
    pub tympanometry_type_right: String,
    pub tympanometry_type_left: String,
    pub hearing_loss_present: bool,
    pub asymmetric_loss: bool,
    pub sudden_sensorineural_loss: bool,
    pub conductive_component: bool,
    pub normal_hearing: bool,
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
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.test_type = Set(self.test_type.clone());
      item.test_reliability = Set(self.test_reliability.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.pure_tone_average_right_db = Set(self.pure_tone_average_right_db);
      item.pure_tone_average_left_db = Set(self.pure_tone_average_left_db);
      item.hearing_loss_type_right = Set(self.hearing_loss_type_right.clone());
      item.hearing_loss_type_left = Set(self.hearing_loss_type_left.clone());
      item.hearing_loss_severity_right = Set(self.hearing_loss_severity_right.clone());
      item.hearing_loss_severity_left = Set(self.hearing_loss_severity_left.clone());
      item.tympanometry_type_right = Set(self.tympanometry_type_right.clone());
      item.tympanometry_type_left = Set(self.tympanometry_type_left.clone());
      item.hearing_loss_present = Set(self.hearing_loss_present);
      item.asymmetric_loss = Set(self.asymmetric_loss);
      item.sudden_sensorineural_loss = Set(self.sudden_sensorineural_loss);
      item.conductive_component = Set(self.conductive_component);
      item.normal_hearing = Set(self.normal_hearing);
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
        .prefix("api/hearing_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
