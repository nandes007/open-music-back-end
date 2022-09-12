const albumsModel = ({
  id,
  name,
  year
}) => ({
  id,
  name,
  year
})

const songsModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
})

module.exports = { albumsModel, songsModel }
