'use strict';

angular.module('angularEcsFlapApp')
  .controller('MainCtrl', function ($window, $document, $scope, $route, ngEcs, assemblies, isMobile) {

    var main = this;

    main.game = ngEcs;
    ngEcs.$fps = isMobile ? 60 : 45;

    main.message = function() {
      if (main.game.$playing) {
        return main.game.systems.collision.score;
      } else {
        return 'angular-ecs-flap';
      }
    };

    main.hiscore = function() {
      if (main.game.systems.collision.hiscore > 0) {
        return 'High Score: '+main.game.systems.collision.hiscore;
      } else {
        return 'Built using AngularJS and angular-ecs';
      }
    };

    main.click = function(e) {
      e.target.blur();
      ngEcs.$start();
    };

    var c = ngEcs.$e('canvas',assemblies.canvas).dom;
    ngEcs.$e('bird',assemblies.bird);

    ngEcs.$e({
      dom: {
        selector: '.canvas-bg'
      },
      velocity: {x:-100,y:0},
      scroll: {x:0,y:0,repeatX:2061}
    });

    ngEcs.$e({
      dom: {
        selector: '.canvas-bg-clouds'
      },
      velocity: {x:-50,y:0},
      scroll: {x:0,y:0,repeatX:2061}
    });

    $document.on('keydown', function(e) {
      if (!ngEcs.$playing && e.keyCode === 32) {
        ngEcs.$start();
      }
    });

    var container = document.querySelector('#container');
    function resizeCanvas() {
      var scaleX = container.offsetWidth / (c.prop('offsetWidth'));

      c.prefixedCss('transform-origin', '0 0')
        .transform('translate3d(0,0,0) scale3d('+scaleX+','+scaleX+',1)');

    }

    resizeCanvas();
    $window.addEventListener('resize', resizeCanvas, false);

  });
