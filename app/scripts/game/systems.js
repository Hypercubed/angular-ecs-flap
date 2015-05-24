/* global $:true */

'use strict';

angular
  .module('angularEcsFlapApp')
  .run(function (ngEcs) {

    ngEcs.$s('controls', {
      keys: {},
      $require: ['control','velocity'],
      changeKey: function(e, v) {
        this.keys[e.keyCode] = v;
      },
      $updateEach: function(e) {
        if (this.keys[32]) {
          e.velocity.y = -350;
        }
      },
      $added: function() {

        var self = this;
        var doc = $(document);

        doc.keydown(function(e) {
          self.changeKey(e||window.event, true);
        });

        doc.keyup(function(e) {
          self.changeKey(e||window.event, false);
        });

      }
    });

    ngEcs.$s('dom', {
      $require: ['dom'],
      $addEntity: function(e) {
        if (!e.dom.$element && e.dom.selector) {
          e.dom.select(e.dom.selector);
        }
      }
    });

    ngEcs.$s('size', {
      $require: ['dom','bbox'],
      $started: function() {
        // get sizes (size may change)
        this.$family.forEach(function(e) {
          var ee = e.dom.$element;
          e.bbox.width = ee.width();
          e.bbox.height = ee.height();

          e.bbox.top = 0;
          e.bbox.left = 0;
          e.bbox.right = e.bbox.width;
          e.bbox.bottom = e.bbox.height;

          ee.width(e.bbox.width);
          ee.height(e.bbox.height);
          ee.css('padding', 0);
        });
      }
    });

    ngEcs.$s('bbox', {
      $require: ['position','bbox'],
      $updateEach: function(e) {
        e.bbox.top = e.position.y;
        e.bbox.left = e.position.x;
        e.bbox.right = e.position.x+e.bbox.width;
        e.bbox.bottom = e.position.y+e.bbox.height;
      }
    });

    ngEcs.$s('acc', {
      $require: ['acc','velocity'],
      $updateEach: function(e, dt) {
        e.velocity.x += e.acc.x*dt;
        e.velocity.y += e.acc.y*dt;
      }
    });

    ngEcs.$s('velocity', {
      $require: ['velocity','position'],
      $updateEach: function(e, dt) {
        e.position.x += e.velocity.x*dt;
        e.position.y += e.velocity.y*dt;
      }
    });

    ngEcs.$s('updatePosition', {
      $require: ['position','dom'],
      $started: function() {
        // get positions
        this.$family.forEach(function(e) {
          var ee = e.dom.$element;
          var p = ee.position();

          e.position.x = p.left;
          e.position.y = p.top;
        });

        // remove from flow
        this.$family.forEach(function(e) {
          var ee = e.dom.$element;
          var w = ee.width();
          var h = ee.height();

          ee.css('top', 0);
          ee.css('left', 0);
          ee.css('right', 'auto');
          ee.css('bottom', 'auto');
          ee.css('padding', 0);
          ee.width(w);
          ee.height(h);
          ee.css('position', 'absolute');
        });
      },
      $render: function() {  // todo: render each?
        this.$family.forEach(function(e) {
          e.dom.$element.css('Transform', 'translate3d(' + ~~(e.position.x) + 'px, ' + ~~(e.position.y) + 'px, 0)');
        });
      }
    });

    ngEcs.$s('pipes', {
      $require: ['pipe'],
      screen: null,
      $started: function() {

        var screen = this.screen = ngEcs.entities.canvas;
        var forth = screen.bbox.width/4

        while (this.$family.length < 5) {
          var i = this.$family.length;

          var el = angular.element('<div class="pipe"></div>');
          angular.element(el).appendTo(screen.dom.$element);

          el.css('top', 0);
          el.css('left', 0);
          el.css('right', 'auto');
          el.css('bottom', 0);

          ngEcs.$e({
            dom: {
              $element: el
            },
            velocity: {
              x: -200, y: 0
            },
            position: {
              x: 0,
              y: 0
            },
            pipe: { cleared: false },
            bbox: {}
          });

        }

        this.$family.forEach(function(e,i) {
          e.position.x = screen.bbox.width+i*forth;
          e.pipe.cleared = false;
          var w = screen.bbox.height;
          e.dom.$element.css('background-position', '0px +'+(w*3/4*Math.random())+'px');
        });

      },
      $updateEach: function(e) {
        var screen = this.screen;
        var forth = screen.bbox.width*1/4;
        if (e.bbox.right < (screen.bbox.left-forth/2)) {
          e.position.x = this.screen.bbox.width+forth/2;
          e.pipe.cleared = false;
        }
      }
    });

    ngEcs.$s('collision', {
      score: 0,
      hiscore: 0,
      screen: null,
      bird: null,
      pipes: null,
      miss: false,
      hit: false,
      startY: null,
      time: 0,
      $require: ['control'],
      $started: function() {
        this.screen = ngEcs.entities.canvas;
        this.pipes = ngEcs.$f(['pipe']);

        var bird = ngEcs.entities.bird;

        if (!this.startY) {
          this.startY = bird.position.y;
        } else {
          bird.position.y = this.startY;
        }

        bird.velocity.y = 0;

        this.time = 0;
        this.score = 0;

      },
      $updateEach: function(bird, dt) {

        var self = this;

        this.time += dt;

        var screenBox = this.screen.bbox;

        // area bounds
        var leftWall = screenBox.left;
        var rightWall = screenBox.right;

        // ball - top/bottom
        if (bird.bbox.top < screenBox.top) {
          bird.position.y = screenBox.top;
          this.miss = true;
        } else if (bird.bbox.bottom > screenBox.bottom) {
          bird.position.y = screenBox.bottom-bird.bbox.height;
          this.miss = true;
        }

        this.pipes.forEach(function(pipe) {
          if (!pipe.pipe.cleared) {
            if (pipe.bbox.right < bird.position.x) {
              pipe.pipe.cleared = true;
              self.score++;
            }
          }
        });

      },
      $render: function() {
        //this.screen.dom.$element.css('border-bottom-color', this.miss ? '#FF5858' : '#eee');
        //this.players[0].dom.$element.css('background-color', this.hit ? '#FF5858' : '#5CB85C');

        if (this.miss) {
          ngEcs.$stop();
        }

        if (this.score > this.hiscore) { this.hiscore = this.score; }

        this.miss = false;
      }
    });

  });
