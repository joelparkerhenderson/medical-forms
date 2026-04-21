function completenessColor(completeness) {
  if (completeness === 100) return "bg-green-100 text-green-800 border-green-300";
  if (completeness >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-red-100 text-red-800 border-red-300";
}
export {
  completenessColor as c
};
