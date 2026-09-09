#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::bhutani_bilirubin_nomograms::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub infant_identifier: String,
    pub sex: String,
    pub born_at: Option<DateTimeWithTimeZone>,
    pub gestational_age_weeks: Option<f64>,
    pub age_hours: Option<f64>,
    pub total_serum_bilirubin_umol_l: Option<f64>,
    pub measurement_method: String,
    pub preterm_under_38: String,
    pub previous_sibling_jaundice: String,
    pub exclusive_breastfeeding: String,
    pub bruising: String,
    pub blood_group_incompatibility: String,
    pub early_onset_under_24h: String,
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
      item.infant_identifier = Set(self.infant_identifier.clone());
      item.sex = Set(self.sex.clone());
      item.born_at = Set(self.born_at);
      item.gestational_age_weeks = Set(self.gestational_age_weeks);
      item.age_hours = Set(self.age_hours);
      item.total_serum_bilirubin_umol_l = Set(self.total_serum_bilirubin_umol_l);
      item.measurement_method = Set(self.measurement_method.clone());
      item.preterm_under_38 = Set(self.preterm_under_38.clone());
      item.previous_sibling_jaundice = Set(self.previous_sibling_jaundice.clone());
      item.exclusive_breastfeeding = Set(self.exclusive_breastfeeding.clone());
      item.bruising = Set(self.bruising.clone());
      item.blood_group_incompatibility = Set(self.blood_group_incompatibility.clone());
      item.early_onset_under_24h = Set(self.early_onset_under_24h.clone());
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
        .prefix("api/bhutani_bilirubin_nomograms/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
