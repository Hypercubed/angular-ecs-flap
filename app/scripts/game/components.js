/* global $:true */

'use strict';

angular
  .module('angularEcsFlapApp')
  .run(function (ngEcs) {

    function Point() {
      this.x = 0;
      this.y = 0;
    }

    Point.prototype.scale = function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    };

    Point.prototype.mag = function() {
      return Math.sqrt(this.x*this.x+this.y*this.y);
    };

    Point.prototype.norm = function() {
      var m = this.mag();
      this.x /= m;
      this.y /= m;
      return this;
    };

    function Dom() {
      this.selector = null;
      this.$element = null;
    }

    Dom.prototype.select = function(s) {
      this.selector = s;
      this.$element = angular.element(s);
    };

    function BBox() {
      this.width = this.height = 0;
      this.top = this.right = this.bottom = this.left = 0;
    }

    BBox.prototype.overlapY = function(that) {
      return Math.max(0,Math.min(this.bottom,that.bottom) - Math.max(this.top,that.top));
    };

    BBox.prototype.overlapX = function(that) {
      return Math.max(0,Math.min(this.right,that.right) - Math.max(this.left,that.left));
    };

    ngEcs.$c('position', Point);
    ngEcs.$c('velocity', Point);
    ngEcs.$c('acc', Point);

    ngEcs.$c('bbox', BBox);

    ngEcs.$c('dom', Dom);

    ngEcs.$c('control', {
      speed: 10
    });

  });
