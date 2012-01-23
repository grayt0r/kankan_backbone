((Login) ->
  
  app = Kankan.app

  class Login.Views.Login extends Backbone.View
    template: "app/templates/login.html"
    
    events:
      "submit form": "login"

    render: (done) ->
      view = this
      Kankan.fetchTemplate this.template, (tmpl) ->
        view.el.innerHTML = tmpl()
        done(view.el)
    
    login: (ev) ->
      view = this
      ev.preventDefault();
      
      email = this.$('input[name=email]').val()
      password = this.$('input[name=password]').val()
      
      $.ajax
        type: 'POST'
        url: 'http://localhost:3000/api/v1/tokens.json'
        data:
          'email': email
          'password': password
        success: (data) ->
          if data.status == 'ok'
            view.saveCredentials(data)
          # TODO: Handle error case
        dataType: 'json'
    
    saveCredentials: (data) ->
      Kankan.auth_token = data.user.authentication_token
      
      # Set jQuery ajax defaults for CORs
      $.ajaxSetup
        data: { auth_token: Kankan.auth_token }
      
      Backbone.history.navigate('boards', true)

) Kankan.module("login")