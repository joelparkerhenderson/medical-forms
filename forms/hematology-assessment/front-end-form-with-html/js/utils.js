/** Returns a human-readable label for an abnormality level. */
export function abnormalityLevelLabel(level) {
  const labels = {
    critical: 'Critical',
    severeAbnormality: 'Severe Abnormality',
    moderateAbnormality: 'Moderate Abnormality',
    mildAbnormality: 'Mild Abnormality',
    normal: 'Normal',
    draft: 'Draft'
  };
  return labels[level] || 'Unknown';
}

/** Calculate composite abnormality score (0-100) from lab values. */
export function calculateAbnormalityScore(data) {
  var deviations = [];

  function deviation(value, low, high, severeLow, severeHigh) {
    if (value === null || value === undefined) return null;
    if (value >= low && value <= high) return 0.0;
    if (value < low) return Math.min((low - value) / Math.max(low - severeLow, 0.01), 1.0);
    return Math.min((value - high) / Math.max(severeHigh - high, 0.01), 1.0);
  }

  var specs = [
    [data.bloodCountAnalysis.hemoglobin, 12.0, 17.0, 6.0, 22.0],
    [data.bloodCountAnalysis.hematocrit, 36.0, 52.0, 20.0, 65.0],
    [data.bloodCountAnalysis.redBloodCellCount, 4.0, 6.0, 2.0, 8.0],
    [data.bloodCountAnalysis.whiteBloodCellCount, 4.0, 11.0, 1.0, 30.0],
    [data.bloodCountAnalysis.plateletCount, 150.0, 400.0, 20.0, 1000.0],
    [data.bloodCountAnalysis.meanCorpuscularVolume, 80.0, 100.0, 50.0, 130.0],
    [data.bloodCountAnalysis.meanCorpuscularHemoglobin, 27.0, 33.0, 15.0, 45.0],
    [data.bloodCountAnalysis.redCellDistributionWidth, 11.5, 14.5, 8.0, 25.0],
    [data.coagulationStudies.prothrombinTime, 11.0, 13.5, 8.0, 30.0],
    [data.coagulationStudies.inr, 0.8, 1.2, 0.5, 5.0],
    [data.coagulationStudies.activatedPartialThromboplastinTime, 25.0, 35.0, 15.0, 80.0],
    [data.coagulationStudies.fibrinogen, 200.0, 400.0, 50.0, 800.0],
    [data.coagulationStudies.dDimer, 0.0, 0.5, 0.0, 5.0],
    [data.ironStudies.serumIron, 60.0, 170.0, 10.0, 300.0],
    [data.ironStudies.totalIronBindingCapacity, 250.0, 370.0, 100.0, 600.0],
    [data.ironStudies.transferrinSaturation, 20.0, 50.0, 5.0, 90.0],
    [data.ironStudies.serumFerritin, 20.0, 250.0, 5.0, 1000.0],
    [data.ironStudies.reticulocyteCount, 0.5, 2.5, 0.1, 10.0]
  ];

  for (var i = 0; i < specs.length; i++) {
    var d = deviation(specs[i][0], specs[i][1], specs[i][2], specs[i][3], specs[i][4]);
    if (d !== null) deviations.push(d);
  }

  if (deviations.length === 0) return null;
  var sum = deviations.reduce(function(a, b) { return a + b; }, 0);
  return Math.min(Math.round((sum / deviations.length) * 100), 100);
}

/** Collect all numeric lab values. */
export function collectNumericItems(data) {
  return [
    data.bloodCountAnalysis.hemoglobin,
    data.bloodCountAnalysis.hematocrit,
    data.bloodCountAnalysis.redBloodCellCount,
    data.bloodCountAnalysis.whiteBloodCellCount,
    data.bloodCountAnalysis.plateletCount,
    data.bloodCountAnalysis.meanCorpuscularVolume,
    data.bloodCountAnalysis.meanCorpuscularHemoglobin,
    data.bloodCountAnalysis.redCellDistributionWidth,
    data.coagulationStudies.prothrombinTime,
    data.coagulationStudies.inr,
    data.coagulationStudies.activatedPartialThromboplastinTime,
    data.coagulationStudies.fibrinogen,
    data.coagulationStudies.dDimer,
    data.coagulationStudies.bleedingTime,
    data.ironStudies.serumIron,
    data.ironStudies.totalIronBindingCapacity,
    data.ironStudies.transferrinSaturation,
    data.ironStudies.serumFerritin,
    data.ironStudies.reticulocyteCount
  ];
}

/** Get nested value from object by dot-path. */
export function getNestedValue(obj, path) {
  return path.split('.').reduce(function(o, k) { return o && o[k]; }, obj);
}

/** Set nested value in object by dot-path. */
export function setNestedValue(obj, path, value) {
  var keys = path.split('.');
  var target = obj;
  for (var i = 0; i < keys.length - 1; i++) {
    target = target[keys[i]];
  }
  target[keys[keys.length - 1]] = value;
}
