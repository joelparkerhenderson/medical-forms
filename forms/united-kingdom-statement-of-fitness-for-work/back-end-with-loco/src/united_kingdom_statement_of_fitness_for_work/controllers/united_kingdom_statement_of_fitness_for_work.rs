#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::united_kingdom_statement_of_fitness_for_works::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub medical_practice_id: i64,
    pub status: String,
    pub assessment_date: Option<Date>,
    pub assessment_method: String,
    pub general_fitness_considered: String,
    pub diagnosis_text: String,
    pub diagnosis_snomed_code: String,
    pub diagnosis_snomed_display: String,
    pub diagnosis_category: String,
    pub condition_first_recorded_date: Option<Date>,
    pub is_automatic_disability: String,
    pub is_non_medical: String,
    pub fitness_for_work: String,
    pub adaptation_phased_return: String,
    pub adaptation_altered_hours: String,
    pub adaptation_amended_duties: String,
    pub adaptation_workplace_adaptations: String,
    pub comments: String,
    pub period_type: String,
    pub period_duration_value: Option<i32>,
    pub period_duration_unit: String,
    pub period_from: Option<Date>,
    pub period_to: Option<Date>,
    pub will_assess_again: String,
    pub planned_review_date: Option<Date>,
    pub issued_at: Option<DateTimeWithTimeZone>,
    pub issued_via: String,
    pub issue_setting: String,
    pub united_kingdom_statement_of_fitness_for_work_id: i64,
    pub safeguarding_concern: String,
    pub safeguarding_notes: String,
    pub clinician_signature_svg: String,
    pub clinician_signed_at: Option<DateTimeWithTimeZone>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.medical_practice_id = Set(self.medical_practice_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_method = Set(self.assessment_method.clone());
      item.general_fitness_considered = Set(self.general_fitness_considered.clone());
      item.diagnosis_text = Set(self.diagnosis_text.clone());
      item.diagnosis_snomed_code = Set(self.diagnosis_snomed_code.clone());
      item.diagnosis_snomed_display = Set(self.diagnosis_snomed_display.clone());
      item.diagnosis_category = Set(self.diagnosis_category.clone());
      item.condition_first_recorded_date = Set(self.condition_first_recorded_date);
      item.is_automatic_disability = Set(self.is_automatic_disability.clone());
      item.is_non_medical = Set(self.is_non_medical.clone());
      item.fitness_for_work = Set(self.fitness_for_work.clone());
      item.adaptation_phased_return = Set(self.adaptation_phased_return.clone());
      item.adaptation_altered_hours = Set(self.adaptation_altered_hours.clone());
      item.adaptation_amended_duties = Set(self.adaptation_amended_duties.clone());
      item.adaptation_workplace_adaptations = Set(self.adaptation_workplace_adaptations.clone());
      item.comments = Set(self.comments.clone());
      item.period_type = Set(self.period_type.clone());
      item.period_duration_value = Set(self.period_duration_value);
      item.period_duration_unit = Set(self.period_duration_unit.clone());
      item.period_from = Set(self.period_from);
      item.period_to = Set(self.period_to);
      item.will_assess_again = Set(self.will_assess_again.clone());
      item.planned_review_date = Set(self.planned_review_date);
      item.issued_at = Set(self.issued_at);
      item.issued_via = Set(self.issued_via.clone());
      item.issue_setting = Set(self.issue_setting.clone());
      item.united_kingdom_statement_of_fitness_for_work_id = Set(self.united_kingdom_statement_of_fitness_for_work_id);
      item.safeguarding_concern = Set(self.safeguarding_concern.clone());
      item.safeguarding_notes = Set(self.safeguarding_notes.clone());
      item.clinician_signature_svg = Set(self.clinician_signature_svg.clone());
      item.clinician_signed_at = Set(self.clinician_signed_at);
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
        .prefix("api/united_kingdom_statement_of_fitness_for_works/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
