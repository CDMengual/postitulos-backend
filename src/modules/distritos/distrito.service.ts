import { distritoRepository } from './distrito.repository'

export const distritoService = {
  async getAll() {
    return distritoRepository.findMany()
  },
}
