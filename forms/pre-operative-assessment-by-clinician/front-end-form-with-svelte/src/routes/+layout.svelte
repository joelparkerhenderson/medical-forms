<script lang="ts">
  import '../app.css';
  let { children }: { children: () => unknown } = $props();
</script>

<div class="max-w-5xl mx-auto px-4 py-6">
  <header class="mb-6 pb-4 border-b border-slate-200">
    <h1 class="text-2xl font-bold text-brand-700">Pre-operative Assessment by Clinician</h1>
    <p class="text-sm text-slate-600">
      NHS-aligned clinician data-entry wizard with ASA grading, composite risk, and safety flags.
    </p>
  </header>
  {@render children()}
</div>
