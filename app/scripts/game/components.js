/* global angular */

'use strict';

angular.module('ngEcs.dom', ['hc.ngEcs'])
  .config(function ($componentsProvider) {
    $componentsProvider.register('dom', function () {
      function Dom (selector) {
        this.selector = selector || null;

        if (angular.isString(selector) && selector.charAt(0) !== '<') {
          selector = document.querySelector(selector);
        }

        angular.element.call(this, selector);

        this.$cachedStyle = {};
      }

      Dom.$inject = ['selector'];

      Dom.prototype = Object.create(angular.element.prototype); // new angular.element();

      Dom.prototype.element = Dom;

      Dom.prototype.cachedCss = function (k, v) {
        if (this.$cachedStyle[k] !== v) {
          this[0].style[k] = v;
          this.$cachedStyle[k] = v;
        }
      };

      var vendorPrefixes = [ '-moz-', '-webkit-', '-o-', '-ms-', '' ];

      Dom.prototype.prefixedCss = function (k, v) {
        if (this.$cachedStyle[k] !== v) {
          var style = this[0].style;
          for (var i = 0; i < 5; i++) {
            style[vendorPrefixes[i] + k] = v;
          }
        }
        return this;
      };

      Dom.prototype.transform = function (x, y, z) {
        if (typeof x === 'string') {
          return this.prefixedCss('transform', x);
        }
        x = ~~x || 0;
        y = ~~y || 0;
        z = ~~z || 0;
        return this.prefixedCss('transform', 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)');
      };

      return Dom;
    });
  });

/* global Victor */

angular
  .module('angularEcsFlapApp')
  .run(function (ngEcs) {
    Victor.$inject = ['x', 'y'];

    ngEcs.$c('position', Victor);
    ngEcs.$c('velocity', Victor);
    ngEcs.$c('acc', Victor);
    ngEcs.$c('scroll', Victor);

    function BBox () {
      this.width = this.height = 0;
      this.top = this.right = this.bottom = this.left = 0;
    }

    BBox.prototype.update = function (pos) {
      this.top = pos.y;
      this.left = pos.x;
      this.right = pos.x + this.width;
      this.bottom = pos.y + this.height;

      if (this.margin) {
        this.top += this.margin.top || 0;
        this.bottom -= this.margin.bottom || 0;
      }
    };

    BBox.prototype.overlapY = function (that) {
      return Math.max(0, Math.min(this.bottom, that.bottom) - Math.max(this.top, that.top));
    };

    BBox.prototype.overlapX = function (that) {
      return Math.max(0, Math.min(this.right, that.right) - Math.max(this.left, that.left));
    };

    ngEcs.$c('bbox', BBox);
  });
