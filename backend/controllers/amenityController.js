import { sendData } from '../utils/apiResponse.js'
import * as amenityService from '../services/amenityService.js'

export async function listAmenities(req, res) {
  sendData(res, await amenityService.listAmenities(req.query))
}

export async function getAmenity(req, res) {
  sendData(res, await amenityService.getAmenityByCode(req.params.code))
}

export async function createAmenity(req, res) {
  sendData(res, await amenityService.createAmenity(req.body), 201)
}

export async function updateAmenity(req, res) {
  sendData(res, await amenityService.updateAmenity(req.params.code, req.body))
}

export async function deleteAmenity(req, res) {
  sendData(res, await amenityService.deleteAmenity(req.params.code))
}
