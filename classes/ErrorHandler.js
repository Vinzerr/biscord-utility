const Errors = require('../structures/Errors')

class BiscordError extends Error {

  constructor( error ){
    error = Errors[error] || error.message
    if( error instanceof Error ){
      super( error.message )
      Error.captureStackTrace( this , this.constructor )
    } else super( error )
  }
  
}

module.exports = BiscordError