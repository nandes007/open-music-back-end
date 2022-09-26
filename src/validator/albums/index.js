const { AlbumPayloadSchema, ImageHandlersSchema } = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateImageHandlersSchema: (headers) => {
    const validationResult = ImageHandlersSchema.validate(headers)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = AlbumsValidator
