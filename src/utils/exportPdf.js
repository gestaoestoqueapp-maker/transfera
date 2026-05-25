import jsPDF from 'jspdf'

function calcColumns(items, pageW, margin) {
  const maxLen = Math.max(...items.map(i => i.description.length))
  const charW = 1.8
  const qtyW = 12
  const gap = 6
  const availW = pageW - margin * 2
  const colW = maxLen * charW + qtyW + gap
  const cols = Math.max(1, Math.floor(availW / colW))
  return { cols, colW: availW / cols }
}

export function exportToPdf(results, coverage, selectedGroups = null) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 10

  const toTransfer = results.raw.filter(r => r.replenish > 0)
  const excess = results.raw.filter(r => r.replenish < 0)

  const groups = {}
  toTransfer.forEach(item => {
    const key = item.article + ' ' + item.gender
    if (!groups[key]) groups[key] = { article: item.article, gender: item.gender, items: [], total: 0 }
    groups[key].items.push(item)
    groups[key].total += item.replenish
  })

  if (excess.length > 0) {
    groups['__EXCESSO__'] = {
      article: 'Excesso',
      gender: 'Loja',
      items: excess.map(i => ({ ...i, replenish: Math.abs(i.replenish) })),
      total: excess.reduce((s, r) => s + Math.abs(r.replenish), 0)
    }
  }

  const groupList = Object.values(groups)
    .filter(g => !selectedGroups || selectedGroups.includes(g.article + ' ' + g.gender))
    .sort((a, b) => b.total - a.total)

  const drawPageHeader = (title, total) => {
    doc.setFillColor(24, 95, 165)
    doc.rect(0, 0, pageW, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('TRANSFERA', margin, 7)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.textWithLink('< indice', pageW - margin, 7, { align: 'right', pageNumber: 1 })
    doc.setTextColor(0, 0, 0)

    doc.setFillColor(230, 241, 251)
    doc.rect(0, 11, pageW, 9, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(12, 68, 124)
    doc.text(title, margin, 17)
    doc.text('Total: ' + total, pageW - margin, 17, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }

  // Calcular páginas para o índice
  const indexEntries = []
  let currentPage = 2

  groupList.forEach(group => {
    const title = group.article.charAt(0) + group.article.slice(1).toLowerCase() +
      ' ' + group.gender.charAt(0) + group.gender.slice(1).toLowerCase()
    indexEntries.push({ title, total: group.total, page: currentPage })

    const { cols, colW } = calcColumns(group.items, pageW, margin)
    const headerH = 25
    const rowH = 5
    const availH = pageH - headerH - 10
    const rowsPerPage = Math.floor(availH / rowH)
    const itemsPerPage = cols * rowsPerPage
    const pagesNeeded = Math.ceil(group.items.length / itemsPerPage)
    currentPage += pagesNeeded
  })

  // Página 1 — Índice
  doc.setFillColor(24, 95, 165)
  doc.rect(0, 0, pageW, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSFERA', margin, 7)
  doc.text(new Date().toLocaleDateString('pt-BR'), pageW - margin, 7, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Indice', margin, 18)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Total a transferir: ' + toTransfer.reduce((s, r) => s + r.replenish, 0) + ' pecas', margin, 25)
  doc.text('Excesso na loja: ' + excess.reduce((s, r) => s + Math.abs(r.replenish), 0) + ' pecas', margin, 30)

  let y = 38
  indexEntries.forEach(entry => {
    if (y > pageH - 10) { y = 18 }
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(24, 95, 165)
    doc.textWithLink(entry.title + ' — ' + entry.total + ' pecas  (pagina ' + entry.page + ')', margin, y, { pageNumber: entry.page })
    doc.setTextColor(0, 0, 0)
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y + 1.5, pageW - margin, y + 1.5)
    y += 8
  })

  // Páginas de cada grupo
  groupList.forEach(group => {
    const title = group.article.charAt(0) + group.article.slice(1).toLowerCase() +
      ' ' + group.gender.charAt(0) + group.gender.slice(1).toLowerCase()

    const { cols, colW } = calcColumns(group.items, pageW, margin)
    const headerH = 25
    const rowH = 5
    const availH = pageH - headerH - 10
    const rowsPerPage = Math.floor(availH / rowH)
    const itemsPerPage = cols * rowsPerPage

    let itemIndex = 0

    while (itemIndex < group.items.length) {
      doc.addPage()
      drawPageHeader(title, group.total)

      let pageY = headerH
      const pageItems = group.items.slice(itemIndex, itemIndex + itemsPerPage)

      for (let c = 0; c < cols; c++) {
        const x = margin + c * colW
        doc.setFillColor(240, 240, 240)
        doc.rect(x, pageY - 4, colW - 2, 5, 'F')
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('Produto', x + 1, pageY)
        doc.text('Qtd', x + colW - 4, pageY, { align: 'right' })
      }
      pageY += 3

      const rowCount = Math.ceil(pageItems.length / cols)
      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row + col * rowCount
          if (idx >= pageItems.length) continue
          const item = pageItems[idx]
          const x = margin + col * colW

          if (row % 2 === 0) {
            doc.setFillColor(248, 248, 248)
            doc.rect(x, pageY - 3, colW - 2, rowH, 'F')
          }

          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(40, 40, 40)

          const maxNameW = colW - 14
          const name = item.description.length * 1.8 > maxNameW
            ? item.description.slice(0, Math.floor(maxNameW / 1.8) - 2) + '..'
            : item.description

          doc.text(name, x + 1, pageY)
          doc.setFont('helvetica', 'bold')
          doc.text('+' + item.replenish, x + colW - 4, pageY, { align: 'right' })
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
        }
        pageY += rowH
      }

      // Rodapé
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, pageH - 8, pageW - margin, pageH - 8)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(24, 95, 165)
      doc.textWithLink('voltar ao indice', margin, pageH - 4, { pageNumber: 1 })
      doc.setTextColor(100, 100, 100)
      doc.text('Pagina ' + doc.getNumberOfPages(), pageW - margin, pageH - 4, { align: 'right' })
      doc.setTextColor(0, 0, 0)

      itemIndex += itemsPerPage
    }
  })

  doc.save('transfera_' + new Date().toISOString().slice(0, 10) + '.pdf')
}