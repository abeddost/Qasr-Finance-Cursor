import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { parseExcelFile } from '../utils/excelParser'
import type { Transaction } from '../utils/excelParser'

interface FileUploadProps {
  onFileUpload: (transactions: Transaction[]) => void
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload a valid Excel file (.xlsx, .xls) or CSV file')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const transactions = await parseExcelFile(file)
      
      if (transactions.length === 0) {
        setError('No valid transaction data found in the file. Please check the format.')
        return
      }

      onFileUpload(transactions)
    } catch (err) {
      setError('Failed to parse the Excel file. Please check the format and try again.')
      console.error('File parsing error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [onFileUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="text-gray-600">Processing your file...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                  <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upload your Excel file
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>

              <button className="btn-primary inline-flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Expected Excel Format</h4>
        <p className="text-sm text-blue-700 mb-2">
          Your Excel file should contain columns for:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Date:</strong> Transaction date</li>
          <li>• <strong>Description:</strong> Transaction description or memo</li>
          <li>• <strong>Category:</strong> Transaction category</li>
          <li>• <strong>Amount:</strong> Transaction amount (positive for income, negative for expenses)</li>
        </ul>
      </div>
    </div>
  )
}

export default FileUpload
