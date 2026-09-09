#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::histopathology_test_results::{ActiveModel, Entity, Model};

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
    pub specimen_site: String,
    pub specimen_adequacy: String,
    pub clinical_history: String,
    pub macroscopic_description: String,
    pub microscopic_description: String,
    pub diagnosis: String,
    pub malignancy_present: bool,
    pub tumour_type: String,
    pub histological_grade: String,
    pub tnm_pt: String,
    pub tnm_pn: String,
    pub tnm_pm: String,
    pub resection_margins: String,
    pub lymphovascular_invasion: bool,
    pub immunohistochemistry: String,
    pub snomed_code: String,
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
      item.specimen_site = Set(self.specimen_site.clone());
      item.specimen_adequacy = Set(self.specimen_adequacy.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.macroscopic_description = Set(self.macroscopic_description.clone());
      item.microscopic_description = Set(self.microscopic_description.clone());
      item.diagnosis = Set(self.diagnosis.clone());
      item.malignancy_present = Set(self.malignancy_present);
      item.tumour_type = Set(self.tumour_type.clone());
      item.histological_grade = Set(self.histological_grade.clone());
      item.tnm_pt = Set(self.tnm_pt.clone());
      item.tnm_pn = Set(self.tnm_pn.clone());
      item.tnm_pm = Set(self.tnm_pm.clone());
      item.resection_margins = Set(self.resection_margins.clone());
      item.lymphovascular_invasion = Set(self.lymphovascular_invasion);
      item.immunohistochemistry = Set(self.immunohistochemistry.clone());
      item.snomed_code = Set(self.snomed_code.clone());
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
        .prefix("api/histopathology_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
