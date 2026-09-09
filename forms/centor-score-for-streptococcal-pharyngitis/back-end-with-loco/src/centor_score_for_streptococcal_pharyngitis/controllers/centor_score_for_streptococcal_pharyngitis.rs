#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::centor_score_for_streptococcal_pharyngitis::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub patient_identifier: String,
    pub age_years: Option<i32>,
    pub sex: String,
    pub tonsillar_exudate: String,
    pub tender_anterior_cervical_nodes: String,
    pub fever_over_38: String,
    pub measured_temperature_celsius: Option<f64>,
    pub absence_of_cough: String,
    pub stridor_or_breathing_difficulty: String,
    pub drooling_or_cannot_swallow: String,
    pub trismus: String,
    pub muffled_voice: String,
    pub unilateral_neck_swelling: String,
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
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_years = Set(self.age_years);
      item.sex = Set(self.sex.clone());
      item.tonsillar_exudate = Set(self.tonsillar_exudate.clone());
      item.tender_anterior_cervical_nodes = Set(self.tender_anterior_cervical_nodes.clone());
      item.fever_over_38 = Set(self.fever_over_38.clone());
      item.measured_temperature_celsius = Set(self.measured_temperature_celsius);
      item.absence_of_cough = Set(self.absence_of_cough.clone());
      item.stridor_or_breathing_difficulty = Set(self.stridor_or_breathing_difficulty.clone());
      item.drooling_or_cannot_swallow = Set(self.drooling_or_cannot_swallow.clone());
      item.trismus = Set(self.trismus.clone());
      item.muffled_voice = Set(self.muffled_voice.clone());
      item.unilateral_neck_swelling = Set(self.unilateral_neck_swelling.clone());
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
        .prefix("api/centor_score_for_streptococcal_pharyngitis/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
