((Boards) ->
  
  app = Kankan.app
  Cards = Kankan.module("cards")
  Lanes = Kankan.module("lanes")

  class Boards.Model extends Backbone.Model
  
  class Boards.Collection extends Backbone.Collection
    model: Boards.Model
    url: 'http://localhost:3000/api/v1/boards'
  
  class Boards.Router extends Backbone.Router    
    routes:
      'boards': 'index',
      'boards/:id': 'show'

    index: ->
      #console.log 'ROUTING: boards/index'
      if Kankan.session.enforceAuthorisation()
        boards = new Boards.Collection
        index = new Boards.Views.Index(boards)
        boards.fetch()
    
    show: (id) ->
      #console.log 'ROUTING: boards/show'
      lanes = new Lanes.Collection(null, { boardId: id })
      cards = new Cards.Collection(null, { boardId: id })
      show = new Boards.Views.Show(lanes, cards)
      lanes.fetch()

  class Boards.Views.Index extends Backbone.View
    template: '/app/templates/boards/index.html'
    
    events:
      'click .board_link': 'showBoard'
    
    initialize: (boards) ->
      boards.bind('reset', this.addAll, this)

    render: (boards, done) ->
      view = this

      Kankan.fetchTemplate this.template, (tmpl) ->
        view.el.innerHTML = tmpl({ boards: boards.models })
        done(view.el)
    
    addAll: (boards) ->
      this.render boards, (el) ->
        $("#main").html(el)
    
    showBoard: (ev) ->
      ev.preventDefault()
      Backbone.history.navigate('boards/' + $(ev.target).attr('data-board-id'), true)
  
  class Boards.Views.Show extends Backbone.View
    template: '/app/templates/boards/show.html'
    cardTemplate: '/app/templates/boards/card.html'
    cardModalTemplate: '/app/templates/boards/cardModal.html'
    
    events:
      'dblclick .card': 'showCard'
    
    initialize: (lanes, cards) ->
      @lanes = lanes
      @cards = cards
      @lanes.bind 'reset', @addAllLanes, @
      @cards.bind 'reset', @addAllCards, @
    
    render: ->
      view = @
      
      Kankan.fetchTemplate @template, (tmpl) ->
        $(view.el).html tmpl({ lanes: view.lanes.models })
        $("#main").html view.el
        
        @$('#my-modal')
          .modal
            backdrop: true
      
      @cards.fetch()
    
    addAllLanes: (lanes) ->
      @render()
    
    addAllCards: (cards) ->
      $.each cards.models, (i, c) =>
        Kankan.fetchTemplate this.cardTemplate, (tmpl) =>
          @$("#lane_#{c.get('lane_id')}").append(tmpl({ card: c }))
    
    showCard: (ev) ->
      cardId = $(ev.target).attr('data-card-id')
      card = @cards.get(cardId)
      
      Kankan.fetchTemplate @cardModalTemplate, (tmpl2) ->
        @$('#my-modal .modal-contents').html tmpl2({ c: card })
        @$('#my-modal').modal 'show'

) Kankan.module("boards")