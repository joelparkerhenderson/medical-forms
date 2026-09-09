#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub assessment_id: i64,
    pub overall_highest_ukmec_category: i32,
    pub ukmec_cocp: Option<i32>,
    pub ukmec_pop: Option<i32>,
    pub ukmec_patch: Option<i32>,
    pub ukmec_ring: Option<i32>,
    pub ukmec_injection: Option<i32>,
    pub ukmec_implant: Option<i32>,
    pub ukmec_cu_iud: Option<i32>,
    pub ukmec_lng_ius: Option<i32>,
    pub ukmec_condom_male: Option<i32>,
    pub ukmec_condom_female: Option<i32>,
    pub ukmec_diaphragm: Option<i32>,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.assessment_id = Set(self.assessment_id);
      item.overall_highest_ukmec_category = Set(self.overall_highest_ukmec_category);
      item.ukmec_cocp = Set(self.ukmec_cocp);
      item.ukmec_pop = Set(self.ukmec_pop);
      item.ukmec_patch = Set(self.ukmec_patch);
      item.ukmec_ring = Set(self.ukmec_ring);
      item.ukmec_injection = Set(self.ukmec_injection);
      item.ukmec_implant = Set(self.ukmec_implant);
      item.ukmec_cu_iud = Set(self.ukmec_cu_iud);
      item.ukmec_lng_ius = Set(self.ukmec_lng_ius);
      item.ukmec_condom_male = Set(self.ukmec_condom_male);
      item.ukmec_condom_female = Set(self.ukmec_condom_female);
      item.ukmec_diaphragm = Set(self.ukmec_diaphragm);
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
        .prefix("api/grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
