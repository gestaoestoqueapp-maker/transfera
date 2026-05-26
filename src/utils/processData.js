function detectHeaderRow(rows, minCells = 3) {
  for (let i = 0; i < rows.length; i++) {
    const filled = (rows[i] || []).filter(c => c !== null && c !== undefined && String(c).trim() !== '').length
    if (filled >= minCells) return i
  }
  return 0
}

export function parseSystemData(rawData) {
  const products = []
  const headerRow = detectHeaderRow(rawData)

  for (let i = headerRow + 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0]) continue
    const code = String(row[0]).trim()
    const saldo = Number(row[5]) || 0
    if (!isNaN(Number(code)) && Number(code) > 0 && saldo >= 0) {
      products.push({ code, saldo })
    }
  }

  return products
}

export function parseBaseData(rawData) {
  const base = {}
  if (!rawData || rawData.length < 2) return base

  const headerRow = detectHeaderRow(rawData)

  for (let i = headerRow + 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0]) continue
    const code = String(row[0]).trim()
    const description = String(row[1] || '').trim()
    const nameColor = String(row[2] || '').trim()
    const barcode = String(row[12] || row[0]).trim()
    const group = String(row[14] || '').trim().toUpperCase()
    const gender = String(row[15] || '').trim().toUpperCase()
    const article = String(row[17] || '').trim().toUpperCase()

    base[code] = { code, description, nameColor, barcode, group, gender, article }
    if (barcode !== code) {
      base[barcode] = { code, description, nameColor, barcode, group, gender, article }
    }
  }

  return base
}

export function parseInventoryExcel(rawData) {
  const counts = {}
  if (!rawData || rawData.length < 2) return counts

  const headerRow = detectHeaderRow(rawData)

  for (let i = headerRow + 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0]) continue
    const barcode = String(row[0]).trim()
    if (!barcode || isNaN(Number(barcode))) continue
    counts[barcode] = (counts[barcode] || 0) + 1
  }

  return counts
}

export function parseInventoryTxt(lines, baseData) {
  const counts = {}
  const errors = []

  lines.forEach((line, index) => {
    const clean = line.trim()
    if (!clean) {
      errors.push({ line: index + 1, value: '', reason: 'Linha vazia' })
      return
    }
    if (!/^\d+$/.test(clean)) {
      errors.push({ line: index + 1, value: clean, reason: 'Caractere inválido' })
      return
    }
    if (!baseData[clean]) {
      errors.push({ line: index + 1, value: clean, reason: 'Código não encontrado na base' })
      return
    }
    counts[clean] = (counts[clean] || 0) + 1
  })

  return { counts, errors }
}

export function calculateResults(systemData, baseData, inventoryByStorage, storages, coverage, ignoredArticles) {
  const results = []
  const safeIgnored = ignoredArticles || {}

  const activeStorages = storages.filter(s => s.active)
  const uploadStorages = activeStorages.slice(0, -1)
  const calculatedStorage = activeStorages[activeStorages.length - 1]

  systemData.forEach(({ code, saldo }) => {
    const product = baseData[code]
    if (!product || !product.article || !product.gender) return

    const ignoredForGender = safeIgnored[product.gender] || []
    if (ignoredForGender.includes(product.article)) return

    const countsByStorage = {}
    let totalCounted = 0

    uploadStorages.forEach(storage => {
      const counts = inventoryByStorage[storage.id] || {}
      const qty = counts[code] || counts[product.barcode] || 0
      countsByStorage[storage.id] = qty
      totalCounted += qty
    })

    const calculatedQty = Math.max(saldo - totalCounted, 0)
    if (calculatedStorage) {
      countsByStorage[calculatedStorage.id] = calculatedQty
    }

    const storeCount = countsByStorage[uploadStorages[0]?.id] || 0
    const extra = calculatedQty
    const genderKey = product.gender
    const target = coverage[genderKey]?.[product.article] || 0
    let replenish = 0

    if (extra + storeCount === 0) {
      replenish = 0
    } else if (target - storeCount > 0) {
      replenish = Math.min(extra, target - storeCount)
    } else {
      replenish = target - storeCount
    }

    if (replenish !== 0) {
      results.push({
        code,
        description: product.description,
        nameColor: product.nameColor || '',
        gender: product.gender,
        group: product.group,
        article: product.article,
        storeCount,
        extra,
        target,
        replenish,
        countsByStorage,
      })
    }
  })

  return results
}

export function groupResults(results) {
  const groups = {}

  results.forEach(item => {
    const key = item.article + ' ' + item.gender
    if (!groups[key]) {
      groups[key] = {
        key,
        article: item.article,
        gender: item.gender,
        total: 0,
        byProduct: {},
      }
    }
    groups[key].total += item.replenish

    const productKey = item.nameColor || item.description.replace(/\s+\S+$/, '').trim()
    if (!groups[key].byProduct[productKey]) {
      groups[key].byProduct[productKey] = {
        key: productKey,
        name: productKey,
        total: 0,
        items: [],
      }
    }
    groups[key].byProduct[productKey].total += item.replenish
    groups[key].byProduct[productKey].items.push(item)
  })

  return Object.values(groups).map(g => ({
    ...g,
    items: Object.values(g.byProduct).sort((a, b) => Math.abs(b.total) - Math.abs(a.total)),
  })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
}
