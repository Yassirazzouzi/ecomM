import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  id?: string
  email: string
  password?: string // Hashed password
  name?: string
  image?: string
  emailVerified?: Date
  createdAt?: Date
  updatedAt?: Date
}
