import { sendData } from '../utils/apiResponse.js'
import * as roomService from '../services/roomService.js'

export async function listRooms(req, res) {
  sendData(res, await roomService.listRooms(req.query))
}

export async function getVacantRooms(_req, res) {
  sendData(res, await roomService.getVacantRooms())
}

export async function getRoom(req, res) {
  sendData(res, await roomService.getRoomById(req.params.id))
}

export async function createRoom(req, res) {
  sendData(res, await roomService.createRoom(req.body), 201)
}

export async function updateAvailability(req, res) {
  sendData(res, await roomService.updateAvailability(req.params.id, req.body.isAvailable))
}
