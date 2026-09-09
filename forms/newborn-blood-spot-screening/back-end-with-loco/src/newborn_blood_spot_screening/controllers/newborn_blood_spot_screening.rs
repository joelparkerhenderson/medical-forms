#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::newborn_blood_spot_screenings::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub sample_taker_role: String,
    pub care_setting: String,
    pub record_date: Option<Date>,
    pub time_of_birth: Option<String>,
    pub gestation_weeks: Option<f64>,
    pub previously_screened: String,
    pub consent_given: String,
    pub decline_reason: String,
    pub sample_date: Option<Date>,
    pub sample_time: Option<String>,
    pub age_at_sample_days: Option<i32>,
    pub sampling_site: String,
    pub sample_notes: String,
    pub sample_adequacy: String,
    pub spot_quality_issue: String,
    pub is_repeat: String,
    pub repeat_reason: String,
    pub scd_result: String,
    pub cf_result: String,
    pub cht_result: String,
    pub pku_result: String,
    pub mcadd_result: String,
    pub msud_result: String,
    pub iva_result: String,
    pub ga1_result: String,
    pub hcu_result: String,
    pub clinical_context: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.sample_taker_role = Set(self.sample_taker_role.clone());
      item.care_setting = Set(self.care_setting.clone());
      item.record_date = Set(self.record_date);
      item.time_of_birth = Set(self.time_of_birth.clone());
      item.gestation_weeks = Set(self.gestation_weeks);
      item.previously_screened = Set(self.previously_screened.clone());
      item.consent_given = Set(self.consent_given.clone());
      item.decline_reason = Set(self.decline_reason.clone());
      item.sample_date = Set(self.sample_date);
      item.sample_time = Set(self.sample_time.clone());
      item.age_at_sample_days = Set(self.age_at_sample_days);
      item.sampling_site = Set(self.sampling_site.clone());
      item.sample_notes = Set(self.sample_notes.clone());
      item.sample_adequacy = Set(self.sample_adequacy.clone());
      item.spot_quality_issue = Set(self.spot_quality_issue.clone());
      item.is_repeat = Set(self.is_repeat.clone());
      item.repeat_reason = Set(self.repeat_reason.clone());
      item.scd_result = Set(self.scd_result.clone());
      item.cf_result = Set(self.cf_result.clone());
      item.cht_result = Set(self.cht_result.clone());
      item.pku_result = Set(self.pku_result.clone());
      item.mcadd_result = Set(self.mcadd_result.clone());
      item.msud_result = Set(self.msud_result.clone());
      item.iva_result = Set(self.iva_result.clone());
      item.ga1_result = Set(self.ga1_result.clone());
      item.hcu_result = Set(self.hcu_result.clone());
      item.clinical_context = Set(self.clinical_context.clone());
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
        .prefix("api/newborn_blood_spot_screenings/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
