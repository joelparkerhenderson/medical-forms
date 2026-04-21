declare module 'pdfmake' {
	const PdfPrinter: any;
	export default PdfPrinter;
}

declare module 'pdfmake/interfaces' {
	export interface TDocumentDefinitions {
		pageSize?: string;
		pageMargins?: [number, number, number, number];
		header?: any;
		footer?: any;
		content: any[];
		defaultStyle?: any;
	}
}
