<script lang="ts">
	let { label, name, options, values = $bindable([]) }: { label: string; name: string; options: { value: string; label: string }[]; values: string[]; } = $props();

	function toggle(val: string) {
		if (values.includes(val)) {
			values = values.filter((v) => v !== val);
		} else {
			values = [...values, val];
		}
	}
</script>

<div class="mb-4">
	<span class="mb-1 block text-sm font-medium text-gray-700">{label}</span>
	<div class="flex flex-wrap gap-2">
		{#each options as opt (opt.value)}
			<label class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm {values.includes(opt.value) ? 'border-primary bg-blue-50 text-primary' : 'border-gray-300 text-gray-700'}">
				<input type="checkbox" {name} value={opt.value} checked={values.includes(opt.value)} onchange={() => toggle(opt.value)} class="sr-only" />
				{opt.label}
			</label>
		{/each}
	</div>
</div>
