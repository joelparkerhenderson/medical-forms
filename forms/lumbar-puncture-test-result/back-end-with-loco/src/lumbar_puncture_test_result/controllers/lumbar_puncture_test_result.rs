#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::lumbar_puncture_test_results::{ActiveModel, Entity, Model};

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
    pub clinical_history: String,
    pub opening_pressure_cmh2o: Option<f64>,
    pub csf_appearance: String,
    pub csf_white_cell_count: Option<f64>,
    pub csf_red_cell_count: Option<f64>,
    pub csf_protein_g_l: Option<f64>,
    pub csf_glucose_mmol_l: Option<f64>,
    pub csf_serum_glucose_ratio: Option<f64>,
    pub csf_lactate_mmol_l: Option<f64>,
    pub gram_stain_result: String,
    pub culture_result: String,
    pub pcr_result: String,
    pub oligoclonal_bands: String,
    pub xanthochromia: String,
    pub raised_protein: bool,
    pub pleocytosis: bool,
    pub low_glucose: bool,
    pub bacterial_meningitis_pattern: bool,
    pub viral_pattern: bool,
    pub subarachnoid_haemorrhage_suggested: bool,
    pub normal_csf: bool,
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
      item.clinical_history = Set(self.clinical_history.clone());
      item.opening_pressure_cmh2o = Set(self.opening_pressure_cmh2o);
      item.csf_appearance = Set(self.csf_appearance.clone());
      item.csf_white_cell_count = Set(self.csf_white_cell_count);
      item.csf_red_cell_count = Set(self.csf_red_cell_count);
      item.csf_protein_g_l = Set(self.csf_protein_g_l);
      item.csf_glucose_mmol_l = Set(self.csf_glucose_mmol_l);
      item.csf_serum_glucose_ratio = Set(self.csf_serum_glucose_ratio);
      item.csf_lactate_mmol_l = Set(self.csf_lactate_mmol_l);
      item.gram_stain_result = Set(self.gram_stain_result.clone());
      item.culture_result = Set(self.culture_result.clone());
      item.pcr_result = Set(self.pcr_result.clone());
      item.oligoclonal_bands = Set(self.oligoclonal_bands.clone());
      item.xanthochromia = Set(self.xanthochromia.clone());
      item.raised_protein = Set(self.raised_protein);
      item.pleocytosis = Set(self.pleocytosis);
      item.low_glucose = Set(self.low_glucose);
      item.bacterial_meningitis_pattern = Set(self.bacterial_meningitis_pattern);
      item.viral_pattern = Set(self.viral_pattern);
      item.subarachnoid_haemorrhage_suggested = Set(self.subarachnoid_haemorrhage_suggested);
      item.normal_csf = Set(self.normal_csf);
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
        .prefix("api/lumbar_puncture_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
