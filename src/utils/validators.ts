import { VALIDATION_RULES } from './constants'

// ===== VALIDATION TYPES =====

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

// ===== BASIC VALIDATORS =====

/**
 * Check if value is not empty
 */
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0
}

/**
 * Check if value has minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength
}

/**
 * Check if value has maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength
}

/**
 * Check if value matches pattern
 */
export const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value)
}

// ===== FIELD VALIDATORS =====

/**
 * Validate name field
 */
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = []
  
  if (!isRequired(name)) {
    errors.push('Name is required')
  } else {
    if (!hasMinLength(name, VALIDATION_RULES.MIN_NAME_LENGTH)) {
      errors.push(`Name must be at least ${VALIDATION_RULES.MIN_NAME_LENGTH} characters`)
    }
    if (!hasMaxLength(name, VALIDATION_RULES.MAX_NAME_LENGTH)) {
      errors.push(`Name must be less than ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate phone field
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = []
  
  if (!isRequired(phone)) {
    errors.push('Phone number is required')
  } else {
    const cleaned = phone.replace(/\D/g, '')
    
    if (!hasMinLength(cleaned, VALIDATION_RULES.MIN_PHONE_LENGTH)) {
      errors.push(`Phone number must be at least ${VALIDATION_RULES.MIN_PHONE_LENGTH} digits`)
    }
    if (!hasMaxLength(cleaned, VALIDATION_RULES.MAX_PHONE_LENGTH)) {
      errors.push(`Phone number must be less than ${VALIDATION_RULES.MAX_PHONE_LENGTH} digits`)
    }
    if (!matchesPattern(phone, VALIDATION_RULES.PHONE_PATTERN)) {
      errors.push('Phone number format is invalid')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate email field (optional)
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = []
  
  if (email.trim().length > 0) {
    if (!matchesPattern(email, VALIDATION_RULES.EMAIL_PATTERN)) {
      errors.push('Email format is invalid')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate bracelet code field
 */
export const validateBraceletCode = (code: string): ValidationResult => {
  const errors: string[] = []
  
  if (!isRequired(code)) {
    errors.push('Bracelet code is required')
  } else {
    const cleaned = code.replace(/\W/g, '')
    
    if (cleaned.length < 4) {
      errors.push('Bracelet code must be at least 4 characters')
    }
    if (cleaned.length > 20) {
      errors.push('Bracelet code must be less than 20 characters')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate tariff plan selection
 */
export const validateTariffPlan = (tariffPlanId: string): ValidationResult => {
  const errors: string[] = []
  
  if (!isRequired(tariffPlanId)) {
    errors.push('Please select a tariff plan')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===== FORM VALIDATORS =====

/**
 * Validate registration form
 */
export const validateRegistrationForm = (formData: {
  braceletCode: string
  parentName: string
  parentPhone: string
  parentEmail: string
  childName: string
  tariffPlanId: string
}): FormValidationResult => {
  const errors: Record<string, string[]> = {}
  
  // Validate bracelet code
  const braceletCodeResult = validateBraceletCode(formData.braceletCode)
  if (!braceletCodeResult.isValid) {
    errors.braceletCode = braceletCodeResult.errors
  }
  
  // Validate parent name
  const parentNameResult = validateName(formData.parentName)
  if (!parentNameResult.isValid) {
    errors.parentName = parentNameResult.errors
  }
  
  // Validate parent phone
  const phoneResult = validatePhone(formData.parentPhone)
  if (!phoneResult.isValid) {
    errors.parentPhone = phoneResult.errors
  }
  
  // Validate parent email (optional)
  const emailResult = validateEmail(formData.parentEmail)
  if (!emailResult.isValid) {
    errors.parentEmail = emailResult.errors
  }
  
  // Validate child name (optional but with length rules if provided)
  if (formData.childName.trim().length > 0) {
    const childNameResult = validateName(formData.childName)
    if (!childNameResult.isValid) {
      errors.childName = childNameResult.errors
    }
  }
  
  // Validate tariff plan
  const tariffResult = validateTariffPlan(formData.tariffPlanId)
  if (!tariffResult.isValid) {
    errors.tariffPlanId = tariffResult.errors
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate search form
 */
export const validateSearchForm = (query: string): ValidationResult => {
  const errors: string[] = []
  
  if (query.trim().length > 0 && query.trim().length < 2) {
    errors.push('Search query must be at least 2 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===== BUSINESS RULE VALIDATORS =====

/**
 * Validate if session can be ended
 */
export const canEndSession = (session: { status: string; is_active: boolean }): ValidationResult => {
  const errors: string[] = []
  
  if (!session.is_active) {
    errors.push('Session is already ended')
  }
  
  if (session.status === 'outside') {
    errors.push('Child must be inside to end session')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate if entry/exit action is allowed
 */
export const canToggleEntry = (session: { is_active: boolean }): ValidationResult => {
  const errors: string[] = []
  
  if (!session.is_active) {
    errors.push('Cannot toggle entry for inactive session')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate if bracelet can be registered
 */
export const canRegisterBracelet = (braceletCode: string, existingSessions: { bracelet_code: string; is_active: boolean }[]): ValidationResult => {
  const errors: string[] = []
  
  const activeSession = existingSessions.find(
    session => session.bracelet_code === braceletCode && session.is_active
  )
  
  if (activeSession) {
    errors.push('This bracelet is already registered and active')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===== UTILITY VALIDATORS =====

/**
 * Check if array is not empty
 */
export const isNotEmpty = <T>(array: T[]): boolean => {
  return array.length > 0
}

/**
 * Check if date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Check if number is positive
 */
export const isPositiveNumber = (value: number): boolean => {
  return value > 0
}

/**
 * Check if number is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

// ===== ASYNC VALIDATORS =====

/**
 * Validate bracelet code uniqueness (would be used with API)
 */
export const validateBraceletCodeUniqueness = async (
  code: string,
  checkFunction: (code: string) => Promise<boolean>
): Promise<ValidationResult> => {
  const errors: string[] = []
  
  try {
    const isUnique = await checkFunction(code)
    if (!isUnique) {
      errors.push('This bracelet code is already in use')
    }
  } catch {
    errors.push('Unable to verify bracelet code uniqueness')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate phone number uniqueness (would be used with API)
 */
export const validatePhoneUniqueness = async (
  phone: string,
  checkFunction: (phone: string) => Promise<boolean>
): Promise<ValidationResult> => {
  const errors: string[] = []
  
  try {
    const isUnique = await checkFunction(phone)
    if (!isUnique) {
      errors.push('This phone number is already registered')
    }
  } catch {
    errors.push('Unable to verify phone number uniqueness')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===== VALIDATION HELPERS =====

/**
 * Get first error message from validation result
 */
export const getFirstError = (result: ValidationResult): string => {
  return result.errors[0] || ''
}

/**
 * Get all errors as single string
 */
export const getAllErrors = (result: ValidationResult): string => {
  return result.errors.join(', ')
}

/**
 * Check if form has any errors
 */
export const hasFormErrors = (result: FormValidationResult): boolean => {
  return Object.keys(result.errors).length > 0
}

/**
 * Get field error message
 */
export const getFieldError = (result: FormValidationResult, fieldName: string): string => {
  const fieldErrors = result.errors[fieldName]
  return fieldErrors ? fieldErrors[0] : ''
}

/**
 * Get all field errors
 */
export const getAllFieldErrors = (result: FormValidationResult, fieldName: string): string[] => {
  return result.errors[fieldName] || []
} 