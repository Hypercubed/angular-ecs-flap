'use strict';

angular.module('angularEcsFlapApp')
  .controller('MainCtrl', function ($window, $document, $scope, $route, ngEcs, assemblies, isMobile) {

    var main = this;

    main.game = ngEcs;
    ngEcs.$fps = isMobile ? 45 : 60;

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

    var scale = null;

    function resizeCanvas() {

      var container = document.querySelector('#container');
      var scaleX = container.offsetWidth / (c.$element.prop('offsetWidth'));

      if (scaleX < 1 && scaleX !== scale) {
        if (isMobile && scale !== null) {
          $window.location.reload();
        } else {
          scale = scaleX;
          c._css('transform-origin', '0 0')
            .transform('translate3d(0,0,0) scale3d('+scale+','+scale+',1)');
        }
      }
    }

    resizeCanvas();

    $window.addEventListener('resize', resizeCanvas, false);

  });
