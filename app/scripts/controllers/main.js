'use strict';

angular.module('angularEcsFlapApp')
  .controller('MainCtrl', function ($window, $document, $scope, ngEcs, assemblies) {

    var main = this;

    main.game = ngEcs;
    ngEcs.$fps = 60;

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

    $document.on('keydown', function(e) {
      if (!ngEcs.$playing && e.keyCode === 32) {
        ngEcs.$start();
      }
    });

    ngEcs.started.add(function() {
      c.$element.addClass('land');
    });

    function resizeCanvas() {
      console.log('resizeCanvas');
      var container = document.querySelector('#container');
      var scaleX = container.offsetWidth / (c.$element.prop('offsetWidth'));
      var scaleY = container.offsetHeight / (c.$element.prop('offsetHeight'));
      var scale = Math.min(scaleX, scaleY);

      if (scaleX < 1) {
        c._css('transform-origin', '0 0')
          .transform('translate3d(0,0,0) scale3d('+scaleX+', '+scaleX+', 1)');
      }
    }

    resizeCanvas();
    $window.addEventListener('resize', resizeCanvas, false);
    $document.on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', resizeCanvas);

  });
