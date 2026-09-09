#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use sea_orm::prelude::Time;
use serde::{Deserialize, Serialize};

use crate::models::_entities::four_a_test_for_deliriums::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub patient_identifier: String,
    pub patient_name: String,
    pub date_of_birth: Option<Date>,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<Time>,
    pub setting: String,
    pub assessor_name: String,
    pub assessor_role: String,
    pub alertness: String,
    pub amt4: String,
    pub attention_months: String,
    pub acute_change: String,
    pub acute_change_source: String,
    pub clinical_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.patient_name = Set(self.patient_name.clone());
      item.date_of_birth = Set(self.date_of_birth);
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time);
      item.setting = Set(self.setting.clone());
      item.assessor_name = Set(self.assessor_name.clone());
      item.assessor_role = Set(self.assessor_role.clone());
      item.alertness = Set(self.alertness.clone());
      item.amt4 = Set(self.amt4.clone());
      item.attention_months = Set(self.attention_months.clone());
      item.acute_change = Set(self.acute_change.clone());
      item.acute_change_source = Set(self.acute_change_source.clone());
      item.clinical_notes = Set(self.clinical_notes.clone());
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
        .prefix("api/four_a_test_for_deliriums/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
