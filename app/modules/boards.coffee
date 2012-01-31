((Boards) ->
  
  app = Kankan.app
  Cards = Kankan.module("cards")
  Lanes = Kankan.module("lanes")

  class Boards.Model extends Backbone.Model
  
  class Boards.Collection extends Backbone.Collection
    model: Boards.Model
    url: "http://localhost:3000/api/v1/boards"
  
  class Boards.Router extends Backbone.Router    
    routes:
      'boards': 'index',
      'boards/:id': 'show'
      
    boards: new Boards.Collection

    index: ->
      #console.log 'ROUTING: boards/index'
      if Kankan.session.enforceAuthorisation()
        index = new Boards.Views.Index({ collection: @boards })
    
    show: (id) ->
      #console.log 'ROUTING: boards/show'
      if Kankan.session.enforceAuthorisation()
        board = @boards.get(id)
        lanes = new Lanes.Collection(null, { boardId: id })
        cards = new Cards.Collection(null, { boardId: id })
        show = new Boards.Views.Show({ model: board, collection: lanes })
        cardsList = new Boards.Views.CardsList({ model: board, collection: cards }, lanes)

  class Boards.Views.Index extends Backbone.View
    template: '/app/templates/boards/index.html'
    
    events:
      'click .board_link': 'showBoard'
    
    initialize: ->
      boards = @collection
      boards.bind 'reset', @render, @
      boards.bind 'add', @render, @
      boards.bind 'remove', @render, @
      boards.fetch()

    render: ->
      view = this
      Kankan.fetchTemplate @template, (tmpl) ->
        $(view.el).html tmpl({ boards: view.collection.models })
        $("#main").html view.el
    
    showBoard: (ev) ->
      ev.preventDefault()
      Backbone.history.navigate('boards/' + $(ev.target).attr('data-board-id'), true)
  
  class Boards.Views.Show extends Backbone.View
    template: '/app/templates/boards/show.html'
    
    initialize: ->
      lanes = @collection
      lanes.bind 'reset', @render, @
      lanes.bind 'add', @render, @
      lanes.bind 'remove', @render, @
      lanes.fetch()
    
    render: ->
      view = @
      Kankan.fetchTemplate @template, (tmpl) ->
        $(view.el).html tmpl({ board: view.model, lanes: view.collection.models })
        $("#main").html view.el
        
        @$('#cardModal').modal { backdrop: true, keyboard: true }
        
        app.trigger 'kankan.lanes.rendered'
  
  class Boards.Views.CardsList extends Backbone.View
    template: '/app/templates/boards/cardModal.html'
    
    initialize: (opts, lanes) ->
      @lanes = lanes
      cards = @collection
      cards.bind 'reset', @addAll, @
      cards.bind 'add', @addOne, @
      
      view = @
      app.bind 'kankan.lanes.rendered', ->
        $('form').on 'submit', view.createCard
        $('.board').on 'click', '.card', view.showCard
        cards.fetch()
    
    addAll: ->
      @collection.each @addOne
    
    addOne: (card) ->
      view = new Boards.Views.Card({ model: card })
      view.render (el) ->
        @$("#lane_#{card.get('lane_id')}").append el
    
    createCard: (ev) =>
      ev.preventDefault()
      card = @collection.create({
        title: $('#cardTitle').val(),
        lane_id: @lanes.first().id
      })
      $('#cardTitle').val('')
      card
    
    showCard: (ev) =>
      cardId = $(ev.target).attr 'data-card-id'
      card = @collection.get cardId

      Kankan.fetchTemplate @template, (tmpl) ->
        @$('#cardModal .modal-contents').html tmpl({ card: card })
        @$('#cardModal').modal 'show'
  
  class Boards.Views.Card extends Backbone.View
    template: '/app/templates/boards/card.html'

    initialize: ->
      @model.bind 'change', @render, @
      @model.bind 'destroy', @remove, @

    render: (done) ->
      view = @
      Kankan.fetchTemplate @template, (tmpl) ->
        $(view.el).html tmpl({ card: view.model })
        done(view.el)
    
    addOne: ->
      Kankan.fetchTemplate this.cardTemplate, (tmpl) =>
        

) Kankan.module("boards")