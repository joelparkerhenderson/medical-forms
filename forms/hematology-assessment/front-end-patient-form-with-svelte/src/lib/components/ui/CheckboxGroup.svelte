<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}
	let {
		label,
		name,
		options,
		selected = $bindable<string[]>([])
	}: {
		label: string;
		name: string;
		options: Option[];
		selected: string[];
	} = $props();

	function toggle(val: string) {
		if (selected.includes(val)) {
			selected = selected.filter((v) => v !== val);
		} else {
			selected = [...selected, val];
		}
	}
</script>

<fieldset class="mb-4">
	<legend class="mb-2 block text-sm font-medium text-gray-700">{label}</legend>
	<div class="flex flex-wrap gap-3">
		{#each options as opt (opt.value)}
			<label
				class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors
					{selected.includes(opt.value) ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
			>
				<input
					type="checkbox"
					{name}
					value={opt.value}
					checked={selected.includes(opt.value)}
					onchange={() => toggle(opt.value)}
					class="text-primary accent-primary"
				/>
				{opt.label}
			</label>
		{/each}
	</div>
</fieldset>
