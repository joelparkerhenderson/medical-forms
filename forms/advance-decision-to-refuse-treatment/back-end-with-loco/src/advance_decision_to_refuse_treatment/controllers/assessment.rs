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
    pub full_name: String,
    pub address: String,
    pub postcode: String,
    pub date_of_birth: Option<Date>,
    pub nhs_number: String,
    pub gp_name: String,
    pub gp_practice: String,
    pub gp_address: String,
    pub gp_phone: String,
    pub has_mental_capacity: String,
    pub understands_consequences: String,
    pub made_voluntarily: String,
    pub capacity_assessment_date: Option<Date>,
    pub capacity_assessor_name: String,
    pub capacity_assessor_role: String,
    pub capacity_notes: String,
    pub circumstances_description: String,
    pub specific_conditions: String,
    pub applies_if_terminally_ill: String,
    pub applies_if_permanently_unconscious: String,
    pub applies_if_severely_brain_damaged: String,
    pub applies_if_advanced_dementia: String,
    pub other_circumstances: String,
    pub refuses_cardiopulmonary_resuscitation: String,
    pub refuses_mechanical_ventilation: String,
    pub refuses_artificial_nutrition: String,
    pub refuses_artificial_hydration: String,
    pub refuses_antibiotics: String,
    pub refuses_blood_transfusion: String,
    pub refuses_dialysis: String,
    pub other_treatments_refused: String,
    pub treatment_refusal_details: String,
    pub includes_life_sustaining_treatment: String,
    pub understands_may_result_in_death: String,
    pub life_sustaining_treatments_specified: String,
    pub is_written_and_signed: String,
    pub is_witnessed: String,
    pub witness_confirmation: String,
    pub has_exceptions: String,
    pub exception_details: String,
    pub pain_management_wishes: String,
    pub comfort_care_wishes: String,
    pub emergency_exception_details: String,
    pub condition_specific_exceptions: String,
    pub preferred_place_of_care: String,
    pub preferred_place_of_death: String,
    pub spiritual_or_religious_wishes: String,
    pub organ_donation_wishes: String,
    pub organ_donation_details: String,
    pub other_wishes: String,
    pub people_to_notify: String,
    pub has_health_welfare_lpa: String,
    pub lpa_registered_with_opg: String,
    pub lpa_registration_date: Option<Date>,
    pub attorney_name: String,
    pub attorney_address: String,
    pub attorney_phone: String,
    pub replacement_attorney_name: String,
    pub lpa_authority_scope: String,
    pub lpa_conflicts_with_adrt: String,
    pub lpa_conflict_details: String,
    pub reviewed_by_healthcare_professional: String,
    pub reviewer_name: String,
    pub reviewer_role: String,
    pub reviewer_registration_number: String,
    pub review_date: Option<Date>,
    pub reviewer_confirms_capacity: String,
    pub reviewer_confirms_informed: String,
    pub clinical_notes: String,
    pub concerns_raised: String,
    pub reviewer_signature_obtained: String,
    pub maker_signature_obtained: String,
    pub maker_signature_date: Option<Date>,
    pub witness_name: String,
    pub witness_address: String,
    pub witness_signature_obtained: String,
    pub witness_signature_date: Option<Date>,
    pub second_witness_name: String,
    pub second_witness_signature_obtained: String,
    pub declaration_statement_agreed: String,
    pub legal_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.status = Set(self.status.clone());
      item.full_name = Set(self.full_name.clone());
      item.address = Set(self.address.clone());
      item.postcode = Set(self.postcode.clone());
      item.date_of_birth = Set(self.date_of_birth);
      item.nhs_number = Set(self.nhs_number.clone());
      item.gp_name = Set(self.gp_name.clone());
      item.gp_practice = Set(self.gp_practice.clone());
      item.gp_address = Set(self.gp_address.clone());
      item.gp_phone = Set(self.gp_phone.clone());
      item.has_mental_capacity = Set(self.has_mental_capacity.clone());
      item.understands_consequences = Set(self.understands_consequences.clone());
      item.made_voluntarily = Set(self.made_voluntarily.clone());
      item.capacity_assessment_date = Set(self.capacity_assessment_date);
      item.capacity_assessor_name = Set(self.capacity_assessor_name.clone());
      item.capacity_assessor_role = Set(self.capacity_assessor_role.clone());
      item.capacity_notes = Set(self.capacity_notes.clone());
      item.circumstances_description = Set(self.circumstances_description.clone());
      item.specific_conditions = Set(self.specific_conditions.clone());
      item.applies_if_terminally_ill = Set(self.applies_if_terminally_ill.clone());
      item.applies_if_permanently_unconscious = Set(self.applies_if_permanently_unconscious.clone());
      item.applies_if_severely_brain_damaged = Set(self.applies_if_severely_brain_damaged.clone());
      item.applies_if_advanced_dementia = Set(self.applies_if_advanced_dementia.clone());
      item.other_circumstances = Set(self.other_circumstances.clone());
      item.refuses_cardiopulmonary_resuscitation = Set(self.refuses_cardiopulmonary_resuscitation.clone());
      item.refuses_mechanical_ventilation = Set(self.refuses_mechanical_ventilation.clone());
      item.refuses_artificial_nutrition = Set(self.refuses_artificial_nutrition.clone());
      item.refuses_artificial_hydration = Set(self.refuses_artificial_hydration.clone());
      item.refuses_antibiotics = Set(self.refuses_antibiotics.clone());
      item.refuses_blood_transfusion = Set(self.refuses_blood_transfusion.clone());
      item.refuses_dialysis = Set(self.refuses_dialysis.clone());
      item.other_treatments_refused = Set(self.other_treatments_refused.clone());
      item.treatment_refusal_details = Set(self.treatment_refusal_details.clone());
      item.includes_life_sustaining_treatment = Set(self.includes_life_sustaining_treatment.clone());
      item.understands_may_result_in_death = Set(self.understands_may_result_in_death.clone());
      item.life_sustaining_treatments_specified = Set(self.life_sustaining_treatments_specified.clone());
      item.is_written_and_signed = Set(self.is_written_and_signed.clone());
      item.is_witnessed = Set(self.is_witnessed.clone());
      item.witness_confirmation = Set(self.witness_confirmation.clone());
      item.has_exceptions = Set(self.has_exceptions.clone());
      item.exception_details = Set(self.exception_details.clone());
      item.pain_management_wishes = Set(self.pain_management_wishes.clone());
      item.comfort_care_wishes = Set(self.comfort_care_wishes.clone());
      item.emergency_exception_details = Set(self.emergency_exception_details.clone());
      item.condition_specific_exceptions = Set(self.condition_specific_exceptions.clone());
      item.preferred_place_of_care = Set(self.preferred_place_of_care.clone());
      item.preferred_place_of_death = Set(self.preferred_place_of_death.clone());
      item.spiritual_or_religious_wishes = Set(self.spiritual_or_religious_wishes.clone());
      item.organ_donation_wishes = Set(self.organ_donation_wishes.clone());
      item.organ_donation_details = Set(self.organ_donation_details.clone());
      item.other_wishes = Set(self.other_wishes.clone());
      item.people_to_notify = Set(self.people_to_notify.clone());
      item.has_health_welfare_lpa = Set(self.has_health_welfare_lpa.clone());
      item.lpa_registered_with_opg = Set(self.lpa_registered_with_opg.clone());
      item.lpa_registration_date = Set(self.lpa_registration_date);
      item.attorney_name = Set(self.attorney_name.clone());
      item.attorney_address = Set(self.attorney_address.clone());
      item.attorney_phone = Set(self.attorney_phone.clone());
      item.replacement_attorney_name = Set(self.replacement_attorney_name.clone());
      item.lpa_authority_scope = Set(self.lpa_authority_scope.clone());
      item.lpa_conflicts_with_adrt = Set(self.lpa_conflicts_with_adrt.clone());
      item.lpa_conflict_details = Set(self.lpa_conflict_details.clone());
      item.reviewed_by_healthcare_professional = Set(self.reviewed_by_healthcare_professional.clone());
      item.reviewer_name = Set(self.reviewer_name.clone());
      item.reviewer_role = Set(self.reviewer_role.clone());
      item.reviewer_registration_number = Set(self.reviewer_registration_number.clone());
      item.review_date = Set(self.review_date);
      item.reviewer_confirms_capacity = Set(self.reviewer_confirms_capacity.clone());
      item.reviewer_confirms_informed = Set(self.reviewer_confirms_informed.clone());
      item.clinical_notes = Set(self.clinical_notes.clone());
      item.concerns_raised = Set(self.concerns_raised.clone());
      item.reviewer_signature_obtained = Set(self.reviewer_signature_obtained.clone());
      item.maker_signature_obtained = Set(self.maker_signature_obtained.clone());
      item.maker_signature_date = Set(self.maker_signature_date);
      item.witness_name = Set(self.witness_name.clone());
      item.witness_address = Set(self.witness_address.clone());
      item.witness_signature_obtained = Set(self.witness_signature_obtained.clone());
      item.witness_signature_date = Set(self.witness_signature_date);
      item.second_witness_name = Set(self.second_witness_name.clone());
      item.second_witness_signature_obtained = Set(self.second_witness_signature_obtained.clone());
      item.declaration_statement_agreed = Set(self.declaration_statement_agreed.clone());
      item.legal_notes = Set(self.legal_notes.clone());
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
