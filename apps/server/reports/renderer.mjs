// Hilo sin credenciales, conexión SQL, URLs ni rutas del usuario. Solo recibe proyección positiva.
import { parentPort, workerData } from "node:worker_threads";
import { createRequire } from "node:module";
import writeExcelFile from "write-excel-file/node";
import PDFDocument from "pdfkit";
const require = createRequire(import.meta.url);
const display = (value) =>
  value === null || value === undefined
    ? ""
    : typeof value === "boolean"
      ? value
        ? "Sí"
        : "No"
      : String(value);

export async function render({ report, format, font = undefined }) {
  // La consulta puede contener documento/correo; conservar selección, pero no
  // copiar ese texto personal a los metadatos del archivo compartible.
  const filters = report.type === "busqueda" && report.filters.q
    ? { ...report.filters, q: "[consulta reservada]" }
    : report.filters;
  if (format === "xlsx") {
    const cell = (value) => ({
      type: typeof value === "number" ? Number : String,
      value: typeof value === "number" ? value : display(value),
    });
    const sheets = report.sections.map((section) => ({
      sheet: section.name,
      columns: section.columns.map(() => ({ width: 25 })),
      stickyRowsCount: 7,
      data: [
        [{ ...cell("Inventario TI · " + report.type), fontWeight: "bold" }],
        [cell("Generado UTC"), cell(report.generatedAt)],
        [cell("Filtros normalizados"), cell(JSON.stringify(filters))],
        [cell("Campo temporal"), cell(section.dateField)],
        [
          cell("Total combinado"),
          cell(report.total),
          cell("Total del conjunto"),
          cell(section.total),
        ],
        [
          cell("Subtotales por condición"),
          cell(
            report.subtotals ? JSON.stringify(report.subtotals) : "No aplica",
          ),
        ],
        section.columns.map((c) => ({
          ...cell(c.label),
          fontWeight: "bold",
          backgroundColor: "#08766B",
          color: "#FFFFFF",
          wrap: true,
        })),
        ...section.items.map((row) =>
          section.columns.map((c) => ({ ...cell(row[c.key]), wrap: true })),
        ),
      ],
    }));
    return writeExcelFile(sheets).toBuffer();
  }
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      ...(font ? {font} : {}),
      size: "A3",
      layout: "landscape",
      margin: 30,
      compress: true,
      info: {
        Title: "Inventario TI · " + report.type,
        CreationDate: new Date(report.generatedAt),
      },
    });
    doc.font(font ?? require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans.ttf"));
    const chunks = [];
    let size = 0;
    doc.on("data", (chunk) => {
      size += chunk.length;
      if (size > 52428800) {
        doc.destroy();
        reject(Error("EXPORT_FAILED"));
      } else chunks.push(chunk);
    });
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    const width = doc.page.width - 60,
      bottom = doc.page.height - 35,
      lineHeight = 11;
    const lines = (value, w) => {
      const text = display(value);
      const result = [];
      let current = "";
      for (const char of text) {
        if (char === "\r") continue;
        if (char === "\n") {
          result.push(current);
          current = "";
          continue;
        }
        if (current && doc.widthOfString(current + char) > w) {
          result.push(current);
          current = char;
        } else current += char;
      }
      result.push(current);
      return result;
    };
    let y = 30,
      page = 1;
    const metadata = () => {
      doc
        .fontSize(12)
        .fillColor("#08766B")
        .text("Inventario TI · " + report.type, 30, 25, { lineBreak: false });
      doc.fontSize(8).fillColor("#20323C");
      y = 47;
      for (const text of [
        "Generado: " + report.generatedAt + " · UTC · Página " + page,
        "Total combinado: " + report.total,
        "Filtros: " + JSON.stringify(filters),
        "Subtotales: " +
          (report.subtotals ? JSON.stringify(report.subtotals) : "No aplica"),
      ]) {
        for (const line of lines(text, width)) {
          doc.text(line, 30, y, { lineBreak: false });
          y += lineHeight;
        }
      }
    };
    const newPage = () => {
      doc.addPage();
      page++;
      metadata();
    };
    metadata();
    for (const section of report.sections) {
      const colWidth = width / section.columns.length;
      const header = () => {
        if (y + 90 > bottom) newPage();
        doc
          .fontSize(9)
          .fillColor("#20323C")
          .text(
            `${section.name} · Total ${section.total} · Campo temporal: ${section.dateField} (UTC)`,
            30,
            y,
            { lineBreak: false },
          );
        y += 20;
        doc.fontSize(7);
        const labels = section.columns.map((c) => lines(c.label, colWidth - 8));
        const h = Math.max(...labels.map((v) => v.length)) * lineHeight + 8;
        doc.rect(30, y, width, h).fill("#08766B");
        doc.fillColor("#FFFFFF");
        labels.forEach((ls, i) =>
          ls.forEach((l, j) =>
            doc.text(l, 34 + i * colWidth, y + 4 + j * lineHeight, {
              lineBreak: false,
            }),
          ),
        );
        y += h + 3;
        doc.fillColor("#20323C");
      };
      header();
      if (!section.total) {
        doc.text("Sin coincidencias · Total cero", 30, y, { lineBreak: false });
        y += 20;
      }
      for (const row of section.items) {
        const cells = section.columns.map((c) =>
          lines(row[c.key], colWidth - 8),
        );
        const height = Math.max(...cells.map((c) => c.length));
        let start = 0;
        while (start < height) {
          if (bottom - y < lineHeight + 8) {
            newPage();
            header();
          }
          const count = Math.min(
            height - start,
            Math.floor((bottom - y - 8) / lineHeight),
          );
          if (count < 1) throw Error("EXPORT_FAILED");
          cells.forEach((ls, i) =>
            ls
              .slice(start, start + count)
              .forEach((l, j) =>
                doc.text(l, 34 + i * colWidth, y + 4 + j * lineHeight, {
                  lineBreak: false,
                }),
              ),
          );
          y += count * lineHeight + 8;
          doc
            .moveTo(30, y)
            .lineTo(width + 30, y)
            .strokeColor("#D9E4E7")
            .stroke();
          start += count;
        }
      }
      y += 25;
    }
    doc.end();
  });
}
if (parentPort)
  render(workerData).then(
    (bytes) => parentPort.postMessage({ bytes }),
    () => parentPort.postMessage({ error: true }),
  );
