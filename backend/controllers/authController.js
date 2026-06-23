import { sendData } from '../utils/apiResponse.js'
import * as authService from '../services/authService.js'

export async function login(req, res) {
  sendData(res, await authService.loginStaff(req.body))
}
