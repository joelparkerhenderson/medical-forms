function bmiCategory(bmi) {
  if (bmi === null) return "";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese Class I";
  if (bmi < 40) return "Obese Class II";
  return "Obese Class III (Morbid)";
}
function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = /* @__PURE__ */ new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || m === 0 && today.getDate() < birth.getDate()) {
    age--;
  }
  return age;
}
function asaGradeLabel(grade) {
  switch (grade) {
    case 1:
      return "ASA I - Healthy";
    case 2:
      return "ASA II - Mild Systemic Disease";
    case 3:
      return "ASA III - Severe Systemic Disease";
    case 4:
      return "ASA IV - Life-Threatening Disease";
    case 5:
      return "ASA V - Moribund";
    default:
      return `ASA ${grade}`;
  }
}
function asaGradeColor(grade) {
  switch (grade) {
    case 1:
      return "bg-green-100 text-green-800 border-green-300";
    case 2:
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case 3:
      return "bg-orange-100 text-orange-800 border-orange-300";
    case 4:
      return "bg-red-100 text-red-800 border-red-300";
    case 5:
      return "bg-red-200 text-red-900 border-red-400";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
export {
  asaGradeLabel as a,
  bmiCategory as b,
  calculateAge as c,
  asaGradeColor as d
};
