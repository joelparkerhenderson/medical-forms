#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::hypertension_review_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub control_status: String,
    pub hypertension_stage: String,
    pub review_status: String,
    pub primary_source: String,
    pub target_group: String,
    pub clinic_target_systolic: Option<i32>,
    pub clinic_target_diastolic: Option<i32>,
    pub home_target_systolic: Option<i32>,
    pub home_target_diastolic: Option<i32>,
    pub graded_at: DateTimeWithTimeZone,
    pub hypertension_review_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.control_status = Set(self.control_status.clone());
      item.hypertension_stage = Set(self.hypertension_stage.clone());
      item.review_status = Set(self.review_status.clone());
      item.primary_source = Set(self.primary_source.clone());
      item.target_group = Set(self.target_group.clone());
      item.clinic_target_systolic = Set(self.clinic_target_systolic);
      item.clinic_target_diastolic = Set(self.clinic_target_diastolic);
      item.home_target_systolic = Set(self.home_target_systolic);
      item.home_target_diastolic = Set(self.home_target_diastolic);
      item.graded_at = Set(self.graded_at);
      item.hypertension_review_id = Set(self.hypertension_review_id);
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
        .prefix("api/hypertension_review_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
