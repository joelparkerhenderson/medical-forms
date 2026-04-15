<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    description = '',
    children
  }: {
    title: string;
    description?: string;
    children: Snippet;
  } = $props();
</script>

<div class="mb-8">
  <div class="mb-4">
    <h2 class="text-xl font-bold text-gray-900">{title}</h2>
    {#if description}
      <p class="mt-1 text-sm text-gray-500">{description}</p>
    {/if}
  </div>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    {@render children()}
  </div>
</div>
