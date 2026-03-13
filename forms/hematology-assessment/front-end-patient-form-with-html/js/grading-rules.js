/** All hematology grading rules. */
export function allRules() {
  return [
    { id: 'HEM-001', category: 'Blood Count', description: 'Critical hemoglobin level (<7 g/dL) - severe anemia', concernLevel: 'high', evaluate: function(d) { return d.bloodCountAnalysis.hemoglobin !== null && d.bloodCountAnalysis.hemoglobin < 7.0; } },
    { id: 'HEM-002', category: 'Blood Count', description: 'Severe thrombocytopenia (platelets <20 x10^9/L) - bleeding risk', concernLevel: 'high', evaluate: function(d) { return d.bloodCountAnalysis.plateletCount !== null && d.bloodCountAnalysis.plateletCount < 20.0; } },
    { id: 'HEM-003', category: 'Blood Count', description: 'Severe leukocytosis (WBC >30 x10^9/L) - possible malignancy', concernLevel: 'high', evaluate: function(d) { return d.bloodCountAnalysis.whiteBloodCellCount !== null && d.bloodCountAnalysis.whiteBloodCellCount > 30.0; } },
    { id: 'HEM-004', category: 'Coagulation', description: 'Critically elevated INR (>4.0) - major hemorrhage risk', concernLevel: 'high', evaluate: function(d) { return d.coagulationStudies.inr !== null && d.coagulationStudies.inr > 4.0; } },
    { id: 'HEM-005', category: 'Coagulation', description: 'Severely low fibrinogen (<100 mg/dL) - DIC risk', concernLevel: 'high', evaluate: function(d) { return d.coagulationStudies.fibrinogen !== null && d.coagulationStudies.fibrinogen < 100.0; } },
    { id: 'HEM-006', category: 'Blood Count', description: 'Moderate anemia (hemoglobin 7-10 g/dL)', concernLevel: 'medium', evaluate: function(d) { var v = d.bloodCountAnalysis.hemoglobin; return v !== null && v >= 7.0 && v < 10.0; } },
    { id: 'HEM-007', category: 'Blood Count', description: 'Moderate thrombocytopenia (platelets 20-50 x10^9/L)', concernLevel: 'medium', evaluate: function(d) { var v = d.bloodCountAnalysis.plateletCount; return v !== null && v >= 20.0 && v < 50.0; } },
    { id: 'HEM-008', category: 'Blood Count', description: 'Leukopenia (WBC <4.0 x10^9/L) - infection risk', concernLevel: 'medium', evaluate: function(d) { return d.bloodCountAnalysis.whiteBloodCellCount !== null && d.bloodCountAnalysis.whiteBloodCellCount < 4.0; } },
    { id: 'HEM-009', category: 'Blood Count', description: 'Microcytosis (MCV <80 fL) - possible iron deficiency', concernLevel: 'medium', evaluate: function(d) { return d.bloodCountAnalysis.meanCorpuscularVolume !== null && d.bloodCountAnalysis.meanCorpuscularVolume < 80.0; } },
    { id: 'HEM-010', category: 'Blood Count', description: 'Macrocytosis (MCV >100 fL) - possible B12/folate deficiency', concernLevel: 'medium', evaluate: function(d) { return d.bloodCountAnalysis.meanCorpuscularVolume !== null && d.bloodCountAnalysis.meanCorpuscularVolume > 100.0; } },
    { id: 'HEM-011', category: 'Coagulation', description: 'Elevated INR (1.5-4.0) - coagulopathy', concernLevel: 'medium', evaluate: function(d) { var v = d.coagulationStudies.inr; return v !== null && v > 1.5 && v <= 4.0; } },
    { id: 'HEM-012', category: 'Coagulation', description: 'Elevated D-dimer (>2.0 mg/L) - thrombotic concern', concernLevel: 'medium', evaluate: function(d) { return d.coagulationStudies.dDimer !== null && d.coagulationStudies.dDimer > 2.0; } },
    { id: 'HEM-013', category: 'Iron Studies', description: 'Severely depleted ferritin (<10 ng/mL) - iron deficiency', concernLevel: 'medium', evaluate: function(d) { return d.ironStudies.serumFerritin !== null && d.ironStudies.serumFerritin < 10.0; } },
    { id: 'HEM-014', category: 'Iron Studies', description: 'Iron overload (ferritin >500 ng/mL) - hemochromatosis risk', concernLevel: 'medium', evaluate: function(d) { return d.ironStudies.serumFerritin !== null && d.ironStudies.serumFerritin > 500.0; } }
  ];
}
