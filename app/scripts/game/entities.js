'use strict';

angular
  .module('angularEcsFlapApp')
  .constant('assemblies', {

    canvas: {
      dom: {
        selector: '#canvas'
      },
      bbox: {
        margin: {
          bottom: 0
        }
      },
      velocity: {x:-100,y:0},
      scroll: {x:0,y:288}
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
          bottom: 50
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
        x: 0, y: 2000
      },
      position: {
        x: 0,
        y: 0
      },
      control: true,
      bird: true
    }

  });
