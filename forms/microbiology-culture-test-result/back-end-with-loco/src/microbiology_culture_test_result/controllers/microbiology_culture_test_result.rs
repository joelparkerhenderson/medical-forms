#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::microbiology_culture_test_results::{ActiveModel, Entity, Model};

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
    pub specimen_site_detail: String,
    pub specimen_condition: String,
    pub clinical_history: String,
    pub gram_stain_result: String,
    pub culture_result: String,
    pub organism_isolated: String,
    pub second_organism_isolated: String,
    pub colony_count: String,
    pub antibiotic_sensitivities: String,
    pub resistance_mrsa: bool,
    pub resistance_esbl: bool,
    pub resistance_cpe: bool,
    pub c_difficile_toxin: String,
    pub acid_fast_bacilli: String,
    pub pcr_result: String,
    pub critical_organism: bool,
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
      item.specimen_site_detail = Set(self.specimen_site_detail.clone());
      item.specimen_condition = Set(self.specimen_condition.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.gram_stain_result = Set(self.gram_stain_result.clone());
      item.culture_result = Set(self.culture_result.clone());
      item.organism_isolated = Set(self.organism_isolated.clone());
      item.second_organism_isolated = Set(self.second_organism_isolated.clone());
      item.colony_count = Set(self.colony_count.clone());
      item.antibiotic_sensitivities = Set(self.antibiotic_sensitivities.clone());
      item.resistance_mrsa = Set(self.resistance_mrsa);
      item.resistance_esbl = Set(self.resistance_esbl);
      item.resistance_cpe = Set(self.resistance_cpe);
      item.c_difficile_toxin = Set(self.c_difficile_toxin.clone());
      item.acid_fast_bacilli = Set(self.acid_fast_bacilli.clone());
      item.pcr_result = Set(self.pcr_result.clone());
      item.critical_organism = Set(self.critical_organism);
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
        .prefix("api/microbiology_culture_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
