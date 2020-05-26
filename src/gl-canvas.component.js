const Control = require('./control.component.js');
const GLUtils = require('./gl-utils.js');
const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');
const World = require('./world.object.js');
const Player = require('./player.object.js');
const Bullet = require('./bullet.object.js');
const Rocket = require('./rocket.object.js');
const mapa = require('./maps.const.js');

class GLCanvas extends Control{
  constructor(parentNode, width, height){
    super (parentNode, 'canvas', '', '', ()=>{
      this.node.requestPointerLock();
      
      console.log(this.player.getPosVector());
      let ny = (20)* Math.cos(this.player.camRX);
      let nx = (20)* Math.sin(this.player.camRX);

      let bl = new Bullet(this.gl, this.player.getPosVector(), new Vector3d(-nx*Math.sin(this.player.camRY), -ny*Math.sin(this.player.camRY), -20*Math.cos(this.player.camRY)));
      this.bulletList.push(bl);
    });
   
  this.bulletList = [];

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
      varying vec4 pos;
      varying vec4 nos;
      void main() {
        gl_Position = u_matrix * a_position;
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

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(positionNormLocation);
    
    let world = new World (gl, mapa);
    
    let rock = new Rocket(gl,new Vector3d(3*5, 3*5, -20), new Vector3d((3+1)*5, (3+1)*5, 0), 
    {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255});

    var then = 0;
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

      world.render(gl, positionAttributeLocation, colorLocation);
      rock.render(gl, positionAttributeLocation, positionNormLocation, colorLocation);
      this.bulletList.forEach(it=>{
        it.render( positionAttributeLocation, colorLocation, deltaTime);
      });

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



module.exports = GLCanvas;