#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::patient_medications::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub medication_id: i64,
    pub dose: String,
    pub frequency: String,
    pub route: String,
    pub indication: String,
    pub started_on: Option<Date>,
    pub prescribed_by: String,
    pub adherence: String,
    pub hold_required: bool,
    pub hold_start_before_days: Option<i32>,
    pub restart_after_days: Option<i32>,
    pub hold_plan_agreed: bool,
    pub hold_plan_agreed_by: String,
    pub hold_plan_agreed_on: Option<Date>,
    pub notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.medication_id = Set(self.medication_id);
      item.dose = Set(self.dose.clone());
      item.frequency = Set(self.frequency.clone());
      item.route = Set(self.route.clone());
      item.indication = Set(self.indication.clone());
      item.started_on = Set(self.started_on);
      item.prescribed_by = Set(self.prescribed_by.clone());
      item.adherence = Set(self.adherence.clone());
      item.hold_required = Set(self.hold_required);
      item.hold_start_before_days = Set(self.hold_start_before_days);
      item.restart_after_days = Set(self.restart_after_days);
      item.hold_plan_agreed = Set(self.hold_plan_agreed);
      item.hold_plan_agreed_by = Set(self.hold_plan_agreed_by.clone());
      item.hold_plan_agreed_on = Set(self.hold_plan_agreed_on);
      item.notes = Set(self.notes.clone());
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
        .prefix("api/patient_medications/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
