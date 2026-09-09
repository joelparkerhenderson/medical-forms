#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::mammography_test_results::{ActiveModel, Entity, Model};

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
    pub exam_type: String,
    pub laterality: String,
    pub examination_adequacy: String,
    pub breast_density: String,
    pub clinical_history: String,
    pub comparison_with_previous: String,
    pub findings_narrative: String,
    pub mass: bool,
    pub calcifications: bool,
    pub architectural_distortion: bool,
    pub asymmetry: bool,
    pub skin_or_nipple_change: bool,
    pub lymphadenopathy: bool,
    pub incidental_finding: bool,
    pub largest_lesion_size_mm: Option<f64>,
    pub impression: String,
    pub bi_rads_category: String,
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
      item.exam_type = Set(self.exam_type.clone());
      item.laterality = Set(self.laterality.clone());
      item.examination_adequacy = Set(self.examination_adequacy.clone());
      item.breast_density = Set(self.breast_density.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.findings_narrative = Set(self.findings_narrative.clone());
      item.mass = Set(self.mass);
      item.calcifications = Set(self.calcifications);
      item.architectural_distortion = Set(self.architectural_distortion);
      item.asymmetry = Set(self.asymmetry);
      item.skin_or_nipple_change = Set(self.skin_or_nipple_change);
      item.lymphadenopathy = Set(self.lymphadenopathy);
      item.incidental_finding = Set(self.incidental_finding);
      item.largest_lesion_size_mm = Set(self.largest_lesion_size_mm);
      item.impression = Set(self.impression.clone());
      item.bi_rads_category = Set(self.bi_rads_category.clone());
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
        .prefix("api/mammography_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
