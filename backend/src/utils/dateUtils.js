import { differenceInCalendarDays, isAfter, isBefore, isSameDay, parseISO, startOfToday } from 'date-fns'

export function assertValidStayDates(checkIn, checkOut) {
  const inDate = parseISO(checkIn)
  const outDate = parseISO(checkOut)
  const today = startOfToday()

  if (isBefore(inDate, today) && !isSameDay(inDate, today)) {
    throw new Error('Check-in date must not be before today')
  }

  if (!isAfter(outDate, inDate)) {
    throw new Error('Check-out date must be strictly after check-in')
  }

  return {
    checkIn: inDate,
    checkOut: outDate,
    numberOfDays: differenceInCalendarDays(outDate, inDate),
  }
}
