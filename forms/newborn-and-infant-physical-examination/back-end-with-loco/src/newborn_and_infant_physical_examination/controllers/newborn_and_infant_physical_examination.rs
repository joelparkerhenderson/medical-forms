#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::newborn_and_infant_physical_examinations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub practitioner_name: String,
    pub practitioner_role: String,
    pub examined_at: Option<DateTimeWithTimeZone>,
    pub examination_context: String,
    pub care_setting: String,
    pub baby_identifier: String,
    pub baby_name: String,
    pub date_of_birth: Option<Date>,
    pub sex: String,
    pub gestational_age_weeks: Option<f64>,
    pub birth_weight_grams: Option<f64>,
    pub breech_presentation: String,
    pub family_history_hip_problems: String,
    pub antenatal_concerns: String,
    pub eyes_red_reflex_right: String,
    pub eyes_red_reflex_left: String,
    pub eyes_appearance: String,
    pub heart_murmur: String,
    pub femoral_pulses_right: String,
    pub femoral_pulses_left: String,
    pub central_cyanosis: String,
    pub oxygen_saturation_preductal: Option<f64>,
    pub oxygen_saturation_postductal: Option<f64>,
    pub barlow_test: String,
    pub ortolani_test: String,
    pub hip_abduction: String,
    pub testis_right: String,
    pub testis_left: String,
    pub general_appearance: String,
    pub skin: String,
    pub head_and_fontanelles: String,
    pub face_and_palate: String,
    pub neck_and_clavicles: String,
    pub chest_and_lungs: String,
    pub abdomen: String,
    pub genitalia: String,
    pub anus_and_spine: String,
    pub limbs_and_digits: String,
    pub feet: String,
    pub tone_and_movement: String,
    pub weight_grams: Option<f64>,
    pub head_circumference_cm: Option<f64>,
    pub length_cm: Option<f64>,
    pub eyes_result_recorded: String,
    pub heart_result_recorded: String,
    pub hips_result_recorded: String,
    pub testes_result_recorded: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.practitioner_name = Set(self.practitioner_name.clone());
      item.practitioner_role = Set(self.practitioner_role.clone());
      item.examined_at = Set(self.examined_at);
      item.examination_context = Set(self.examination_context.clone());
      item.care_setting = Set(self.care_setting.clone());
      item.baby_identifier = Set(self.baby_identifier.clone());
      item.baby_name = Set(self.baby_name.clone());
      item.date_of_birth = Set(self.date_of_birth);
      item.sex = Set(self.sex.clone());
      item.gestational_age_weeks = Set(self.gestational_age_weeks);
      item.birth_weight_grams = Set(self.birth_weight_grams);
      item.breech_presentation = Set(self.breech_presentation.clone());
      item.family_history_hip_problems = Set(self.family_history_hip_problems.clone());
      item.antenatal_concerns = Set(self.antenatal_concerns.clone());
      item.eyes_red_reflex_right = Set(self.eyes_red_reflex_right.clone());
      item.eyes_red_reflex_left = Set(self.eyes_red_reflex_left.clone());
      item.eyes_appearance = Set(self.eyes_appearance.clone());
      item.heart_murmur = Set(self.heart_murmur.clone());
      item.femoral_pulses_right = Set(self.femoral_pulses_right.clone());
      item.femoral_pulses_left = Set(self.femoral_pulses_left.clone());
      item.central_cyanosis = Set(self.central_cyanosis.clone());
      item.oxygen_saturation_preductal = Set(self.oxygen_saturation_preductal);
      item.oxygen_saturation_postductal = Set(self.oxygen_saturation_postductal);
      item.barlow_test = Set(self.barlow_test.clone());
      item.ortolani_test = Set(self.ortolani_test.clone());
      item.hip_abduction = Set(self.hip_abduction.clone());
      item.testis_right = Set(self.testis_right.clone());
      item.testis_left = Set(self.testis_left.clone());
      item.general_appearance = Set(self.general_appearance.clone());
      item.skin = Set(self.skin.clone());
      item.head_and_fontanelles = Set(self.head_and_fontanelles.clone());
      item.face_and_palate = Set(self.face_and_palate.clone());
      item.neck_and_clavicles = Set(self.neck_and_clavicles.clone());
      item.chest_and_lungs = Set(self.chest_and_lungs.clone());
      item.abdomen = Set(self.abdomen.clone());
      item.genitalia = Set(self.genitalia.clone());
      item.anus_and_spine = Set(self.anus_and_spine.clone());
      item.limbs_and_digits = Set(self.limbs_and_digits.clone());
      item.feet = Set(self.feet.clone());
      item.tone_and_movement = Set(self.tone_and_movement.clone());
      item.weight_grams = Set(self.weight_grams);
      item.head_circumference_cm = Set(self.head_circumference_cm);
      item.length_cm = Set(self.length_cm);
      item.eyes_result_recorded = Set(self.eyes_result_recorded.clone());
      item.heart_result_recorded = Set(self.heart_result_recorded.clone());
      item.hips_result_recorded = Set(self.hips_result_recorded.clone());
      item.testes_result_recorded = Set(self.testes_result_recorded.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/newborn_and_infant_physical_examinations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
