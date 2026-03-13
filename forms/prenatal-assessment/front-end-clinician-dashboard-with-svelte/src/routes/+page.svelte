<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let riskFilter = $state('');
	let referralFilter = $state('');
	let trimesterFilter = $state('');
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

	const riskOptions = [
		{ value: '', label: 'All risk levels' },
		{ value: 'low', label: 'Low Risk' },
		{ value: 'moderate', label: 'Moderate Risk' },
		{ value: 'high', label: 'High Risk' },
		{ value: 'very-high', label: 'Very High Risk' },
	];

	const referralOptions = [
		{ value: '', label: 'All referral statuses' },
		{ value: 'None', label: 'No referral' },
		{ value: 'referred', label: 'Referred' },
	];

	const trimesterOptions = [
		{ value: '', label: 'All trimesters' },
		{ value: '1', label: '1st trimester (< 14 weeks)' },
		{ value: '2', label: '2nd trimester (14-27 weeks)' },
		{ value: '3', label: '3rd trimester (28+ weeks)' },
	];

	function riskLevelLabel(level: string): string {
		switch (level) {
			case 'low': return 'Low';
			case 'moderate': return 'Moderate';
			case 'high': return 'High';
			case 'very-high': return 'Very High';
			default: return level;
		}
	}

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
			id: 'riskLevel',
			header: 'Risk Level',
			width: 120,
			sort: true,
			template: (value: string) => riskLevelLabel(value),
		},
		{
			id: 'gestationalWeeks',
			header: 'Gestational Age',
			width: 140,
			sort: true,
			template: (value: number) => `${value} weeks`,
		},
		{
			id: 'primaryConcern',
			header: 'Primary Concern',
			flexgrow: 1,
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

	function trimesterForWeeks(weeks: number): string {
		if (weeks < 14) return '1';
		if (weeks < 28) return '2';
		return '3';
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
					row.primaryConcern.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Risk level filter
			if (riskFilter && row.riskLevel !== riskFilter) {
				return false;
			}

			// Referral filter
			if (referralFilter === 'None' && row.referralStatus !== 'None') return false;
			if (referralFilter === 'referred' && row.referralStatus === 'None') return false;

			// Trimester filter
			if (trimesterFilter && trimesterForWeeks(row.gestationalWeeks) !== trimesterFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		riskFilter = '';
		referralFilter = '';
		trimesterFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || riskFilter !== '' || referralFilter !== '' || trimesterFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Prenatal Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with prenatal assessment status</p>
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
						placeholder="NHS number, name, or concern..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Risk Level -->
				<div>
					<label for="risk-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Risk Level
					</label>
					<select
						id="risk-filter"
						bind:value={riskFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each riskOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Trimester -->
				<div>
					<label for="trimester-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Trimester
					</label>
					<select
						id="trimester-filter"
						bind:value={trimesterFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each trimesterOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Referral -->
				<div>
					<label for="referral-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Referral
					</label>
					<select
						id="referral-filter"
						bind:value={referralFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each referralOptions as opt (opt.value)}
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
