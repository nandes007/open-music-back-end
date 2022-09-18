const { postPlaylistPayloadSchema, songPlaylistPayloadSchema } = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = postPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateSongPlaylistPayload: (payload) => {
    const validationResult = songPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = PlaylistsValidator
