/*
 * Grunt Task File
 * ---------------
 *
 * Task: Coffee
 * Description: Compiles coffeescript files to JS
 * Dependencies: coffee-script
 *
 */

task.registerBasicTask("coffee", "Compiles coffeescript files to JS", function(files, name) {
  var done = this.async(),
      exec = require('child_process').exec;
  
  var coffeeCommand = 'coffee -j ' + name + ' -c ' + files.join(' ');
  
  // Compile the files to JS
  task.helper('child_process', coffeeCommand, function(err) {
    if (err) {
      log.error(err);
      return false;
    }
    
    // Otherwise, print a success message.
    log.writeln("Coffeescript compilation complete.");
    
    done();
  });
});