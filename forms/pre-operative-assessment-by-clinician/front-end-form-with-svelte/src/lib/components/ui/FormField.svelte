<script lang="ts">
  let {
    label,
    id,
    hint = '',
    children,
  }: { label: string; id: string; hint?: string; children: () => unknown } = $props();
</script>

<div class="mb-4">
  <label for={id} class="block text-sm font-medium text-slate-700 mb-1">{label}</label>
  {@render children()}
  {#if hint}<p class="text-xs text-slate-500 mt-1">{hint}</p>{/if}
</div>
