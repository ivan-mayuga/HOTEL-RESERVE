import { differenceInCalendarDays, isAfter, isBefore, isSameDay, parseISO, startOfToday } from 'date-fns'

export function validateDate(value) {
  const date = value instanceof Date ? value : parseISO(String(value))
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }
  return date
}

export function isBeforeToday(value) {
  const date = validateDate(value)
  const today = startOfToday()
  return isBefore(date, today) && !isSameDay(date, today)
}

export function dateDifferenceInDays(start, end) {
  return differenceInCalendarDays(validateDate(end), validateDate(start))
}

export function validateStayDates(checkIn, checkOut) {
  const inDate = validateDate(checkIn)
  const outDate = validateDate(checkOut)

  if (isBeforeToday(inDate)) {
    throw new Error('Check-in date must not be before today')
  }

  if (!isAfter(outDate, inDate)) {
    throw new Error('Check-out date must be strictly after check-in')
  }

  return {
    checkIn: inDate,
    checkOut: outDate,
    numberOfDays: dateDifferenceInDays(inDate, outDate),
  }
}
