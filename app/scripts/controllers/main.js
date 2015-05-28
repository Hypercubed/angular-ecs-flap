/* global $:true */

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
        return 'Built using angular-ecs';
      }
    };

    main.click = function(e) {
      e.target.blur();
      ngEcs.$start();
    };

    ngEcs.$e('canvas',assemblies.canvas);
    ngEcs.$e('bird',assemblies.bird);

    $document.on('keydown', function(e) {
      if (!ngEcs.$playing && e.keyCode === 32) {
        ngEcs.$start();
      }
    });

    function $(s) {
      return angular.element(document.querySelector( s ));
    }

    var canvas = $('.container');

    function resizeCanvas() {
      var scaleX = window.innerWidth / (canvas.prop('offsetWidth')+60);
      var scaleY = window.innerHeight / (canvas.prop('offsetHeight')+20);
      var scale = Math.min(scaleX, scaleY);

      if (scale < 1) {
        canvas.css('transform-origin', '0 0');
        canvas.css('transform', 'scale('+scale+')');
      }
    }

    resizeCanvas();
    $window.addEventListener('resize', resizeCanvas, false);

  });
