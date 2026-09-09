#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::casualty_card_primary_surveys::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub casualty_card_id: i64,
    pub airway_status: String,
    pub airway_adjuncts: String,
    pub c_spine_immobilised: String,
    pub breathing_effort: String,
    pub chest_movement: String,
    pub breath_sounds: String,
    pub trachea_position: String,
    pub pulse_character: String,
    pub skin_colour: String,
    pub skin_temperature: String,
    pub capillary_refill: String,
    pub haemorrhage: String,
    pub iv_access: String,
    pub gcs_eye: Option<i32>,
    pub gcs_verbal: Option<i32>,
    pub gcs_motor: Option<i32>,
    pub gcs_total: Option<i32>,
    pub pupils: String,
    pub blood_glucose_disability: String,
    pub limb_movements: String,
    pub skin_examination: String,
    pub injuries_identified: String,
    pub log_roll_findings: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.casualty_card_id = Set(self.casualty_card_id);
      item.airway_status = Set(self.airway_status.clone());
      item.airway_adjuncts = Set(self.airway_adjuncts.clone());
      item.c_spine_immobilised = Set(self.c_spine_immobilised.clone());
      item.breathing_effort = Set(self.breathing_effort.clone());
      item.chest_movement = Set(self.chest_movement.clone());
      item.breath_sounds = Set(self.breath_sounds.clone());
      item.trachea_position = Set(self.trachea_position.clone());
      item.pulse_character = Set(self.pulse_character.clone());
      item.skin_colour = Set(self.skin_colour.clone());
      item.skin_temperature = Set(self.skin_temperature.clone());
      item.capillary_refill = Set(self.capillary_refill.clone());
      item.haemorrhage = Set(self.haemorrhage.clone());
      item.iv_access = Set(self.iv_access.clone());
      item.gcs_eye = Set(self.gcs_eye);
      item.gcs_verbal = Set(self.gcs_verbal);
      item.gcs_motor = Set(self.gcs_motor);
      item.gcs_total = Set(self.gcs_total);
      item.pupils = Set(self.pupils.clone());
      item.blood_glucose_disability = Set(self.blood_glucose_disability.clone());
      item.limb_movements = Set(self.limb_movements.clone());
      item.skin_examination = Set(self.skin_examination.clone());
      item.injuries_identified = Set(self.injuries_identified.clone());
      item.log_roll_findings = Set(self.log_roll_findings.clone());
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
        .prefix("api/casualty_card_primary_surveys/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
