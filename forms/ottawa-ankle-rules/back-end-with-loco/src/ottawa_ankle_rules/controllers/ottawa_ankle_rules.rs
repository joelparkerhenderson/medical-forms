#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::ottawa_ankle_rules::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub status: String,
    pub patient_identifier: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub injured_side: String,
    pub hours_since_injury: Option<f64>,
    pub age_years: Option<i32>,
    pub sex: String,
    pub assessment_reliable: String,
    pub malleolar_zone_pain: String,
    pub lateral_malleolus_tenderness: String,
    pub medial_malleolus_tenderness: String,
    pub midfoot_zone_pain: String,
    pub fifth_metatarsal_base_tenderness: String,
    pub navicular_tenderness: String,
    pub able_to_bear_weight_immediately: String,
    pub able_to_bear_weight_now: String,
    pub clinical_notes: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.status = Set(self.status.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.injured_side = Set(self.injured_side.clone());
      item.hours_since_injury = Set(self.hours_since_injury);
      item.age_years = Set(self.age_years);
      item.sex = Set(self.sex.clone());
      item.assessment_reliable = Set(self.assessment_reliable.clone());
      item.malleolar_zone_pain = Set(self.malleolar_zone_pain.clone());
      item.lateral_malleolus_tenderness = Set(self.lateral_malleolus_tenderness.clone());
      item.medial_malleolus_tenderness = Set(self.medial_malleolus_tenderness.clone());
      item.midfoot_zone_pain = Set(self.midfoot_zone_pain.clone());
      item.fifth_metatarsal_base_tenderness = Set(self.fifth_metatarsal_base_tenderness.clone());
      item.navicular_tenderness = Set(self.navicular_tenderness.clone());
      item.able_to_bear_weight_immediately = Set(self.able_to_bear_weight_immediately.clone());
      item.able_to_bear_weight_now = Set(self.able_to_bear_weight_now.clone());
      item.clinical_notes = Set(self.clinical_notes.clone());
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
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
        .prefix("api/ottawa_ankle_rules/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
