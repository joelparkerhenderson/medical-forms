#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub status: String,
    pub age_of_onset: Option<i32>,
    pub known_allergens: String,
    pub family_history_of_atopy: String,
    pub family_atopy_details: String,
    pub family_history_of_allergy: String,
    pub family_allergy_details: String,
    pub pollen_allergy: String,
    pub dust_mite_allergy: String,
    pub mould_allergy: String,
    pub animal_dander_allergy: String,
    pub latex_allergy: String,
    pub insect_sting_allergy: String,
    pub insect_sting_severity: String,
    pub seasonal_pattern: String,
    pub other_environmental_allergens: String,
    pub asthma: String,
    pub asthma_severity: String,
    pub eczema: String,
    pub eczema_severity: String,
    pub rhinitis: String,
    pub rhinitis_severity: String,
    pub eosinophilic_oesophagitis: String,
    pub mast_cell_disorders: String,
    pub mast_cell_details: String,
    pub mental_health_impact: String,
    pub mental_health_details: String,
    pub quality_of_life_score: Option<i32>,
    pub school_work_impact: String,
    pub school_work_impact_details: String,
    pub emergency_action_plan_status: String,
    pub training_provided: String,
    pub training_details: String,
    pub follow_up_schedule: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.status = Set(self.status.clone());
      item.age_of_onset = Set(self.age_of_onset);
      item.known_allergens = Set(self.known_allergens.clone());
      item.family_history_of_atopy = Set(self.family_history_of_atopy.clone());
      item.family_atopy_details = Set(self.family_atopy_details.clone());
      item.family_history_of_allergy = Set(self.family_history_of_allergy.clone());
      item.family_allergy_details = Set(self.family_allergy_details.clone());
      item.pollen_allergy = Set(self.pollen_allergy.clone());
      item.dust_mite_allergy = Set(self.dust_mite_allergy.clone());
      item.mould_allergy = Set(self.mould_allergy.clone());
      item.animal_dander_allergy = Set(self.animal_dander_allergy.clone());
      item.latex_allergy = Set(self.latex_allergy.clone());
      item.insect_sting_allergy = Set(self.insect_sting_allergy.clone());
      item.insect_sting_severity = Set(self.insect_sting_severity.clone());
      item.seasonal_pattern = Set(self.seasonal_pattern.clone());
      item.other_environmental_allergens = Set(self.other_environmental_allergens.clone());
      item.asthma = Set(self.asthma.clone());
      item.asthma_severity = Set(self.asthma_severity.clone());
      item.eczema = Set(self.eczema.clone());
      item.eczema_severity = Set(self.eczema_severity.clone());
      item.rhinitis = Set(self.rhinitis.clone());
      item.rhinitis_severity = Set(self.rhinitis_severity.clone());
      item.eosinophilic_oesophagitis = Set(self.eosinophilic_oesophagitis.clone());
      item.mast_cell_disorders = Set(self.mast_cell_disorders.clone());
      item.mast_cell_details = Set(self.mast_cell_details.clone());
      item.mental_health_impact = Set(self.mental_health_impact.clone());
      item.mental_health_details = Set(self.mental_health_details.clone());
      item.quality_of_life_score = Set(self.quality_of_life_score);
      item.school_work_impact = Set(self.school_work_impact.clone());
      item.school_work_impact_details = Set(self.school_work_impact_details.clone());
      item.emergency_action_plan_status = Set(self.emergency_action_plan_status.clone());
      item.training_provided = Set(self.training_provided.clone());
      item.training_details = Set(self.training_details.clone());
      item.follow_up_schedule = Set(self.follow_up_schedule.clone());
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
        .prefix("api/assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
