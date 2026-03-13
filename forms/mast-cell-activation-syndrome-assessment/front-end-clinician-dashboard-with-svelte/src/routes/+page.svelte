<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let scoreFilter = $state('');
	let systemsFilter = $state('');
	let anaphylaxisFilter = $state('');
	let gridApi = $state<any>(null);

	// Load patients from backend API, fall back to sample data
	$effect(() => {
		fetchPatients()
			.then((items) => {
				if (items.length > 0) {
					patients = items;
				}
				loading = false;
			})
			.catch(() => {
				// Backend unavailable — use sample data
				loading = false;
			});
	});

	const scoreOptions = [
		{ value: '', label: 'All scores' },
		{ value: '0-10', label: 'Minimal (0-10)' },
		{ value: '11-20', label: 'Mild (11-20)' },
		{ value: '21-30', label: 'Moderate (21-30)' },
		{ value: '31-40', label: 'Severe (31-40)' },
	];

	const systemsOptions = [
		{ value: '', label: 'All systems' },
		{ value: '0', label: '0 systems' },
		{ value: '1', label: '1 system' },
		{ value: '2', label: '2 systems' },
		{ value: '3', label: '3 systems' },
		{ value: '4', label: '4 systems' },
		{ value: '5', label: '5 systems' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	const columns = [
		{
			id: 'nhsNumber',
			header: 'NHS Number',
			width: 140,
			sort: true,
		},
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'symptomScore',
			header: 'Symptom Score',
			width: 130,
			sort: true,
			template: (value: number) => `${value}/40`,
		},
		{
			id: 'organSystemsAffected',
			header: 'Systems Affected',
			width: 140,
			sort: true,
			template: (value: number) => `${value}/5`,
		},
		{
			id: 'tryptaseLevel',
			header: 'Tryptase (ng/mL)',
			width: 140,
			sort: true,
		},
		{
			id: 'anaphylaxisRisk',
			header: 'Anaphylaxis Risk',
			width: 140,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function scoreInRange(score: number, range: string): boolean {
		switch (range) {
			case '0-10': return score >= 0 && score <= 10;
			case '11-20': return score >= 11 && score <= 20;
			case '21-30': return score >= 21 && score <= 30;
			case '31-40': return score >= 31 && score <= 40;
			default: return true;
		}
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();

		const filter = (row: PatientRow) => {
			// Text search across key fields
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Symptom score range filter
			if (scoreFilter && !scoreInRange(row.symptomScore, scoreFilter)) {
				return false;
			}

			// Systems affected filter
			if (systemsFilter && row.organSystemsAffected !== Number(systemsFilter)) {
				return false;
			}

			// Anaphylaxis risk filter
			if (anaphylaxisFilter === 'yes' && !row.anaphylaxisRisk) return false;
			if (anaphylaxisFilter === 'no' && row.anaphylaxisRisk) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		scoreFilter = '';
		systemsFilter = '';
		anaphylaxisFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || scoreFilter !== '' || systemsFilter !== '' || anaphylaxisFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">MCAS Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with mast cell activation syndrome assessment status</p>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<!-- Filters bar -->
		<div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-end gap-4">
				<!-- Search -->
				<div class="min-w-[240px] flex-1">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-700">
						Search
					</label>
					<input
						id="search"
						type="text"
						placeholder="NHS number or name..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Symptom Score -->
				<div>
					<label for="score-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Symptom Score
					</label>
					<select
						id="score-filter"
						bind:value={scoreFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each scoreOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Systems Affected -->
				<div>
					<label for="systems-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Systems Affected
					</label>
					<select
						id="systems-filter"
						bind:value={systemsFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each systemsOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Anaphylaxis risk -->
				<div>
					<label for="anaphylaxis-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Anaphylaxis Risk
					</label>
					<select
						id="anaphylaxis-filter"
						bind:value={anaphylaxisFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each yesNoOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Clear filters -->
				{#if hasActiveFilters}
					<button
						onclick={clearFilters}
						class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
					>
						Clear filters
					</button>
				{/if}
			</div>
		</div>

		<!-- Data grid -->
		<div class="rounded-lg bg-white shadow-sm" style="height: 600px;">
			{#if loading}
				<div class="flex h-full items-center justify-center text-muted">
					Loading patients...
				</div>
			{:else}
				<Willow>
					<Grid data={patients} {columns} {init} />
				</Willow>
			{/if}
		</div>

		<!-- Summary -->
		<div class="mt-4 flex items-center gap-4 text-sm text-muted">
			<span>{patients.length} patients total</span>
			{#if error}
				<span class="text-warning">{error}</span>
			{/if}
		</div>
	</main>
</div>
