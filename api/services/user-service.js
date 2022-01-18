const bcrypt = require('bcrypt')

// Helpers
const statusCode = require('../helpers/status-code')
const Response = require('../helpers/response')
const Token = require('../helpers/token')

// Repository
const UserRepository = require('../repositories/user-repository')

class UserService {
  static async signUp (res, data) {
    const user = await UserRepository.create(data)
    return Response.success(res, statusCode?.CREATED, user, 'You have registered successfully')
  }

  static async signIn (res, data) {
    // Find user by email
    const user = await UserRepository.findByEmail(data?.email)
    if (!user) {
      return Response.error(res, statusCode?.NOT_FOUND, 'No user with this email exists')
    }

    // Validate password
    const isMatch = bcrypt.compareSync(data?.password, user?.password)
    if (!isMatch) {
      return Response.error(res, statusCode?.NOT_AUTHORIZED, 'Email and password do not match')
    }

    // Generate a token to the session
    const token = Token.generate(user?.id, 'user')
    return Response.success(res, statusCode?.OK, { user, token }, 'You have authenticated successfully')
  }

  static async search (res, parameter) {
    const users = await UserRepository.search(parameter)
    if (users?.length === 0) {
      return Response.error(res, statusCode?.NOT_FOUND, 'No user found')
    }
    return Response.success(res, statusCode?.OK, users, 'Users list found')
  }

  static async getById (res, id) {
    const user = await UserRepository.findById(id)
    if (!user) {
      return Response.error(res, statusCode?.NOT_FOUND, 'No user with this id exists')
    }
    return Response.success(res, statusCode?.OK, user, `User of id: ${id}`)
  }

  static async update (res, data, id) {
    await UserRepository.update(data, id)
    const user = await UserRepository.findById(id)
    return Response.success(res, statusCode?.OK, user, 'You have updated your user account successfully')
  }

  static async delete (res, id) {
    await UserRepository.delete(id)
    return Response.success(res, statusCode?.NO_CONTENT)
  }
}

module.exports = UserService