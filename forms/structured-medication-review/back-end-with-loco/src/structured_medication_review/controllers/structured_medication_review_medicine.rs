#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::structured_medication_review_medicines::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub structured_medication_review_id: i64,
    pub drug_name: String,
    pub form_strength: String,
    pub dose_regimen: String,
    pub indication: String,
    pub indication_recorded: String,
    pub is_regular: String,
    pub is_high_risk: String,
    pub high_risk_class: String,
    pub adherence: String,
    pub anticholinergic_burden_points: Option<i32>,
    pub monitoring_required: String,
    pub monitoring_up_to_date: String,
    pub deprescribing_candidate: String,
    pub stopp_criterion: String,
    pub start_criterion: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.structured_medication_review_id = Set(self.structured_medication_review_id);
      item.drug_name = Set(self.drug_name.clone());
      item.form_strength = Set(self.form_strength.clone());
      item.dose_regimen = Set(self.dose_regimen.clone());
      item.indication = Set(self.indication.clone());
      item.indication_recorded = Set(self.indication_recorded.clone());
      item.is_regular = Set(self.is_regular.clone());
      item.is_high_risk = Set(self.is_high_risk.clone());
      item.high_risk_class = Set(self.high_risk_class.clone());
      item.adherence = Set(self.adherence.clone());
      item.anticholinergic_burden_points = Set(self.anticholinergic_burden_points);
      item.monitoring_required = Set(self.monitoring_required.clone());
      item.monitoring_up_to_date = Set(self.monitoring_up_to_date.clone());
      item.deprescribing_candidate = Set(self.deprescribing_candidate.clone());
      item.stopp_criterion = Set(self.stopp_criterion.clone());
      item.start_criterion = Set(self.start_criterion.clone());
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
        .prefix("api/structured_medication_review_medicines/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
