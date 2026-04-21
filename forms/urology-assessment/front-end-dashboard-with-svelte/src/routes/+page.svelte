<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let ipssFilter = $state('');
	let severityFilter = $state('');
	let urgencyFilter = $state('');
	let gridApi = $state<any>(null);

	$effect(() => {
		fetchPatients()
			.then((items) => {
				if (items.length > 0) {
					patients = items;
				}
				loading = false;
			})
			.catch(() => {
				loading = false;
			});
	});

	const ipssOptions = [
		{ value: '', label: 'All IPSS scores' },
		{ value: '0-7', label: 'Mild (0-7)' },
		{ value: '8-19', label: 'Moderate (8-19)' },
		{ value: '20-35', label: 'Severe (20-35)' },
	];

	const severityOptions = [
		{ value: '', label: 'All severities' },
		{ value: 'Mild', label: 'Mild' },
		{ value: 'Moderate', label: 'Moderate' },
		{ value: 'Severe', label: 'Severe' },
	];

	const urgencyOptions = [
		{ value: '', label: 'All urgencies' },
		{ value: 'Routine', label: 'Routine' },
		{ value: 'Soon', label: 'Soon' },
		{ value: 'Urgent', label: 'Urgent' },
	];

	const columns = [
		{ id: 'nhsNumber', header: 'NHS Number', width: 140, sort: true },
		{ id: 'patientName', header: 'Patient Name', flexgrow: 1, sort: true },
		{ id: 'ipssScore', header: 'IPSS Score', width: 110, sort: true, template: (value: number) => `${value}/35` },
		{ id: 'symptomSeverity', header: 'Severity', width: 120, sort: true },
		{ id: 'psaLevel', header: 'PSA (ng/mL)', width: 120, sort: true },
		{ id: 'referralUrgency', header: 'Urgency', width: 120, sort: true },
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function ipssInRange(score: number, range: string): boolean {
		switch (range) {
			case '0-7': return score >= 0 && score <= 7;
			case '8-19': return score >= 8 && score <= 19;
			case '20-35': return score >= 20 && score <= 35;
			default: return true;
		}
	}

	function applyFilters() {
		if (!gridApi) return;
		const term = searchTerm.toLowerCase();
		const filter = (row: PatientRow) => {
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}
			if (ipssFilter && !ipssInRange(row.ipssScore, ipssFilter)) return false;
			if (severityFilter && row.symptomSeverity !== severityFilter) return false;
			if (urgencyFilter && row.referralUrgency !== urgencyFilter) return false;
			return true;
		};
		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		ipssFilter = '';
		severityFilter = '';
		urgencyFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || ipssFilter !== '' || severityFilter !== '' || urgencyFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Urology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with urology assessment status</p>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-end gap-4">
				<div class="min-w-[240px] flex-1">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-700">Search</label>
					<input id="search" type="text" placeholder="NHS number or name..." bind:value={searchTerm} oninput={applyFilters} class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label for="ipss-filter" class="mb-1 block text-sm font-medium text-gray-700">IPSS Score</label>
					<select id="ipss-filter" bind:value={ipssFilter} onchange={applyFilters} class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
						{#each ipssOptions as opt (opt.value)}<option value={opt.value}>{opt.label}</option>{/each}
					</select>
				</div>
				<div>
					<label for="severity-filter" class="mb-1 block text-sm font-medium text-gray-700">Severity</label>
					<select id="severity-filter" bind:value={severityFilter} onchange={applyFilters} class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
						{#each severityOptions as opt (opt.value)}<option value={opt.value}>{opt.label}</option>{/each}
					</select>
				</div>
				<div>
					<label for="urgency-filter" class="mb-1 block text-sm font-medium text-gray-700">Urgency</label>
					<select id="urgency-filter" bind:value={urgencyFilter} onchange={applyFilters} class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
						{#each urgencyOptions as opt (opt.value)}<option value={opt.value}>{opt.label}</option>{/each}
					</select>
				</div>
				{#if hasActiveFilters}
					<button onclick={clearFilters} class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Clear filters</button>
				{/if}
			</div>
		</div>

		<div class="rounded-lg bg-white shadow-sm" style="height: 600px;">
			{#if loading}
				<div class="flex h-full items-center justify-center text-muted">Loading patients...</div>
			{:else}
				<Willow>
					<Grid data={patients} {columns} {init} />
				</Willow>
			{/if}
		</div>

		<div class="mt-4 flex items-center gap-4 text-sm text-muted">
			<span>{patients.length} patients total</span>
			{#if error}<span class="text-warning">{error}</span>{/if}
		</div>
	</main>
</div>
