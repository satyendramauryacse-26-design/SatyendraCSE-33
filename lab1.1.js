const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Listeners
myEmitter.on('greet', (name) => {
    console.log(`Hello, ${name}!`);
});

myEmitter.on('exit', () => {
    console.log('Exiting the program...');
});

// Trigger events
myEmitter.emit('greet', 'Satyendra');
myEmitter.emit('exit');