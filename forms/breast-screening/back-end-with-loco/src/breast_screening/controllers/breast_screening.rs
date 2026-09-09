#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::breast_screenings::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub reporting_clinician_role: String,
    pub reported_at: Option<DateTimeWithTimeZone>,
    pub screening_unit: String,
    pub episode_type: String,
    pub patient_identifier: String,
    pub age_years: Option<i32>,
    pub last_screened_date: Option<Date>,
    pub higher_risk_surveillance: String,
    pub symptomatic: String,
    pub consent_given: String,
    pub views_taken: String,
    pub image_adequacy: String,
    pub first_read_opinion: String,
    pub second_read_opinion: String,
    pub arbitration_outcome: String,
    pub reading_outcome: String,
    pub assessment_performed: String,
    pub assessment_modalities: String,
    pub imaging_classification: Option<i32>,
    pub clinical_context: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.reporting_clinician_role = Set(self.reporting_clinician_role.clone());
      item.reported_at = Set(self.reported_at);
      item.screening_unit = Set(self.screening_unit.clone());
      item.episode_type = Set(self.episode_type.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_years = Set(self.age_years);
      item.last_screened_date = Set(self.last_screened_date);
      item.higher_risk_surveillance = Set(self.higher_risk_surveillance.clone());
      item.symptomatic = Set(self.symptomatic.clone());
      item.consent_given = Set(self.consent_given.clone());
      item.views_taken = Set(self.views_taken.clone());
      item.image_adequacy = Set(self.image_adequacy.clone());
      item.first_read_opinion = Set(self.first_read_opinion.clone());
      item.second_read_opinion = Set(self.second_read_opinion.clone());
      item.arbitration_outcome = Set(self.arbitration_outcome.clone());
      item.reading_outcome = Set(self.reading_outcome.clone());
      item.assessment_performed = Set(self.assessment_performed.clone());
      item.assessment_modalities = Set(self.assessment_modalities.clone());
      item.imaging_classification = Set(self.imaging_classification);
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
        .prefix("api/breast_screenings/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
