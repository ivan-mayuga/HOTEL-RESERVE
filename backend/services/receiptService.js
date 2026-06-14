import PDFDocument from 'pdfkit'
import { Receipt } from '../models/Receipt.js'
import { generate } from '../utils/referenceGenerator.js'
import { formatWithCommas } from '../utils/priceFormatter.js'
import { createHttpError } from '../utils/apiResponse.js'

export async function generateReceipt(booking, options = {}) {
  const orNumber = await generate('RCPT-', Receipt, 'orNumber')
  const receipt = new Receipt({
    orNumber,
    bookingRef: booking._id,
    referenceNumber: booking.referenceNumber,
    guestName: booking.guestName,
    roomNumber: booking.roomNumber,
    roomType: booking.roomType,
    roomRate: booking.roomRate,
    amenitiesTotal: booking.amenitiesTotal,
    finalAmount: booking.finalAmount,
    amountReceived: booking.amountReceived,
    change: booking.change,
    paymentMethod: booking.paymentMethod,
    issuedAt: new Date(),
  })

  return receipt.save(options)
}

export async function listReceipts() {
  return Receipt.find().sort({ issuedAt: -1 })
}

export async function getReceiptByOrNumber(orNumber) {
  const receipt = await Receipt.findOne({ orNumber: String(orNumber).toUpperCase() })
  if (!receipt) throw createHttpError('Receipt not found', 404)
  return receipt
}

export function generatePdf(receipt) {
  const doc = new PDFDocument({ margin: 56 })
  const chunks = []

  doc.on('data', (chunk) => chunks.push(chunk))

  doc.fontSize(20).text('ESPLENIN HOTEL', { align: 'center' })
  doc.fontSize(12).text('Official Receipt', { align: 'center' })
  doc.moveDown()
  doc.moveTo(56, doc.y).lineTo(556, doc.y).stroke()
  doc.moveDown()

  writeRow(doc, 'OR Number', receipt.orNumber)
  writeRow(doc, 'Reference Number', receipt.referenceNumber)
  writeRow(doc, 'Guest Name', receipt.guestName)
  writeRow(doc, 'Room', `${receipt.roomNumber} - ${receipt.roomType}`)
  writeRow(doc, 'Payment Method', receipt.paymentMethod)
  writeRow(doc, 'Issued At', new Date(receipt.issuedAt).toLocaleString())

  doc.moveDown()
  doc.fontSize(14).text('Line Items')
  doc.moveDown(0.4)
  writeRow(doc, 'Room Rate', `PHP ${formatWithCommas(receipt.roomRate)}`)
  writeRow(doc, 'Amenities Total', `PHP ${formatWithCommas(receipt.amenitiesTotal)}`)
  writeRow(doc, 'Total Due', `PHP ${formatWithCommas(receipt.finalAmount)}`)
  writeRow(doc, 'Amount Paid', `PHP ${formatWithCommas(receipt.amountReceived)}`)
  writeRow(doc, 'Change', `PHP ${formatWithCommas(receipt.change)}`)

  doc.end()

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

function writeRow(doc, label, value) {
  doc.fontSize(11).text(label, { continued: true, width: 180 })
  doc.font('Helvetica-Bold').text(String(value), { align: 'right' })
  doc.font('Helvetica')
}
