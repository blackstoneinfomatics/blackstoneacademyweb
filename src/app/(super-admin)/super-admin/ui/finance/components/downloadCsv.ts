const escapeHtml = (value: string | number | undefined | null) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const downloadPdf = async (
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | undefined | null>>,
) => {
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default || html2pdfModule;
  const pdfContent = document.createElement("div");

  pdfContent.style.cssText =
    "background:#ffffff;color:#101828;font-family:Arial,sans-serif;padding:32px;width:760px;";
  pdfContent.innerHTML = `
    <div style="border-bottom:2px solid #496A96;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="color:#496A96;font-size:24px;margin:0 0 6px;">Finance Report</h1>
      <p style="color:#667085;font-size:12px;margin:0;">Generated on ${new Date().toLocaleDateString("en-IN")}</p>
    </div>
    <table style="border-collapse:collapse;width:100%;font-size:12px;">
      <thead><tr>${headers
        .map(
          (header) =>
            `<th style="border:1px solid #E4E7EC;background:#496A96;color:#ffffff;text-align:left;padding:8px;">${escapeHtml(header)}</th>`,
        )
        .join("")}</tr></thead>
      <tbody>${rows
        .map(
          (row) =>
            `<tr>${row
              .map(
                (value) =>
                  `<td style="border:1px solid #E4E7EC;padding:8px;">${escapeHtml(value)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("")}</tbody>
    </table>
  `;

  document.body.appendChild(pdfContent);

  try {
    await html2pdf()
      .set({
        margin: 8,
        filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(pdfContent)
      .save();
  } finally {
    pdfContent.remove();
  }
};