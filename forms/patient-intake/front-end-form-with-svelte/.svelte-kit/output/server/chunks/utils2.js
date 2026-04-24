function riskLevelLabel(level) {
  switch (level) {
    case "low":
      return "Low Risk - Healthy, minimal risk factors";
    case "medium":
      return "Medium Risk - Controlled chronic conditions, some risk factors";
    case "high":
      return "High Risk - Uncontrolled conditions, multiple comorbidities";
    default:
      return `Risk: ${level}`;
  }
}
function riskLevelColor(level) {
  switch (level) {
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
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
export {
  riskLevelColor as a,
  calculateAge as c,
  riskLevelLabel as r
};
