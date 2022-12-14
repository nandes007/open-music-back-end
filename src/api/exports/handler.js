const ClientError = require('../../exceptions/ClientError')

class ExportsHandler {
  constructor (service, validator, playlistsService) {
    this._service = service
    this._validator = validator
    this._playlistsService = playlistsService

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this)
  }

  async postExportPlaylistsHandler (request, h) {
    try {
      const { playlistId } = request.params
      const { id: userId } = request.auth.credentials
      this._validator.validateExportPlaylistsPayload(request.payload)

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

      const message = {
        playlistId,
        userId,
        targetEmail: request.payload.targetEmail
      }

      await this._service.sendMessage('export:playlists', JSON.stringify(message))

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses'
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        return error
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }
}

module.exports = ExportsHandler
