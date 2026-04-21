import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 6;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Trauma Event Identification', shortTitle: 'Trauma Event', section: 'traumaEvent' },
	{ number: 3, title: 'Intrusion Symptoms (Cluster B)', shortTitle: 'Intrusion (B)', section: 'clusterBIntrusion' },
	{ number: 4, title: 'Avoidance Symptoms (Cluster C)', shortTitle: 'Avoidance (C)', section: 'clusterCAvoidance' },
	{ number: 5, title: 'Negative Alterations in Cognitions & Mood (Cluster D)', shortTitle: 'Alterations (D)', section: 'clusterDNegativeAlterations' },
	{ number: 6, title: 'Alterations in Arousal & Reactivity (Cluster E)', shortTitle: 'Arousal (E)', section: 'clusterEArousalReactivity' }
];
