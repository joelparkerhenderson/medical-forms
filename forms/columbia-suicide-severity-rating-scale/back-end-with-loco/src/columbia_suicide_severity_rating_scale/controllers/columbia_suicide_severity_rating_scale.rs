#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::columbia_suicide_severity_rating_scales::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub scale_version: String,
    pub reason_for_assessment: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub wish_to_be_dead: String,
    pub non_specific_active_thoughts: String,
    pub active_ideation_methods: String,
    pub active_ideation_intent: String,
    pub active_ideation_plan: String,
    pub ideation_timeframe: String,
    pub ideation_frequency: Option<i32>,
    pub ideation_duration: Option<i32>,
    pub ideation_controllability: Option<i32>,
    pub ideation_deterrents: Option<i32>,
    pub ideation_reasons: Option<i32>,
    pub actual_attempt: String,
    pub interrupted_attempt: String,
    pub aborted_attempt: String,
    pub preparatory_acts: String,
    pub non_suicidal_self_injury: String,
    pub behaviour_recency: String,
    pub lifetime_attempt_count: Option<i32>,
    pub most_recent_attempt_date: Option<Date>,
    pub actual_lethality: Option<i32>,
    pub potential_lethality: Option<i32>,
    pub access_to_lethal_means: String,
    pub protective_factors: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.scale_version = Set(self.scale_version.clone());
      item.reason_for_assessment = Set(self.reason_for_assessment.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.wish_to_be_dead = Set(self.wish_to_be_dead.clone());
      item.non_specific_active_thoughts = Set(self.non_specific_active_thoughts.clone());
      item.active_ideation_methods = Set(self.active_ideation_methods.clone());
      item.active_ideation_intent = Set(self.active_ideation_intent.clone());
      item.active_ideation_plan = Set(self.active_ideation_plan.clone());
      item.ideation_timeframe = Set(self.ideation_timeframe.clone());
      item.ideation_frequency = Set(self.ideation_frequency);
      item.ideation_duration = Set(self.ideation_duration);
      item.ideation_controllability = Set(self.ideation_controllability);
      item.ideation_deterrents = Set(self.ideation_deterrents);
      item.ideation_reasons = Set(self.ideation_reasons);
      item.actual_attempt = Set(self.actual_attempt.clone());
      item.interrupted_attempt = Set(self.interrupted_attempt.clone());
      item.aborted_attempt = Set(self.aborted_attempt.clone());
      item.preparatory_acts = Set(self.preparatory_acts.clone());
      item.non_suicidal_self_injury = Set(self.non_suicidal_self_injury.clone());
      item.behaviour_recency = Set(self.behaviour_recency.clone());
      item.lifetime_attempt_count = Set(self.lifetime_attempt_count);
      item.most_recent_attempt_date = Set(self.most_recent_attempt_date);
      item.actual_lethality = Set(self.actual_lethality);
      item.potential_lethality = Set(self.potential_lethality);
      item.access_to_lethal_means = Set(self.access_to_lethal_means.clone());
      item.protective_factors = Set(self.protective_factors.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/columbia_suicide_severity_rating_scales/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
