<script lang="ts">
	let { title, description = '' }: { title: string; description?: string } = $props();
	let { children } = $props();
</script>

<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="mb-1 text-xl font-bold text-gray-900">{title}</h2>
	{#if description}<p class="mb-4 text-sm text-gray-500">{description}</p>{/if}
	{@render children()}
</div>
