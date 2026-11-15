import React, { useState, useRef } from 'react'
import { exportData, downloadAsJSON, importData } from '@/utils/backup'
import { Download, Upload, CheckCircle2, AlertCircle, FileArchive } from 'lucide-react'

interface BackupRestoreProps {
  userId?: string
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ userId = 'default_user' }) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const data = exportData(userId)
      const filename = `examflow-backup-${new Date().toISOString().slice(0, 10)}.json`
      downloadAsJSON(data, filename)
      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' })
      setTimeout(() => setStatusMessage(null), 4000)
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Export failed: ${e.message}` })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)

        const confirmed = window.confirm(
          'Importing will merge study sessions, task completions, and notes from this backup file. Continue?'
        )
        if (!confirmed) {
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        }

        const res = importData(parsed, userId)
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: `Successfully imported ${res.count} items from backup! Refreshing...`,
          })
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Failed to import backup.',
          })
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Invalid backup file format: ${err.message}`,
        })
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-1">
        <FileArchive className="w-5 h-5 text-primary-500" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Backup & Restore Data</h3>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
        Export your complete preparation progress, formula notes, and study session history to a portable JSON file,
        or restore onto any device.
      </p>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl mb-4 text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors min-touch"
        >
          <Download className="w-4 h-4" />
          Export Backup (JSON)
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-colors min-touch"
        >
          <Upload className="w-4 h-4" />
          Import Backup
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />
      </div>
    </div>
  )
}
