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
function mmseScoreColor(score) {
  if (score >= 24) return "bg-green-100 text-green-800 border-green-300";
  if (score >= 18) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (score >= 10) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
}
function educationLabel(level) {
  switch (level) {
    case "none":
      return "No formal education";
    case "primary":
      return "Primary school";
    case "secondary":
      return "Secondary school";
    case "university":
      return "University/College";
    case "postgraduate":
      return "Postgraduate";
    default:
      return "";
  }
}
function adlLabel(level) {
  switch (level) {
    case "independent":
      return "Independent";
    case "needs-some-help":
      return "Needs some help";
    case "needs-significant-help":
      return "Needs significant help";
    case "fully-dependent":
      return "Fully dependent";
    default:
      return "";
  }
}
export {
  adlLabel as a,
  calculateAge as c,
  educationLabel as e,
  mmseScoreColor as m
};
