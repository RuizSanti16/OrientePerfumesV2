/* Las librerías se cargan bajo demanda (dynamic import) para no
   engordar el bundle inicial de la tienda. */

/* ── Helpers ─────────────────────────────────────────────────── */
const GOLD  = [201, 168, 76];
const DARK  = [26, 26, 24];
const GRIS  = [120, 114, 100];

function fechaHoy() {
  return new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function nombreArchivo(base, ext) {
  const f = new Date().toISOString().slice(0, 10);
  return `${base}_${f}.${ext}`;
}

/* ── PDF ─────────────────────────────────────────────────────────
   secciones: [{ titulo, columnas: ['Col1',...], filas: [[...],...] }]
──────────────────────────────────────────────────────────────── */
export async function exportarPDF({ titulo, subtitulo = '', secciones = [], archivo = 'reporte' }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  /* Encabezado de marca */
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor(...GOLD);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('ORIENTPERFUMES', 14, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 172, 155);
  doc.text('Fragancias Orientales · Nicho · Diseñador', 14, 19);
  doc.setTextColor(...GOLD);
  doc.setFontSize(9);
  doc.text(fechaHoy(), pageW - 14, 13, { align: 'right' });

  /* Título del reporte */
  let y = 42;
  doc.setTextColor(...DARK);
  doc.setFont('times', 'bold');
  doc.setFontSize(17);
  doc.text(titulo, 14, y);
  if (subtitulo) {
    y += 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...GRIS);
    doc.text(subtitulo, 14, y);
  }
  y += 8;

  /* Secciones con tablas */
  secciones.forEach(sec => {
    if (sec.titulo) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...GOLD);
      doc.text(sec.titulo.toUpperCase(), 14, y);
      y += 3;
    }
    autoTable(doc, {
      startY: y,
      head: [sec.columnas],
      body: sec.filas.length ? sec.filas : [['Sin datos']],
      margin: { left: 14, right: 14 },
      styles:     { font: 'helvetica', fontSize: 8.5, cellPadding: 2.5, textColor: [40, 38, 34] },
      headStyles: { fillColor: DARK, textColor: GOLD, fontSize: 8, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 238] },
    });
    y = doc.lastAutoTable.finalY + 10;
  });

  /* Pie de página */
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text(`OrientPerfumes — Reporte generado automáticamente · Página ${i} de ${pages}`,
      pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
  }

  doc.save(nombreArchivo(archivo, 'pdf'));
}

/* ── Excel ───────────────────────────────────────────────────────
   hojas: [{ nombre, columnas: ['Col1',...], filas: [[...],...] }]
──────────────────────────────────────────────────────────────── */
export async function exportarExcel({ hojas = [], archivo = 'reporte' }) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  hojas.forEach(h => {
    const ws = XLSX.utils.aoa_to_sheet([h.columnas, ...h.filas]);
    /* Ancho de columnas según contenido */
    ws['!cols'] = h.columnas.map((col, i) => {
      const maxLen = Math.max(
        String(col).length,
        ...h.filas.map(f => String(f[i] ?? '').length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
    });
    /* Nombre de hoja: máx 31 chars, sin caracteres inválidos */
    const nombre = (h.nombre || 'Datos').replace(/[\\/?*[\]:]/g, '').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, nombre);
  });
  XLSX.writeFile(wb, nombreArchivo(archivo, 'xlsx'));
}
