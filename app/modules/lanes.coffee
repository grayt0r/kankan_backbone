((Lanes) ->
  
  app = Kankan.app

  class Lanes.Model extends Backbone.Model
    url: "http://localhost:3000/api/v1/lanes"
  
  class Lanes.Collection extends Backbone.Collection
    model: Lanes.Model
    
    initialize: (models, options) ->
      @_meta = {}
      @meta 'boardId', options.boardId
      
    url: ->
      "http://localhost:3000/api/v1/lanes?board_id=#{@meta('boardId')}"
    
    meta: (prop, val) ->
      if not val?
        return @_meta[prop]
      else
        @_meta[prop] = val 

) Kankan.module("lanes")