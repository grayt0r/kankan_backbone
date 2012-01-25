((Cards) ->
  
  app = Kankan.app

  class Cards.Model extends Backbone.Model
  
  class Cards.Collection extends Backbone.Collection
    model: Cards.Model
    
    initialize: (models, options) ->
      @_meta = {}
      @meta 'boardId', options.boardId
      
    url: ->
      "http://localhost:3000/api/v1/cards/for_board?board_id=#{@meta('boardId')}"
    
    meta: (prop, val) ->
      if not val?
        return @_meta[prop]
      else
        @_meta[prop] = val 

) Kankan.module("cards")