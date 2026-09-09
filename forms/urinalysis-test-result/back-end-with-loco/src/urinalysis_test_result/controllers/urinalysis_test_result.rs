#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::urinalysis_test_results::{ActiveModel, Entity, Model};

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
    pub specimen_condition: String,
    pub clinical_history: String,
    pub leucocytes: String,
    pub nitrites: String,
    pub protein: String,
    pub blood: String,
    pub glucose: String,
    pub ketones: String,
    pub bilirubin: String,
    pub ph: Option<f64>,
    pub specific_gravity: Option<f64>,
    pub red_cell_count: String,
    pub white_cell_count: String,
    pub epithelial_cells: String,
    pub casts: String,
    pub organisms_seen: bool,
    pub crystals: String,
    pub culture_result: String,
    pub organism_isolated: String,
    pub colony_count_cfu_ml: String,
    pub antibiotic_sensitivities: String,
    pub overall_result_status: String,
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
      item.specimen_type = Set(self.specimen_type.clone());
      item.specimen_condition = Set(self.specimen_condition.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.leucocytes = Set(self.leucocytes.clone());
      item.nitrites = Set(self.nitrites.clone());
      item.protein = Set(self.protein.clone());
      item.blood = Set(self.blood.clone());
      item.glucose = Set(self.glucose.clone());
      item.ketones = Set(self.ketones.clone());
      item.bilirubin = Set(self.bilirubin.clone());
      item.ph = Set(self.ph);
      item.specific_gravity = Set(self.specific_gravity);
      item.red_cell_count = Set(self.red_cell_count.clone());
      item.white_cell_count = Set(self.white_cell_count.clone());
      item.epithelial_cells = Set(self.epithelial_cells.clone());
      item.casts = Set(self.casts.clone());
      item.organisms_seen = Set(self.organisms_seen);
      item.crystals = Set(self.crystals.clone());
      item.culture_result = Set(self.culture_result.clone());
      item.organism_isolated = Set(self.organism_isolated.clone());
      item.colony_count_cfu_ml = Set(self.colony_count_cfu_ml.clone());
      item.antibiotic_sensitivities = Set(self.antibiotic_sensitivities.clone());
      item.overall_result_status = Set(self.overall_result_status.clone());
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
        .prefix("api/urinalysis_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
