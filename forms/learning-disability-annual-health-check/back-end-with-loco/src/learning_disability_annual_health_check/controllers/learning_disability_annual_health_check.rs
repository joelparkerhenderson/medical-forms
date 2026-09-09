#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::learning_disability_annual_health_checks::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub checked_on: Option<Date>,
    pub practice_name: String,
    pub easy_read_invitation_sent: String,
    pub pre_check_done: String,
    pub person_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub ld_register_status: String,
    pub main_carer: String,
    pub communication_needs: String,
    pub reasonable_adjustments_recorded: String,
    pub health_passport: String,
    pub consent_capacity_note: String,
    pub weight_bmi_status: String,
    pub bmi: Option<f64>,
    pub blood_pressure_status: String,
    pub epilepsy_status: String,
    pub constipation_status: String,
    pub dysphagia_status: String,
    pub continence_status: String,
    pub mobility_falls_status: String,
    pub dental_status: String,
    pub vision_status: String,
    pub hearing_status: String,
    pub foot_health_status: String,
    pub skin_status: String,
    pub physical_health_actions: String,
    pub cancer_screening_status: String,
    pub other_screening_status: String,
    pub immunisation_status: String,
    pub medication_reconciled: String,
    pub psychotropic_prescribed: String,
    pub psychotropic_indication: String,
    pub psychotropic_last_reviewed: Option<Date>,
    pub stomp_discussed: String,
    pub medication_side_effects: String,
    pub mental_health_status: String,
    pub behaviour_status: String,
    pub behaviour_triggers: String,
    pub syndrome_specific_status: String,
    pub carer_needs_status: String,
    pub social_circumstances: String,
    pub health_action_plan_produced: String,
    pub health_action_plan_shared: String,
    pub health_action_plan_actions: String,
    pub clinician_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.checked_on = Set(self.checked_on);
      item.practice_name = Set(self.practice_name.clone());
      item.easy_read_invitation_sent = Set(self.easy_read_invitation_sent.clone());
      item.pre_check_done = Set(self.pre_check_done.clone());
      item.person_identifier = Set(self.person_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.ld_register_status = Set(self.ld_register_status.clone());
      item.main_carer = Set(self.main_carer.clone());
      item.communication_needs = Set(self.communication_needs.clone());
      item.reasonable_adjustments_recorded = Set(self.reasonable_adjustments_recorded.clone());
      item.health_passport = Set(self.health_passport.clone());
      item.consent_capacity_note = Set(self.consent_capacity_note.clone());
      item.weight_bmi_status = Set(self.weight_bmi_status.clone());
      item.bmi = Set(self.bmi);
      item.blood_pressure_status = Set(self.blood_pressure_status.clone());
      item.epilepsy_status = Set(self.epilepsy_status.clone());
      item.constipation_status = Set(self.constipation_status.clone());
      item.dysphagia_status = Set(self.dysphagia_status.clone());
      item.continence_status = Set(self.continence_status.clone());
      item.mobility_falls_status = Set(self.mobility_falls_status.clone());
      item.dental_status = Set(self.dental_status.clone());
      item.vision_status = Set(self.vision_status.clone());
      item.hearing_status = Set(self.hearing_status.clone());
      item.foot_health_status = Set(self.foot_health_status.clone());
      item.skin_status = Set(self.skin_status.clone());
      item.physical_health_actions = Set(self.physical_health_actions.clone());
      item.cancer_screening_status = Set(self.cancer_screening_status.clone());
      item.other_screening_status = Set(self.other_screening_status.clone());
      item.immunisation_status = Set(self.immunisation_status.clone());
      item.medication_reconciled = Set(self.medication_reconciled.clone());
      item.psychotropic_prescribed = Set(self.psychotropic_prescribed.clone());
      item.psychotropic_indication = Set(self.psychotropic_indication.clone());
      item.psychotropic_last_reviewed = Set(self.psychotropic_last_reviewed);
      item.stomp_discussed = Set(self.stomp_discussed.clone());
      item.medication_side_effects = Set(self.medication_side_effects.clone());
      item.mental_health_status = Set(self.mental_health_status.clone());
      item.behaviour_status = Set(self.behaviour_status.clone());
      item.behaviour_triggers = Set(self.behaviour_triggers.clone());
      item.syndrome_specific_status = Set(self.syndrome_specific_status.clone());
      item.carer_needs_status = Set(self.carer_needs_status.clone());
      item.social_circumstances = Set(self.social_circumstances.clone());
      item.health_action_plan_produced = Set(self.health_action_plan_produced.clone());
      item.health_action_plan_shared = Set(self.health_action_plan_shared.clone());
      item.health_action_plan_actions = Set(self.health_action_plan_actions.clone());
      item.clinician_note = Set(self.clinician_note.clone());
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
        .prefix("api/learning_disability_annual_health_checks/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
