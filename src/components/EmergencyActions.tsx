import React, { useState } from 'react'
import { Phone, AlertTriangle, Shield, X } from 'lucide-react'

const EmergencyActions: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  const handleEmergencyCall = () => {
    // Here you can add logic for emergency security service call
    const phoneNumber = '+40 721 911 911' // Security service number
    window.location.href = `tel:${phoneNumber}`
  }

  const handleReportLostBracelet = () => {
    // Here you can add logic for reporting lost bracelet
    alert('Lost bracelet reporting feature will be added later')
  }

  if (!isVisible) {
    return (
      <button
        className="emergency-toggle"
        onClick={() => setIsVisible(true)}
        aria-label="Emergency Actions"
      >
        <Shield size={20} />
      </button>
    )
  }

  return (
    <div className="emergency-actions">
      <div className="emergency-backdrop" onClick={() => setIsVisible(false)} />
      <div className="emergency-panel">
        <div className="emergency-header">
          <h3>Emergency Actions</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="close-button"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="emergency-buttons">
          <button
            onClick={handleEmergencyCall}
            className="emergency-button danger"
          >
            <Phone size={24} />
            <div className="button-content">
                          <span className="button-title">Emergency Call</span>
            <span className="button-description">Contact security service</span>
            </div>
          </button>

          <button
            onClick={handleReportLostBracelet}
            className="emergency-button warning"
          >
            <AlertTriangle size={24} />
            <div className="button-content">
                          <span className="button-title">Lost Bracelet</span>
            <span className="button-description">Report loss or damage</span>
            </div>
          </button>
        </div>

        <div className="emergency-info">
          <p>Use these buttons only in emergency situations</p>
        </div>
      </div>
    </div>
  )
}

export default EmergencyActions 