<script lang="ts">
	let {
		label,
		name,
		value = $bindable<number | null>(null),
		min,
		max,
		step = 1,
		unit = '',
		placeholder = '',
		required = false
	}: {
		label: string;
		name: string;
		value: number | null;
		min?: number;
		max?: number;
		step?: number;
		unit?: string;
		placeholder?: string;
		required?: boolean;
	} = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.value === '') {
			value = null;
		} else {
			const num = Number(target.value);
			value = isNaN(num) ? null : num;
		}
	}
</script>

<div class="mb-4">
	<label for={name} class="mb-1 block text-sm font-medium text-gray-700">
		{label}
		{#if unit}<span class="text-gray-500">({unit})</span>{/if}
		{#if required}<span class="text-red-500">*</span>{/if}
	</label>
	<input
		id={name}
		{name}
		type="number"
		{min}
		{max}
		{step}
		{required}
		{placeholder}
		value={value ?? ''}
		oninput={handleInput}
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
	/>
</div>
