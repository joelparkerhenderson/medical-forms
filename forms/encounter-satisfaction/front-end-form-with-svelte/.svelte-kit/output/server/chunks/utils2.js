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
function satisfactionScoreColor(score) {
  if (score >= 4.5) return "bg-green-100 text-green-800 border-green-300";
  if (score >= 3.5) return "bg-blue-100 text-blue-800 border-blue-300";
  if (score >= 2.5) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (score >= 1.5) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
}
export {
  calculateAge as c,
  satisfactionScoreColor as s
};
