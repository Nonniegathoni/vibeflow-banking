export const detectFraud = (transaction, user) => {
  // Large transaction amount
  if (transaction.amount > 1000000) {
    return true
  }

  // Unusual time for transaction
  const hour = new Date(transaction.date).getHours()
  if (hour < 6 || hour > 23) {
    return true
  }

  // Multiple transactions in a short time
  // This would require checking recent transactions, which we're not implementing here for simplicity

  // Unusual location
  // This would require tracking and checking transaction locations, which we're not implementing here

  return false
}

