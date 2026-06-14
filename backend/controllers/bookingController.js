import { sendData } from '../utils/apiResponse.js'
import * as bookingService from '../services/bookingService.js'
import * as paymentService from '../services/paymentService.js'

export async function listBookings(req, res) {
  sendData(res, await bookingService.listBookings(req.query))
}

export async function getBooking(req, res) {
  sendData(res, await bookingService.getBookingByReference(req.params.referenceNumber))
}

export async function createBooking(req, res) {
  sendData(res, await bookingService.createReservation(req.body), 201)
}

export async function payBooking(req, res) {
  sendData(res, await paymentService.processPayment(req.params.referenceNumber, req.body))
}

export async function checkoutBooking(req, res) {
  sendData(res, await bookingService.checkoutGuest(req.params.referenceNumber))
}

export async function cancelBooking(req, res) {
  sendData(res, await bookingService.cancelReservation(req.params.referenceNumber))
}
