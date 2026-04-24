import { c as calculateAge, r as riskLevelLabel } from "../../../../chunks/utils2.js";
function buildPdfDocument(data, result) {
  const age = calculateAge(data.personalInformation.dateOfBirth);
  return {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    header: {
      text: "PATIENT INTAKE REPORT",
      alignment: "center",
      margin: [0, 20, 0, 0],
      fontSize: 10,
      color: "#6b7280",
      bold: true
    },
    footer: (currentPage, pageCount) => ({
      text: `Page ${currentPage} of ${pageCount} | Generated ${new Date(result.timestamp).toLocaleString()}`,
      alignment: "center",
      margin: [0, 20, 0, 0],
      fontSize: 8,
      color: "#9ca3af"
    }),
    content: [
      // Title & Risk Level
      {
        text: `Risk Level: ${result.riskLevel.toUpperCase()}`,
        fontSize: 24,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 4]
      },
      {
        text: riskLevelLabel(result.riskLevel),
        fontSize: 14,
        alignment: "center",
        color: "#4b5563",
        margin: [0, 0, 0, 20]
      },
      // Patient Details
      sectionHeader("Patient Details"),
      {
        table: {
          widths: ["*", "*"],
          body: [
            [
              field("Name", data.personalInformation.fullName),
              field("DOB", `${data.personalInformation.dateOfBirth}${age ? ` (Age ${age})` : ""}`)
            ],
            [
              field("Sex", data.personalInformation.sex || "N/A"),
              field("NHS Number", data.insuranceAndId.nhsNumber || "N/A")
            ],
            [
              field("Phone", data.personalInformation.phone || "N/A"),
              field("Email", data.personalInformation.email || "N/A")
            ],
            [
              field("Reason for Visit", data.reasonForVisit.primaryReason || "N/A"),
              field("Urgency", data.reasonForVisit.urgencyLevel || "N/A")
            ]
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 16]
      },
      // Additional Flags
      ...result.additionalFlags.length > 0 ? [
        sectionHeader("Flagged Issues for Clinician"),
        {
          ul: result.additionalFlags.map(
            (f) => ({
              text: `[${f.priority.toUpperCase()}] ${f.category}: ${f.message}`,
              color: f.priority === "high" ? "#dc2626" : f.priority === "medium" ? "#d97706" : "#4b5563",
              margin: [0, 2, 0, 2]
            })
          ),
          margin: [0, 0, 0, 16]
        }
      ] : [],
      // Fired Rules
      ...result.firedRules.length > 0 ? [
        sectionHeader("Risk Classification Justification"),
        {
          table: {
            headerRows: 1,
            widths: [60, 80, "*", 50],
            body: [
              [
                { text: "Rule ID", bold: true, fontSize: 9 },
                { text: "Category", bold: true, fontSize: 9 },
                { text: "Finding", bold: true, fontSize: 9 },
                { text: "Risk", bold: true, fontSize: 9 }
              ],
              ...result.firedRules.map((r) => [
                { text: r.id, fontSize: 8, color: "#6b7280" },
                { text: r.category, fontSize: 9 },
                { text: r.description, fontSize: 9 },
                { text: r.riskLevel, fontSize: 9, bold: true }
              ])
            ]
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 16]
        }
      ] : [],
      // Medications
      ...data.medications.length > 0 ? [
        sectionHeader("Medications"),
        {
          ul: data.medications.map(
            (m) => `${m.name} ${m.dose} ${m.frequency} (prescribed by ${m.prescriber || "N/A"})`
          ),
          margin: [0, 0, 0, 16]
        }
      ] : [],
      // Allergies
      ...data.allergies.length > 0 ? [
        sectionHeader("Allergies"),
        {
          ul: data.allergies.map(
            (a) => `${a.allergen} (${a.allergyType}) - ${a.reaction}${a.severity ? ` [${a.severity}]` : ""}`
          ),
          margin: [0, 0, 0, 16]
        }
      ] : []
    ],
    defaultStyle: {
      fontSize: 10
    }
  };
}
function sectionHeader(text) {
  return {
    text,
    fontSize: 14,
    bold: true,
    color: "#1f2937",
    margin: [0, 8, 0, 8]
  };
}
function field(label, value) {
  return {
    text: [
      { text: `${label}: `, bold: true, color: "#6b7280" },
      { text: value }
    ],
    margin: [0, 4, 0, 4]
  };
}
const POST = async ({ request }) => {
  const { data, result } = await request.json();
  const docDefinition = buildPdfDocument(data, result);
  const PdfPrinter = (await import("pdfmake")).default;
  const fonts = {
    Roboto: {
      normal: "node_modules/pdfmake/build/vfs_fonts.js",
      bold: "node_modules/pdfmake/build/vfs_fonts.js",
      italics: "node_modules/pdfmake/build/vfs_fonts.js",
      bolditalics: "node_modules/pdfmake/build/vfs_fonts.js"
    }
  };
  const printer = new PdfPrinter(fonts);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks = [];
  return new Promise((resolve) => {
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(
        new Response(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="patient-intake.pdf"`
          }
        })
      );
    });
    pdfDoc.end();
  });
};
export {
  POST
};
