const Control = require('./control.component.js');
const GLUtils = require('./gl-utils.js');
const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');
const World = require('./world.object.js');
const Player = require('./player.object.js');
const Bullet = require('./bullet.object.js');
const Point = require('./point.object.js');
const Rocket = require('./rocket.object.js');
const Mov = require('./mov.object.js');
const mapa = require('./maps.const.js');
const calc = require('./calc.utils.js');

function solveList(vertexList, sv, nnv, nv){
  let res =[];
  let dvmin;
  let dvminl=99999;
  for (let i=0; i<vertexList.length; i+=9){
    let v=[];
    for (let j=0; j<3; j+=1){
      v[j] = new Vector3d(vertexList[i+j*3+0], vertexList[i+j*3+1], vertexList[i+j*3+2]);
    }
   
    let dv = solveLinear(sv, nnv, v[0], v[1], v[2]);
    let dvv = new Vector3d(dv.x,dv.y,dv.z)
    if (calc.inTriangle(v[0],v[1],v[2], dvv)){
      if (calc.onLine(sv, nv.mul(1000).addVector(sv), dvv)){
        if (dvminl>dvv.subVector(sv).abs()){
          dvmin =dvv;
          dvminl = dvv.subVector(sv).abs();
        }
        //res.push(dv);
      }
    }
  }
  return dvmin;
}

function solveWorld(world, sv, nnv, nv){
  let res =[];
  let dvmin;
  let dvminl=99999;
  world.modelList.forEach(it=>{
    //console.log(it);
    for (let i=0; i<it.vertexList.length; i+=9){
      let v=[];
      for (let j=0; j<3; j+=1){
        v[j] = new Vector3d(it.vertexList[i+j*3+0], it.vertexList[i+j*3+1], it.vertexList[i+j*3+2]);
      }
     
      let dv = solveLinear(sv, nnv, v[0], v[1], v[2]);
      let dvv = new Vector3d(dv.x,dv.y,dv.z)
      if (calc.inTriangle(v[0],v[1],v[2], dvv)){
        if (calc.onLine(sv, nv.mul(1000).addVector(sv), dvv)){
          if (dvminl>dvv.subVector(sv).abs()){
            dvmin =dvv;
            dvminl = dvv.subVector(sv).abs();
          }
          //res.push(dv);
        }
      }
    }
    
  });
  if (dvmin) { return [dvmin]} else {return [];}
 // return res;
}

class GLCanvas extends Control{
  constructor(parentNode, width, height){
    super (parentNode, 'canvas', '', '', ()=>{
      this.node.requestPointerLock();
      
      //console.log(this.player.getPosVector());
      let ny = (20)* Math.cos(this.player.camRX);
      let nx = (20)* Math.sin(this.player.camRX);

      //let bl = new Bullet(this.gl, this.player.getPosVector(), new Vector3d(-nx*Math.sin(this.player.camRY), -ny*Math.sin(this.player.camRY), -20*Math.cos(this.player.camRY)));
      //this.bulletList.push(bl);

      let nv = new Vector3d(-nx*Math.sin(this.player.camRY), -ny*Math.sin(this.player.camRY), -20*Math.cos(this.player.camRY));
      let sv = this.player.getPosVector();
      let nnv = nv.addVector(sv);
      let dv = solveLinear(sv, nnv, new Vector3d(1,4,0), new Vector3d(3,4,0), new Vector3d(2,17,0));
      console.log(nnv);
     // let pl = new Point(this.gl, new Vector3d(dv.x,dv.y,dv.z) , new Vector3d(0,0,0));
     // this.pointList.push(pl);
     //console.log(colorLocation);
      let arr = solveWorld(this.world, sv, nnv, nv);
      console.log(arr);
      this.pointList=[];
      arr.forEach(it=>{
        let pl = new Point(this.gl, new Vector3d(it.x,it.y,it.z) , new Vector3d(0,0,0));
        this.pointList.push(pl);  
      })
      //console.log('mtr', this.moved.getTransformed());
      let rvm = solveList(this.moved.getTransformed(), sv, nnv, nv);
      console.log('rvm',rvm)
      if (rvm) {this.pointList.push(new Point(this.gl, new Vector3d(rvm.x,rvm.y,rvm.z) , new Vector3d(0,0,0)))}
      console.log(this.pointList);
    });
   
  this.bulletList = [];
  this.pointList = [];

  this.player = new Player();
  this.player.spawn();

    this.node.addEventListener('mousemove', (e)=>{
      this.player.rotateCam(e.movementX, e.movementY);
    });

    document.addEventListener('keydown', (e)=>{
      console.log(e.code);
      if (e.code == 'KeyW'){
        this.player.forward = true;
      } 
      if (e.code == 'Space'){
        this.player.tryJump = true;
      } 
    });

    document.addEventListener('keyup', (e)=>{
      if (e.code == 'KeyW'){
        this.player.forward = false;
      }  
      if (e.code == 'Space'){
        this.player.tryJump = false;
      }
    })

    this.node.width = width;
    this.node.height = height;
    this.context = this.node.getContext('webgl'); 
  }

  init(){
    let vertexShaderSource = `
      attribute vec4 a_position;
      attribute vec4 n_position;
      uniform mat4 u_matrix;
      uniform mat4 u_matrix_world;
      varying vec4 pos;
      varying vec4 nos;
      void main() {
        gl_Position = u_matrix * u_matrix_world * a_position;
        pos = gl_Position;
        nos = n_position;
      }
    `;

    let fragmentShaderSource =`
      precision mediump float;
      uniform vec4 u_color;
      varying vec4 pos;
      varying vec4 nos;
      void main() {
        gl_FragColor = normalize(vec4(nos.x, nos.y, nos.z, 1));
      }
    `;
    
    let gl = this.context;
    this.gl = gl;

    let program = makeShader(gl, vertexShaderSource, fragmentShaderSource);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var positionNormLocation = gl.getAttribLocation(program, "n_position");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    var worldLocation = gl.getUniformLocation(program, "u_matrix_world");

    console.log(m4.identity());


    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(positionNormLocation);
    
    let moved = new Mov(gl,new Vector3d(0, 0, 0), new Vector3d(1,1,1), m4.identity());
    console.log('fgh', moved.getTransformed());
    this.moved = moved;

    let world = new World (gl, mapa);
    this.world=world;
    
    let rock = new Rocket(gl,new Vector3d(3*5, 3*5, -20), new Vector3d((3+1)*5, (3+1)*5, 0), 
    {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255});

    var then = 0;
    let ang =0;
    var drawScene = (now)=>{
      now *= 0.001;
      var deltaTime = now - then;
      then = now;

     

      this.player.procMoves(world, deltaTime);

      if (this.player.posZ > 30) {
        console.log('death');
        this.player.spawn();
      } 

      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var matrix = makeCameraMatrix(aspect, this.player.camRX, this.player.camRY, this.player.posX, this.player.posY, this.player.posZ);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      let wmat = m4.identity();
      ang+=0.1*deltaTime;
      wmat = m4.translate(wmat, 30, 15, 5);
      wmat = m4.xRotate(wmat, ang);
      
      
      //gl.uniformMatrix4fv(worldLocation, false, wmat);

      world.render(gl, positionAttributeLocation, colorLocation);
      rock.render(gl, positionAttributeLocation, positionNormLocation, colorLocation);
      this.bulletList.forEach(it=>{
        it.render( positionAttributeLocation, colorLocation, deltaTime);
      });
      this.pointList.forEach(it=>{
        it.render( positionAttributeLocation, colorLocation, deltaTime);
      });
      moved.render(positionAttributeLocation,colorLocation, worldLocation,wmat);

      requestAnimationFrame(drawScene);
    }
    requestAnimationFrame(drawScene);
    
  }
}


function makeCameraMatrix(aspect, rx, ry, px, py, pz){
  let matrix = m4.perspective(1, aspect, 0.1, 2000); 
  matrix = m4.xRotate(matrix, ry);
  matrix = m4.yRotate(matrix, 0);
  matrix = m4.zRotate(matrix, rx);
  matrix = m4.scale(matrix, 1, 1, 1);
  matrix = m4.translate(matrix, px, py, pz);
  return matrix;
}

function makeShader(gl, vertexShaderSource, fragmentShaderSource){
  var vertexShader = GLUtils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = GLUtils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  var program = GLUtils.createProgram(gl, vertexShader, fragmentShader);  
  return program;
}

function getNormal(u, v, w){
  let nv = {x: v.x-u.x, y: v.y-u.y, z: v.z-u.z}  
  let nw = {x: w.x-u.x, y: w.y-u.y, z: w.z-u.z}  
  let n = {x: nv.y*nw.z - nv.z*nw.y, y: nv.z * nw.x - nv.x * nw.z, z: nv.x * nw.y - nv.y * nw.x}
  let d = Math.hypot(n.x, n.y, n.z);
  //console.log(nv);
  return {x: n.x/d, y: n.y/d, z: n.z/d}
}

function getValueD(v, n){
  let d = -(v.x*n.x + v.y*n.y + v.z*n.z);
  return d;
}

function solveLinear(v1, v2, u, v, w){
  let n = getNormal (u, v, w);
  
  let d = getValueD(u, n);
  let nv = {x: v1.x-v2.x, y: v1.y-v2.y, z: v1.z-v2.z};
  let h = (n.x*v1.x + n.y*v1.y + n.z*v1.z +d) / (-(n.x*nv.x + n.y*nv.y + n.z*nv.z));
  //console.log(h, d);
  return {x: v1.x + h*nv.x, y: v1.y + h*nv.y, z: v1.z + h*nv.z}
}


module.exports = GLCanvas;