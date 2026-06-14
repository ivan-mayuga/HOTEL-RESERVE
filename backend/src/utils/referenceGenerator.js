export function nextBookingReference(sequenceNumber) {
  return `B${String(sequenceNumber).padStart(4, '0')}`
}

export function nextReceiptNumber(sequenceNumber) {
  return `RCPT-${String(sequenceNumber).padStart(4, '0')}`
}
