<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
  import type { Medication, Allergy } from '$lib/engine/types.js';

  function newMed(): Medication {
    return {
      name: '',
      dose: '',
      route: '',
      frequency: '',
      indication: '',
      class: '',
      perioperativeAction: '',
      perioperativeNotes: '',
      lastDoseAt: '',
    };
  }
  function newAllergy(): Allergy {
    return {
      allergen: '',
      category: '',
      reactionType: '',
      reactionSeverity: '',
      reactionNotes: '',
      verified: '',
    };
  }
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 13 — Medications &amp; allergies</h2>

  <h3 class="text-lg font-semibold mb-2">Medications (clinician-reconciled)</h3>
  <button
    type="button"
    class="mb-3 px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-sm"
    onclick={() => store.data.medications.push(newMed())}
  >
    + Add medication
  </button>

  {#each store.data.medications as med, i}
    <div class="border rounded p-3 mb-3 grid grid-cols-2 md:grid-cols-4 gap-2">
      <input class="border rounded px-2 py-1" placeholder="Name" bind:value={med.name} />
      <input class="border rounded px-2 py-1" placeholder="Dose" bind:value={med.dose} />
      <input class="border rounded px-2 py-1" placeholder="Frequency" bind:value={med.frequency} />
      <select class="border rounded px-2 py-1" bind:value={med.class}>
        <option value="">Class</option>
        <option value="anticoagulant">Anticoagulant</option>
        <option value="antiplatelet">Antiplatelet</option>
        <option value="antihypertensive">Antihypertensive</option>
        <option value="insulin">Insulin</option>
        <option value="steroid">Steroid</option>
        <option value="opioid">Opioid</option>
        <option value="other">Other</option>
      </select>
      <select class="border rounded px-2 py-1" bind:value={med.perioperativeAction}>
        <option value="">Peri-op action</option>
        <option value="continue">Continue</option>
        <option value="hold-on-day">Hold on day</option>
        <option value="stop">Stop</option>
        <option value="bridge">Bridge</option>
      </select>
      <input class="border rounded px-2 py-1 col-span-2" placeholder="Notes" bind:value={med.perioperativeNotes} />
      <button type="button" class="text-red-600 text-sm" onclick={() => store.data.medications.splice(i, 1)}>Remove</button>
    </div>
  {/each}

  <h3 class="text-lg font-semibold mt-6 mb-2">Allergies</h3>
  <button
    type="button"
    class="mb-3 px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-sm"
    onclick={() => store.data.allergies.push(newAllergy())}
  >
    + Add allergy
  </button>

  {#each store.data.allergies as a, i}
    <div class="border rounded p-3 mb-3 grid grid-cols-2 md:grid-cols-4 gap-2">
      <input class="border rounded px-2 py-1" placeholder="Allergen" bind:value={a.allergen} />
      <select class="border rounded px-2 py-1" bind:value={a.category}>
        <option value="">Category</option>
        <option value="drug">Drug</option><option value="latex">Latex</option>
        <option value="food">Food</option><option value="contrast">Contrast</option>
      </select>
      <select class="border rounded px-2 py-1" bind:value={a.reactionType}>
        <option value="">Reaction</option>
        <option value="anaphylaxis">Anaphylaxis</option>
        <option value="rash">Rash</option><option value="urticaria">Urticaria</option>
        <option value="bronchospasm">Bronchospasm</option>
      </select>
      <select class="border rounded px-2 py-1" bind:value={a.reactionSeverity}>
        <option value="">Severity</option>
        <option value="mild">Mild</option><option value="moderate">Moderate</option>
        <option value="severe">Severe</option><option value="life-threatening">Life-threatening</option>
      </select>
      <button type="button" class="text-red-600 text-sm" onclick={() => store.data.allergies.splice(i, 1)}>Remove</button>
    </div>
  {/each}
</section>
