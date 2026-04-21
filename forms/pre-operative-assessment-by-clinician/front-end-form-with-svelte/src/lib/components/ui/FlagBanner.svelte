<script lang="ts">
  import type { AdditionalFlag, CompositeRisk } from '$lib/engine/types.js';

  let { flags, risk }: { flags: AdditionalFlag[]; risk: CompositeRisk } = $props();

  const riskClass = $derived(
    risk === 'critical'
      ? 'bg-red-100 border-red-500 text-red-900'
      : risk === 'high'
        ? 'bg-orange-100 border-orange-500 text-orange-900'
        : risk === 'moderate'
          ? 'bg-yellow-100 border-yellow-500 text-yellow-900'
          : 'bg-green-100 border-green-500 text-green-900',
  );
</script>

{#if flags.length > 0}
  <div class="border-l-4 {riskClass} p-4 my-4 rounded">
    <p class="font-semibold mb-2">Composite risk: {risk.toUpperCase()}</p>
    <ul class="list-disc list-inside text-sm space-y-1">
      {#each flags as f}
        <li>
          <span class="font-medium">[{f.priority.toUpperCase()}]</span>
          {f.description} — {f.suggestedAction}
        </li>
      {/each}
    </ul>
  </div>
{/if}
