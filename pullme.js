var EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
   Creates an iterator that allows pull-based access to a stream of objects.
   It emits the following events:
   - `readable` when one or more items can be read
   - `end` when there are no more items
   - `error` when a non-recoverable error occurs
*/
function Iterator(options) {
  if (!(this instanceof Iterator))
    return new Iterator(options);
  EventEmitter.call(this);

  // Add a bound version of the emit method for use in callbacks
  var self = this;
  this._emit = function (name, a, b, c) { self.emit(name, a, b, c); };
}
util.inherits(Iterator, EventEmitter);

/** Tries to read an item from the iterator; returns the item, or `null` if none is available. **/
Iterator.prototype.read = function () {
  throw new Error('The read method has not been implemented.');
};

/** Asynchronously emits the given event. */
Iterator.prototype._emitAsync = function (eventName, a, b, c) {
  setImmediate(this._emit, eventName, a, b, c);
};

/** Indicates whether reading more items from this iterator is not possible. **/
Iterator.prototype.ended = false;

/** Makes the current class a superclass of the given class. */
Iterator.makeSuperclassOf = function makeSuperclassOf(subclass) {
  util.inherits(subclass, this);
  subclass.makeSuperclassOf = makeSuperclassOf;
};



/** Creates an iterator that returns items from the given array. **/
function ArrayIterator(items, options) {
  if (!(this instanceof ArrayIterator))
    return new ArrayIterator(items, options);
  Iterator.call(this, options);

  if (!(items && items.length > 0))
    return this._emitAsync('end');

  this._buffer = items.slice();
  this._emitAsync('readable');
}
Iterator.makeSuperclassOf(ArrayIterator);

/** Tries to read an item from the iterator; returns the item, or `null` if none is available. **/
ArrayIterator.prototype.read = function () {
  var buffer = this._buffer;
  if (!buffer) return null;

  var item = buffer.shift();
  if (buffer.length === 0) {
    delete this._buffer;
    this._emitAsync('end');
  }
  return item;
};

/** Indicates whether reading more items from this iterator is not possible. **/
Object.defineProperty(ArrayIterator.prototype, 'ended', {
  get: function () { return !('_buffer' in this); },
});

// Export all submodules
module.exports = {
  Iterator: Iterator,
  ArrayIterator: ArrayIterator,
};