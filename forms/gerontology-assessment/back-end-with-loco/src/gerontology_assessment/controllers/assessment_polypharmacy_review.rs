#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::assessment_polypharmacy_reviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub assessment_id: i64,
    pub total_regular_medications: Option<i32>,
    pub total_prn_medications: Option<i32>,
    pub polypharmacy_flag: String,
    pub medication_review_date: Option<Date>,
    pub falls_risk_medications: String,
    pub falls_risk_medication_details: String,
    pub anticholinergic_burden: String,
    pub drug_interactions_identified: String,
    pub drug_interaction_details: String,
    pub adherence_concerns: String,
    pub adherence_details: String,
    pub stopp_start_review_done: String,
    pub deprescribing_opportunities: String,
    pub polypharmacy_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.assessment_id = Set(self.assessment_id);
      item.total_regular_medications = Set(self.total_regular_medications);
      item.total_prn_medications = Set(self.total_prn_medications);
      item.polypharmacy_flag = Set(self.polypharmacy_flag.clone());
      item.medication_review_date = Set(self.medication_review_date);
      item.falls_risk_medications = Set(self.falls_risk_medications.clone());
      item.falls_risk_medication_details = Set(self.falls_risk_medication_details.clone());
      item.anticholinergic_burden = Set(self.anticholinergic_burden.clone());
      item.drug_interactions_identified = Set(self.drug_interactions_identified.clone());
      item.drug_interaction_details = Set(self.drug_interaction_details.clone());
      item.adherence_concerns = Set(self.adherence_concerns.clone());
      item.adherence_details = Set(self.adherence_details.clone());
      item.stopp_start_review_done = Set(self.stopp_start_review_done.clone());
      item.deprescribing_opportunities = Set(self.deprescribing_opportunities.clone());
      item.polypharmacy_notes = Set(self.polypharmacy_notes.clone());
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
        .prefix("api/assessment_polypharmacy_reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
