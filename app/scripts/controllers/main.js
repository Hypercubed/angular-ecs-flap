/* global $:true */

'use strict';

angular.module('angularEcsFlapApp')
  .controller('MainCtrl', function ($scope, ngEcs, assemblies) {

    var main = this;

    main.game = ngEcs;
    ngEcs.$fps = 50;

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
      if (ngEcs.$playing) {
        console.log('stop');
        ngEcs.$stop();
      } else {
        console.log('start');
        ngEcs.$start();
      }
    };

    ngEcs.$e('canvas',assemblies.canvas);
    ngEcs.$e('bird',assemblies.bird);

    $(document).on('keydown', function(e) {
      if (!ngEcs.$playing && e.keyCode === 32) {
        ngEcs.$start();
      }
    });

  });
