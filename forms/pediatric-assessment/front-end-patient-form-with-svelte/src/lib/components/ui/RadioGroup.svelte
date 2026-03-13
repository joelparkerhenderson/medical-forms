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

<fieldset class="mb-4">
	<legend class="mb-2 block text-sm font-medium text-gray-700">
		{label}
		{#if required}<span class="text-red-500">*</span>{/if}
	</legend>
	<div class="flex flex-wrap gap-3">
		{#each options as opt (opt.value)}
			<label
				class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors
					{value === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
			>
				<input
					type="radio"
					{name}
					value={opt.value}
					bind:group={value}
					required={required}
					class="text-primary accent-primary"
				/>
				{opt.label}
			</label>
		{/each}
	</div>
</fieldset>
