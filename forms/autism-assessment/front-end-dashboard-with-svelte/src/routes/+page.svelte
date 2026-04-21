<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let aq10Filter = $state('');
	let outcomeFilter = $state('');
	let ageGroupFilter = $state('');
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

	const aq10Options = [
		{ value: '', label: 'All AQ-10 scores' },
		{ value: '0-3', label: 'Low (0-3)' },
		{ value: '4-5', label: 'Borderline (4-5)' },
		{ value: '6-8', label: 'Above threshold (6-8)' },
		{ value: '9-10', label: 'High (9-10)' },
	];

	const outcomeOptions = [
		{ value: '', label: 'All outcomes' },
		{ value: 'Below threshold', label: 'Below threshold' },
		{ value: 'At or above threshold', label: 'At or above threshold' },
	];

	const ageGroupOptions = [
		{ value: '', label: 'All age groups' },
		{ value: 'Child', label: 'Child' },
		{ value: 'Adolescent', label: 'Adolescent' },
		{ value: 'Adult', label: 'Adult' },
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
			id: 'aq10Score',
			header: 'AQ-10 Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/10`,
		},
		{
			id: 'screeningOutcome',
			header: 'Screening Outcome',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'ageGroup',
			header: 'Age Group',
			width: 120,
			sort: true,
		},
		{
			id: 'referralStatus',
			header: 'Referral Status',
			width: 180,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function aq10InRange(score: number, range: string): boolean {
		switch (range) {
			case '0-3': return score >= 0 && score <= 3;
			case '4-5': return score >= 4 && score <= 5;
			case '6-8': return score >= 6 && score <= 8;
			case '9-10': return score >= 9 && score <= 10;
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
					row.patientName.toLowerCase().includes(term) ||
					row.referralStatus.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// AQ-10 score range filter
			if (aq10Filter && !aq10InRange(row.aq10Score, aq10Filter)) {
				return false;
			}

			// Outcome filter
			if (outcomeFilter && row.screeningOutcome !== outcomeFilter) {
				return false;
			}

			// Age group filter
			if (ageGroupFilter && row.ageGroup !== ageGroupFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		aq10Filter = '';
		outcomeFilter = '';
		ageGroupFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || aq10Filter !== '' || outcomeFilter !== '' || ageGroupFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Autism Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with autism screening assessment status</p>
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
						placeholder="NHS number, name, or referral status..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- AQ-10 Score -->
				<div>
					<label for="aq10-filter" class="mb-1 block text-sm font-medium text-gray-700">
						AQ-10 Score
					</label>
					<select
						id="aq10-filter"
						bind:value={aq10Filter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each aq10Options as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Outcome -->
				<div>
					<label for="outcome-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Outcome
					</label>
					<select
						id="outcome-filter"
						bind:value={outcomeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each outcomeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Age Group -->
				<div>
					<label for="age-group-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Age Group
					</label>
					<select
						id="age-group-filter"
						bind:value={ageGroupFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each ageGroupOptions as opt (opt.value)}
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
