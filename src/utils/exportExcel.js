import * as XLSX from 'xlsx'
export function exportToExcel(results, coverage) {
  const wb = XLSX.utils.book_new()
  const repData = [['Produto', 'Genero', 'Grupo', 'Artigo', 'Qtd. Loja', 'Estoque Extra', 'Meta', 'Reposicao']]
  results.raw.forEach(item => { if (item.replenish > 0) repData.push([item.description, item.gender, item.group, item.article, item.storeCount, item.extra, item.target, item.replenish]) })
  const wsRep = XLSX.utils.aoa_to_sheet(repData)
  wsRep['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsRep, 'Reposicao')
  const excData = [['Produto', 'Genero', 'Artigo', 'Qtd. Loja', 'Meta', 'Excesso']]
  results.raw.forEach(item => { if (item.replenish < 0) excData.push([item.description, item.gender, item.article, item.storeCount, item.target, Math.abs(item.replenish)]) })
  const wsExc = XLSX.utils.aoa_to_sheet(excData)
  wsExc['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsExc, 'Excesso')
  const cobData = [['Artigo', 'Feminina', 'Masculina']]
  const articles = [...new Set([...Object.keys(coverage.FEMININA || {}), ...Object.keys(coverage.MASCULINA || {})])]
  articles.forEach(a => cobData.push([a, coverage.FEMININA?.[a] || 0, coverage.MASCULINA?.[a] || 0]))
  const wsCob = XLSX.utils.aoa_to_sheet(cobData)
  wsCob['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, wsCob, 'Coberturas')
  XLSX.writeFile(wb, 'transfera_' + new Date().toISOString().slice(0, 10) + '.xlsx')
}