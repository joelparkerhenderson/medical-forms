<script lang="ts">
	let {
		label,
		name,
		options,
		values = $bindable([]),
		hint = ''
	}: {
		label: string;
		name: string;
		options: { value: string; label: string }[];
		values: string[];
		hint?: string;
	} = $props();

	function toggle(val: string) {
		if (values.includes(val)) {
			values = values.filter((v) => v !== val);
		} else {
			values = [...values, val];
		}
	}
</script>

<div class="mb-4">
	<span class="block text-sm font-medium text-gray-700 mb-1">{label}</span>
	{#if hint}
		<p class="text-xs text-gray-500 mb-1">{hint}</p>
	{/if}
	<div class="flex flex-col gap-2">
		{#each options as opt}
			<label class="inline-flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					{name}
					checked={values.includes(opt.value)}
					onchange={() => toggle(opt.value)}
					class="text-primary focus:ring-primary"
				/>
				{opt.label}
			</label>
		{/each}
	</div>
</div>
