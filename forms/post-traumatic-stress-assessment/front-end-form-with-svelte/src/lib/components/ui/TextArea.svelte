<script lang="ts">
	let {
		label,
		name,
		value = $bindable(''),
		placeholder = '',
		required = false,
		rows = 3
	}: {
		label: string;
		name: string;
		value: string;
		placeholder?: string;
		required?: boolean;
		rows?: number;
	} = $props();
</script>

<div class="mb-4">
	<label for={name} class="mb-1 block text-sm font-medium text-gray-700">
		{label}
		{#if required}<span class="text-red-500">*</span>{/if}
	</label>
	<textarea
		id={name}
		{name}
		{placeholder}
		{required}
		{rows}
		bind:value
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
	></textarea>
</div>
