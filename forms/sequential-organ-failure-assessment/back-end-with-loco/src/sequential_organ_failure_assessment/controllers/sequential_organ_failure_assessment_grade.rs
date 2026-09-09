#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::sequential_organ_failure_assessment_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub sequential_organ_failure_assessment_id: i64,
    pub respiration_score: Option<i32>,
    pub coagulation_score: Option<i32>,
    pub liver_score: Option<i32>,
    pub cardiovascular_score: Option<i32>,
    pub cns_score: Option<i32>,
    pub renal_score: Option<i32>,
    pub total_score: Option<i32>,
    pub delta_sofa: Option<i32>,
    pub mortality_band: String,
    pub sepsis3: bool,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.sequential_organ_failure_assessment_id = Set(self.sequential_organ_failure_assessment_id);
      item.respiration_score = Set(self.respiration_score);
      item.coagulation_score = Set(self.coagulation_score);
      item.liver_score = Set(self.liver_score);
      item.cardiovascular_score = Set(self.cardiovascular_score);
      item.cns_score = Set(self.cns_score);
      item.renal_score = Set(self.renal_score);
      item.total_score = Set(self.total_score);
      item.delta_sofa = Set(self.delta_sofa);
      item.mortality_band = Set(self.mortality_band.clone());
      item.sepsis3 = Set(self.sepsis3);
      item.graded_at = Set(self.graded_at);
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
        .prefix("api/sequential_organ_failure_assessment_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
