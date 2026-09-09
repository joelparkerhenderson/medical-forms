#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::zarit_burden_interviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub practitioner_name: String,
    pub practitioner_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub instrument_form: String,
    pub carer_identifier: String,
    pub carer_relationship: String,
    pub carer_co_resident: String,
    pub care_hours_per_week: Option<f64>,
    pub recipient_identifier: String,
    pub recipient_condition: String,
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
    pub item_11: Option<i32>,
    pub item_12: Option<i32>,
    pub item_13: Option<i32>,
    pub item_14: Option<i32>,
    pub item_15: Option<i32>,
    pub item_16: Option<i32>,
    pub item_17: Option<i32>,
    pub item_18: Option<i32>,
    pub item_19: Option<i32>,
    pub item_20: Option<i32>,
    pub item_21: Option<i32>,
    pub item_22: Option<i32>,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.practitioner_name = Set(self.practitioner_name.clone());
      item.practitioner_role = Set(self.practitioner_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.instrument_form = Set(self.instrument_form.clone());
      item.carer_identifier = Set(self.carer_identifier.clone());
      item.carer_relationship = Set(self.carer_relationship.clone());
      item.carer_co_resident = Set(self.carer_co_resident.clone());
      item.care_hours_per_week = Set(self.care_hours_per_week);
      item.recipient_identifier = Set(self.recipient_identifier.clone());
      item.recipient_condition = Set(self.recipient_condition.clone());
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
      item.item_11 = Set(self.item_11);
      item.item_12 = Set(self.item_12);
      item.item_13 = Set(self.item_13);
      item.item_14 = Set(self.item_14);
      item.item_15 = Set(self.item_15);
      item.item_16 = Set(self.item_16);
      item.item_17 = Set(self.item_17);
      item.item_18 = Set(self.item_18);
      item.item_19 = Set(self.item_19);
      item.item_20 = Set(self.item_20);
      item.item_21 = Set(self.item_21);
      item.item_22 = Set(self.item_22);
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
        .prefix("api/zarit_burden_interviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
