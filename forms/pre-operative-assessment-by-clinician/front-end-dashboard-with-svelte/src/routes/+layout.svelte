<script lang="ts">
  import '../app.css';
  let { children }: { children: () => unknown } = $props();
</script>

<div class="max-w-7xl mx-auto p-6">
  <header class="mb-4 pb-3 border-b">
    <h1 class="text-2xl font-bold text-brand-600">Clinician Dashboard</h1>
    <p class="text-sm text-slate-600">Pre-operative assessments — ASA, RCRI, STOP-BANG, CFS, composite risk.</p>
  </header>
  {@render children()}
</div>
