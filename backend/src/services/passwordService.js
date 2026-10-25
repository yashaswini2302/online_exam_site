import bcrypt from 'bcryptjs'
import { Buffer } from 'node:buffer'
import HttpError from '../utils/httpError.js'

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Password must be at least 12 characters and no more than 72 UTF-8 bytes')
  }
  const characterGroups = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/]
  if (characterGroups.filter((pattern) => pattern.test(password)).length < 3) {
    throw new HttpError(400, 'Use at least three of: lowercase letters, uppercase letters, numbers, and symbols')
  }
}

export async function hashPassword(password) {
  validatePassword(password)
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password, passwordHash) {
  if (typeof password !== 'string' || typeof passwordHash !== 'string' || !passwordHash) return false
  return bcrypt.compare(password, passwordHash)
}