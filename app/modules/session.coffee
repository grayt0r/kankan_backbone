((Session) ->
  
  app = Kankan.app
  
  class SessionStore
    storeId: 'sessions'
    key: 'currentUser'
    
    constructor: ->
      @store = localStorage.getItem @storeId
      @data = (@store && JSON.parse(@store)) || {}
    
    save: ->
      localStorage.setItem @storeId, JSON.stringify(@data)
    
    create: (session) ->
      @data[@key] = session
      @save()
      session
    
    update: (session) ->
      @data[@key] = session
      @save()
      session
    
    retrieve: ->
      @data[@key]
    
    destroy: (session) ->
      delete @data[@key]
      @save()
      session
  
  session = new SessionStore

  class Session.Model
    constructor: ->
      currentUser = session.retrieve()
      if currentUser
        @email = currentUser.email
        @token = currentUser.token
        @addHeaderToAjaxCalls()
      else
        @email = ''
        @token = ''
    
    authenticate: (email, password, callback) ->
      self = @
      self.getTokenFromApi email, password, (err) ->
        if !err
          callback.call self
        else
          callback.call self, err
    
    isAuthorised: ->
      if @token then return true
      
      if @email
        @getTokenFromLocalStorage()
        if @token then return true
      
      return false
    
    enforceAuthorisation: ->
      if @isAuthorised()
        return true
      else
        Backbone.history.navigate 'login', true
        return false
    
    getTokenFromLocalStorage: ->
      result = session.retrieve()
      if result.token
        @token = result.token
        session.update @
    
    getTokenFromApi: (email, password, callback) ->
      self = @
      
      $.ajax
        type: 'POST'
        url: 'http://localhost:3000/api/v1/tokens.json'
        data:
          'email': email
          'password': password
        success: (data) ->
          if data.status == 'ok'
            self.email = data.user.email
            self.token = data.user.authentication_token
            session.create self
            callback.call self
          else
            # TODO: Improve error handling
            callback.call self, 'Login failed'
        error: (jqXHR, textStatus, errorThrown) ->
          callback.call self, 'Login error'
        dataType: 'json'
    
    addHeaderToAjaxCalls: ->
      # Set jQuery ajax defaults for CORs
      $.ajaxSetup
        headers: { "X-Requested-With": "XMLHttpRequest" }
        beforeSend: (jqXHR, s) ->
          separator = if /\?/.test(s.url) then '&' else '?'
          s.url += "#{separator}auth_token=#{Kankan.session.token}"
    
    destroy: ->
      session.destroy @
      @email = ''
      @token = ''

) Kankan.module("session")