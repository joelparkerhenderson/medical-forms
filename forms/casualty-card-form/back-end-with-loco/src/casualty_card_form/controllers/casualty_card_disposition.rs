#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::casualty_card_dispositions::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub casualty_card_id: i64,
    pub disposition: String,
    pub admitting_specialty: String,
    pub admitting_consultant: String,
    pub ward: String,
    pub level_of_care: String,
    pub discharge_diagnosis: String,
    pub discharge_medications: String,
    pub discharge_instructions: String,
    pub follow_up: String,
    pub return_precautions: String,
    pub receiving_hospital: String,
    pub reason_for_transfer: String,
    pub mode_of_transfer: String,
    pub discharge_time: Option<DateTimeWithTimeZone>,
    pub total_time_in_department: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.casualty_card_id = Set(self.casualty_card_id);
      item.disposition = Set(self.disposition.clone());
      item.admitting_specialty = Set(self.admitting_specialty.clone());
      item.admitting_consultant = Set(self.admitting_consultant.clone());
      item.ward = Set(self.ward.clone());
      item.level_of_care = Set(self.level_of_care.clone());
      item.discharge_diagnosis = Set(self.discharge_diagnosis.clone());
      item.discharge_medications = Set(self.discharge_medications.clone());
      item.discharge_instructions = Set(self.discharge_instructions.clone());
      item.follow_up = Set(self.follow_up.clone());
      item.return_precautions = Set(self.return_precautions.clone());
      item.receiving_hospital = Set(self.receiving_hospital.clone());
      item.reason_for_transfer = Set(self.reason_for_transfer.clone());
      item.mode_of_transfer = Set(self.mode_of_transfer.clone());
      item.discharge_time = Set(self.discharge_time);
      item.total_time_in_department = Set(self.total_time_in_department.clone());
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
        .prefix("api/casualty_card_dispositions/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
