const albumsModel = ({
  id,
  name,
  year,
  cover
}) => ({
  id,
  name,
  year,
  cover
})

const playlistsModel = ({
  id,
  name,
  username
}) => ({
  id,
  name,
  username
})

const playlistActivitiesModel = ({
  username,
  title,
  action,
  time
}) => ({
  username,
  title,
  action,
  time
})

module.exports = { albumsModel, playlistsModel, playlistActivitiesModel }
