#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_conditions::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub assessment_id: i64,
    pub has_diabetes: String,
    pub has_atrial_fibrillation: String,
    pub has_rheumatoid_arthritis: String,
    pub has_chronic_kidney_disease: String,
    pub has_migraine: String,
    pub has_severe_mental_illness: String,
    pub has_erectile_dysfunction: String,
    pub on_atypical_antipsychotic: String,
    pub on_corticosteroids: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.assessment_id = Set(self.assessment_id);
      item.has_diabetes = Set(self.has_diabetes.clone());
      item.has_atrial_fibrillation = Set(self.has_atrial_fibrillation.clone());
      item.has_rheumatoid_arthritis = Set(self.has_rheumatoid_arthritis.clone());
      item.has_chronic_kidney_disease = Set(self.has_chronic_kidney_disease.clone());
      item.has_migraine = Set(self.has_migraine.clone());
      item.has_severe_mental_illness = Set(self.has_severe_mental_illness.clone());
      item.has_erectile_dysfunction = Set(self.has_erectile_dysfunction.clone());
      item.on_atypical_antipsychotic = Set(self.on_atypical_antipsychotic.clone());
      item.on_corticosteroids = Set(self.on_corticosteroids.clone());
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
        .prefix("api/medical_conditions/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
