<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 2 — Patient &amp; planned procedure</h2>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block">
      <span class="text-sm text-slate-700">NHS number</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.patient.nhsNumber} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Date of birth</span>
      <input type="date" class="w-full border rounded px-2 py-1" bind:value={store.data.patient.dateOfBirth} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">First name</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.patient.firstName} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Last name</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.patient.lastName} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Sex</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.patient.sex}>
        <option value="">—</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Weight (kg)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.patient.weightKg} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Height (cm)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.patient.heightCm} />
    </label>
  </div>

  <h3 class="text-lg font-semibold mt-6 mb-3">Planned procedure</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block md:col-span-2">
      <span class="text-sm text-slate-700">Planned procedure</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.plannedProcedure} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Specialty</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.surgicalSpecialty} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Urgency</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.urgency}>
        <option value="">—</option>
        <option value="elective">Elective</option>
        <option value="urgent">Urgent</option>
        <option value="emergency">Emergency</option>
        <option value="immediate">Immediate</option>
      </select>
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Surgical severity (NICE NG45)</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.surgicalSeverity}>
        <option value="">—</option>
        <option value="minor">Minor</option>
        <option value="intermediate">Intermediate</option>
        <option value="major">Major</option>
        <option value="major-plus">Major+</option>
      </select>
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Laterality</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.laterality}>
        <option value="">—</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="bilateral">Bilateral</option>
        <option value="midline">Midline</option>
        <option value="na">N/A</option>
      </select>
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Anticipated blood loss (mL)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.anticipatedBloodLossMl} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Anticipated duration (min)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.anticipatedDurationMinutes} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Consultant surgeon</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.consultantSurgeon} />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Planned date</span>
      <input type="date" class="w-full border rounded px-2 py-1" bind:value={store.data.surgery.plannedDate} />
    </label>
  </div>
</section>
