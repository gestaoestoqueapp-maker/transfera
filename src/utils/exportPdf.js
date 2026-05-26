import jsPDF from 'jspdf'

const FONT_SIZE = 7
const CHAR_W = 1.65
const QTY_W = 12
const COL_PAD = 3
const COL_GAP = 6
const ROW_H = 5
const HEADER_H = 28
const COL_HEADER_H = 6

function calcLayout(items, pageW, margin) {
  const availW = pageW - margin * 2
  const availH_rows = Math.floor((297 - HEADER_H - COL_HEADER_H - 10) / ROW_H)

  const maxNameLen = Math.max(...items.map(i => i.description.length))
  const nomeW = maxNameLen * CHAR_W + COL_PAD * 2
  const colW = nomeW + QTY_W + COL_GAP

  // Só usa múltiplas colunas se os itens não cabem em 1 coluna numa página
  const maxCols = Math.max(1, Math.floor(availW / colW))
  const cols = items.length <= availH_rows ? 1 : Math.min(maxCols, items.length)

  return { cols, colW, nomeW }
}

function truncate(text, nomeW) {
  const maxChars = Math.floor(nomeW / CHAR_W)
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - 2) + '..'
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

  const indexEntries = []
  let currentPage = 2

  groupList.forEach(group => {
    const title = group.article.charAt(0) + group.article.slice(1).toLowerCase() +
      ' ' + group.gender.charAt(0) + group.gender.slice(1).toLowerCase()
    indexEntries.push({ title, total: group.total, page: currentPage })

    const { cols } = calcLayout(group.items, pageW, margin)
    const availH = pageH - HEADER_H - COL_HEADER_H - 10
    const rowsPerPage = Math.floor(availH / ROW_H)
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

    const { cols, colW, nomeW } = calcLayout(group.items, pageW, margin)
    const availH = pageH - HEADER_H - COL_HEADER_H - 10
    const rowsPerPage = Math.floor(availH / ROW_H)
    const itemsPerPage = cols * rowsPerPage

    let itemIndex = 0

    while (itemIndex < group.items.length) {
      doc.addPage()
      drawPageHeader(title, group.total)

      let pageY = HEADER_H
      const pageItems = group.items.slice(itemIndex, itemIndex + itemsPerPage)
      const rowCount = Math.ceil(pageItems.length / cols)
      const blockW = nomeW + QTY_W + COL_PAD

      for (let c = 0; c < cols; c++) {
        const x = margin + c * colW
        doc.setFillColor(240, 240, 240)
        doc.rect(x, pageY, blockW, COL_HEADER_H, 'F')
        doc.setFontSize(FONT_SIZE)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(40, 40, 40)
        doc.text('Produto', x + COL_PAD, pageY + 4)
        doc.text('Qtd', x + blockW - 1, pageY + 4, { align: 'right' })
      }
      pageY += COL_HEADER_H + 2

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row + col * rowCount
          if (idx >= pageItems.length) continue
          const item = pageItems[idx]
          const x = margin + col * colW

          if (row % 2 === 0) {
            doc.setFillColor(248, 248, 248)
            doc.rect(x, pageY - 3, blockW, ROW_H, 'F')
          }

          doc.setFontSize(FONT_SIZE)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(40, 40, 40)

          const name = truncate(item.description, nomeW - COL_PAD)
          doc.text(name, x + COL_PAD, pageY)
          doc.setFont('helvetica', 'bold')
          doc.text('+' + item.replenish, x + blockW - 1, pageY, { align: 'right' })
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
        }
        pageY += ROW_H
      }

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
