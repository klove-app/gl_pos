import React, { useState, useRef } from 'react'
import { Camera, Upload, Loader2 } from 'lucide-react'

interface QrScannerProps {
  onScan: (code: string) => void
  loading?: boolean
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, loading = false }) => {
  const [manualCode, setManualCode] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      setManualCode('')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Here you can add QR code image processing
      // For now, we simulate reading
      const mockCode = `BR-${Date.now()}`
      onScan(mockCode)
    }
  }

  return (
    <div className="qr-scanner">
      <div className="scanner-content">
        {loading ? (
          <div className="scanner-loading">
            <Loader2 size={48} className="spinner" />
            <p>Processing bracelet...</p>
          </div>
        ) : (
          <>
            {/* Scanner Area */}
            <div className="scanner-area">
              <div className="scanner-frame">
                <div className="scanner-corners">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
                <Camera size={64} className="camera-icon" />
                <p>Point camera at bracelet QR code</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="scanner-actions">
              <button 
                type="button"
                className="action-button secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} />
                Upload Photo
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                aria-label="Upload QR code image"
              />
            </div>

            {/* Manual Input */}
            <div className="manual-input">
              <h3>Or enter code manually</h3>
              <form onSubmit={handleManualSubmit} className="manual-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter bracelet code"
                    className="code-input"
                  />
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={!manualCode.trim()}
                  >
                    Scan
                  </button>
                </div>
              </form>
            </div>

            {/* Help Instructions */}
            <div className="scanner-help">
              <h4>🎪 How it works:</h4>
              <ul>
                <li>🆕 New bracelet → Registration</li>
                <li>✅ Registered bracelet → Entry/Exit</li>
                <li>🏠 Inside → Mark exit</li>
                <li>🚪 Outside → Mark entry</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default QrScanner 