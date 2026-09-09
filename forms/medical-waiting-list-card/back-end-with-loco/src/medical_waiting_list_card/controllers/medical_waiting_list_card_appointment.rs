#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_waiting_list_card_appointments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub medical_waiting_list_card_id: i64,
    pub appointment_date: Option<Date>,
    pub appointment_time: Option<String>,
    pub duration_minutes: Option<i32>,
    pub appointment_type: String,
    pub site_name: String,
    pub site_address: String,
    pub clinic_name: String,
    pub room: String,
    pub clinician_name: String,
    pub clinician_team: String,
    pub status: String,
    pub travel_notes: String,
    pub access_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.medical_waiting_list_card_id = Set(self.medical_waiting_list_card_id);
      item.appointment_date = Set(self.appointment_date);
      item.appointment_time = Set(self.appointment_time.clone());
      item.duration_minutes = Set(self.duration_minutes);
      item.appointment_type = Set(self.appointment_type.clone());
      item.site_name = Set(self.site_name.clone());
      item.site_address = Set(self.site_address.clone());
      item.clinic_name = Set(self.clinic_name.clone());
      item.room = Set(self.room.clone());
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_team = Set(self.clinician_team.clone());
      item.status = Set(self.status.clone());
      item.travel_notes = Set(self.travel_notes.clone());
      item.access_notes = Set(self.access_notes.clone());
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
        .prefix("api/medical_waiting_list_card_appointments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
