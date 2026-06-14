import { sendData } from '../utils/apiResponse.js'
import * as receiptService from '../services/receiptService.js'

export async function listReceipts(_req, res) {
  sendData(res, await receiptService.listReceipts())
}

export async function getReceipt(req, res) {
  sendData(res, await receiptService.getReceiptByOrNumber(req.params.orNumber))
}

export async function getReceiptPdf(req, res) {
  const receipt = await receiptService.getReceiptByOrNumber(req.params.orNumber)
  const pdf = await receiptService.generatePdf(receipt)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${receipt.orNumber}.pdf"`)
  res.send(pdf)
}
