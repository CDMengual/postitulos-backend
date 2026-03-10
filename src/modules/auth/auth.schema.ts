import { parseRequiredTrimmedString } from '../../shared/validation/common'

export const authSchema = {
  parseLogin(body: Record<string, unknown>) {
    return {
      email: parseRequiredTrimmedString(body.email, 'email'),
      password: parseRequiredTrimmedString(body.password, 'password'),
    }
  },

  parseChangePassword(body: Record<string, unknown>) {
    return {
      currentPassword: parseRequiredTrimmedString(body.currentPassword, 'currentPassword'),
      newPassword: parseRequiredTrimmedString(body.newPassword, 'newPassword'),
    }
  },
}
