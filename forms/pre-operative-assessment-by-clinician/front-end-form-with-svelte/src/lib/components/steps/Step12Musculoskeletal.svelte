<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
  const rom = ['', 'full', 'reduced', 'severely-limited'] as const;
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 12 — Musculoskeletal &amp; skin</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Spine exam</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.musculoskeletal.spineExam}>
        <option value="">—</option><option value="normal">Normal</option>
        <option value="scoliosis">Scoliosis</option><option value="kyphosis">Kyphosis</option>
        <option value="previous-surgery">Previous surgery</option>
        <option value="ankylosing-spondylitis">Ankylosing spondylitis</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Neuraxial suitable</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.musculoskeletal.neuraxialSuitable}>
        <option value="">—</option><option value="yes">Yes</option>
        <option value="no">No</option><option value="unsure">Unsure</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Hip ROM</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.musculoskeletal.jointRomHip}>
        {#each rom as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Shoulder ROM</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.musculoskeletal.jointRomShoulder}>
        {#each rom as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Neck ROM</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.musculoskeletal.jointRomNeck}>
        {#each rom as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Pressure ulcer risk</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.musculoskeletal.pressureUlcerRisk}>
        <option value="">—</option><option value="low">Low</option>
        <option value="moderate">Moderate</option><option value="high">High</option><option value="very-high">Very high</option>
      </select></label>
  </div>
</section>
