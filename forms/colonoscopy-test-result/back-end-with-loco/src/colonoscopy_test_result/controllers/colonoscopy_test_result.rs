#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::colonoscopy_test_results::{ActiveModel, Entity, Model};

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
    pub procedure: String,
    pub extent_reached: String,
    pub bowel_preparation_quality: String,
    pub sedation_used: bool,
    pub clinical_history: String,
    pub polyps_found: bool,
    pub mass_lesion: bool,
    pub diverticulosis: bool,
    pub inflammation_ibd: bool,
    pub angiodysplasia: bool,
    pub bleeding_source_identified: bool,
    pub normal_examination: bool,
    pub polyp_count: Option<i32>,
    pub largest_polyp_mm: Option<f64>,
    pub biopsy_taken: bool,
    pub polypectomy_performed: bool,
    pub complication: String,
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
      item.procedure = Set(self.procedure.clone());
      item.extent_reached = Set(self.extent_reached.clone());
      item.bowel_preparation_quality = Set(self.bowel_preparation_quality.clone());
      item.sedation_used = Set(self.sedation_used);
      item.clinical_history = Set(self.clinical_history.clone());
      item.polyps_found = Set(self.polyps_found);
      item.mass_lesion = Set(self.mass_lesion);
      item.diverticulosis = Set(self.diverticulosis);
      item.inflammation_ibd = Set(self.inflammation_ibd);
      item.angiodysplasia = Set(self.angiodysplasia);
      item.bleeding_source_identified = Set(self.bleeding_source_identified);
      item.normal_examination = Set(self.normal_examination);
      item.polyp_count = Set(self.polyp_count);
      item.largest_polyp_mm = Set(self.largest_polyp_mm);
      item.biopsy_taken = Set(self.biopsy_taken);
      item.polypectomy_performed = Set(self.polypectomy_performed);
      item.complication = Set(self.complication.clone());
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
        .prefix("api/colonoscopy_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
