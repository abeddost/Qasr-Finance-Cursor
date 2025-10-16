import * as XLSX from 'xlsx'

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  partner: string
  amount: number
  type: 'income' | 'expense'
}

export const parseExcelFile = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
        
        // Find header row and extract data
        const transactions = extractTransactions(jsonData)
        resolve(transactions)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsBinaryString(file)
  })
}

const extractTransactions = (data: any[][]): Transaction[] => {
  if (data.length < 2) return []
  
  // Find header row (look for common column names)
  const headerRow = data[0]
  
  // Map column indices
  const columnMap = {
    date: -1,
    description: -1,
    category: -1,
    partner: -1,
    amount: -1
  }
  
  // Find column indices
  headerRow.forEach((cell: any, index: number) => {
    const cellValue = String(cell).toLowerCase().trim()
    
    if (cellValue.includes('date')) {
      columnMap.date = index
    } else if (cellValue.includes('description') || cellValue.includes('memo') || cellValue.includes('note')) {
      columnMap.description = index
    } else if (cellValue.includes('category')) {
      columnMap.category = index
    } else if (cellValue.includes('partner') || cellValue.includes('person') || cellValue.includes('name')) {
      columnMap.partner = index
    } else if (cellValue.includes('amount') || cellValue.includes('value') || cellValue.includes('sum')) {
      columnMap.amount = index
    }
  })
  
  // If we couldn't find standard columns, assume first few columns
  if (columnMap.date === -1) columnMap.date = 0
  if (columnMap.description === -1) columnMap.description = 1
  if (columnMap.category === -1) columnMap.category = 2
  if (columnMap.partner === -1) columnMap.partner = 3
  if (columnMap.amount === -1) columnMap.amount = 4
  
  const transactions: Transaction[] = []
  
  // Process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    
    if (!row || row.length === 0) continue
    
    const date = parseDate(row[columnMap.date])
    const description = String(row[columnMap.description] || '').trim()
    const category = String(row[columnMap.category] || 'Uncategorized').trim()
    const partner = String(row[columnMap.partner] || 'Unknown').trim()
    const amount = parseAmount(row[columnMap.amount])
    
    // More lenient validation - only skip if absolutely necessary
    if (!date) {
      console.warn(`Skipping row ${i}: Invalid date - ${row[columnMap.date]}`)
      continue
    }
    
    if (!description) {
      console.warn(`Skipping row ${i}: Empty description`)
      continue
    }
    
    if (isNaN(amount)) {
      console.warn(`Skipping row ${i}: Invalid amount - ${row[columnMap.amount]}`)
      continue
    }
    
    transactions.push({
      id: `transaction-${i}`,
      date: date.toISOString().split('T')[0],
      description,
      category,
      partner,
      amount,
      type: amount >= 0 ? 'income' : 'expense'
    })
  }
  
  return transactions
}

const parseDate = (value: any): Date | null => {
  if (!value) return null
  
  // Handle Excel serial date numbers
  if (typeof value === 'number') {
    // Excel date serial number (days since 1900-01-01)
    const excelEpoch = new Date(1900, 0, 1)
    return new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000)
  }
  
  // Handle string dates - Support DD/MM/YYYY format
  if (typeof value === 'string') {
    const trimmed = value.trim()
    
    // Handle malformed dates like "25.0.9.2025" - this is likely "25.09.2025" with split month
    const malformedMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (malformedMatch) {
      console.log(`Malformed date detected: ${trimmed}`, malformedMatch)
      
      const day = parseInt(malformedMatch[1], 10)
      const monthPart1 = malformedMatch[2] // "0"
      const monthPart2 = malformedMatch[3]  // "9"
      const year = parseInt(malformedMatch[4], 10)
      
      // Combine the month parts: "0" + "9" = "09" = September
      const month = parseInt(monthPart1 + monthPart2, 10) - 1 // "09" = 9, then -1 = 8 (September)
      
      console.log(`Parsed as: Day=${day}, Month=${month + 1} (from ${monthPart1}${monthPart2}), Year=${year}`)
      const date = new Date(year, month, day)
      console.log(`Created date: ${date.toISOString()}`)
      
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        console.log(`✅ Successfully parsed malformed date: ${trimmed} -> ${date.toISOString()}`)
        return date
      } else {
        console.log(`❌ Date validation failed for: ${trimmed}`)
      }
    }
    
    // Handle another malformed pattern like "25.09.2025" but with extra dots
    const extraDotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.(\d{1,2})$/)
    if (extraDotMatch) {
      console.log(`Extra dot pattern detected: ${trimmed}`, extraDotMatch)
      const day = parseInt(extraDotMatch[1], 10)
      const month = parseInt(extraDotMatch[2], 10) - 1
      const year = parseInt(extraDotMatch[3], 10)
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date
      }
    }
    
    // Try DD/MM/YYYY format first
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10)
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1 // JavaScript months are 0-based
      const year = parseInt(ddmmyyyyMatch[3], 10)
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date
      }
    }
    
    // Try DD-MM-YYYY format
    const ddmmyyyyDashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
    if (ddmmyyyyDashMatch) {
      const day = parseInt(ddmmyyyyDashMatch[1], 10)
      const month = parseInt(ddmmyyyyDashMatch[2], 10) - 1
      const year = parseInt(ddmmyyyyDashMatch[3], 10)
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date
      }
    }
    
    // Try DD.MM.YYYY format
    const ddmmyyyyDotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (ddmmyyyyDotMatch) {
      const day = parseInt(ddmmyyyyDotMatch[1], 10)
      const month = parseInt(ddmmyyyyDotMatch[2], 10) - 1
      const year = parseInt(ddmmyyyyDotMatch[3], 10)
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date
      }
    }
    
    // Try to fix common malformed patterns before fallback
    let fixedDate = trimmed
    
    // Fix patterns like "25.0.9.2025" by removing the extra part
    const fixPattern1 = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (fixPattern1) {
      fixedDate = `${fixPattern1[1]}.${fixPattern1[2]}.${fixPattern1[4]}`
      console.log(`Fixed pattern 1: ${trimmed} -> ${fixedDate}`)
    }
    
    // Fix patterns like "25.09.2025.9" by removing the extra part
    const fixPattern2 = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.(\d{1,2})$/)
    if (fixPattern2) {
      fixedDate = `${fixPattern2[1]}.${fixPattern2[2]}.${fixPattern2[3]}`
      console.log(`Fixed pattern 2: ${trimmed} -> ${fixedDate}`)
    }
    
    // Try parsing the fixed date
    const date = new Date(fixedDate)
    if (!isNaN(date.getTime())) {
      console.log(`Successfully parsed fixed date: ${trimmed} -> ${fixedDate} -> ${date.toISOString()}`)
      return date
    }
    
    // Final fallback to standard Date parsing
    const fallbackDate = new Date(trimmed)
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value
  }
  
  return null
}

const parseAmount = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0
  
  // Handle string amounts (remove currency symbols, commas, spaces)
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,€£¥\s]/g, '').replace(/,/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  
  // Handle numeric values
  if (typeof value === 'number') {
    return value
  }
  
  return 0
}
