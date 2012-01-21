casper.test.comment 'Login tests...'

casper.start "http://localhost:8000/", ->
  @test.assertTitle 'Kankan', 'page has the correct title'
  @test.assertEvalEquals (-> $('h2').html()), 'Login', 'login page has the correct heading'
  @test.assertEvalEquals (-> $('h2').length), 1, 'login page has the correct number of headings'

casper.then ->
  # Casper submits the form by calling the native .submit() function which doesn't trigger
  # the jQuery submit event meaning the page breaks - to get around this we need to submit
  # the form ourselves
  @fill 'form', { email: 'rossgrayton@gmail.com', password: 'password' }, false
  @evaluate (-> $('form').submit())

casper.then ->
  @waitForSelector '.boards', ->
    @test.assertEvalEquals (-> $('h2').html()), 'Your Boards', 'board list page has the correct heading'
    @test.assertEvalEquals (-> $('.item').length), 1, 'lists the correct number of boards'

casper.run ->
  @test.done()