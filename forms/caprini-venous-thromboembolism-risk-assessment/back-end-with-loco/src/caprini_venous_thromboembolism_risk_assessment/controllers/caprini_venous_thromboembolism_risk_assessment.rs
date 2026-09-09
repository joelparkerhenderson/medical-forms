#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::caprini_venous_thromboembolism_risk_assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub clinician_name: String,
    pub clinician_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub admission_type: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub minor_surgery: String,
    pub recent_major_surgery: String,
    pub varicose_veins: String,
    pub inflammatory_bowel_disease: String,
    pub swollen_legs: String,
    pub obesity: String,
    pub acute_myocardial_infarction: String,
    pub congestive_heart_failure: String,
    pub sepsis: String,
    pub serious_lung_disease: String,
    pub abnormal_pulmonary_function: String,
    pub medical_patient_bed_rest: String,
    pub oral_contraceptive_or_hrt: String,
    pub pregnancy_or_postpartum: String,
    pub adverse_pregnancy_history: String,
    pub arthroscopic_surgery: String,
    pub major_open_surgery: String,
    pub laparoscopic_surgery: String,
    pub malignancy: String,
    pub confined_to_bed: String,
    pub immobilising_cast: String,
    pub central_venous_access: String,
    pub history_of_vte: String,
    pub family_history_of_thrombosis: String,
    pub factor_v_leiden: String,
    pub prothrombin_20210a: String,
    pub lupus_anticoagulant: String,
    pub anticardiolipin_antibodies: String,
    pub elevated_homocysteine: String,
    pub heparin_induced_thrombocytopenia: String,
    pub other_thrombophilia: String,
    pub stroke: String,
    pub elective_arthroplasty: String,
    pub hip_pelvis_leg_fracture: String,
    pub acute_spinal_cord_injury: String,
    pub multiple_trauma: String,
    pub high_bleeding_risk: String,
    pub clinical_note: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.admission_type = Set(self.admission_type.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.minor_surgery = Set(self.minor_surgery.clone());
      item.recent_major_surgery = Set(self.recent_major_surgery.clone());
      item.varicose_veins = Set(self.varicose_veins.clone());
      item.inflammatory_bowel_disease = Set(self.inflammatory_bowel_disease.clone());
      item.swollen_legs = Set(self.swollen_legs.clone());
      item.obesity = Set(self.obesity.clone());
      item.acute_myocardial_infarction = Set(self.acute_myocardial_infarction.clone());
      item.congestive_heart_failure = Set(self.congestive_heart_failure.clone());
      item.sepsis = Set(self.sepsis.clone());
      item.serious_lung_disease = Set(self.serious_lung_disease.clone());
      item.abnormal_pulmonary_function = Set(self.abnormal_pulmonary_function.clone());
      item.medical_patient_bed_rest = Set(self.medical_patient_bed_rest.clone());
      item.oral_contraceptive_or_hrt = Set(self.oral_contraceptive_or_hrt.clone());
      item.pregnancy_or_postpartum = Set(self.pregnancy_or_postpartum.clone());
      item.adverse_pregnancy_history = Set(self.adverse_pregnancy_history.clone());
      item.arthroscopic_surgery = Set(self.arthroscopic_surgery.clone());
      item.major_open_surgery = Set(self.major_open_surgery.clone());
      item.laparoscopic_surgery = Set(self.laparoscopic_surgery.clone());
      item.malignancy = Set(self.malignancy.clone());
      item.confined_to_bed = Set(self.confined_to_bed.clone());
      item.immobilising_cast = Set(self.immobilising_cast.clone());
      item.central_venous_access = Set(self.central_venous_access.clone());
      item.history_of_vte = Set(self.history_of_vte.clone());
      item.family_history_of_thrombosis = Set(self.family_history_of_thrombosis.clone());
      item.factor_v_leiden = Set(self.factor_v_leiden.clone());
      item.prothrombin_20210a = Set(self.prothrombin_20210a.clone());
      item.lupus_anticoagulant = Set(self.lupus_anticoagulant.clone());
      item.anticardiolipin_antibodies = Set(self.anticardiolipin_antibodies.clone());
      item.elevated_homocysteine = Set(self.elevated_homocysteine.clone());
      item.heparin_induced_thrombocytopenia = Set(self.heparin_induced_thrombocytopenia.clone());
      item.other_thrombophilia = Set(self.other_thrombophilia.clone());
      item.stroke = Set(self.stroke.clone());
      item.elective_arthroplasty = Set(self.elective_arthroplasty.clone());
      item.hip_pelvis_leg_fracture = Set(self.hip_pelvis_leg_fracture.clone());
      item.acute_spinal_cord_injury = Set(self.acute_spinal_cord_injury.clone());
      item.multiple_trauma = Set(self.multiple_trauma.clone());
      item.high_bleeding_risk = Set(self.high_bleeding_risk.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/caprini_venous_thromboembolism_risk_assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
