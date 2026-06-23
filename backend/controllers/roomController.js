import { sendData } from '../utils/apiResponse.js'
import * as roomService from '../services/roomService.js'

export async function listRooms(req, res) {
  sendData(res, await roomService.listRooms(req.query))
}

export async function getVacantRooms(req, res) {
  sendData(res, await roomService.getVacantRooms(req.query.checkIn, req.query.checkOut))
}

export async function getRoom(req, res) {
  sendData(res, await roomService.getRoomById(req.params.id))
}

export async function createRoom(req, res) {
  sendData(res, await roomService.createRoom(req.body), 201)
}

export async function updateRoom(req, res) {
  sendData(res, await roomService.updateRoom(req.params.id, req.body))
}

export async function deleteRoom(req, res) {
  sendData(res, await roomService.deleteRoom(req.params.id))
}

export async function updateAvailability(req, res) {
  sendData(res, await roomService.updateAvailability(req.params.id, req.body.isAvailable))
}
