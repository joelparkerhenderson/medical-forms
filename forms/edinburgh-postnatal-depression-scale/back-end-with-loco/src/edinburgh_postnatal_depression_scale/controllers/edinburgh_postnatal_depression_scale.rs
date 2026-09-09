#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::edinburgh_postnatal_depression_scales::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub care_setting: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub perinatal_stage: String,
    pub perinatal_week: Option<f64>,
    pub respondent_identifier: String,
    pub age_band: String,
    pub preferred_language: String,
    pub assistance_needed: String,
    pub item_1: Option<i32>,
    pub item_2: Option<i32>,
    pub item_3: Option<i32>,
    pub item_4: Option<i32>,
    pub item_5: Option<i32>,
    pub item_6: Option<i32>,
    pub item_7: Option<i32>,
    pub item_8: Option<i32>,
    pub item_9: Option<i32>,
    pub item_10: Option<i32>,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.care_setting = Set(self.care_setting.clone());
      item.assessed_at = Set(self.assessed_at);
      item.perinatal_stage = Set(self.perinatal_stage.clone());
      item.perinatal_week = Set(self.perinatal_week);
      item.respondent_identifier = Set(self.respondent_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.preferred_language = Set(self.preferred_language.clone());
      item.assistance_needed = Set(self.assistance_needed.clone());
      item.item_1 = Set(self.item_1);
      item.item_2 = Set(self.item_2);
      item.item_3 = Set(self.item_3);
      item.item_4 = Set(self.item_4);
      item.item_5 = Set(self.item_5);
      item.item_6 = Set(self.item_6);
      item.item_7 = Set(self.item_7);
      item.item_8 = Set(self.item_8);
      item.item_9 = Set(self.item_9);
      item.item_10 = Set(self.item_10);
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
        .prefix("api/edinburgh_postnatal_depression_scales/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
