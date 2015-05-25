"use strict";angular.module("angularEcsFlapApp",["ngAnimate","ngRoute","ngSanitize","ngTouch","hc.ngEcs"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("angularEcsFlapApp").run(["ngEcs",function(a){function b(){this.x=0,this.y=0}function c(){this.selector=null,this.$element=null}function d(){this.width=this.height=0,this.top=this.right=this.bottom=this.left=0}b.prototype.scale=function(a){return this.x*=a,this.y*=a,this},b.prototype.mag=function(){return Math.sqrt(this.x*this.x+this.y*this.y)},b.prototype.norm=function(){var a=this.mag();return this.x/=a,this.y/=a,this},c.prototype.select=function(a){this.selector=a,this.$element=angular.element(a)},d.prototype.overlapY=function(a){return Math.max(0,Math.min(this.bottom,a.bottom)-Math.max(this.top,a.top))},d.prototype.overlapX=function(a){return Math.max(0,Math.min(this.right,a.right)-Math.max(this.left,a.left))},a.$c("position",b),a.$c("velocity",b),a.$c("acc",b),a.$c("bbox",d),a.$c("dom",c),a.$c("control",{speed:10})}]),angular.module("angularEcsFlapApp").run(["ngEcs",function(a){a.$s("controls",{keys:{},disabled:!1,$require:["control","velocity"],changeKey:function(a,b){this.keys[a.keyCode]=b},$started:function(){this.disabled=!1},$updateEach:function(a){this.disabled||!this.keys[32]&&!this.mousedown||(a.velocity.y=-350)},$added:function(){var a=this,b=$(document);b.keydown(function(b){a.changeKey(b||window.event,!0)}),b.keyup(function(b){a.changeKey(b||window.event,!1)}),b.on("mousedown touchstart",function(){a.mousedown=!0}),b.on("mousemove mouseup touchend touchcancel",function(){a.mousedown=!1})}}),a.$s("dom",{$require:["dom"],$addEntity:function(a){!a.dom.$element&&a.dom.selector&&a.dom.select(a.dom.selector)}}),a.$s("size",{$require:["dom","bbox"],$started:function(){this.$family.forEach(function(a){var b=a.dom.$element;a.bbox.width=b.width(),a.bbox.height=b.height(),a.bbox.top=0,a.bbox.left=0,a.bbox.right=a.bbox.width,a.bbox.bottom=a.bbox.height,b.width(a.bbox.width),b.height(a.bbox.height),b.css("padding",0)})}}),a.$s("acc",{$require:["acc","velocity"],$updateEach:function(a,b){a.velocity.x+=a.acc.x*b,a.velocity.y+=a.acc.y*b}}),a.$s("velocity",{$require:["velocity","position"],$updateEach:function(a,b){a.position.x+=a.velocity.x*b,a.position.y+=a.velocity.y*b}}),a.$s("updatePosition",{$require:["position","dom"],$started:function(){this.$family.forEach(function(a){var b=a.dom.$element,c=b.position();a.position.x=c.left,a.position.y=c.top}),this.$family.forEach(function(a){var b=a.dom.$element,c=b.width(),d=b.height();b.css("top",0),b.css("left",0),b.css("right","auto"),b.css("bottom","auto"),b.css("padding",0),b.width(c),b.height(d),b.css("position","absolute")})},$render:function(){for(var a,b=this.$family,c=b.length;c--;){a=b[c];var d="translate3d("+~~a.position.x+"px, "+~~a.position.y+"px, 0)";if("bird"===a._id){var e=Math.max(-a.velocity.y/350,-1);d=d+" rotate("+180*Math.acos(e)/Math.PI+"deg) "}a.dom.$element.css("Transform",d)}}}),a.$s("bbox",{$require:["position","bbox"],$updateEach:function(a){a.bbox.top=a.position.y,a.bbox.left=a.position.x,a.bbox.right=a.position.x+a.bbox.width,a.bbox.bottom=a.position.y+a.bbox.height}}),a.$s("pipes",{$require:["pipe"],screen:null,$started:function(){for(var b=this.screen=a.entities.canvas,c=b.bbox.width/4,d=b.bbox.height;this.$family.length<5;){var e=(this.$family.length,angular.element('<img class="pipe" src="../images/yeoman.png"></img>'));angular.element(e).appendTo($("#canvas")),e.css("top",0),e.css("left",0),e.css("right",80),e.css("bottom",300),e.css("padding",0),e.css("height",300),a.$e({dom:{$element:e},velocity:{x:-200,y:0},position:{x:0,y:0},pipe:{cleared:!1},bbox:{}})}a.systems.size.$started(),this.$family.forEach(function(a,e){a.position.x=b.bbox.width+e*c,a.position.y=2*d/4*Math.random(),a.pipe.cleared=!1})}}),a.$s("collision",{score:0,hiscore:0,screen:null,bird:null,pipes:null,miss:!1,hit:!1,crash:!1,startY:null,time:0,$require:["control"],$started:function(){this.screen=a.entities.canvas,this.pipes=a.$f(["pipe"]);var b=a.entities.bird;this.startY?b.position.y=this.startY:this.startY=b.position.y,b.velocity.y=0,this.time=0,this.score=0,this.miss=!1,this.crash=!1},$updateEach:function(a,b){this.time+=b;var c=this.screen.bbox,d=a.bbox;c.left,c.right;d.top<c.top?(a.position.y=c.top,this.miss=!0):d.bottom>c.bottom&&(a.position.y=c.bottom-d.height,this.crash=!0);for(var e,f,g=this.pipes,h=g.length;h--;)e=g[h],f=e.bbox,e.pipe.cleared?f.right<c.left-c.width/8&&(e.position.x=9*c.width/8,e.pipe.cleared=!1):f.right<d.left?(e.pipe.cleared=!0,this.score++):f.left<d.right&&(d.top<f.top+50||d.bottom>f.bottom-50)&&(this.miss=!0)},$render:function(){this.miss&&(a.systems.controls.disabled?(this.screen.dom.$element.css("background-color","#eee"),this.miss=!1):(this.screen.dom.$element.css("background-color","#FF5858"),a.systems.controls.disabled=!0)),this.crash&&(this.miss=!1,a.$stop()),this.score>this.hiscore&&(this.hiscore=this.score)}})}]),angular.module("angularEcsFlapApp").controller("MainCtrl",["$scope","ngEcs",function(a,b){var c=this;c.game=b,b.$fps=50,c.message=function(){return c.game.$playing?c.game.systems.collision.score:"angular-ecs-flap"},c.hiscore=function(){return c.game.systems.collision.hiscore>0?"High Score: "+c.game.systems.collision.hiscore:"Built using angular-ecs"},c.click=function(a){a.target.blur(),b.$playing?(console.log("stop"),b.$stop()):(console.log("start"),b.$start())},b.$e("canvas",{dom:{selector:"#canvas"},bbox:{}}),b.$e("bird",{dom:{selector:"#bird"},bbox:{},velocity:{x:0,y:0},acc:{x:0,y:1200},position:{x:0,y:0},control:{}})}]),angular.module("angularEcsFlapApp").controller("AboutCtrl",["$scope",function(a){}]);