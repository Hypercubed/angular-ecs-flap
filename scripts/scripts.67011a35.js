"use strict";angular.module("angularEcsFlapApp",["ngAnimate","ngRoute","ngSanitize","ngTouch","ngCookies","hc.ngEcs"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).otherwise({redirectTo:"/"})}]).factory("isMobile",["$window",function(a){return a.innerWidth<768}]),angular.module("angularEcsFlapApp").run(["ngEcs",function(a){function b(){this.x=0,this.y=0}function c(){this.selector=null,this.$element=null}function d(){this.width=this.height=0,this.top=this.right=this.bottom=this.left=0}b.prototype.scale=function(a){return this.x*=a,this.y*=a,this},b.prototype.mag=function(){return Math.sqrt(this.x*this.x+this.y*this.y)},b.prototype.norm=function(){var a=this.mag();return this.x/=a,this.y/=a,this},c.prototype.select=function(a){return this.selector=a,this.$element=angular.element(document.querySelector(a))},c.prototype._css=function(a,b){var c=this.$element;return["-ms-","-webkit-",""].forEach(function(d){c.css(d+a,b)}),this},c.prototype.transform=function(a){return this._css("transform",a),this},d.prototype.update=function(a){this.top=a.y,this.left=a.x,this.right=a.x+this.width,this.bottom=a.y+this.height,this.margin&&(this.top+=this.margin.top||0,this.bottom-=this.margin.bottom||0)},d.prototype.overlapY=function(a){return Math.max(0,Math.min(this.bottom,a.bottom)-Math.max(this.top,a.top))},d.prototype.overlapX=function(a){return Math.max(0,Math.min(this.right,a.right)-Math.max(this.left,a.left))},a.$c("position",b),a.$c("velocity",b),a.$c("acc",b),a.$c("scroll",b),a.$c("bbox",d),a.$c("dom",c)}]),angular.module("angularEcsFlapApp").run(["$window","$document","$cookies","ngEcs","assemblies","isMobile",function(a,b,c,d,e,f){function g(a){return 180*a/Math.PI}var h=400;f||d.$s("meter",{meter:null,$added:function(){var a=this.meter=new FPSMeter({graph:1,history:20});a.hide(),b.on("keypress",function(b){126===b.which&&(a.isPaused?a.show():a.hide())})},$render:function(){this.meter.tick()}}),d.$s("controls",{keys:{},$require:["control","velocity"],changeKey:function(a,b){this.keys[a.keyCode]=b},$started:function(){this.disabled=!1},$updateEach:function(a){(this.keys[32]||this.mousedown)&&(a.velocity.y=-h)},$added:function(){var a=this;b.on("keydown",function(b){a.changeKey(b||window.event,!0)}).on("keyup",function(b){a.changeKey(b||window.event,!1)}).on("mousedown touchstart",function(){a.mousedown=!0}).on("mousemove mouseup touchend touchcancel",function(){a.mousedown=!1})}}),d.$s("dom",{$require:["dom"],$addEntity:function(a){!a.dom.$element&&a.dom.selector&&a.dom.select(a.dom.selector)}}),d.$s("acceleration",{$require:["acc","velocity"],$updateEach:function(a,b){a.velocity.x+=a.acc.x*b,a.velocity.y+=a.acc.y*b}}),d.$s("position",{$require:["position","dom","velocity"],$addEntity:function(a){var b=d.entities.canvas.dom.$element,c=a.dom.$element;a.position.x=c.prop("offsetLeft")-b.prop("offsetLeft"),a.position.y=c.prop("offsetTop")-b.prop("offsetTop")},getTranslation:function(a){var b="translate3d("+~~a.position.x+"px, "+~~a.position.y+"px, 0)";if("bird"===a._id){var c=-a.velocity.y/h,d=Math.max(c,-1),e=Math.max(c,-.5);b=b+" rotateZ("+g(Math.acos(d))+"deg) rotateY("+g(Math.asin(e))+"deg)"}return b},$started:function(){var a=this;this.$family.forEach(function(b){var c=b.dom.$element,d=c.prop("offsetWidth"),e=c.prop("offsetHeight");c.css({top:0,left:0,right:"auto",bottom:"auto",padding:0,margin:0,width:d+"px",height:e+"px",position:"absolute"}),b.dom.transform(a.getTranslation(b))})},$updateEach:function(a,b){a.position.x+=a.velocity.x*b,a.position.y+=a.velocity.y*b},$render:function(){for(var a,b=this.$family,c=b.length;c--;){a=b[c];var d=this.getTranslation(a);a.dom.$t!==d&&(a.dom.$t=d,a.dom.transform(d))}}}),f||d.$s("scroll",{$require:["scroll","dom","velocity"],$updateEach:function(a,b){a.scroll.x=a.scroll.x+a.velocity.x*b,a.scroll.y=a.scroll.y+a.velocity.y*b},$render:function(){for(var a,b=this.$family,c=b.length;c--;){var a=b[c];a.dom.$element.css("background-position",~~a.scroll.x+"px "+~~a.scroll.y+"px")}}}),d.$s("pipes",{$require:["pipe"],screen:null,$started:function(){for(var a=this.screen=d.entities.canvas,b=a.bbox.width/4,c=a.bbox.height;this.$family.length<5;){var f=angular.element('<img class="pipe" src="images/yeoman.png"></img>');angular.element(a.dom.$element).append(f),d.$e(angular.copy(e.pipe)).$add("dom",{$element:f})}d.systems.bbox.$started(),this.$family.forEach(function(d,e){d.position.x=a.bbox.width+e*b,d.position.y=c/2*Math.random(),d.pipe.cleared=!1})}}),d.$s("bbox",{$require:["dom","bbox"],$addEntity:function(a){var b=a.dom.$element;a.bbox.width=b.prop("offsetWidth"),a.bbox.height=b.prop("offsetHeight"),a.bbox.update({x:0,y:0})},$started:function(){this.$family.forEach(function(a){a.dom.$element.css({width:a.bbox.width+"px",height:a.bbox.height+"px",padding:0,margin:0})})},$updateEach:function(a){a.position&&a.bbox.update(a.position)}}),d.$s("collision",{score:0,hiscore:0,screen:null,bird:null,pipes:null,miss:!1,hit:!1,crash:!1,startPos:null,time:0,$require:["bird"],$started:function(){this.hiscore=c.hiscore||0,this.screen=d.entities.canvas,this.pipes=d.$f(["pipe"]);var a=this.$family[0];a.$add("control",!0),this.startPos?(a.position.x=this.startPos.x,a.position.y=this.startPos.y):(this.startPos={},this.startPos.x=a.position.x,this.startPos.y=a.position.y),a.velocity.y=0,this.time=0,this.score=0,this.miss=!1,this.crash=!1,this.screen.dom.$element.removeClass("crash")},$updateEach:function(a,b){this.time+=b;var c=this.screen.bbox,d=a.bbox;if(d.bottom>c.bottom&&(a.position.y=c.bottom-d.height,this.crash=!0),!this.crash&&!this.miss)for(var e,f,g=this.pipes,h=g.length;h--;)e=g[h],f=e.bbox,e.pipe.cleared?f.right<c.left-c.width/8&&(e.position.x=9*c.width/8,e.pipe.cleared=!1):f.right<d.left?(e.pipe.cleared=!0,this.score++):f.left<d.right&&(d.top<f.top||d.bottom>f.bottom)&&(this.miss=!0,a.$remove("control"))},$render:function(){(this.miss||this.crash)&&(this.screen.dom.$element.addClass("crash"),this.crash&&d.$stop()),this.score>this.hiscore&&(this.hiscore=this.score)},$stopped:function(){c.hiscore=this.hiscore}})}]),angular.module("angularEcsFlapApp").constant("assemblies",{canvas:{dom:{selector:"#canvas"},bbox:{margin:{bottom:0}},velocity:{x:-100,y:0},scroll:{x:0,y:288}},pipe:{velocity:{x:-200,y:0},position:{x:0,y:0},pipe:{cleared:!1},bbox:{margin:{top:50,bottom:50}}},bird:{dom:{selector:"#bird"},bbox:{},velocity:{x:0,y:0},acc:{x:0,y:2e3},position:{x:0,y:0},control:!0,bird:!0}}),angular.module("angularEcsFlapApp").controller("MainCtrl",["$window","$document","$scope","ngEcs","assemblies","isMobile",function(a,b,c,d,e,f){function g(){var a=document.querySelector("#container"),b=a.offsetWidth/i.$element.prop("offsetWidth"),c=a.offsetHeight/i.$element.prop("offsetHeight");Math.min(b,c);1>b&&i._css("transform-origin","0 0").transform("translate3d(0,0,0) scale3d("+b+", "+b+", 1)")}var h=this;h.game=d,d.$fps=f?45:60,h.message=function(){return h.game.$playing?h.game.systems.collision.score:"angular-ecs-flap"},h.hiscore=function(){return h.game.systems.collision.hiscore>0?"High Score: "+h.game.systems.collision.hiscore:"Built using AngularJS and angular-ecs"},h.click=function(a){a.target.blur(),d.$start()};var i=d.$e("canvas",e.canvas).dom;d.$e("bird",e.bird),b.on("keydown",function(a){d.$playing||32!==a.keyCode||d.$start()}),d.started.add(function(){i.$element.addClass("land")}),g(),a.addEventListener("resize",g,!1),b.on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange",g)}]),angular.module("angularEcsFlapApp").controller("AboutCtrl",function(){});