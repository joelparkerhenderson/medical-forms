<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}
	let {
		label,
		name,
		options,
		value = $bindable(''),
		required = false
	}: {
		label: string;
		name: string;
		options: Option[];
		value: string;
		required?: boolean;
	} = $props();
</script>

<div class="mb-4">
	<label for={name} class="mb-1 block text-sm font-medium text-gray-700">
		{label}
		{#if required}<span class="text-red-500">*</span>{/if}
	</label>
	<select
		id={name}
		{name}
		{required}
		bind:value
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
	>
		<option value="">-- Select --</option>
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
