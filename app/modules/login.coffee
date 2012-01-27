((Login) ->
  
  app = Kankan.app

  class Login.Views.Login extends Backbone.View
    template: "app/templates/login.html"
    
    events:
      "submit form": "login"

    render: ->
      view = this
      Kankan.fetchTemplate this.template, (tmpl) ->
        $(view.el).html tmpl()
        $('#main').html view.el
    
    login: (ev) ->
      view = this
      ev.preventDefault();
      
      email = this.$('input[name=email]').val()
      password = this.$('input[name=password]').val()
      
      Kankan.session.authenticate email, password, (err) ->
        # TODO: Handle errors
        if !err
          Kankan.session.addAuthTokenToAjaxCalls()
          Backbone.history.navigate 'boards', true
        else
          console.log 'login error', err

) Kankan.module("login")