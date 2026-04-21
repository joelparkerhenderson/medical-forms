<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}
	let {
		label,
		name,
		options,
		numericValue = $bindable(null)
	}: {
		label: string;
		name: string;
		options: Option[];
		numericValue: number | null;
	} = $props();

	let stringValue = $derived(numericValue !== null ? String(numericValue) : '');

	function handleChange(e: Event) {
		const target = e.currentTarget as HTMLSelectElement;
		numericValue = target.value === '' ? null : Number(target.value);
	}
</script>

<div class="mb-4">
	<label for={name} class="mb-1 block text-sm font-medium text-gray-700">{label}</label>
	<select
		id={name}
		{name}
		value={stringValue}
		onchange={handleChange}
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
	>
		<option value="">-- Select --</option>
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
