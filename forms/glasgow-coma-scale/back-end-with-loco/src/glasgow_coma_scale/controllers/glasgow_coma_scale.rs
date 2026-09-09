#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::glasgow_coma_scales::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub assessor_name: String,
    pub assessor_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub setting: String,
    pub reason: String,
    pub intubated: String,
    pub sedated: String,
    pub paralysed: String,
    pub eye_response: String,
    pub eye_not_testable_reason: String,
    pub verbal_response: String,
    pub verbal_not_testable_reason: String,
    pub motor_response: String,
    pub motor_not_testable_reason: String,
    pub left_pupil_reactivity: String,
    pub right_pupil_reactivity: String,
    pub left_pupil_size_mm: Option<f64>,
    pub right_pupil_size_mm: Option<f64>,
    pub previous_total: Option<i32>,
    pub previous_motor_score: Option<i32>,
    pub previous_assessed_at: Option<DateTimeWithTimeZone>,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.assessor_name = Set(self.assessor_name.clone());
      item.assessor_role = Set(self.assessor_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.setting = Set(self.setting.clone());
      item.reason = Set(self.reason.clone());
      item.intubated = Set(self.intubated.clone());
      item.sedated = Set(self.sedated.clone());
      item.paralysed = Set(self.paralysed.clone());
      item.eye_response = Set(self.eye_response.clone());
      item.eye_not_testable_reason = Set(self.eye_not_testable_reason.clone());
      item.verbal_response = Set(self.verbal_response.clone());
      item.verbal_not_testable_reason = Set(self.verbal_not_testable_reason.clone());
      item.motor_response = Set(self.motor_response.clone());
      item.motor_not_testable_reason = Set(self.motor_not_testable_reason.clone());
      item.left_pupil_reactivity = Set(self.left_pupil_reactivity.clone());
      item.right_pupil_reactivity = Set(self.right_pupil_reactivity.clone());
      item.left_pupil_size_mm = Set(self.left_pupil_size_mm);
      item.right_pupil_size_mm = Set(self.right_pupil_size_mm);
      item.previous_total = Set(self.previous_total);
      item.previous_motor_score = Set(self.previous_motor_score);
      item.previous_assessed_at = Set(self.previous_assessed_at);
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
        .prefix("api/glasgow_coma_scales/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
