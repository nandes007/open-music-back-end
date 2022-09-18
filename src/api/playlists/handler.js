const ClientError = require('../../exceptions/ClientError')

class PlaylistsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
    this.postSongPlaylistHandler = this.postSongPlaylistHandler.bind(this)
    this.getSongsByPlaylistIdHandler = this.getSongsByPlaylistIdHandler.bind(this)
    this.deleteSongPlaylistByIdHandler = this.deleteSongPlaylistByIdHandler.bind(this)
    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this)
  }

  async postPlaylistHandler (request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload)
      const { name } = request.payload
      const { id: credentialId } = request.auth.credentials
      const playlistId = await this._service.addPlaylist({ name, owner: credentialId })

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId
        }
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

  async getPlaylistsHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._service.getPlaylists(credentialId)
    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  async deletePlaylistByIdHandler (request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._service.verifyPlaylistAccess(id, credentialId)
      await this._service.deletePlaylistById(id, credentialId)

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus'
      }
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

  async postSongPlaylistHandler (request, h) {
    try {
      this._validator.validateSongPlaylistPayload(request.payload)
      const { id: playlistId } = request.params
      const { songId } = request.payload
      const { id: credentialId } = request.auth.credentials

      await this._service.verifyPlaylistOwner(playlistId, credentialId)
      await this._service.isSongExist(songId)
      const songPlaylistId = await this._service.addPlaylistByPlaylistId(playlistId, songId)
      await this._service.addPaylistHistory(playlistId, songId, credentialId, 'add')

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          songPlaylistId
        }
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

  async getSongsByPlaylistIdHandler (request, h) {
    try {
      const { id: playlistId } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._service.verifyPlaylistOwner(playlistId, credentialId)
      const playlist = await this._service.getPlaylistById(playlistId)
      const songs = await this._service.getSongByPlaylistId(playlistId)

      return {
        status: 'success',
        data: {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            username: playlist.username,
            songs
          }
        }
      }
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

  async deleteSongPlaylistByIdHandler (request, h) {
    try {
      this._validator.validateSongPlaylistPayload(request.payload)
      const { songId } = request.payload
      const { id: playlistId } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._service.verifyPlaylistOwner(playlistId, credentialId)
      await this._service.deleteSongFromPlaylistById(playlistId, songId)
      await this._service.addPaylistHistory(playlistId, songId, credentialId, 'delete')

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus'
      }
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

  async getPlaylistActivitiesHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(id, credentialId)
    const playlistId = await this._service.isPlaylistExist(id)
    const activities = await this._service.getPlaylistActivities(id)

    return {
      status: 'success',
      data: {
        playlistId,
        activities
      }
    }
  }
}

module.exports = PlaylistsHandler
