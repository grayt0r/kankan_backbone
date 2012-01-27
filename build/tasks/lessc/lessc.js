/*
 * Grunt Task File
 * ---------------
 *
 * Task: Lessc
 * Description: Compiles less files to CSS
 * Dependencies: less
 *
 */

task.registerBasicTask("lessc", "Compiles less files to CSS", function(files, name) {
  var done = this.async(),
      exec = require('child_process').exec;
  
  var lesscCommand = 'lessc ' + files + ' > ' + name;
  
  // Compile the files to JS
  task.helper('child_process', lesscCommand, function(err) {
    if (err) {
      log.error(err);
      return false;
    }
    
    // Otherwise, print a success message.
    log.writeln("Less compilation complete.");
    
    done();
  });
});