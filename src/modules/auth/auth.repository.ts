import { userRepository } from '../users/user.repository'

export const authRepository = {
  findByEmail(email: string) {
    return userRepository.findAuthByEmail(email)
  },

  findPasswordById(id: number) {
    return userRepository.findPasswordById(id)
  },

  updatePassword(id: number, password: string) {
    return userRepository.updatePassword(id, password)
  },

  findCurrentUserById(id: number) {
    return userRepository.findCurrentUserById(id)
  },
}
