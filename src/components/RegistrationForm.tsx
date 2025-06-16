import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, CreditCard, Loader2, X } from 'lucide-react'
import { BraceletAPI } from '../lib/api'
// For testing with mock data, uncomment the line below:
// import { MockBraceletAPI as BraceletAPI } from '../lib/mockData'
import type { TariffPlan } from '../types'
import toast from 'react-hot-toast'

interface RegistrationFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialBraceletCode?: string
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialBraceletCode = '' 
}) => {
  const [formData, setFormData] = useState({
    braceletCode: initialBraceletCode,
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    childName: '',
    tariffPlanId: ''
  })
  
  const [tariffPlans, setTariffPlans] = useState<TariffPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTariffs, setLoadingTariffs] = useState(true)

  useEffect(() => {
    const loadTariffPlans = async () => {
      try {
        setLoadingTariffs(true)
        const plans = await BraceletAPI.getTariffPlans()
        setTariffPlans(plans)
        
        // Select default plan (1 day)
        const defaultPlan = plans.find((p: TariffPlan) => p.name === '1 Day') || plans[0]
        if (defaultPlan) {
          setFormData(prev => ({ ...prev, tariffPlanId: defaultPlan.id }))
        }
      } catch (error) {
        console.error('Error loading tariffs:', error)
        toast.error('Error loading tariff plans')
      } finally {
        setLoadingTariffs(false)
      }
    }

    loadTariffPlans()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.braceletCode.trim()) {
      toast.error('Please enter bracelet code')
      return
    }
    
    if (!formData.parentName.trim()) {
      toast.error('Please enter parent name')
      return
    }
    
    if (!formData.parentPhone.trim()) {
      toast.error('Please enter parent phone')
      return
    }
    
    if (!formData.tariffPlanId) {
      toast.error('Please select a tariff plan')
      return
    }

    try {
      setLoading(true)
      
      await BraceletAPI.registerBracelet(
        formData.braceletCode.trim(),
        formData.parentName.trim(),
        formData.parentPhone.trim(),
        formData.childName.trim() || undefined,
        formData.tariffPlanId,
        formData.parentEmail.trim() || undefined
      )
      
      toast.success('🎉 Bracelet registered successfully!')
      onSuccess()
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedTariff = tariffPlans.find(t => t.id === formData.tariffPlanId)

  return (
    <div className="registration-form">
      <div className="form-header">
        <h2>🎪 Register New Bracelet</h2>
        <button 
          onClick={onCancel}
          className="close-button"
          aria-label="Close form"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Bracelet Code */}
        <div className="form-group">
          <label htmlFor="braceletCode" className="form-label">
            <CreditCard size={16} />
            Bracelet Code *
          </label>
          <input
            id="braceletCode"
            type="text"
            value={formData.braceletCode}
            onChange={(e) => handleInputChange('braceletCode', e.target.value)}
            placeholder="Enter or scan bracelet code"
            className="form-input"
            required
          />
        </div>

        {/* Parent Information */}
        <div className="form-section">
          <h3 className="section-title">👨‍👩‍👧‍👦 Parent Information</h3>
          
          <div className="form-group">
            <label htmlFor="parentName" className="form-label">
              <User size={16} />
              Parent Name *
            </label>
            <input
              id="parentName"
              type="text"
              value={formData.parentName}
              onChange={(e) => handleInputChange('parentName', e.target.value)}
              placeholder="Enter parent's full name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="parentPhone" className="form-label">
              <Phone size={16} />
              Parent Phone *
            </label>
            <input
              id="parentPhone"
              type="tel"
              value={formData.parentPhone}
              onChange={(e) => handleInputChange('parentPhone', e.target.value)}
              placeholder="+40 721 123 456"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="parentEmail" className="form-label">
              <Mail size={16} />
              Email (Optional)
            </label>
            <input
              id="parentEmail"
              type="email"
              value={formData.parentEmail}
              onChange={(e) => handleInputChange('parentEmail', e.target.value)}
              placeholder="parent@example.com"
              className="form-input"
            />
          </div>
        </div>

        {/* Child Information */}
        <div className="form-section">
          <h3 className="section-title">🧒 Child Information</h3>
          
          <div className="form-group">
            <label htmlFor="childName" className="form-label">
              <User size={16} />
              Child Name (Optional)
            </label>
            <input
              id="childName"
              type="text"
              value={formData.childName}
              onChange={(e) => handleInputChange('childName', e.target.value)}
              placeholder="Enter child's name"
              className="form-input"
            />
          </div>
        </div>

        {/* Tariff Plan */}
        <div className="form-section">
          <h3 className="section-title">💰 Select Plan</h3>
          
          {loadingTariffs ? (
            <div className="tariff-loading">
              <Loader2 size={20} className="spinner" />
              <span>Loading plans...</span>
            </div>
          ) : (
            <div className="tariff-options">
              {tariffPlans.map((tariff) => (
                <label key={tariff.id} className="tariff-option">
                  <input
                    type="radio"
                    name="tariffPlan"
                    value={tariff.id}
                    checked={formData.tariffPlanId === tariff.id}
                    onChange={(e) => handleInputChange('tariffPlanId', e.target.value)}
                    className="tariff-radio"
                  />
                  <div className="tariff-info">
                    <div className="tariff-header">
                      <span className="tariff-name">{tariff.name}</span>
                      <span className="tariff-price">${tariff.price}</span>
                    </div>
                    <p className="tariff-description">{tariff.description}</p>
                    <p className="tariff-duration">
                      Duration: {tariff.duration_hours >= 24 
                        ? `${Math.floor(tariff.duration_hours / 24)} day${Math.floor(tariff.duration_hours / 24) > 1 ? 's' : ''}`
                        : `${tariff.duration_hours} hour${tariff.duration_hours > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {selectedTariff && (
          <div className="form-summary">
            <div className="summary-row">
              <span>Selected Plan:</span>
              <span>{selectedTariff.name}</span>
            </div>
            <div className="summary-row">
              <span>Duration:</span>
              <span>
                {selectedTariff.duration_hours >= 24 
                  ? `${Math.floor(selectedTariff.duration_hours / 24)} day${Math.floor(selectedTariff.duration_hours / 24) > 1 ? 's' : ''}`
                  : `${selectedTariff.duration_hours} hour${selectedTariff.duration_hours > 1 ? 's' : ''}`
                }
              </span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span className="price">${selectedTariff.price}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="action-button secondary"
            disabled={loading}
          >
            <X size={16} />
            Cancel
          </button>
          
          <button
            type="submit"
            className="action-button primary"
            disabled={loading || !selectedTariff}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinner" />
                Registering...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Register Bracelet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegistrationForm 