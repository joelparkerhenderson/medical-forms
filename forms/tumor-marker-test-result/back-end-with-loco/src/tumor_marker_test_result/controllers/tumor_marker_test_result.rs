#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::tumor_marker_test_results::{ActiveModel, Entity, Model};

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
    pub specimen_condition: String,
    pub clinical_history: String,
    pub known_cancer_site: String,
    pub psa: Option<f64>,
    pub ca125: Option<f64>,
    pub ca19_9: Option<f64>,
    pub carcinoembryonic_antigen_cea: Option<f64>,
    pub alpha_fetoprotein_afp: Option<f64>,
    pub beta_hcg: Option<f64>,
    pub ca15_3: Option<f64>,
    pub lactate_dehydrogenase_ldh: Option<f64>,
    pub calcitonin: Option<f64>,
    pub chromogranin_a: Option<f64>,
    pub previous_value: Option<f64>,
    pub trend: String,
    pub comparison_with_previous: String,
    pub overall_result_status: String,
    pub markedly_elevated: bool,
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
      item.specimen_condition = Set(self.specimen_condition.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.known_cancer_site = Set(self.known_cancer_site.clone());
      item.psa = Set(self.psa);
      item.ca125 = Set(self.ca125);
      item.ca19_9 = Set(self.ca19_9);
      item.carcinoembryonic_antigen_cea = Set(self.carcinoembryonic_antigen_cea);
      item.alpha_fetoprotein_afp = Set(self.alpha_fetoprotein_afp);
      item.beta_hcg = Set(self.beta_hcg);
      item.ca15_3 = Set(self.ca15_3);
      item.lactate_dehydrogenase_ldh = Set(self.lactate_dehydrogenase_ldh);
      item.calcitonin = Set(self.calcitonin);
      item.chromogranin_a = Set(self.chromogranin_a);
      item.previous_value = Set(self.previous_value);
      item.trend = Set(self.trend.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.overall_result_status = Set(self.overall_result_status.clone());
      item.markedly_elevated = Set(self.markedly_elevated);
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
        .prefix("api/tumor_marker_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
