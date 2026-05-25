import jsPDF from 'jspdf'
export function exportToPdf(results, coverage) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 10
  const colW = pageW - margin * 2
  let y = margin
  const checkPage = (needed = 6) => { if (y + needed > pageH - margin) { doc.addPage(); y = margin } }
  doc.setFillColor(24, 95, 165)
  doc.rect(0, 0, pageW, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSFERA', margin, 8)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Gerado em: ' + new Date().toLocaleDateString('pt-BR'), pageW - margin, 8, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y = 16
  const toTransfer = results.raw.filter(r => r.replenish > 0)
  const excess = results.raw.filter(r => r.replenish < 0)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('RESUMO', margin, y); y += 5
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text('Total a transferir: ' + toTransfer.reduce((s, r) => s + r.replenish, 0) + ' pecas', margin, y); y += 4
  doc.text('Excesso na loja: ' + excess.reduce((s, r) => s + Math.abs(r.replenish), 0) + ' pecas', margin, y); y += 8
  const groups = {}
  toTransfer.forEach(item => {
    const key = item.article + ' ' + item.gender
    if (!groups[key]) groups[key] = { article: item.article, gender: item.gender, items: [], total: 0 }
    groups[key].items.push(item); groups[key].total += item.replenish
  })
  Object.values(groups).sort((a, b) => b.total - a.total).forEach(group => {
    checkPage(10)
    doc.setFillColor(230, 241, 251); doc.rect(margin, y, colW, 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(12, 68, 124)
    doc.text(group.article.charAt(0) + group.article.slice(1).toLowerCase() + ' ' + group.gender.charAt(0) + group.gender.slice(1).toLowerCase(), margin + 2, y + 4)
    doc.text('Total: ' + group.total, pageW - margin, y + 4, { align: 'right' })
    doc.setTextColor(0, 0, 0); y += 7
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    group.items.forEach((item, i) => {
      checkPage(5)
      if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 1, colW, 5, 'F') }
      doc.text(item.description, margin + 2, y + 3)
      doc.text('+' + item.replenish, pageW - margin, y + 3, { align: 'right' }); y += 5
    }); y += 3
  })
  if (excess.length > 0) {
    checkPage(10)
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(133, 79, 11)
    doc.text('EXCESSO NA LOJA', margin, y); doc.setTextColor(0, 0, 0); y += 5
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    excess.forEach((item, i) => {
      checkPage(5)
      if (i % 2 === 0) { doc.setFillColor(250, 238, 218); doc.rect(margin, y - 1, colW, 5, 'F') }
      doc.text(item.description, margin + 2, y + 3)
      doc.text(String(item.replenish), pageW - margin, y + 3, { align: 'right' }); y += 5
    })
  }
  doc.save('transfera_' + new Date().toISOString().slice(0, 10) + '.pdf')
}