'use strict';

angular
  .module('angularEcsFlapApp')
  .run(function ($document, $cookies, ngEcs, assemblies) {

    // $ = angular.element;

    var power = 400;

    ngEcs.$s('controls', {
      keys: {},
      $require: ['control','velocity'],
      changeKey: function(e, v) {
        this.keys[e.keyCode] = v;
      },
      $started: function() {
        this.disabled = false;
      },
      $updateEach: function(e) {
        if (this.keys[32] || this.mousedown) {
          e.velocity.y = -power;
        }
      },
      $added: function() {

        var self = this;

        $document
          .on('keydown', function(e) {
            self.changeKey(e||window.event, true);
          })
          .on('keyup', function(e) {
            self.changeKey(e||window.event, false);
          })
          .on('mousedown touchstart', function() {
            self.mousedown = true;
          })
          .on('mousemove mouseup touchend touchcancel', function() {
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

    ngEcs.$s('acceleration', {
      $require: ['acc','velocity'],
      $updateEach: function(e, dt) {
        e.velocity.x += e.acc.x*dt;
        e.velocity.y += e.acc.y*dt;
      }
    });

    function radToDeg(a) {
      return a*180/Math.PI;
    }

    ngEcs.$s('position', {
      $require: ['position','dom','velocity'],

      $addEntity: function(e) {
        var c = ngEcs.entities.canvas.dom.$element;
        var ee = e.dom.$element;

        e.position.x = ee.prop('offsetLeft') - c.prop('offsetLeft');
        e.position.y = ee.prop('offsetTop') - c.prop('offsetTop');
      },
      getTranslation: function(e) {
        var t = 'translate3d(' + ~~(e.position.x) + 'px, ' + ~~(e.position.y) + 'px, 0)';
        if (e._id === 'bird') {
          var _y = -e.velocity.y/power;
          var y = Math.max(_y, -1);
          var yy = Math.max(_y, -0.5);
          t = t+' rotateZ('+(radToDeg(Math.acos(y)))+'deg) rotateY('+(radToDeg(Math.asin(yy)))+'deg)';
        }
        return t;
      },
      $started: function() {
        var sys = this;
        // remove from flow
        this.$family.forEach(function(e) {
          var ee = e.dom.$element;
          var w = ee.prop('offsetWidth');
          var h = ee.prop('offsetHeight');
          //var w = ee.width();
          //var h = ee.height();

          ee.css({
              'top': 0,
              'left': 0,
              'right': 'auto',
              'bottom': 'auto',
              'padding': 0,
              'margin': 0,
              'width': w+'px',
              'height': h+'px',
              'position': 'absolute'
            });

          e.dom.transform(sys.getTranslation(e));
        });
      },
      $updateEach: function(e, dt) {
        e.position.x += e.velocity.x*dt;
        e.position.y += e.velocity.y*dt;
      },
      $render: function() {

        var fam = this.$family, i = fam.length, e;

        while (i--) {
          e = fam[i];
          var t = this.getTranslation(e);
          if (e.dom.$t !== t) {
            e.dom.$t = t;
            e.dom.transform(t);
          }
        }

      }
    });

    ngEcs.$s('scroll', {
      $require: ['scroll','dom','velocity'],
      $updateEach: function(e,dt) {
        //console.log('update');
        e.scroll.x = (e.scroll.x + e.velocity.x*dt);
        e.scroll.y = (e.scroll.y + e.velocity.y*dt);
      },
      $render: function() {
        //console.log('render');

        var fam = this.$family, i = fam.length, e;

        while (i--) {
          var e = fam[0];
          e.dom.$element.css('background-position', ~~e.scroll.x+'px '+ ~~e.scroll.y+'px')
        }

      }
    });

    ngEcs.$s('pipes', {
      $require: ['pipe'],
      screen: null,
      $started: function() {

        var screen = this.screen = ngEcs.entities.canvas;
        var forth = screen.bbox.width/4;
        var h = screen.bbox.height;

        while (this.$family.length < 5) {

          var el = angular.element('<img class="pipe" src="images/yeoman.png"></img>');
          //angular.element(el).appendTo(screen.dom.$element);
          angular.element(screen.dom.$element).append(el);

          ngEcs.$e(angular.copy(assemblies.pipe))
            .$add('dom', { $element: el });

        }

        ngEcs.systems.bbox.$started();

        this.$family.forEach(function(e,i) {
          e.position.x = screen.bbox.width+i*forth;
          e.position.y = h/2*Math.random();
          e.pipe.cleared = false;
        });
      }
    });

    ngEcs.$s('bbox', {
      $require: ['dom','bbox'],
      $addEntity: function(e) {
          var ee = e.dom.$element;

          e.bbox.width = ee.prop('offsetWidth');
          e.bbox.height= ee.prop('offsetHeight');

          e.bbox.update({x:0, y:0});
      },
      $started: function() {
        this.$family.forEach(function(e) {

          e.dom.$element
            .css({
              'width': e.bbox.width+'px',
              'height': e.bbox.height+'px',
              'padding': 0,
              'margin': 0
            });

        });
      },
      $updateEach: function(e) {
        e.position && e.bbox.update(e.position);
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
      $require: ['bird'],
      $started: function() {

        this.hiscore = $cookies.hiscore || 0;

        this.screen = ngEcs.entities.canvas;

        this.pipes = ngEcs.$f(['pipe']);

        var bird = this.$family[0];
        bird.$add('control', true);

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

        this.screen.dom.$element.removeClass('crash');

      },
      $updateEach: function(bird, dt) {

        this.time += dt;

        var screenBox = this.screen.bbox;
        var birdBox = bird.bbox;

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
                bird.$remove('control');
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
          this.screen.dom.$element.addClass('crash');
          if (this.crash) {
            ngEcs.$stop();
          }
        }

        if (this.score > this.hiscore) { this.hiscore = this.score; }
      },
      $stopped: function() {
        $cookies.hiscore = this.hiscore;
      }
    });

  });
