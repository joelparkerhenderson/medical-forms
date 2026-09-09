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
    pub psqi_global_score: Option<i32>,
    pub psqi_component1_subjective_quality: Option<i32>,
    pub psqi_component2_sleep_latency: Option<i32>,
    pub psqi_component3_sleep_duration: Option<i32>,
    pub psqi_component4_sleep_efficiency: Option<i32>,
    pub psqi_component5_sleep_disturbances: Option<i32>,
    pub psqi_component6_sleep_medication: Option<i32>,
    pub psqi_component7_daytime_dysfunction: Option<i32>,
    pub sleep_quality_category: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.assessment_id = Set(self.assessment_id);
      item.psqi_global_score = Set(self.psqi_global_score);
      item.psqi_component1_subjective_quality = Set(self.psqi_component1_subjective_quality);
      item.psqi_component2_sleep_latency = Set(self.psqi_component2_sleep_latency);
      item.psqi_component3_sleep_duration = Set(self.psqi_component3_sleep_duration);
      item.psqi_component4_sleep_efficiency = Set(self.psqi_component4_sleep_efficiency);
      item.psqi_component5_sleep_disturbances = Set(self.psqi_component5_sleep_disturbances);
      item.psqi_component6_sleep_medication = Set(self.psqi_component6_sleep_medication);
      item.psqi_component7_daytime_dysfunction = Set(self.psqi_component7_daytime_dysfunction);
      item.sleep_quality_category = Set(self.sleep_quality_category.clone());
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
