<script lang="ts">
	let {
		label,
		id,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		hint = '',
		min,
		max,
		step
	}: {
		label: string;
		id: string;
		value: string | number | null;
		type?: string;
		placeholder?: string;
		hint?: string;
		min?: number;
		max?: number;
		step?: number | string;
	} = $props();
</script>

<div class="mb-4">
	<label for={id} class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
	{#if hint}
		<p class="text-xs text-gray-500 mb-1">{hint}</p>
	{/if}
	<input
		{type}
		{id}
		name={id}
		bind:value
		{placeholder}
		{min}
		{max}
		{step}
		class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
	/>
</div>
