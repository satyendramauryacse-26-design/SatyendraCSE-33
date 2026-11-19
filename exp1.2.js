//event handling in node js
 const EventEmitter = require('events'); 
 const emitter = new EventEmitter(); 
 emitter.on("load", (name) =>
     { console.log(`welcome, ${name}!`);
 });
  emitter.on("exit", () =>
     { console.log("program is exiting...");

      });
   emitter.emit("load", "Siddhant");
    emitter.emit("exit");    