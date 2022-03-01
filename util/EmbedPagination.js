const { MessageActionRow, MessageButton , MessageEmbed } = require('discord.js')

const ErrorHandler = require('../classes/ErrorHandler')

class EmbedPagination {

  constructor( options ){
    
    this.embeds = options?.embeds
    this.buttons = options?.buttons ? options.buttons : [ 'Prev' , 'Next' ]
    this.timeout = options?.timeout ? options.timeout : 10000
    this.filter = options?.filter ? options.filter : component => component.customId == 'prev' || component.customId == 'next'
    this.current = 0

  }

  setEmbeds( embeds ){
    if( ! embeds ) return this.embeds
    this.embeds = embeds
    return true
  }

  setButtons( buttons ){
    if( ! buttons ) return this.buttons
    this.buttons = buttons
    return true
  }

  setTimeout( timeout ){
    if( ! timeout ) return this.timeout
    this.timeout = timeout
    return true
  }

  setFilter( filter ){
    if( ! filter ) return this.filter
    this.filter = filter
    return true
  }

  async send( channel ){
    
    if( ! this.embeds ) throw new ErrorHandler( 'MISSING_EMBEDS' )

    if( typeof this.timeout != 'number' ) throw new ErrorHandler( 'INVALID_TIMEOUT' )
    if( typeof this.filer != 'function' ) throw new ErrorHandler( 'INVALID_FILTER' )
    if( typeof this.embeds != 'object' || ! Array.isArray( this.embeds) ) throw new ErrorHandler( 'INVALID_EMBEDS' )
    if( typeof this.buttons != 'obect' || ! Array.isArray( this.buttons) ) throw new ErrorHandler( 'INVALID_BUTTONS' )

    if( this.embeds.some( embeds => embed instanceof MessageEmbed ) ) throw new ErrorHandler( 'INVALID_EMBEDS' )
    if( this.buttons.some( button => typeof button != 'string' ) ) throw new ErrorHandler( 'INVALID_BUTTONS' )
      
    try{
      let   actionrow = new MessageActionRow().addComponents(new MessageButton().setCustomId('prev').setLabel( this.buttons[0] ).setStyle('SECONDARY') , new MessageButton().setCustomId('next').setLabel( this.buttons[0] ).setStyle('PRIMARY') )
      const message = await channel.send({ embeds: [ this.embeds[0] ] , components: [ actionrow ]})
      const collector = message.createMessageComponentCollector({ filter: this.filter , time: this.timeout })
            collector.on( 'collect', async function( component ) {
              switch( component.customId ){
                case 'prev':
                  this.current = this.current - 1 
                  await message.edit({ embeds: [ this.embeds[ this.current ] ] })
                  break;
                case 'next':
                  this.current = this.current + 1
                  await message.edit({ embeds: [ this.embeds[ this.current ] ] })
                  break;
              }
            })
            collector.on( 'end', async function( collected ) {
              actionrow.components[0].setDisabled( true )
              actionrow.components[1].setDisabled( true )
              message.deleted ? message.edit({ components: [ actionrow ]}) : null
            }) 
      return collector
    } catch ( error ){
      throw new ErrorHandler( error )
      return false
    }
  }
}

module.exports = EmbedPagination