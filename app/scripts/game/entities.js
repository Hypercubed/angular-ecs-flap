/* global $:true */

'use strict';

angular
  .module('angularEcsFlapApp')
  .constant('assemblies', {

    canvas: {
      dom: {
        selector: '#canvas'
      },
      bbox: {}
    },

    pipe: {
      velocity: {
        x: -200, y: 0
      },
      position: {
        x: 0,
        y: 0
      },
      pipe: { cleared: false },
      bbox: {
        margin: {
          top: 50,
          bottom: -50
        }
      }
    },

    bird: {
      dom: {
        selector: '#bird',
      },
      bbox: {},
      velocity: {
        x: 0, y: 0
      },
      acc: {
        x: 0, y: 1500
      },
      position: {
        x: 0,
        y: 0
      },
      control: {}
    }

  });
