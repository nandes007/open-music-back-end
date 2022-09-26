const ClientError = require('../../exceptions/ClientError')

class AlbumsHandler {
  constructor (service, validator, storageService) {
    this._service = service
    this._validator = validator
    this._storageService = storageService

    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this)
    this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this)
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this)
  }

  async postAlbumHandler (request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload)
      const { name = 'noname', year } = request.payload

      const albumId = await this._service.addAlbum({ name, year })

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
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

  async getAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      const album = await this._service.getAlbumById(id)
      const songs = await this._service.getSongsByAlbumId(id)

      return {
        status: 'success',
        data: {
          album: {
            id: album.id,
            name: album.name,
            year: album.year,
            coverUrl: album.cover,
            songs
          }
        }
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
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

  async putAlbumByIdHandler (request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload)
      const { id } = request.params

      await this._service.editAlbumById(id, request.payload)

      return {
        status: 'success',
        message: 'Album berhasil diperbarui'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
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

  async deleteAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      await this._service.deleteAlbumById(id)

      return {
        status: 'success',
        message: 'Album berhasil dihapus'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
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

  async postAlbumCoverHandler (request, h) {
    try {
      const { cover } = request.payload
      const { id } = request.params

      this._validator.validateImageHandlersSchema(cover.hapi.headers)

      await this._service.isAlbumExists(id)
      const fileLocation = await this._storageService.writeFile(cover, cover.hapi)
      await this._service.uploadImage(id, fileLocation)

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah'
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
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

  async postAlbumLikesHandler (request, h) {
    try {
      const { id: albumId } = request.params
      const { id: userId } = request.auth.credentials

      await this._service.isAlbumExists(albumId)

      await this._service.likeAlbum(userId, albumId)

      const response = h.response({
        status: 'success',
        message: 'Album like berhasil dilakukan.'
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
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

  async getAlbumLikesHandler (request, h) {
    try {
      const { id } = request.params

      const likes = await this._service.getLikeAlbum(id)

      const response = h.response({
        status: 'success',
        data: {
          likes: likes.data
        }
      })
      response.code(200)
      if (likes.header) {
        response.header('X-Data-Source', 'cache')
      }
      // likes.header ? response.header('X-Data-Source', 'cache') : response.header('', '')
      // response.header('X-Data-Source', 'cache')
      // response.header()
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
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

module.exports = AlbumsHandler
