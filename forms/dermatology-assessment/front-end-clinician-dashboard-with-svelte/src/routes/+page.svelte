<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let dlqiFilter = $state('');
	let severityFilter = $state('');
	let allergyFilter = $state('');
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

	const dlqiOptions = [
		{ value: '', label: 'All DLQI scores' },
		{ value: '0-1', label: 'No effect (0-1)' },
		{ value: '2-5', label: 'Small effect (2-5)' },
		{ value: '6-10', label: 'Moderate effect (6-10)' },
		{ value: '11-20', label: 'Very large effect (11-20)' },
		{ value: '21-30', label: 'Extremely large effect (21-30)' },
	];

	const severityOptions = [
		{ value: '', label: 'All severities' },
		{ value: 'No effect on life', label: 'No effect on life' },
		{ value: 'Small effect', label: 'Small effect' },
		{ value: 'Moderate effect', label: 'Moderate effect' },
		{ value: 'Very large effect', label: 'Very large effect' },
		{ value: 'Extremely large effect', label: 'Extremely large effect' },
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
			id: 'dlqiScore',
			header: 'DLQI Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/30`,
		},
		{
			id: 'primaryCondition',
			header: 'Primary Condition',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'severity',
			header: 'Severity',
			width: 180,
			sort: true,
		},
		{
			id: 'allergyFlag',
			header: 'Allergy',
			width: 100,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function dlqiInRange(score: number, range: string): boolean {
		switch (range) {
			case '0-1': return score >= 0 && score <= 1;
			case '2-5': return score >= 2 && score <= 5;
			case '6-10': return score >= 6 && score <= 10;
			case '11-20': return score >= 11 && score <= 20;
			case '21-30': return score >= 21 && score <= 30;
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
					row.primaryCondition.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// DLQI score range filter
			if (dlqiFilter && !dlqiInRange(row.dlqiScore, dlqiFilter)) {
				return false;
			}

			// Severity filter
			if (severityFilter && row.severity !== severityFilter) {
				return false;
			}

			// Allergy filter
			if (allergyFilter === 'yes' && !row.allergyFlag) return false;
			if (allergyFilter === 'no' && row.allergyFlag) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		dlqiFilter = '';
		severityFilter = '';
		allergyFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || dlqiFilter !== '' || severityFilter !== '' || allergyFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Dermatology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with dermatology assessment status</p>
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
						placeholder="NHS number, name, or condition..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- DLQI Score -->
				<div>
					<label for="dlqi-filter" class="mb-1 block text-sm font-medium text-gray-700">
						DLQI Score
					</label>
					<select
						id="dlqi-filter"
						bind:value={dlqiFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each dlqiOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Severity -->
				<div>
					<label for="severity-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Severity
					</label>
					<select
						id="severity-filter"
						bind:value={severityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each severityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Allergy flag -->
				<div>
					<label for="allergy-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Allergy
					</label>
					<select
						id="allergy-filter"
						bind:value={allergyFilter}
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
