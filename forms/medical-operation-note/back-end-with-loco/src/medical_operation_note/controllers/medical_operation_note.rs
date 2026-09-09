//! Medical operation note controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_operation_notes::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a medical operation note record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Status.
    pub status: String,
    /// Hospital name.
    pub hospital_name: String,
    /// Theatre number.
    pub theatre_number: String,
    /// List type.
    pub list_type: String,
    /// Case start at.
    pub case_start_at: Option<DateTimeWithTimeZone>,
    /// Anaesthesia start at.
    pub anaesthesia_start_at: Option<DateTimeWithTimeZone>,
    /// Knife to skin at.
    pub knife_to_skin_at: Option<DateTimeWithTimeZone>,
    /// End of surgery at.
    pub end_of_surgery_at: Option<DateTimeWithTimeZone>,
    /// Case end at.
    pub case_end_at: Option<DateTimeWithTimeZone>,
    /// Consent status.
    pub consent_status: String,
    /// Side marked.
    pub side_marked: String,
    /// Sign in completed.
    pub sign_in_completed: String,
    /// Asa physical status.
    pub asa_physical_status: String,
    /// Pre operative diagnosis.
    pub pre_operative_diagnosis: String,
    /// Post operative diagnosis.
    pub post_operative_diagnosis: String,
    /// Indication.
    pub indication: String,
    /// Urgency.
    pub urgency: String,
    /// Laterality.
    pub laterality: String,
    /// Anaesthesia type.
    pub anaesthesia_type: String,
    /// Airway management.
    pub airway_management: String,
    /// Induction agent.
    pub induction_agent: String,
    /// Maintenance agent.
    pub maintenance_agent: String,
    /// Neuromuscular blockade.
    pub neuromuscular_blockade: String,
    /// Regional block description.
    pub regional_block_description: String,
    /// Invasive monitoring.
    pub invasive_monitoring: String,
    /// Intraop crystalloid ml.
    pub intraop_crystalloid_ml: Option<i32>,
    /// Intraop colloid ml.
    pub intraop_colloid_ml: Option<i32>,
    /// Intraop blood ml.
    pub intraop_blood_ml: Option<i32>,
    /// Intraop urine ml.
    pub intraop_urine_ml: Option<i32>,
    /// Anaesthetic event.
    pub anaesthetic_event: String,
    /// Anaesthetic event description.
    pub anaesthetic_event_description: String,
    /// Patient position.
    pub patient_position: String,
    /// Pressure area protection notes.
    pub pressure_area_protection_notes: String,
    /// Prep solution.
    pub prep_solution: String,
    /// Drape type.
    pub drape_type: String,
    /// Surgical approach.
    pub surgical_approach: String,
    /// Incision type.
    pub incision_type: String,
    /// Incision length cm.
    pub incision_length_cm: Option<f64>,
    /// Table tilt.
    pub table_tilt: String,
    /// Tourniquet used.
    pub tourniquet_used: String,
    /// Tourniquet site.
    pub tourniquet_site: String,
    /// Tourniquet pressure mmhg.
    pub tourniquet_pressure_mmhg: Option<i32>,
    /// Tourniquet on at.
    pub tourniquet_on_at: Option<DateTimeWithTimeZone>,
    /// Tourniquet off at.
    pub tourniquet_off_at: Option<DateTimeWithTimeZone>,
    /// Converted to open.
    pub converted_to_open: String,
    /// Conversion reason.
    pub conversion_reason: String,
    /// Operative findings summary.
    pub operative_findings_summary: String,
    /// Pathology found.
    pub pathology_found: String,
    /// Anatomical anomalies.
    pub anatomical_anomalies: String,
    /// Intraop photographs taken.
    pub intraop_photographs_taken: String,
    /// Frozen section requested.
    pub frozen_section_requested: String,
    /// Swab count first agreed.
    pub swab_count_first_agreed: String,
    /// Swab count final agreed.
    pub swab_count_final_agreed: String,
    /// Needle count first agreed.
    pub needle_count_first_agreed: String,
    /// Needle count final agreed.
    pub needle_count_final_agreed: String,
    /// Instrument count first agreed.
    pub instrument_count_first_agreed: String,
    /// Instrument count final agreed.
    pub instrument_count_final_agreed: String,
    /// Count discrepancy resolution.
    pub count_discrepancy_resolution: String,
    /// Estimated blood loss ml.
    pub estimated_blood_loss_ml: Option<i32>,
    /// Transfusion given.
    pub transfusion_given: String,
    /// Prbc units.
    pub prbc_units: Option<i32>,
    /// Ffp units.
    pub ffp_units: Option<i32>,
    /// Platelet units.
    pub platelet_units: Option<i32>,
    /// Cryoprecipitate units.
    pub cryoprecipitate_units: Option<i32>,
    /// Cell salvage ml.
    pub cell_salvage_ml: Option<i32>,
    /// Massive haemorrhage protocol activated.
    pub massive_haemorrhage_protocol_activated: String,
    /// Never event flagged.
    pub never_event_flagged: String,
    /// Never event description.
    pub never_event_description: String,
    /// Equipment problem.
    pub equipment_problem: String,
    /// Equipment problem description.
    pub equipment_problem_description: String,
    /// Recovery destination.
    pub recovery_destination: String,
    /// Monitoring frequency.
    pub monitoring_frequency: String,
    /// IV fluids plan.
    pub iv_fluids_plan: String,
    /// Analgesia plan.
    pub analgesia_plan: String,
    /// Antibiotic plan.
    pub antibiotic_plan: String,
    /// Vte prophylaxis plan.
    pub vte_prophylaxis_plan: String,
    /// Diet plan.
    pub diet_plan: String,
    /// Mobilisation plan.
    pub mobilisation_plan: String,
    /// Wound care plan.
    pub wound_care_plan: String,
    /// Follow up plan.
    pub follow_up_plan: String,
    /// Special instructions.
    pub special_instructions: String,
    /// Sign out completed.
    pub sign_out_completed: String,
    /// Debrief completed.
    pub debrief_completed: String,
    /// Surgeon override grade.
    pub surgeon_override_grade: String,
    /// Surgeon override reason.
    pub surgeon_override_reason: String,
    /// Attestation text.
    pub attestation_text: String,
    /// Electronic signature.
    pub electronic_signature: String,
    /// Dictated at.
    pub dictated_at: Option<DateTimeWithTimeZone>,
    /// Signed at.
    pub signed_at: Option<DateTimeWithTimeZone>,
    /// Patient ID.
    pub patient_id: i64,
    /// Lead surgeon ID.
    pub lead_surgeon_id: i64,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.status = Set(self.status.clone());
      item.hospital_name = Set(self.hospital_name.clone());
      item.theatre_number = Set(self.theatre_number.clone());
      item.list_type = Set(self.list_type.clone());
      item.case_start_at = Set(self.case_start_at);
      item.anaesthesia_start_at = Set(self.anaesthesia_start_at);
      item.knife_to_skin_at = Set(self.knife_to_skin_at);
      item.end_of_surgery_at = Set(self.end_of_surgery_at);
      item.case_end_at = Set(self.case_end_at);
      item.consent_status = Set(self.consent_status.clone());
      item.side_marked = Set(self.side_marked.clone());
      item.sign_in_completed = Set(self.sign_in_completed.clone());
      item.asa_physical_status = Set(self.asa_physical_status.clone());
      item.pre_operative_diagnosis = Set(self.pre_operative_diagnosis.clone());
      item.post_operative_diagnosis = Set(self.post_operative_diagnosis.clone());
      item.indication = Set(self.indication.clone());
      item.urgency = Set(self.urgency.clone());
      item.laterality = Set(self.laterality.clone());
      item.anaesthesia_type = Set(self.anaesthesia_type.clone());
      item.airway_management = Set(self.airway_management.clone());
      item.induction_agent = Set(self.induction_agent.clone());
      item.maintenance_agent = Set(self.maintenance_agent.clone());
      item.neuromuscular_blockade = Set(self.neuromuscular_blockade.clone());
      item.regional_block_description = Set(self.regional_block_description.clone());
      item.invasive_monitoring = Set(self.invasive_monitoring.clone());
      item.intraop_crystalloid_ml = Set(self.intraop_crystalloid_ml);
      item.intraop_colloid_ml = Set(self.intraop_colloid_ml);
      item.intraop_blood_ml = Set(self.intraop_blood_ml);
      item.intraop_urine_ml = Set(self.intraop_urine_ml);
      item.anaesthetic_event = Set(self.anaesthetic_event.clone());
      item.anaesthetic_event_description = Set(self.anaesthetic_event_description.clone());
      item.patient_position = Set(self.patient_position.clone());
      item.pressure_area_protection_notes = Set(self.pressure_area_protection_notes.clone());
      item.prep_solution = Set(self.prep_solution.clone());
      item.drape_type = Set(self.drape_type.clone());
      item.surgical_approach = Set(self.surgical_approach.clone());
      item.incision_type = Set(self.incision_type.clone());
      item.incision_length_cm = Set(self.incision_length_cm);
      item.table_tilt = Set(self.table_tilt.clone());
      item.tourniquet_used = Set(self.tourniquet_used.clone());
      item.tourniquet_site = Set(self.tourniquet_site.clone());
      item.tourniquet_pressure_mmhg = Set(self.tourniquet_pressure_mmhg);
      item.tourniquet_on_at = Set(self.tourniquet_on_at);
      item.tourniquet_off_at = Set(self.tourniquet_off_at);
      item.converted_to_open = Set(self.converted_to_open.clone());
      item.conversion_reason = Set(self.conversion_reason.clone());
      item.operative_findings_summary = Set(self.operative_findings_summary.clone());
      item.pathology_found = Set(self.pathology_found.clone());
      item.anatomical_anomalies = Set(self.anatomical_anomalies.clone());
      item.intraop_photographs_taken = Set(self.intraop_photographs_taken.clone());
      item.frozen_section_requested = Set(self.frozen_section_requested.clone());
      item.swab_count_first_agreed = Set(self.swab_count_first_agreed.clone());
      item.swab_count_final_agreed = Set(self.swab_count_final_agreed.clone());
      item.needle_count_first_agreed = Set(self.needle_count_first_agreed.clone());
      item.needle_count_final_agreed = Set(self.needle_count_final_agreed.clone());
      item.instrument_count_first_agreed = Set(self.instrument_count_first_agreed.clone());
      item.instrument_count_final_agreed = Set(self.instrument_count_final_agreed.clone());
      item.count_discrepancy_resolution = Set(self.count_discrepancy_resolution.clone());
      item.estimated_blood_loss_ml = Set(self.estimated_blood_loss_ml);
      item.transfusion_given = Set(self.transfusion_given.clone());
      item.prbc_units = Set(self.prbc_units);
      item.ffp_units = Set(self.ffp_units);
      item.platelet_units = Set(self.platelet_units);
      item.cryoprecipitate_units = Set(self.cryoprecipitate_units);
      item.cell_salvage_ml = Set(self.cell_salvage_ml);
      item.massive_haemorrhage_protocol_activated = Set(self.massive_haemorrhage_protocol_activated.clone());
      item.never_event_flagged = Set(self.never_event_flagged.clone());
      item.never_event_description = Set(self.never_event_description.clone());
      item.equipment_problem = Set(self.equipment_problem.clone());
      item.equipment_problem_description = Set(self.equipment_problem_description.clone());
      item.recovery_destination = Set(self.recovery_destination.clone());
      item.monitoring_frequency = Set(self.monitoring_frequency.clone());
      item.iv_fluids_plan = Set(self.iv_fluids_plan.clone());
      item.analgesia_plan = Set(self.analgesia_plan.clone());
      item.antibiotic_plan = Set(self.antibiotic_plan.clone());
      item.vte_prophylaxis_plan = Set(self.vte_prophylaxis_plan.clone());
      item.diet_plan = Set(self.diet_plan.clone());
      item.mobilisation_plan = Set(self.mobilisation_plan.clone());
      item.wound_care_plan = Set(self.wound_care_plan.clone());
      item.follow_up_plan = Set(self.follow_up_plan.clone());
      item.special_instructions = Set(self.special_instructions.clone());
      item.sign_out_completed = Set(self.sign_out_completed.clone());
      item.debrief_completed = Set(self.debrief_completed.clone());
      item.surgeon_override_grade = Set(self.surgeon_override_grade.clone());
      item.surgeon_override_reason = Set(self.surgeon_override_reason.clone());
      item.attestation_text = Set(self.attestation_text.clone());
      item.electronic_signature = Set(self.electronic_signature.clone());
      item.dictated_at = Set(self.dictated_at);
      item.signed_at = Set(self.signed_at);
      item.patient_id = Set(self.patient_id);
      item.lead_surgeon_id = Set(self.lead_surgeon_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every medical operation note record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new medical operation note record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the medical operation note record identified by `id`.
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

/// Remove the medical operation note record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single medical operation note record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// Build the routes for the medical operation notes resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/medical_operation_notes/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
