{Schema} = require 'mongoose'
module.exports =
  Song: new Schema
    title: String
    artist: String
    genre: String
  Setlist: