"use strict";angular.module("angularEcsFlapApp",["ngAnimate","ngRoute","ngSanitize","ngTouch","hc.ngEcs"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("angularEcsFlapApp").run(["ngEcs",function(a){function b(){this.x=0,this.y=0}function c(){this.selector=null,this.$element=null}function d(){this.width=this.height=0,this.top=this.right=this.bottom=this.left=0}b.prototype.scale=function(a){return this.x*=a,this.y*=a,this},b.prototype.mag=function(){return Math.sqrt(this.x*this.x+this.y*this.y)},b.prototype.norm=function(){var a=this.mag();return this.x/=a,this.y/=a,this},c.prototype.select=function(a){this.selector=a,this.$element=angular.element(a)},d.prototype.overlapY=function(a){return Math.max(0,Math.min(this.bottom,a.bottom)-Math.max(this.top,a.top))},d.prototype.overlapX=function(a){return Math.max(0,Math.min(this.right,a.right)-Math.max(this.left,a.left))},a.$c("position",b),a.$c("velocity",b),a.$c("acc",b),a.$c("bbox",d),a.$c("dom",c),a.$c("control",{speed:10})}]),angular.module("angularEcsFlapApp").run(["ngEcs","assemblies",function(a,b){function c(a){return 180*a/Math.PI}var d=400;a.$s("controls",{keys:{},disabled:!1,$require:["control","velocity"],changeKey:function(a,b){this.keys[a.keyCode]=b},$started:function(){this.disabled=!1},$updateEach:function(a){this.disabled||!this.keys[32]&&!this.mousedown||(a.velocity.y=-d)},$added:function(){var a=this,b=$(document);b.keydown(function(b){a.changeKey(b||window.event,!0)}),b.keyup(function(b){a.changeKey(b||window.event,!1)}),b.on("mousedown touchstart",function(){a.mousedown=!0}),b.on("mousemove mouseup touchend touchcancel",function(){a.mousedown=!1})}}),a.$s("dom",{$require:["dom"],$addEntity:function(a){!a.dom.$element&&a.dom.selector&&a.dom.select(a.dom.selector)}}),a.$s("size",{$require:["dom","bbox"],$addEntity:function(a){var b=a.dom.$element;a.bbox.width=b.width(),a.bbox.height=b.height(),a.bbox.top=0,a.bbox.left=0,a.bbox.right=a.bbox.width,a.bbox.bottom=a.bbox.height},$started:function(){this.$family.forEach(function(a){var b=a.dom.$element;b.width(a.bbox.width),b.height(a.bbox.height),b.css("padding",0),b.css("margin",0)})}}),a.$s("acc",{$require:["acc","velocity"],$updateEach:function(a,b){a.velocity.x+=a.acc.x*b,a.velocity.y+=a.acc.y*b}}),a.$s("velocity",{$require:["velocity","position"],$updateEach:function(a,b){a.position.x+=a.velocity.x*b,a.position.y+=a.velocity.y*b}}),a.$s("updatePosition",{$require:["position","dom"],$addEntity:function(a){var b=$("#canvas").offset(),c=a.dom.$element,d=c.offset();a.position.x=d.left-b.left,a.position.y=d.top-b.top},getTranslation:function(a){var b="translate3d("+~~a.position.x+"px, "+~~a.position.y+"px, 0)";if("bird"===a._id){var e=-a.velocity.y/d,f=Math.max(e,-1),g=Math.max(e,-.5);b=b+" rotateZ("+c(Math.acos(f))+"deg) rotateY("+c(Math.asin(g))+"deg)"}return b},$started:function(){var a=this;this.$family.forEach(function(b){var c=b.dom.$element,d=c.width(),e=c.height();c.css("top",0).css("left",0).css("right","auto").css("bottom","auto").css("padding",0).css("margin",0).width(d).height(e).css("position","absolute").css("Transform",a.getTranslation(b))})},$render:function(){for(var a,b=this.$family,c=b.length;c--;){a=b[c];var d=this.getTranslation(a);a.dom.$t!==d&&(a.dom.$t=d,a.dom.$element.css("Transform",d))}}}),a.$s("bbox",{$require:["position","bbox"],$updateEach:function(a){var b=a.bbox,c=a.position;b.top=c.y,b.left=c.x,b.right=c.x+b.width,b.bottom=c.y+b.height,b.margin&&(b.top+=b.margin.top||0,b.bottom+=0|b.margin.bottom)}}),a.$s("pipes",{$require:["pipe"],screen:null,$started:function(){for(var c=this.screen=a.entities.canvas,d=c.bbox.width/4,e=c.bbox.height;this.$family.length<5;){var f=(this.$family.length,angular.element('<img class="pipe" src="images/yeoman.png"></img>'));angular.element(f).appendTo($("#canvas"));var g=a.$e(angular.copy(b.pipe));g.$add("dom",{$element:f})}a.systems.size.$started(),this.$family.forEach(function(a,b){a.position.x=c.bbox.width+b*d,a.position.y=e/2*Math.random(),a.pipe.cleared=!1})}}),a.$s("collision",{score:0,hiscore:0,screen:null,bird:null,pipes:null,miss:!1,hit:!1,crash:!1,startPos:null,time:0,$require:["control"],$started:function(){this.screen=a.entities.canvas,this.pipes=a.$f(["pipe"]);var b=a.entities.bird;this.startPos?(b.position.x=this.startPos.x,b.position.y=this.startPos.y):(this.startPos={},this.startPos.x=b.position.x,this.startPos.y=b.position.y),b.velocity.y=0,this.time=0,this.score=0,this.miss=!1,this.crash=!1,this.screen.dom.$element.css("background-color","#eee")},$updateEach:function(a,b){this.time+=b;var c=this.screen.bbox,d=a.bbox;c.left,c.right;if(d.bottom>c.bottom&&(a.position.y=c.bottom-d.height,this.crash=!0),!this.crash&&!this.miss)for(var e,f,g=this.pipes,h=g.length;h--;)e=g[h],f=e.bbox,e.pipe.cleared?f.right<c.left-c.width/8&&(e.position.x=9*c.width/8,e.pipe.cleared=!1):f.right<d.left?(e.pipe.cleared=!0,this.score++):f.left<d.right&&(d.top<f.top||d.bottom>f.bottom)&&(this.miss=!0)},$render:function(){(this.miss||this.crash)&&(a.systems.controls.disabled||(this.screen.dom.$element.css("background-color","#FF5858"),a.systems.controls.disabled=!0),this.crash&&a.$stop()),this.score>this.hiscore&&(this.hiscore=this.score)}})}]),angular.module("angularEcsFlapApp").constant("assemblies",{canvas:{dom:{selector:"#canvas"},bbox:{}},pipe:{velocity:{x:-200,y:0},position:{x:0,y:0},pipe:{cleared:!1},bbox:{margin:{top:50,bottom:-50}}},bird:{dom:{selector:"#bird"},bbox:{},velocity:{x:0,y:0},acc:{x:0,y:2e3},position:{x:0,y:0},control:{}}}),angular.module("angularEcsFlapApp").controller("MainCtrl",["$scope","ngEcs","assemblies",function(a,b,c){function d(){var a=window.innerWidth/(f.width()+60),b=window.innerHeight/(f.height()+60),c=Math.min(a,b);1>c&&(f.css("transform-origin","0 0"),f.css("transform","scale("+c+")"))}var e=this;e.game=b,b.$fps=50,e.message=function(){return e.game.$playing?e.game.systems.collision.score:"angular-ecs-flap"},e.hiscore=function(){return e.game.systems.collision.hiscore>0?"High Score: "+e.game.systems.collision.hiscore:"Built using angular-ecs"},e.click=function(a){a.target.blur(),b.$playing?(console.log("stop"),b.$stop()):(console.log("start"),b.$start())},b.$e("canvas",c.canvas),b.$e("bird",c.bird),$(document).on("keydown",function(a){b.$playing||32!==a.keyCode||b.$start()});var f=$(".container");d(),window.addEventListener("resize",d,!1)}]),angular.module("angularEcsFlapApp").controller("AboutCtrl",["$scope",function(a){}]);