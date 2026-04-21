<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let hhiesFilter = $state('');
	let hearingLossFilter = $state('');
	let aidStatusFilter = $state('');
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

	const hhiesOptions = [
		{ value: '', label: 'All HHIE-S scores' },
		{ value: '0-8', label: 'No handicap (0-8)' },
		{ value: '10-22', label: 'Mild-moderate (10-22)' },
		{ value: '24-40', label: 'Significant (24-40)' },
	];

	const hearingLossOptions = [
		{ value: '', label: 'All grades' },
		{ value: 'Normal', label: 'Normal' },
		{ value: 'Mild', label: 'Mild' },
		{ value: 'Moderate', label: 'Moderate' },
		{ value: 'Severe', label: 'Severe' },
		{ value: 'Profound', label: 'Profound' },
	];

	const aidStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'None', label: 'No hearing aids' },
		{ value: 'has-aids', label: 'Has hearing aids' },
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
			id: 'hhiesScore',
			header: 'HHIE-S Score',
			width: 120,
			sort: true,
			template: (value: number) => `${value}/40`,
		},
		{
			id: 'hearingLossGrade',
			header: 'Hearing Loss',
			width: 120,
			sort: true,
		},
		{
			id: 'currentAidStatus',
			header: 'Current Aids',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'referralType',
			header: 'Referral Type',
			width: 200,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function hhiesInRange(score: number, range: string): boolean {
		switch (range) {
			case '0-8': return score >= 0 && score <= 8;
			case '10-22': return score >= 10 && score <= 22;
			case '24-40': return score >= 24 && score <= 40;
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
					row.referralType.toLowerCase().includes(term) ||
					row.currentAidStatus.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// HHIE-S score range filter
			if (hhiesFilter && !hhiesInRange(row.hhiesScore, hhiesFilter)) {
				return false;
			}

			// Hearing loss grade filter
			if (hearingLossFilter && row.hearingLossGrade !== hearingLossFilter) {
				return false;
			}

			// Aid status filter
			if (aidStatusFilter === 'None' && row.currentAidStatus !== 'None') return false;
			if (aidStatusFilter === 'has-aids' && row.currentAidStatus === 'None') return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		hhiesFilter = '';
		hearingLossFilter = '';
		aidStatusFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || hhiesFilter !== '' || hearingLossFilter !== '' || aidStatusFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Hearing Aid Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with hearing aid assessment status</p>
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
						placeholder="NHS number, name, or referral type..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- HHIE-S Score -->
				<div>
					<label for="hhies-filter" class="mb-1 block text-sm font-medium text-gray-700">
						HHIE-S Score
					</label>
					<select
						id="hhies-filter"
						bind:value={hhiesFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each hhiesOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Hearing Loss Grade -->
				<div>
					<label for="loss-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Hearing Loss
					</label>
					<select
						id="loss-filter"
						bind:value={hearingLossFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each hearingLossOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Aid Status -->
				<div>
					<label for="aid-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Hearing Aids
					</label>
					<select
						id="aid-filter"
						bind:value={aidStatusFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each aidStatusOptions as opt (opt.value)}
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
