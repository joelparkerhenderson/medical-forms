<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchAssessments } from '$lib/api/assessments.js';
  import type { AssessmentRow } from '$lib/data/sample.js';

  let rows = $state<AssessmentRow[]>([]);
  let filterRisk = $state<string>('');
  let sortKey = $state<keyof AssessmentRow>('date');
  let sortDir = $state<'asc' | 'desc'>('desc');

  onMount(async () => {
    rows = await fetchAssessments();
  });

  const filtered = $derived(
    rows
      .filter((r) => !filterRisk || r.composite === filterRisk)
      .slice()
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }),
  );

  function setSort(k: keyof AssessmentRow) {
    if (sortKey === k) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else {
      sortKey = k;
      sortDir = 'asc';
    }
  }

  function riskClass(r: string): string {
    const map: Record<string, string> = {
      low: 'bg-green-100',
      moderate: 'bg-yellow-100',
      high: 'bg-orange-100',
      critical: 'bg-red-100',
    };
    return map[r] ?? '';
  }
</script>

<div class="flex gap-3 mb-4 items-end">
  <label>
    <span class="text-sm block">Risk</span>
    <select class="border rounded px-2 py-1" bind:value={filterRisk}>
      <option value="">All</option>
      <option value="low">Low</option>
      <option value="moderate">Moderate</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </select>
  </label>
  <p class="text-sm text-slate-500 ml-auto">{filtered.length} results</p>
</div>

<div class="bg-white rounded-lg shadow overflow-x-auto">
  <table class="min-w-full text-sm">
    <thead class="bg-slate-100 text-left">
      <tr>
        <th class="p-2 cursor-pointer" onclick={() => setSort('date')}>Date</th>
        <th class="p-2 cursor-pointer" onclick={() => setSort('patient')}>Patient</th>
        <th class="p-2">NHS</th>
        <th class="p-2">Procedure</th>
        <th class="p-2 cursor-pointer" onclick={() => setSort('urgency')}>Urgency</th>
        <th class="p-2 cursor-pointer" onclick={() => setSort('asa')}>ASA</th>
        <th class="p-2">RCRI</th>
        <th class="p-2">STOP-BANG</th>
        <th class="p-2">CFS</th>
        <th class="p-2 cursor-pointer" onclick={() => setSort('composite')}>Risk</th>
        <th class="p-2">Flags</th>
        <th class="p-2">Clinician</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as r (r.id)}
        <tr class="{riskClass(r.composite)} border-b border-slate-200">
          <td class="p-2">{r.date}</td>
          <td class="p-2 font-medium">{r.patient}</td>
          <td class="p-2 text-slate-600">{r.nhs}</td>
          <td class="p-2">{r.procedure}</td>
          <td class="p-2">{r.urgency}</td>
          <td class="p-2 font-semibold">{r.asa}</td>
          <td class="p-2">{r.rcri}</td>
          <td class="p-2">{r.stopbang}</td>
          <td class="p-2">{r.cfs ?? '—'}</td>
          <td class="p-2 uppercase">{r.composite}</td>
          <td class="p-2 text-xs">{r.flags.join(', ') || '—'}</td>
          <td class="p-2">{r.clinician}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<p class="text-xs text-slate-500 mt-4">
  Fallback to sample data if no backend is reachable. In production, rows come
  from the Rust backend's <code>/api/assessments</code> endpoint.
</p>
