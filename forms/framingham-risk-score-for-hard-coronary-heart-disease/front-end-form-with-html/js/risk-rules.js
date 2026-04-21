import { convertMmolToMg, calculateBmi, isSmoker } from './utils.js';

function getTcMg(d) {
  if (d.cholesterol.totalCholesterol === null) return null;
  return d.cholesterol.cholesterolUnit === 'mmolL'
    ? convertMmolToMg(d.cholesterol.totalCholesterol) : d.cholesterol.totalCholesterol;
}
function getHdlMg(d) {
  if (d.cholesterol.hdlCholesterol === null) return null;
  return d.cholesterol.cholesterolUnit === 'mmolL'
    ? convertMmolToMg(d.cholesterol.hdlCholesterol) : d.cholesterol.hdlCholesterol;
}
function getBmi(d) {
  return d.lifestyleFactors.bmi ?? calculateBmi(d.demographics.heightCm, d.demographics.weightKg);
}

export function allRules() {
  return [
    { id:'FRS-001', category:'Overall Risk', description:'10-year CHD risk >= 20% (high risk)', riskLevel:'high', evaluate:(_d,r)=>r>=20 },
    { id:'FRS-002', category:'Blood Pressure', description:'Systolic BP >= 180 mmHg (hypertensive crisis)', riskLevel:'high', evaluate:(d)=>d.bloodPressure.systolicBp!==null&&d.bloodPressure.systolicBp>=180 },
    { id:'FRS-003', category:'Cholesterol', description:'Total cholesterol >= 310 mg/dL', riskLevel:'high', evaluate:(d)=>{const t=getTcMg(d);return t!==null&&t>=310;} },
    { id:'FRS-004', category:'Cholesterol', description:'HDL < 30 mg/dL (critically low)', riskLevel:'high', evaluate:(d)=>{const h=getHdlMg(d);return h!==null&&h<30;} },
    { id:'FRS-005', category:'Combined Risk', description:'Multiple risk factors: age>=60, smoker, BP>=140, TC>=240', riskLevel:'high', evaluate:(d)=>{return d.demographics.age>=60&&isSmoker(d.smokingHistory.smokingStatus)&&d.bloodPressure.systolicBp>=140&&(getTcMg(d)??0)>=240;} },
    { id:'FRS-006', category:'Overall Risk', description:'10-year CHD risk 10-19.9% (intermediate)', riskLevel:'medium', evaluate:(_d,r)=>r>=10&&r<20 },
    { id:'FRS-007', category:'Smoking', description:'Current smoker', riskLevel:'medium', evaluate:(d)=>isSmoker(d.smokingHistory.smokingStatus) },
    { id:'FRS-008', category:'Blood Pressure', description:'Systolic BP 140-179 mmHg', riskLevel:'medium', evaluate:(d)=>d.bloodPressure.systolicBp!==null&&d.bloodPressure.systolicBp>=140&&d.bloodPressure.systolicBp<180 },
    { id:'FRS-009', category:'Cholesterol', description:'Total cholesterol 240-309 mg/dL', riskLevel:'medium', evaluate:(d)=>{const t=getTcMg(d);return t!==null&&t>=240&&t<310;} },
    { id:'FRS-010', category:'Cholesterol', description:'HDL 30-39 mg/dL (low)', riskLevel:'medium', evaluate:(d)=>{const h=getHdlMg(d);return h!==null&&h>=30&&h<40;} },
    { id:'FRS-011', category:'Blood Pressure', description:'On BP treatment', riskLevel:'medium', evaluate:(d)=>d.bloodPressure.onBpTreatment==='yes' },
    { id:'FRS-012', category:'Family History', description:'Premature family CHD history', riskLevel:'medium', evaluate:(d)=>d.familyHistory.familyChdHistory==='yes'&&d.familyHistory.familyChdAgeOnset==='under55' },
    { id:'FRS-013', category:'Lifestyle', description:'BMI >= 30 (obese)', riskLevel:'medium', evaluate:(d)=>{const b=getBmi(d);return b!==null&&b>=30;} },
    { id:'FRS-014', category:'Lifestyle', description:'Sedentary lifestyle', riskLevel:'medium', evaluate:(d)=>d.lifestyleFactors.physicalActivity==='sedentary' },
    { id:'FRS-015', category:'Demographics', description:'Age >= 65', riskLevel:'medium', evaluate:(d)=>d.demographics.age!==null&&d.demographics.age>=65 },
    { id:'FRS-016', category:'Cholesterol', description:'HDL >= 60 mg/dL (protective)', riskLevel:'low', evaluate:(d)=>{const h=getHdlMg(d);return h!==null&&h>=60;} },
    { id:'FRS-017', category:'Smoking', description:'Non-smoker', riskLevel:'low', evaluate:(d)=>!isSmoker(d.smokingHistory.smokingStatus)&&d.smokingHistory.smokingStatus!=='' },
    { id:'FRS-018', category:'Blood Pressure', description:'Normal BP (<120/80) untreated', riskLevel:'low', evaluate:(d)=>d.bloodPressure.systolicBp!==null&&d.bloodPressure.systolicBp<120&&d.bloodPressure.diastolicBp!==null&&d.bloodPressure.diastolicBp<80&&d.bloodPressure.onBpTreatment!=='yes' },
    { id:'FRS-019', category:'Cholesterol', description:'Total cholesterol < 200 mg/dL (optimal)', riskLevel:'low', evaluate:(d)=>{const t=getTcMg(d);return t!==null&&t<200;} },
    { id:'FRS-020', category:'Lifestyle', description:'Physically active', riskLevel:'low', evaluate:(d)=>d.lifestyleFactors.physicalActivity==='moderate'||d.lifestyleFactors.physicalActivity==='vigorous' },
  ];
}
