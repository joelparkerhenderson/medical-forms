function dashboard() {
  return {
    rows: window.SAMPLE_ASSESSMENTS || [],
    sortKey: 'date',
    sortDir: 'desc',
    filterRisk: '',
    filterUrgency: '',

    get filtered() {
      return this.rows
        .filter(
          (r) =>
            (!this.filterRisk || r.composite === this.filterRisk) &&
            (!this.filterUrgency || r.urgency === this.filterUrgency),
        )
        .sort((a, b) => {
          const av = a[this.sortKey];
          const bv = b[this.sortKey];
          if (av < bv) return this.sortDir === 'asc' ? -1 : 1;
          if (av > bv) return this.sortDir === 'asc' ? 1 : -1;
          return 0;
        });
    },

    setSort(k) {
      if (this.sortKey === k) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      else {
        this.sortKey = k;
        this.sortDir = 'asc';
      }
    },
  };
}
window.dashboard = dashboard;
