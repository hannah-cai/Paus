//geometry variables
var renderer, geometry, uniqueVertices;
//state variables
var s, vol, g, x, targetY, speed, movement;
var hover, inc, motion, st, y = 0;
var state = "talking";
var easing = 0.15;
var tt = 0;
var ripple;
//light/color variables
var pn, ps, ph, pa, pChange, pShift, goalColor;
var pShift = 15;

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  angleMode(DEGREES);
  mic = new p5.AudioIn();
  mic.start();
  //set color variables: base, neutral, sad, happy, alarmed
  pn = color(50, 0, 25);
  ps = color(50, 0, 75);
  // ph = color(225, 0, 125);
  ph = color(255, 0, 100);
  pa = color(255, 0, 0);
  //initial colors
  pChange = pn;
  lastColor = pn;
  goalColor = pn;
  //states
  talking = createButton('talking');
  talking.position(0, 0, 0);
  talking.mousePressed(function(){y = 20 * sin(hover/10 % 360); if(state != 'talking'){state = 'talking'}});
  waiting = createButton('waiting');
  waiting.position(50, 0, 0);
  waiting.mousePressed(function(){if(state != 'waiting'){hover = 0; state = 'waiting'}});
  listening = createButton('listening');
  listening.position(100, 0, 0);
  listening.mousePressed(function(){y = 20 * sin(hover/10 % 360); if(state != 'listening'){state = 'listening'}});
  //emotions
  neutral = createButton('neutral');
  neutral.position(0, 20, 0);
  neutral.mousePressed(function(){changeColor(pn)});
  sad = createButton('sad');
  sad.position(50, 20, 0);
  sad.mousePressed(function(){changeColor(ps)});
  happy = createButton('happy');
  happy.position(100, 20, 0);
  happy.mousePressed(function(){changeColor(ph)});
  alarmed = createButton('alarmed');
  alarmed.position(150, 20, 0);
  alarmed.mousePressed(function(){changeColor(pa)});
}

function changeColor(color) {
  st = 0;
  goalColor = color;
}

function draw() {
  background(250);
  vol = mic.getLevel(0.9);
  s = min(width,height)/10;
  speed = 5000;
  ripple = 0.01;
  //lights
  ambientLight(100); 
  directionalLight(182, 206, 255, 0.25, 0.25, 0);
  pointLight(200, 220, 245, height, width, 1000);
  ambientMaterial(169, 240, 255);
  //changing color
  if (st <= pShift) {
    x = map(st, 0, pShift, 0, 1);
    st++;
    pChange = lerpColor(lastColor, goalColor, x);
  }
  if (st == pShift) {
    lastColor = goalColor;
  }
  pointLight(pChange, cos(frameCount)*500, sin(frameCount)*500, 1000);
  //states
  if (state == "talking") {
    hover = 0;
    targetY = 0;
    dy = targetY - y;
    y += dy * easing;
    translate(0, y);
  } else if (state == "waiting") {
    hover += 1000 / 15;
    translate(0, 20 * sin(hover/10 % 360));
  } else if (state == "listening") {
    hover = 0;
    targetY = 0;
    dy = targetY - y;
    y += dy * easing;
    translate(0, y);
    s += s * vol * 2;
    ripple += vol / 3;
  } 
  tt += ripple;
  //create and render sphere
  geometry = icosphere(5);
  uniqueVertices = [...new Set(geometry.vertices)];
  for (var ii = 0; ii < 10; ii ++) {
    var vertices = uniqueVertices;
    for (var i = 0 ; i < vertices.length; i ++) {
      var v = vertices[i];
      var l = v.mag();
      v.setMag(1 + (l - 1) * 0.991);
    }
  }
  geometry.computeNormals();
  renderer.createBuffers("!", geometry);
  renderer.drawBuffersScaled("!", s, s, s);
}

//code from <https://codepen.io/Spongman/pen/NyGZZy>
function icosphere(detail) {
  g = new p5.Geometry(detail);
  var addVertex = function(p) {
    p.normalize();
    g.vertices.push(p);
//modified code (create noise, move vertices based on noise)
    movement = 0.1;
    var v = noise(
      p.x + tt,
      p.y + tt,
      p.z + tt
      );
    v = map(v, 0, 1, -movement, movement);
    p.x += p.x * v;
    p.y += p.y * v;
    p.z += p.z * v;
    g.uvs.push([1, 1]);
  }
//unmodified code (render sphere)
  var midPointIndexCache = {};
  var midPoint = function(pb, pChange) {
    var key = pb < pChange ? pb + "," + pChange : pChange + "," + pb;
    var ret = midPointIndexCache[key];
    if (typeof ret === "undefined") {
      ret = midPointIndexCache[key] = g.vertices.length;
      addVertex(p5.Vector.add(g.vertices[pb], g.vertices[pChange]));
    }
    return ret;
  };
  var phi = (1 + Math.sqrt(5) / 2);
  addVertex(new p5.Vector(-1, phi, 0));
  addVertex(new p5.Vector(1, phi, 0));
  addVertex(new p5.Vector(-1, -phi, 0));
  addVertex(new p5.Vector(1, -phi, 0));
  addVertex(new p5.Vector(0, -1, phi));
  addVertex(new p5.Vector(0, 1, phi));
  addVertex(new p5.Vector(0, -1, -phi));
  addVertex(new p5.Vector(0, 1, -phi));
  addVertex(new p5.Vector(phi, 0, -1));
  addVertex(new p5.Vector(phi, 0, 1));
  addVertex(new p5.Vector(-phi, 0, -1));
  addVertex(new p5.Vector(-phi, 0, 1));
  var faces = [
  [0, 5, 11],
  [0, 1, 5],
  [0, 7, 1],
  [0, 10, 7],
  [0, 11, 10],
  [1, 9, 5],
  [5, 4, 11],
  [11, 2, 10],
  [10, 6, 7],
  [7, 8, 1],
  [3, 4, 9],
  [3, 2, 4],
  [3, 6, 2],
  [3, 8, 6],
  [3, 9, 8],
  [4, 5, 9],
  [2, 11, 4],
  [6, 10, 2],
  [8, 7, 6],
  [9, 1, 8]
  ];
  for (var ff = 0; ff < faces.length; ff++) {
    var f = faces[ff];
    var t = f[0];
    f[0] = f[1];
    f[1] = t;
  }
  for (var i = 0; i < detail; i++) {
    var faces2 = [];
    for (var iTri = 0; iTri < faces.length; iTri++) {
      var tri = faces[iTri];
      var a = tri[0];
      var b = tri[1];
      var c = tri[2];
      var ab = midPoint(a, b);
      var bc = midPoint(b, c);
      var ca = midPoint(c, a);
      faces2.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = faces2;
  }
  var q, iv;
  for (var fi = 0; fi < faces.length; fi++) {
    var face = faces[fi];
    var uv1 = g.uvs[face[0]];
    var uv2 = g.uvs[face[1]];
    var uv3 = g.uvs[face[2]];
    var u1 = uv1[0];
    var u2 = uv2[0];
    var u3 = uv3[0];
    if (
      (u1 < 0.25 || u2 < 0.25 || u3 < 0.25) &&
      (u1 > 0.75 || u2 > 0.75 || u3 > 0.75)
      ) {
      for (q = 0; q < 3; q++) {
        iv = face[q];
      }
    }
    for (q = 0; q < 3; q++) {
      iv = face[q];
      var v = g.uvs[face[q]][1];
      if (v % 1 === 0) {
        var u = (g.uvs[face[(q + 1) % 3]][0] + g.uvs[face[(q + 2) % 3]][0]) / 2;
      }
    }
  }
  g.faces = faces;
  return g;
}