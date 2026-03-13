/// Return a human-readable label for a NEWS2 clinical response level.
pub fn clinical_response_label(response: &str) -> &str {
    match response {
        "Low" => "Low risk – routine monitoring",
        "Low-Medium" => "Low-Medium risk – urgent ward review",
        "Medium" => "Medium risk – urgent review",
        "High" => "High risk – emergency assessment by critical care",
        _ => "Unknown",
    }
}

/// Calculate GCS total from eye, verbal, and motor components.
pub fn calculate_gcs(eye: Option<u8>, verbal: Option<u8>, motor: Option<u8>) -> Option<u8> {
    match (eye, verbal, motor) {
        (Some(e), Some(v), Some(m)) => Some(e + v + m),
        _ => None,
    }
}
