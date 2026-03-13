import { c as calculateAge, a as asaGradeLabel, b as bmiCategory } from "../../../../chunks/utils2.js";
function buildPdfDocument(data, result) {
  const age = calculateAge(data.demographics.dateOfBirth);
  const bmi = data.demographics.bmi;
  return {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    header: {
      text: "PRE-OPERATIVE ASSESSMENT REPORT",
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
      // Title & ASA Grade
      {
        text: `ASA Grade: ${result.asaGrade}`,
        fontSize: 24,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 4]
      },
      {
        text: asaGradeLabel(result.asaGrade),
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
              field("Name", `${data.demographics.firstName} ${data.demographics.lastName}`),
              field("DOB", `${data.demographics.dateOfBirth}${age ? ` (Age ${age})` : ""}`)
            ],
            [
              field("Sex", data.demographics.sex || "N/A"),
              field("BMI", bmi ? `${bmi} (${bmiCategory(bmi)})` : "N/A")
            ],
            [
              field("Procedure", data.demographics.plannedProcedure || "N/A"),
              field("Urgency", data.demographics.procedureUrgency || "N/A")
            ]
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 16]
      },
      // Additional Flags
      ...result.additionalFlags.length > 0 ? [
        sectionHeader("Flagged Issues for Anaesthetist"),
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
        sectionHeader("ASA Grade Justification"),
        {
          table: {
            headerRows: 1,
            widths: [60, 80, "*", 40],
            body: [
              [
                { text: "Rule ID", bold: true, fontSize: 9 },
                { text: "System", bold: true, fontSize: 9 },
                { text: "Finding", bold: true, fontSize: 9 },
                { text: "Grade", bold: true, fontSize: 9 }
              ],
              ...result.firedRules.map((r) => [
                { text: r.id, fontSize: 8, color: "#6b7280" },
                { text: r.system, fontSize: 9 },
                { text: r.description, fontSize: 9 },
                { text: `ASA ${r.grade}`, fontSize: 9, bold: true }
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
            (m) => `${m.name} ${m.dose} ${m.frequency}`
          ),
          margin: [0, 0, 0, 16]
        }
      ] : [],
      // Allergies
      ...data.allergies.length > 0 ? [
        sectionHeader("Allergies"),
        {
          ul: data.allergies.map(
            (a) => `${a.allergen} - ${a.reaction}${a.severity ? ` (${a.severity})` : ""}`
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
            "Content-Disposition": `attachment; filename="preop-assessment.pdf"`
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
