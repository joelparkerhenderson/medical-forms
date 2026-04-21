<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
  const c = $derived(store.data.clinician);
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 1 — Clinician identification</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block">
      <span class="text-sm text-slate-700">Clinician name</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.clinician.clinicianName} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Role</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.clinician.clinicianRole}>
        <option value="">—</option>
        <option value="anaesthetist">Anaesthetist</option>
        <option value="surgeon">Surgeon</option>
        <option value="preop-nurse">Pre-op nurse</option>
        <option value="perioperative-physician">Perioperative physician</option>
        <option value="geriatrician">Geriatrician</option>
        <option value="pharmacist">Pharmacist</option>
        <option value="other">Other</option>
      </select>
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Registration body</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.clinician.registrationBody}>
        <option value="">—</option>
        <option value="GMC">GMC</option>
        <option value="NMC">NMC</option>
        <option value="HCPC">HCPC</option>
        <option value="GPhC">GPhC</option>
        <option value="other">Other</option>
      </select>
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Registration number</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.clinician.registrationNumber} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Site</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.clinician.siteName} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Assessment date</span>
      <input type="date" class="w-full border rounded px-2 py-1" bind:value={store.data.clinician.assessmentDate} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Assessment time</span>
      <input type="time" class="w-full border rounded px-2 py-1" bind:value={store.data.clinician.assessmentTime} />
    </label>
  </div>
</section>
