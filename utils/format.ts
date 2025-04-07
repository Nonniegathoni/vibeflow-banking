export function formatKES(amount: number | null | undefined): string {
  if (amount == null) {
    return 'Ksh ---';
  }
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
      return 'Ksh ---';
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}