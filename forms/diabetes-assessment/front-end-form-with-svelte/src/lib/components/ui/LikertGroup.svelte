<script lang="ts">
	interface LikertOption {
		value: number;
		label: string;
	}
	let {
		label,
		name,
		options,
		value = $bindable(null),
		required = false
	}: {
		label: string;
		name: string;
		options: LikertOption[];
		value: number | null;
		required?: boolean;
	} = $props();
</script>

<fieldset class="mb-4">
	<legend class="mb-2 block text-sm font-medium text-gray-700">
		{label}
		{#if required}<span class="text-red-500">*</span>{/if}
	</legend>
	<div class="flex flex-wrap gap-2">
		{#each options as opt (opt.value)}
			<label
				class="flex cursor-pointer flex-col items-center rounded-lg border px-4 py-2 text-center text-sm transition-colors
					{value === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
			>
				<input
					type="radio"
					{name}
					value={opt.value}
					checked={value === opt.value}
					onchange={() => (value = opt.value)}
					required={required}
					class="mb-1 text-primary accent-primary"
				/>
				<span>{opt.label}</span>
			</label>
		{/each}
	</div>
</fieldset>
