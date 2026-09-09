#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::medical_information_form_for_air_travels::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub submitter_name: String,
    pub submitter_role: String,
    pub submitter_email: String,
    pub submitter_phone: String,
    pub submitter_organisation: String,
    pub airline_booking_reference: String,
    pub airline_iata_code: String,
    pub airline_name: String,
    pub outbound_flight_number: String,
    pub outbound_date: Option<Date>,
    pub outbound_origin_iata: String,
    pub outbound_destination_iata: String,
    pub return_flight_number: String,
    pub return_date: Option<Date>,
    pub cabin_class: String,
    pub sector_duration_minutes: Option<i32>,
    pub transit_airports_iata: String,
    pub special_assistance_codes: String,
    pub reason_equipment: String,
    pub reason_recent_acute_event: String,
    pub reason_unstable_condition: String,
    pub reason_communicable_disease: String,
    pub reason_pregnancy: String,
    pub reason_mobility_escort: String,
    pub reason_psychiatric: String,
    pub primary_diagnosis: String,
    pub icd10_codes: String,
    pub diagnosis_date: Option<Date>,
    pub current_treatment: String,
    pub last_admission_date: Option<Date>,
    pub last_discharge_date: Option<Date>,
    pub last_specialist_review_date: Option<Date>,
    pub resting_systolic_bp: Option<i32>,
    pub resting_diastolic_bp: Option<i32>,
    pub resting_heart_rate: Option<i32>,
    pub nyha_class: String,
    pub recent_mi_date: Option<Date>,
    pub recent_stent_date: Option<Date>,
    pub on_anticoagulant: String,
    pub pacemaker_or_icd: String,
    pub exercise_tolerance_metres: Option<i32>,
    pub unstable_angina: String,
    pub resting_spo2_percent: Option<f64>,
    pub predicted_inflight_spo2_percent: Option<f64>,
    pub hypoxic_challenge_result: String,
    pub recent_pneumothorax_date: Option<Date>,
    pub asthma_severity: String,
    pub copd_severity: String,
    pub cpap_or_bipap_use: String,
    pub recent_pulmonary_embolism_date: Option<Date>,
    pub last_surgery_date: Option<Date>,
    pub last_surgery_site: String,
    pub cabin_gas_risk: String,
    pub recent_fracture_cast: String,
    pub recent_dvt_date: Option<Date>,
    pub scuba_diving_within_24h: String,
    pub recent_stroke_date: Option<Date>,
    pub is_pregnant: String,
    pub gestation_weeks: Option<i32>,
    pub pregnancy_type: String,
    pub pregnancy_complications: String,
    pub expected_delivery_date: Option<Date>,
    pub obstetrician_contact: String,
    pub communicable_disease_status: String,
    pub last_symptom_date: Option<Date>,
    pub isolation_required: String,
    pub vaccination_status: String,
    pub current_antimicrobials: String,
    pub requires_supplemental_oxygen: String,
    pub oxygen_flow_rate_lpm: Option<f64>,
    pub oxygen_duration: String,
    pub requires_poc: String,
    pub poc_make_model: String,
    pub poc_battery_hours: Option<f64>,
    pub requires_stretcher: String,
    pub requires_incubator: String,
    pub requires_iv_pump: String,
    pub requires_medical_escort: String,
    pub requires_extra_seat: String,
    pub requires_accessible_lavatory: String,
    pub wheelchair_type: String,
    pub accompanying_carer: String,
    pub regular_medications: String,
    pub controlled_drugs: String,
    pub dangerous_goods_battery_declaration: String,
    pub sharps_in_cabin: String,
    pub refrigerated_medication: String,
    pub customs_documentation_available: String,
    pub haemoglobin_g_per_l: Option<i32>,
    pub physician_declaration: String,
    pub physician_signature_name: String,
    pub physician_signature_date: Option<Date>,
    pub valid_until_date: Option<Date>,
    pub additional_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.submitter_name = Set(self.submitter_name.clone());
      item.submitter_role = Set(self.submitter_role.clone());
      item.submitter_email = Set(self.submitter_email.clone());
      item.submitter_phone = Set(self.submitter_phone.clone());
      item.submitter_organisation = Set(self.submitter_organisation.clone());
      item.airline_booking_reference = Set(self.airline_booking_reference.clone());
      item.airline_iata_code = Set(self.airline_iata_code.clone());
      item.airline_name = Set(self.airline_name.clone());
      item.outbound_flight_number = Set(self.outbound_flight_number.clone());
      item.outbound_date = Set(self.outbound_date);
      item.outbound_origin_iata = Set(self.outbound_origin_iata.clone());
      item.outbound_destination_iata = Set(self.outbound_destination_iata.clone());
      item.return_flight_number = Set(self.return_flight_number.clone());
      item.return_date = Set(self.return_date);
      item.cabin_class = Set(self.cabin_class.clone());
      item.sector_duration_minutes = Set(self.sector_duration_minutes);
      item.transit_airports_iata = Set(self.transit_airports_iata.clone());
      item.special_assistance_codes = Set(self.special_assistance_codes.clone());
      item.reason_equipment = Set(self.reason_equipment.clone());
      item.reason_recent_acute_event = Set(self.reason_recent_acute_event.clone());
      item.reason_unstable_condition = Set(self.reason_unstable_condition.clone());
      item.reason_communicable_disease = Set(self.reason_communicable_disease.clone());
      item.reason_pregnancy = Set(self.reason_pregnancy.clone());
      item.reason_mobility_escort = Set(self.reason_mobility_escort.clone());
      item.reason_psychiatric = Set(self.reason_psychiatric.clone());
      item.primary_diagnosis = Set(self.primary_diagnosis.clone());
      item.icd10_codes = Set(self.icd10_codes.clone());
      item.diagnosis_date = Set(self.diagnosis_date);
      item.current_treatment = Set(self.current_treatment.clone());
      item.last_admission_date = Set(self.last_admission_date);
      item.last_discharge_date = Set(self.last_discharge_date);
      item.last_specialist_review_date = Set(self.last_specialist_review_date);
      item.resting_systolic_bp = Set(self.resting_systolic_bp);
      item.resting_diastolic_bp = Set(self.resting_diastolic_bp);
      item.resting_heart_rate = Set(self.resting_heart_rate);
      item.nyha_class = Set(self.nyha_class.clone());
      item.recent_mi_date = Set(self.recent_mi_date);
      item.recent_stent_date = Set(self.recent_stent_date);
      item.on_anticoagulant = Set(self.on_anticoagulant.clone());
      item.pacemaker_or_icd = Set(self.pacemaker_or_icd.clone());
      item.exercise_tolerance_metres = Set(self.exercise_tolerance_metres);
      item.unstable_angina = Set(self.unstable_angina.clone());
      item.resting_spo2_percent = Set(self.resting_spo2_percent);
      item.predicted_inflight_spo2_percent = Set(self.predicted_inflight_spo2_percent);
      item.hypoxic_challenge_result = Set(self.hypoxic_challenge_result.clone());
      item.recent_pneumothorax_date = Set(self.recent_pneumothorax_date);
      item.asthma_severity = Set(self.asthma_severity.clone());
      item.copd_severity = Set(self.copd_severity.clone());
      item.cpap_or_bipap_use = Set(self.cpap_or_bipap_use.clone());
      item.recent_pulmonary_embolism_date = Set(self.recent_pulmonary_embolism_date);
      item.last_surgery_date = Set(self.last_surgery_date);
      item.last_surgery_site = Set(self.last_surgery_site.clone());
      item.cabin_gas_risk = Set(self.cabin_gas_risk.clone());
      item.recent_fracture_cast = Set(self.recent_fracture_cast.clone());
      item.recent_dvt_date = Set(self.recent_dvt_date);
      item.scuba_diving_within_24h = Set(self.scuba_diving_within_24h.clone());
      item.recent_stroke_date = Set(self.recent_stroke_date);
      item.is_pregnant = Set(self.is_pregnant.clone());
      item.gestation_weeks = Set(self.gestation_weeks);
      item.pregnancy_type = Set(self.pregnancy_type.clone());
      item.pregnancy_complications = Set(self.pregnancy_complications.clone());
      item.expected_delivery_date = Set(self.expected_delivery_date);
      item.obstetrician_contact = Set(self.obstetrician_contact.clone());
      item.communicable_disease_status = Set(self.communicable_disease_status.clone());
      item.last_symptom_date = Set(self.last_symptom_date);
      item.isolation_required = Set(self.isolation_required.clone());
      item.vaccination_status = Set(self.vaccination_status.clone());
      item.current_antimicrobials = Set(self.current_antimicrobials.clone());
      item.requires_supplemental_oxygen = Set(self.requires_supplemental_oxygen.clone());
      item.oxygen_flow_rate_lpm = Set(self.oxygen_flow_rate_lpm);
      item.oxygen_duration = Set(self.oxygen_duration.clone());
      item.requires_poc = Set(self.requires_poc.clone());
      item.poc_make_model = Set(self.poc_make_model.clone());
      item.poc_battery_hours = Set(self.poc_battery_hours);
      item.requires_stretcher = Set(self.requires_stretcher.clone());
      item.requires_incubator = Set(self.requires_incubator.clone());
      item.requires_iv_pump = Set(self.requires_iv_pump.clone());
      item.requires_medical_escort = Set(self.requires_medical_escort.clone());
      item.requires_extra_seat = Set(self.requires_extra_seat.clone());
      item.requires_accessible_lavatory = Set(self.requires_accessible_lavatory.clone());
      item.wheelchair_type = Set(self.wheelchair_type.clone());
      item.accompanying_carer = Set(self.accompanying_carer.clone());
      item.regular_medications = Set(self.regular_medications.clone());
      item.controlled_drugs = Set(self.controlled_drugs.clone());
      item.dangerous_goods_battery_declaration = Set(self.dangerous_goods_battery_declaration.clone());
      item.sharps_in_cabin = Set(self.sharps_in_cabin.clone());
      item.refrigerated_medication = Set(self.refrigerated_medication.clone());
      item.customs_documentation_available = Set(self.customs_documentation_available.clone());
      item.haemoglobin_g_per_l = Set(self.haemoglobin_g_per_l);
      item.physician_declaration = Set(self.physician_declaration.clone());
      item.physician_signature_name = Set(self.physician_signature_name.clone());
      item.physician_signature_date = Set(self.physician_signature_date);
      item.valid_until_date = Set(self.valid_until_date);
      item.additional_notes = Set(self.additional_notes.clone());
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
        .prefix("api/medical_information_form_for_air_travels/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
