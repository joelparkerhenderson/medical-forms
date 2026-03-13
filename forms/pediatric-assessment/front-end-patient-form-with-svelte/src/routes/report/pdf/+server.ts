import type { RequestHandler } from './$types';
import { buildPdfDocument } from '$lib/report/pdf-builder';
import type { AssessmentData, GradingResult } from '$lib/engine/types';

export const POST: RequestHandler = async ({ request }) => {
	const { data, result } = (await request.json()) as {
		data: AssessmentData;
		result: GradingResult;
	};

	const docDefinition = buildPdfDocument(data, result);

	// Dynamic import for server-side pdfmake
	const PdfPrinter = (await import('pdfmake')).default;

	const fonts = {
		Roboto: {
			normal: 'node_modules/pdfmake/build/vfs_fonts.js',
			bold: 'node_modules/pdfmake/build/vfs_fonts.js',
			italics: 'node_modules/pdfmake/build/vfs_fonts.js',
			bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js'
		}
	};

	// @ts-expect-error pdfmake types don't expose constructor correctly
	const printer = new PdfPrinter(fonts);
	const pdfDoc = printer.createPdfKitDocument(docDefinition);

	const chunks: Uint8Array[] = [];

	return new Promise<Response>((resolve) => {
		pdfDoc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
		pdfDoc.on('end', () => {
			const pdfBuffer = Buffer.concat(chunks);
			resolve(
				new Response(pdfBuffer, {
					headers: {
						'Content-Type': 'application/pdf',
						'Content-Disposition': `attachment; filename="pediatric-assessment.pdf"`
					}
				})
			);
		});
		pdfDoc.end();
	});
};
