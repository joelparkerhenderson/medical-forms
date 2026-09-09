#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::bowel_cancer_screening_fits::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub reviewed_at: Option<DateTimeWithTimeZone>,
    pub screening_hub: String,
    pub participant_identifier: String,
    pub age: Option<i32>,
    pub within_age_range: String,
    pub recall_interval: String,
    pub invitation_date: Option<Date>,
    pub previous_outcome: String,
    pub last_screen_date: Option<Date>,
    pub kit_returned: String,
    pub return_date: Option<Date>,
    pub sample_adequacy: String,
    pub spoilt_reason: String,
    pub faecal_haemoglobin_ug_g: Option<f64>,
    pub assay: String,
    pub threshold_applied: Option<f64>,
    pub red_flag_symptoms: String,
    pub clinical_note: String,
    pub context: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.reviewed_at = Set(self.reviewed_at);
      item.screening_hub = Set(self.screening_hub.clone());
      item.participant_identifier = Set(self.participant_identifier.clone());
      item.age = Set(self.age);
      item.within_age_range = Set(self.within_age_range.clone());
      item.recall_interval = Set(self.recall_interval.clone());
      item.invitation_date = Set(self.invitation_date);
      item.previous_outcome = Set(self.previous_outcome.clone());
      item.last_screen_date = Set(self.last_screen_date);
      item.kit_returned = Set(self.kit_returned.clone());
      item.return_date = Set(self.return_date);
      item.sample_adequacy = Set(self.sample_adequacy.clone());
      item.spoilt_reason = Set(self.spoilt_reason.clone());
      item.faecal_haemoglobin_ug_g = Set(self.faecal_haemoglobin_ug_g);
      item.assay = Set(self.assay.clone());
      item.threshold_applied = Set(self.threshold_applied);
      item.red_flag_symptoms = Set(self.red_flag_symptoms.clone());
      item.clinical_note = Set(self.clinical_note.clone());
      item.context = Set(self.context.clone());
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
        .prefix("api/bowel_cancer_screening_fits/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
