// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation - at least 8 chars, with at least one number, one uppercase, one lowercase
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  return passwordRegex.test(password)
}

// Kenyan phone number validation (starts with +254 or 07xx/01xx)
export function isValidKenyanPhone(phone: string): boolean {
  const normalizedPhone = phone.replace(/\s+/g, "")
  // This regex matches Kenyan phone numbers in formats:
  // +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
  const kenyaPhoneRegex = /^(?:254|\+254|0)?(7|1)(?:(?:[0-9][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6}$/
  return kenyaPhoneRegex.test(normalizedPhone)
}

// Ensure amount is positive and within reasonable limits
export function isValidTransactionAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount > 0 && amount <= 1000000
}

// Format Kenyan phone number to international format
export function formatKenyanPhone(phone: string): string {
  const normalizedPhone = phone.replace(/\s+/g, "")

  if (normalizedPhone.startsWith("+254")) {
    return normalizedPhone
  }

  if (normalizedPhone.startsWith("254")) {
    return `+${normalizedPhone}`
  }

  if (normalizedPhone.startsWith("0")) {
    return `+254${normalizedPhone.substring(1)}`
  }

  return normalizedPhone
}

