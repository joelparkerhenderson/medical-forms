<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}
	let {
		label,
		options,
		values = $bindable([])
	}: {
		label: string;
		options: Option[];
		values: string[];
	} = $props();

	function toggle(val: string) {
		if (values.includes(val)) {
			values = values.filter((v) => v !== val);
		} else {
			values = [...values, val];
		}
	}
</script>

<fieldset class="mb-4">
	<legend class="mb-2 block text-sm font-medium text-gray-700">{label}</legend>
	<div class="flex flex-wrap gap-3">
		{#each options as opt}
			<label
				class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors
					{values.includes(opt.value) ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
			>
				<input
					type="checkbox"
					checked={values.includes(opt.value)}
					onchange={() => toggle(opt.value)}
					class="accent-primary"
				/>
				{opt.label}
			</label>
		{/each}
	</div>
</fieldset>
