<script lang="ts">
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const principles: { number: number; text: string }[] = [
		{ number: 1, text: "Ensure all individuals eligible for the medical programme can access timely care." },
		{ number: 2, text: "Provide health care with competence and compassion." },
		{ number: 3, text: "Treat patients and colleagues with dignity and respect." },
		{ number: 4, text: "Ensure every encounter is conducted without discrimination based on age, sexual orientation, gender, race, ethnicity, national origin, language, disease, disability, or religion." },
		{ number: 5, text: "Do not engage in retaliation against colleagues or patients for any reason." },
		{ number: 6, text: "Make all reasonable attempts to respectfully provide care to each patient. If for any reason a provider is unable to do so, ensure the patient receives non-judgemental and prompt referral to another clinician, or seek alternative options to preserve patient autonomy." },
		{ number: 7, text: "Provide each patient with the information needed for considered decision-making about their health. A patient's informed and voluntary consent must be secured, when possible, before initiating a medical procedure." },
		{ number: 8, text: "Safeguard patient confidentiality, medical information, and privacy." },
		{ number: 9, text: "Report unintended events promptly, honestly, and thoroughly through appropriate channels." },
		{ number: 10, text: "Commit to continued education and adaptation: fulfil educational and training requirements, seek out and apply the soundest medical guidance, and, in situations of uncertainty, ask for help." },
		{ number: 11, text: "Follow guidelines and policies with professionalism, honesty, and integrity." },
		{ number: 12, text: "Report wrongdoing (including violations of this Code of Conduct) to the appropriate authorities." }
	];
</script>

<SectionCard title="Code of Conduct Notice" description="All medical-service providers, employed staff, contractors, eligible family members, and re-employed annuitants are expected to uphold the following principles.">
	<div class="prose prose-sm max-w-none text-gray-800">
		<p class="mb-4">
			This Code of Conduct reflects four fundamental principles: (1) responsibilities to patients; (2) respect for patients and colleagues; (3) adherence to established medical standards; (4) acknowledgement that medicine is an ever-evolving field that requires providers to stay current in their fields to ensure excellent patient care.
		</p>

		<ol class="list-decimal space-y-3 pl-5">
			{#each principles as p (p.number)}
				<li class="text-sm leading-relaxed">
					{p.text}
				</li>
			{/each}
		</ol>

		<p class="mt-6 text-sm text-gray-600">
			Please read each principle carefully before proceeding to acknowledge and sign.
		</p>
	</div>
</SectionCard>
