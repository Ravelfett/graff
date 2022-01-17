const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
var width = window.innerWidth;
var height = window.innerHeight;


function resize() {
  width = window.innerWidth,
  height = window.innerHeight,
  ratio = window.devicePixelRatio;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  context.scale(ratio, ratio);
}
window.onresize = function() {
  resize();
};
window.onload = function() {
  resize();
  window.requestAnimationFrame(animate);
}

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('mousemove', (p) => {
  const t = canvas.getBoundingClientRect();
  mouse[0] = (p.pageX - t.left);
  mouse[1] = (p.pageY - t.top);
}, false);

document.onmousedown = function (e) {
  if (e.button == 0) {
    for(const i in graf.nodes){
      if((graf.nodes[i].x-mouse[0])**2+(graf.nodes[i].y-mouse[1])**2 < 25**2) {
        clicks[0] = true;
        clicking = i;
      }
    }
    if (!clicks[0]) {
      clicks[0] = true;
      const n = new VNode();
      n.x = mouse[0];
      n.y = mouse[1];
      clicking = graf.addNode(n);
    }
  }
  if (e.button == 2) {
    for(const i in graf.nodes){
      if((graf.nodes[i].x-mouse[0])**2+(graf.nodes[i].y-mouse[1])**2 < 60**2) {
        clicks[1] = true;
        clicking = i;
      }
    }
  }
};

document.onmouseup = function (e) {
  if (e.button == 0) {
    clicks[0] = false;
  }
  if (e.button == 2) {
    if (clicks[1]) {
      for(const i in graf.nodes){
        if((graf.nodes[i].x-mouse[0])**2+(graf.nodes[i].y-mouse[1])**2 < 60**2) {
          c1 = new VConnection(1);
          c2 = new VConnection(1);
          graf.nodes[clicking].connect(c1, i);
          graf.nodes[i].connect(c2, clicking);
        }
      }
    }
    clicks[1] = false;
  }
};

class VNode extends Node {
  constructor() {
    super();
    this.color = 'hsl(199, 100%, 50%)';
    this.x = Math.random()*width;
    this.y = Math.random()*height;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
  }
  update(){
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.ax = 0;
    this.ay = 0;
  }
  render(ctx){

  }
}

class VConnection extends Connection {
  constructor(weight) {
    super();
    this.color = "rgb(189, 152, 109)";
    this.weight = weight;
  }
}

const mouse = [0, 0];
const clicks = [false, false];
let clicking = 0;


const graf = new Graph();
ns = []
for(let i = 0; i < 20; i++){
  ns.push(graf.addNode(new VNode()))
}
for(let i = 0; i < 40; i++){
  n1 = ns[Math.floor(Math.random()*ns.length)]
  n2 = ns[Math.floor(Math.random()*ns.length)]
  node1 = graf.nodes[n1];
  node2 = graf.nodes[n2];
  if(((node1.x-node2.y)**2+(node1.y-node2.y)**2)<500**2){
    let w = Math.floor(Math.random()*5)
    c1 = new VConnection(w);
    c2 = new VConnection(w);
    node1.connect(c1, n2);
    node2.connect(c2, n1);
  }
}


function path(graf, n1, n2){
  let l = {};
  for(let i in graf.nodes){
    l[i] = {distance: null, visited: false, path: []};
  }
  l[n1].distance = 0;
  while(true){
    let min = null;
    for(let i in l){
      if(l[i].distance != null && !l[i].visited){
        if(min == null){
          min = i;
        }
        if(l[min]>l[i]){
          min = i;
        }
      }
    }
    if (min == null){
      return {distance: -1, path: []};
    }
    if (min == n2) {
      return l[min];
    }
    for(let i of graf.nodes[min].connections){
      let ndist = l[min].distance+i.weight;
      if(l[i.target].distance == null){
        l[i.target].distance = ndist;
        l[i.target].path = [...l[min].path, min];
      }
      if (l[i.target].distance>ndist) {
        l[i.target].distance = ndist;
        l[i.target].path = [...l[min].path, min];
      }
    }
    l[min].visited = true;
  }
}

graf.nodes[ns[0]].color = "rgb(184, 222, 78)";
graf.nodes[ns[3]].color = "rgb(14, 67, 138)";
let paf = path(graf, ns[0], ns[3]);
for(let i of paf.path.slice(1)){
  graf.nodes[i].color = "red"
}


function animate() {
  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.fillStyle = "rgb(38, 6, 77)";
  context.rect(0, 0, width, height);
  context.fill();
  context.closePath();


  for(const i in graf.nodes){
    let node1 = graf.nodes[i]
    for(const j of node1.connections){
      let node2 = graf.nodes[j.target];
      if ((node1.x-node2.x)**2+(node1.y-node2.y)**2 > 800**2) {
        node1.ax += (node2.x-node1.x)/4000;
        node1.ay += (node2.y-node1.y)/4000;
      }
      if ((node1.x-node2.x)**2+(node1.y-node2.y)**2 < 300**2) {
        node1.ax += (node1.x-node2.x)/4000;
        node1.ay += (node1.y-node2.y)/4000;
      }
    }
  }

  if (clicks[0]) {
    graf.nodes[clicking].ax = (mouse[0]-graf.nodes[clicking].x)/200;
    graf.nodes[clicking].ay = (mouse[1]-graf.nodes[clicking].y)/200;
  }
  for(const i in graf.nodes){
    graf.nodes[i].update();
  }

  for(const i in graf.nodes){
    for(const j of graf.nodes[i].connections){
      context.strokeStyle = j.color;
      context.beginPath();
      context.lineWidth = 6;
      context.moveTo(graf.nodes[i].x, graf.nodes[i].y);
      context.lineTo(graf.nodes[j.target].x, graf.nodes[j.target].y);
      context.stroke();
      context.closePath();
    }
  }
  if(clicks[1]){
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(graf.nodes[clicking].x, graf.nodes[clicking].y);
    context.lineTo(mouse[0], mouse[1]);
    context.stroke();
    context.closePath();
  }

  for(const i in graf.nodes){
    context.beginPath();
    context.fillStyle = graf.nodes[i].color;
    context.arc(graf.nodes[i].x, graf.nodes[i].y, 20, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
  }
  context.fillStyle = "rgb(163, 180, 231)";
  context.font = '48px consolas';
  context.textAlign = "center";
  context.textBaseline = "middle";
  for(const i in graf.nodes){
    for(const j of graf.nodes[i].connections){
      context.fillText(j.weight, (graf.nodes[i].x+graf.nodes[j.target].x)/2, (graf.nodes[i].y+graf.nodes[j.target].y)/2);
    }
  }
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
