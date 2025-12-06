export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateDonationAmount = (amount: string): ValidationResult => {
  if (!amount || amount.trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }

  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (num < 1) {
    return { valid: false, error: 'Minimum donation is RM 1' };
  }

  if (num > 1000000) {
    return { valid: false, error: 'Amount cannot exceed RM 1,000,000' };
  }

  return { valid: true };
};

export const validateCampaignId = (id: string): ValidationResult => {
  if (!id || id.trim() === '') {
    return { valid: false, error: 'Campaign ID is required' };
  }

  return { valid: true };
};