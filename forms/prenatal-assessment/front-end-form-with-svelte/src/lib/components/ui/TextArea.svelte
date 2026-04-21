<script lang="ts">
	let {
		label,
		name,
		value = $bindable(''),
		placeholder = '',
		rows = 3
	}: {
		label: string;
		name: string;
		value: string;
		placeholder?: string;
		rows?: number;
	} = $props();
</script>

<div class="mb-4">
	<label for={name} class="mb-1 block text-sm font-medium text-gray-700">{label}</label>
	<textarea
		id={name}
		{name}
		{placeholder}
		{rows}
		bind:value
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
	></textarea>
</div>
