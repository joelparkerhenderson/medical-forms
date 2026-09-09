#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::mental_state_examinations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub assessment_reason: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub appearance_grooming: String,
    pub appearance_eye_contact: String,
    pub appearance_rapport: String,
    pub appearance_psychomotor: String,
    pub appearance_abnormal_movements: String,
    pub appearance_notes: String,
    pub speech_rate: String,
    pub speech_volume: String,
    pub speech_quantity: String,
    pub speech_fluency: String,
    pub speech_notes: String,
    pub mood_subjective: String,
    pub mood_descriptor: String,
    pub affect_range: String,
    pub affect_congruence: String,
    pub affect_reactivity: String,
    pub emotion_notes: String,
    pub hallucinations_present: String,
    pub command_hallucinations: String,
    pub illusions: String,
    pub depersonalisation: String,
    pub derealisation: String,
    pub perception_notes: String,
    pub thought_form: String,
    pub delusions: String,
    pub obsessions: String,
    pub suicidal_ideation: String,
    pub homicidal_ideation: String,
    pub self_harm_thoughts: String,
    pub thought_notes: String,
    pub insight_level: String,
    pub treatment_understanding: String,
    pub judgement: String,
    pub insight_notes: String,
    pub orientation: String,
    pub attention: String,
    pub memory: String,
    pub cognitive_impression: String,
    pub cognition_notes: String,
    pub clinical_formulation: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.assessment_reason = Set(self.assessment_reason.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.appearance_grooming = Set(self.appearance_grooming.clone());
      item.appearance_eye_contact = Set(self.appearance_eye_contact.clone());
      item.appearance_rapport = Set(self.appearance_rapport.clone());
      item.appearance_psychomotor = Set(self.appearance_psychomotor.clone());
      item.appearance_abnormal_movements = Set(self.appearance_abnormal_movements.clone());
      item.appearance_notes = Set(self.appearance_notes.clone());
      item.speech_rate = Set(self.speech_rate.clone());
      item.speech_volume = Set(self.speech_volume.clone());
      item.speech_quantity = Set(self.speech_quantity.clone());
      item.speech_fluency = Set(self.speech_fluency.clone());
      item.speech_notes = Set(self.speech_notes.clone());
      item.mood_subjective = Set(self.mood_subjective.clone());
      item.mood_descriptor = Set(self.mood_descriptor.clone());
      item.affect_range = Set(self.affect_range.clone());
      item.affect_congruence = Set(self.affect_congruence.clone());
      item.affect_reactivity = Set(self.affect_reactivity.clone());
      item.emotion_notes = Set(self.emotion_notes.clone());
      item.hallucinations_present = Set(self.hallucinations_present.clone());
      item.command_hallucinations = Set(self.command_hallucinations.clone());
      item.illusions = Set(self.illusions.clone());
      item.depersonalisation = Set(self.depersonalisation.clone());
      item.derealisation = Set(self.derealisation.clone());
      item.perception_notes = Set(self.perception_notes.clone());
      item.thought_form = Set(self.thought_form.clone());
      item.delusions = Set(self.delusions.clone());
      item.obsessions = Set(self.obsessions.clone());
      item.suicidal_ideation = Set(self.suicidal_ideation.clone());
      item.homicidal_ideation = Set(self.homicidal_ideation.clone());
      item.self_harm_thoughts = Set(self.self_harm_thoughts.clone());
      item.thought_notes = Set(self.thought_notes.clone());
      item.insight_level = Set(self.insight_level.clone());
      item.treatment_understanding = Set(self.treatment_understanding.clone());
      item.judgement = Set(self.judgement.clone());
      item.insight_notes = Set(self.insight_notes.clone());
      item.orientation = Set(self.orientation.clone());
      item.attention = Set(self.attention.clone());
      item.memory = Set(self.memory.clone());
      item.cognitive_impression = Set(self.cognitive_impression.clone());
      item.cognition_notes = Set(self.cognition_notes.clone());
      item.clinical_formulation = Set(self.clinical_formulation.clone());
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
        .prefix("api/mental_state_examinations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
