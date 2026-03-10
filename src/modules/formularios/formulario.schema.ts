import { parseOptionalPositiveInt, parseRequiredPositiveInt } from '../../shared/validation/common'

export const formularioSchema = {
  parseListQuery(query: Record<string, unknown>) {
    return {
      postituloId: parseOptionalPositiveInt(query.postituloId, 'postituloId'),
    }
  },

  parseId(params: Record<string, unknown>) {
    return parseRequiredPositiveInt(params.id, 'id')
  },
}
