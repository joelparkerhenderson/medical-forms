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
function news2ResponseLabel(response) {
  switch (response) {
    case "low":
      return "Low (routine monitoring)";
    case "low-medium":
      return "Low-Medium (urgent ward review)";
    case "medium":
      return "Medium (urgent review)";
    case "high":
      return "High (emergency assessment)";
    default:
      return "";
  }
}
function news2ResponseColor(response) {
  switch (response) {
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    case "low-medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "medium":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
function news2ScoreColor(score) {
  if (score >= 7) return "bg-red-100 text-red-800 border-red-300";
  if (score >= 5) return "bg-orange-100 text-orange-800 border-orange-300";
  if (score >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-green-100 text-green-800 border-green-300";
}
function mtsCategoryLabel(category) {
  switch (category) {
    case "1-immediate":
      return "1 - Immediate (Red)";
    case "2-very-urgent":
      return "2 - Very Urgent (Orange)";
    case "3-urgent":
      return "3 - Urgent (Yellow)";
    case "4-standard":
      return "4 - Standard (Green)";
    case "5-non-urgent":
      return "5 - Non-Urgent (Blue)";
    default:
      return "";
  }
}
export {
  news2ResponseLabel as a,
  news2ScoreColor as b,
  calculateAge as c,
  mtsCategoryLabel as m,
  news2ResponseColor as n
};
