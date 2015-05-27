/* global $:true */

'use strict';

angular
  .module('angularEcsFlapApp')
  .run(function (ngEcs, assemblies) {

    var power = 400;

    ngEcs.$s('controls', {
      keys: {},
      disabled: false,
      $require: ['control','velocity'],
      changeKey: function(e, v) {
        this.keys[e.keyCode] = v;
      },
      $started: function() {
        this.disabled = false;
      },
      $updateEach: function(e) {
        if (!this.disabled && (this.keys[32] || this.mousedown)) {
          e.velocity.y = -power;
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

        doc.on('mousedown touchstart', function() {
          self.mousedown = true;
        });

        doc.on('mousemove mouseup touchend touchcancel', function() {
          self.mousedown = false;
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
      $addEntity: function(e) {
          var ee = e.dom.$element;

          e.bbox.width = ee.width();
          e.bbox.height = ee.height();

          e.bbox.top = 0;
          e.bbox.left = 0;
          e.bbox.right = e.bbox.width;
          e.bbox.bottom = e.bbox.height;
      },
      $started: function() {
        // get sizes (size may change)
        this.$family.forEach(function(e) {
          var ee = e.dom.$element;

          /* e.bbox.width = ee.width();
          e.bbox.height = ee.height();

          e.bbox.top = 0;
          e.bbox.left = 0;
          e.bbox.right = e.bbox.width;
          e.bbox.bottom = e.bbox.height; */

          ee.width(e.bbox.width);
          ee.height(e.bbox.height);
          ee.css('padding', 0);
          ee.css('margin', 0);
        });
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
      $addEntity: function(e) {
        var ee = e.dom.$element;
        var p = ee.offset();

        e.position.x = p.left;
        e.position.y = p.top;
      },
      $started: function() {
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
          ee.css('margin', 0);
          ee.width(w);
          ee.height(h);
          ee.css('position', 'absolute');
        });

      },
      $render: function() {

        function radToDeg(a) {
          return a*180/Math.PI;
        }

        var fam = this.$family, i = fam.length, e;

        while (i--) {
          e = fam[i];
          var t = 'translate3d(' + ~~(e.position.x) + 'px, ' + ~~(e.position.y) + 'px, 0)';
          if (e._id === 'bird') {
            var _y = -e.velocity.y/power;
            var y = Math.max(_y, -1);
            var yy = Math.max(_y, -0.5);
            t = t+' rotateZ('+(radToDeg(Math.acos(y)))+'deg) rotateY('+(radToDeg(Math.asin(yy)))+'deg)';
          }
          if (e.dom.$t !== t) {
            e.dom.$t = t;
            e.dom.$element.css('Transform', t);
          }
        }

      }
    });

    ngEcs.$s('bbox', {
      $require: ['position','bbox'],
      $updateEach: function(e) {
        var bbox = e.bbox;
        var pos = e.position;

        bbox.top = pos.y;
        bbox.left = pos.x;
        bbox.right = pos.x+bbox.width;
        bbox.bottom = pos.y+bbox.height;

        if (bbox.margin) {
          bbox.top += bbox.margin.top || 0;
          bbox.bottom += bbox.margin.bottom | 0;
        }
      }
    });

    ngEcs.$s('pipes', {
      $require: ['pipe'],
      screen: null,
      $started: function() {

        var screen = this.screen = ngEcs.entities.canvas;
        var forth = screen.bbox.width/4
        var h = screen.bbox.height;

        while (this.$family.length < 5) {
          var i = this.$family.length;

          var el = angular.element('<img class="pipe" src="images/yeoman.png"></img>');
          angular.element(el).appendTo($('#canvas'));

          el.css('top', 0);
          el.css('left', 0);
          el.css('right', 80);
          el.css('bottom', 300);
          el.css('padding', 0);
          el.css('height', 300);

          var e = ngEcs.$e(angular.copy(assemblies.pipe));
          e.$add('dom', { $element: el });

        }

        ngEcs.systems.size.$started();

        this.$family.forEach(function(e,i) {
          e.position.x = screen.bbox.width+i*forth;
          e.position.y = h*2/4*Math.random();
          e.pipe.cleared = false;

          //e.dom.$element.css('background-position', '0px +'+(w*3/4*Math.random())+'px');
        });
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
      crash: false,
      startPos: null,
      time: 0,
      $require: ['control'],
      $started: function() {
        //console.log(ngEcs.entities);
        this.screen = ngEcs.entities.canvas;
        this.pipes = ngEcs.$f(['pipe']);

        var bird = ngEcs.entities.bird;

        if (!this.startPos) {
          this.startPos = {};
          this.startPos.x = bird.position.x;
          this.startPos.y = bird.position.y;
        } else {
          bird.position.x = this.startPos.x;
          bird.position.y = this.startPos.y;
        }

        bird.velocity.y = 0;

        this.time = 0;
        this.score = 0;
        this.miss = false;
        this.crash = false;

        this.screen.dom.$element.css('background-color', '#eee');

      },
      $updateEach: function(bird, dt) {

        this.time += dt;

        var screenBox = this.screen.bbox;
        var birdBox = bird.bbox;

        // area bounds
        var leftWall = screenBox.left;
        var rightWall = screenBox.right;

        // ball - top/bottom
        //if (birdBox.top < screenBox.top) {
        //  bird.position.y = screenBox.top;
        //  this.miss = true;
        //} else
        if (birdBox.bottom > screenBox.bottom) {
          bird.position.y = screenBox.bottom-birdBox.height;
          this.crash = true;
        }

        if (this.crash || this.miss) { return; }

        var fam = this.pipes, i = fam.length, pipe, pipeBox;
        while (i--) {
          pipe = fam[i];
          pipeBox = pipe.bbox;
          if (!pipe.pipe.cleared) {
            if (pipeBox.right < birdBox.left) {
              pipe.pipe.cleared = true;
              this.score++;
            } else if (pipeBox.left < birdBox.right) {
              //console.log('pipe', pipeBox.top, pipeBox.bottom);
              //console.log('bird', birdBox.top, birdBox.bottom);
              if (birdBox.top < (pipeBox.top) || birdBox.bottom > (pipeBox.bottom)) {
                this.miss = true;
              }
            }
          } else if (pipeBox.right < (screenBox.left-screenBox.width/8)) {
            pipe.position.x = 9*screenBox.width/8;
            pipe.pipe.cleared = false;
          }
        }

      },
      $render: function() {

        if (this.miss || this.crash) {
          if (!ngEcs.systems.controls.disabled) {
            this.screen.dom.$element.css('background-color', '#FF5858');
            ngEcs.systems.controls.disabled = true;
          }
          if (this.crash) {
            ngEcs.$stop();
          }
        }

        if (this.score > this.hiscore) { this.hiscore = this.score; }
      }
    });

  });
