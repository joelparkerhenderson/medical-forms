// Pre-operative Assessment by Clinician — Alpine.js component
// Single-page wizard with 16 sections and ASA composite grading.
// Engine mirrors the SvelteKit version but is a subset.

function assessment() {
  return {
    stepTitles: [
      'Clinician identification',
      'Patient & procedure',
      'Vital signs',
      'Airway',
      'Cardiovascular',
      'Respiratory',
      'Neurological',
      'Renal & hepatic',
      'Haematology',
      'Endocrine',
      'Gastrointestinal',
      'Musculoskeletal & skin',
      'Medications & allergies',
      'Functional capacity',
      'Anaesthesia plan',
      'Summary & sign-off',
    ],
    data: {
      clinician: { name: '', role: '', regBody: '', regNumber: '', site: '', date: '', time: '' },
      patient: {
        firstName: '', lastName: '', dob: '', nhs: '', sex: '', weight: null, height: null,
      },
      surgery: { procedure: '', specialty: '', urgency: '', severity: '', blood: null, duration: null },
      vitals: { sbp: null, dbp: null, hr: null, spo2: null, rr: null, temp: null, roomAir: '' },
      airway: {
        mallampati: '', thyromental: null, mouthOpening: null, neckRom: '', dentition: '',
        stopbang: { S: '', T: '', O: '', P: '', B: '', A: '', N: '', G: '' },
      },
      cardio: {
        rhythm: '', ihd: '', chf: '', stroke: '', recentMi: '', pacemaker: '', valve: '',
        ischaemia: '', ef: null, angina: '',
      },
      resp: {
        asthma: '', copd: '', fev1: null, smoking: '', packYears: null, covid: '', daysSinceCovid: null,
      },
      neuro: { gcs: null, cognition: '', capacity: '', recentStroke: '', daysSinceStroke: null },
      renalHep: {
        creatinine: null, egfr: null, ckd: '', dialysis: '', bilirubin: null, albumin: null,
        liverDisease: '', childPugh: '',
      },
      haem: {
        hb: null, platelets: null, inr: null, onAnticoag: '', anticoagType: '', holdPlan: '',
        groupSave: '', crossmatch: null,
      },
      endo: {
        type: '', onInsulin: '', hba1c: null, control: '', thyroid: '', steroids: '', steroidDose: null,
      },
      gi: { fastingConfirmed: '', reflux: '', rsi: '' },
      msk: { spine: '', neuraxial: '', hipRom: '', shoulderRom: '' },
      meds: [],
      allergies: [],
      func: { mets: null, dasi: null, cfs: null, ecog: null, malnutrition: '', cpet: '' },
      plan: {
        technique: '', airwayPlan: '', rsi: '', monitoring: '', analgesia: '', dvt: '',
        abx: '', disposition: '', los: null,
      },
      summary: { finalAsa: '', override: '', recommendation: '', notes: '' },
    },

    addMed() {
      this.data.meds.push({ name: '', dose: '', freq: '', class: '', action: '', notes: '' });
    },
    removeMed(i) { this.data.meds.splice(i, 1); },
    addAllergy() {
      this.data.allergies.push({
        allergen: '', category: '', reaction: '', severity: '',
      });
    },
    removeAllergy(i) { this.data.allergies.splice(i, 1); },

    computeAsa() {
      const d = this.data;
      const fired = [];
      let grade = 'I';
      const order = ['I', 'II', 'III', 'IV', 'V', 'VI'];
      const bump = (g, id, desc) => {
        if (order.indexOf(g) > order.indexOf(grade)) grade = g;
        fired.push({ id, grade: g, desc });
      };

      if (d.resp.smoking === 'current') bump('II', 'R-ASA-II-05', 'Current smoker');
      if (d.endo.control === 'well-controlled') bump('II', 'R-ASA-II-02', 'Well-controlled DM');
      if (d.resp.asthma === 'controlled') bump('II', 'R-ASA-II-03', 'Mild asthma');

      if (d.endo.control === 'poor' || (d.endo.hba1c != null && d.endo.hba1c > 53))
        bump('III', 'R-ASA-III-02', 'Poorly controlled diabetes');
      if (d.cardio.ihd === 'yes' && d.cardio.recentMi !== 'yes')
        bump('III', 'R-ASA-III-03', 'History of MI > 3 months');
      if (d.cardio.pacemaker === 'yes') bump('III', 'R-ASA-III-05', 'Pacemaker/ICD');
      if (d.cardio.ef != null && d.cardio.ef >= 30 && d.cardio.ef <= 40)
        bump('III', 'R-ASA-III-06', 'Moderate reduction of EF');
      if (d.renalHep.egfr != null && d.renalHep.egfr >= 30 && d.renalHep.egfr < 60)
        bump('III', 'R-ASA-III-08', 'eGFR 30-59');
      if (['peritoneal', 'haemodialysis'].includes(d.renalHep.dialysis))
        bump('III', 'R-ASA-III-09', 'Dialysis');
      if (d.func.cfs != null && d.func.cfs >= 5 && d.func.cfs <= 6)
        bump('III', 'R-ASA-III-12', 'CFS 5-6');

      if (d.cardio.recentMi === 'yes') bump('IV', 'R-ASA-IV-01', 'Recent MI');
      if (d.cardio.angina === 'yes' || d.cardio.ischaemia === 'yes')
        bump('IV', 'R-ASA-IV-03', 'Active ischaemia');
      if (d.cardio.valve === 'yes') bump('IV', 'R-ASA-IV-04', 'Severe valve disease');
      if (d.cardio.ef != null && d.cardio.ef < 30) bump('IV', 'R-ASA-IV-05', 'EF < 30%');
      if (d.resp.copd === 'severe' || (d.vitals.spo2 != null && d.vitals.spo2 < 92 && d.vitals.roomAir === 'yes'))
        bump('IV', 'R-ASA-IV-06', 'Severe respiratory compromise');
      if (d.renalHep.liverDisease === 'decompensated' || d.renalHep.childPugh === 'C')
        bump('IV', 'R-ASA-IV-07', 'Decompensated liver disease');
      if (d.func.cfs != null && d.func.cfs >= 7 && d.func.cfs <= 8)
        bump('IV', 'R-ASA-IV-08', 'CFS 7-8');

      if (d.func.cfs === 9) bump('V', 'R-ASA-V-01', 'CFS 9 (terminally ill)');

      return { grade, fired };
    },

    computeRcri() {
      const d = this.data;
      let score = 0;
      const items = [];
      if (d.surgery.severity === 'major' || d.surgery.severity === 'major-plus') { score++; items.push('High-risk surgery'); }
      if (d.cardio.ihd === 'yes') { score++; items.push('IHD'); }
      if (d.cardio.chf === 'yes') { score++; items.push('CHF'); }
      if (d.cardio.stroke === 'yes') { score++; items.push('Stroke/TIA'); }
      if (d.endo.onInsulin === 'yes') { score++; items.push('Insulin DM'); }
      if (d.renalHep.creatinine != null && d.renalHep.creatinine > 177) { score++; items.push('Cr > 177'); }
      return { score, items };
    },

    computeStopBang() {
      const sb = this.data.airway.stopbang;
      let score = 0;
      for (const k in sb) if (sb[k] === 'yes') score++;
      return score;
    },

    computeFlags() {
      const d = this.data;
      const flags = [];
      if (['III', 'IV'].includes(d.airway.mallampati))
        flags.push({ id: 'F-DIFFICULT-AIRWAY', priority: 'high', desc: `Mallampati ${d.airway.mallampati}`, action: 'Prepare difficult-airway trolley.' });
      if (d.cardio.ef != null && d.cardio.ef < 40)
        flags.push({ id: 'F-SEVERE-CARDIAC', priority: 'high', desc: `EF ${d.cardio.ef}%`, action: 'Cardiology review.' });
      if (d.vitals.spo2 != null && d.vitals.spo2 < 92 && d.vitals.roomAir === 'yes')
        flags.push({ id: 'F-SEVERE-RESP', priority: 'high', desc: `SpO₂ ${d.vitals.spo2}%`, action: 'Respiratory review.' });
      if (d.haem.inr != null && d.haem.inr > 1.5 && d.haem.onAnticoag !== 'yes')
        flags.push({ id: 'F-COAG', priority: 'high', desc: `INR ${d.haem.inr}`, action: 'Correct before surgery.' });
      if (d.haem.hb != null && d.haem.hb < 80)
        flags.push({ id: 'F-ANAEMIA', priority: 'high', desc: `Hb ${d.haem.hb}`, action: 'Transfuse / iron.' });
      if (d.endo.hba1c != null && d.endo.hba1c > 75)
        flags.push({ id: 'F-DM', priority: 'high', desc: `HbA1c ${d.endo.hba1c}`, action: 'Defer elective; diabetes review.' });
      if (d.func.cfs != null && d.func.cfs >= 7)
        flags.push({ id: 'F-FRAIL', priority: 'high', desc: `CFS ${d.func.cfs}`, action: 'CGA + SDM conversation.' });
      if (d.resp.covid === 'recent' && d.resp.daysSinceCovid != null && d.resp.daysSinceCovid < 49)
        flags.push({ id: 'F-COVID', priority: 'high', desc: `COVID-19 ${d.resp.daysSinceCovid} days ago`, action: 'Consider deferring 7 weeks.' });
      if (d.gi.fastingConfirmed === 'no' && d.surgery.urgency === 'elective')
        flags.push({ id: 'F-FAST', priority: 'high', desc: 'Fasting not confirmed', action: 'RSI or reschedule.' });
      return flags;
    },

    get result() {
      const asa = this.computeAsa();
      const rcri = this.computeRcri();
      const sb = this.computeStopBang();
      const flags = this.computeFlags();
      const cfs = this.data.func.cfs;
      let risk = 'low';
      if (asa.grade === 'V' || asa.grade === 'VI' || cfs === 9) risk = 'critical';
      else if (
        asa.grade === 'IV' || asa.grade === 'III' ||
        ['III', 'IV'].includes(this.data.airway.mallampati) ||
        rcri.score >= 2 || sb >= 5 || (cfs != null && cfs >= 5)
      ) risk = 'high';
      else if (asa.grade === 'II' || this.data.airway.mallampati === 'II' || rcri.score === 1 || sb >= 3) risk = 'moderate';
      const suffix = (this.data.surgery.urgency === 'emergency' || this.data.surgery.urgency === 'immediate') ? 'E' : '';
      return { asa: asa.grade, suffix, firedAsa: asa.fired, rcri, sb, flags, risk };
    },

    print() { window.print(); },
    reset() { if (confirm('Clear all entered data?')) location.reload(); },
  };
}
window.assessment = assessment;
