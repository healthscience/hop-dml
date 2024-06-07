'use strict'
/**
*  
*
*
* @class HopDml
* @package    dml
* @copyright  Copyright (c) 2024 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import EventEmitter from 'events'

class HopDml extends EventEmitter {

  constructor(library) {
    super()
    this.library = library
  }

  /**
  * produce proof of work merkle
  * @method powEvidence
  *
  */
  powEvidence = function (context) {
    console.log('build proof of work for this model and NXP')
    // console.log(this.library)
    // next match peer NXP to source genesis nxp contract
    // hash of proof of work
    // form message
    // send to specific peer  (stage two broadcast)
  }

}

export default HopDml