#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::bhutani_bilirubin_nomogram_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub bhutani_bilirubin_nomogram_id: i64,
    pub risk_zone: String,
    pub percentile_band: String,
    pub phototherapy_threshold_umol_l: Option<f64>,
    pub exchange_threshold_umol_l: Option<f64>,
    pub above_phototherapy_threshold: String,
    pub above_exchange_threshold: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.bhutani_bilirubin_nomogram_id = Set(self.bhutani_bilirubin_nomogram_id);
      item.risk_zone = Set(self.risk_zone.clone());
      item.percentile_band = Set(self.percentile_band.clone());
      item.phototherapy_threshold_umol_l = Set(self.phototherapy_threshold_umol_l);
      item.exchange_threshold_umol_l = Set(self.exchange_threshold_umol_l);
      item.above_phototherapy_threshold = Set(self.above_phototherapy_threshold.clone());
      item.above_exchange_threshold = Set(self.above_exchange_threshold.clone());
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
        .prefix("api/bhutani_bilirubin_nomogram_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
