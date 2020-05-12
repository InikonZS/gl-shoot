const Control = require('./control.component.js');
const GLUtils = require('./gl-utils.js');

class GLCanvas extends Control{
  constructor(parentNode, width, height){
    super (parentNode, 'canvas', '', '', ()=>{
      this.node.requestPointerLock();
    });
   /* document.addEventListener('keyup', (e)=>{
      if (e.code == 'Esc'){
        this.node.exitPointerLock();
      }
    });*/
  /*  document.addEventListener('pointerlockchange', (e)=>{

    });*/
    this.camRX=0;
    this.camRY=0;
    this.posX=0;
    this.posY=0;
    this.forward = false;
    this.node.addEventListener('mousemove', (e)=>{
      //console.log(e.movementX);
      this.camRX += e.movementX / 100;
      this.camRY += e.movementY / 100;
        if (this.camRY>0){ this.camRY=0 }
        if (this.camRY<-Math.PI){ this.camRY=-Math.PI}
    });

    document.addEventListener('keydown', (e)=>{
      console.log(e.code);
      if (e.code == 'KeyW'){
        this.forward = true;
      }  
    });

    document.addEventListener('keyup', (e)=>{
      if (e.code == 'KeyW'){
        this.forward = false;
      }  
    })

    this.node.width = width;
    this.node.height = height;
    this.context = this.node.getContext('webgl'); 
  }

  init(){
    let vertexShaderSource = `
      attribute vec4 a_position;
      uniform mat4 u_matrix;
      void main() {
        gl_Position = u_matrix * a_position;
      }
    `;

    let fragmentShaderSource =`
      precision mediump float;
      uniform vec4 u_color;
      void main() {
        gl_FragColor = u_color;
      }
    `;
    
    let gl = this.context;

    let program = makeShader(gl, vertexShaderSource, fragmentShaderSource);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);


var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = makeHorizontalPlaneModel({x:0, y:0}, {x:10.5, y:10.4}, -1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
/*
    var positionBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);

    var positions1 = makeHorizontalPlaneModel({x:20, y:20}, {x:30.5, y:30.4}, -1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions1), gl.STATIC_DRAW);
*/  
    let modelList = [];
    for (let i = 0; i<10; i++){
      let model = makeModel(
        gl, 
        makeHorizontalPlaneModel({x:0 + i*15, y:0}, {x:10.5+ i*15, y:10.4}, -1),
        {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255},
        renderModel
      );
      modelList.push(model);
      console.log(model);
    }
    

   



    var moveSpeed = 5;

    var then = 0;
    var drawScene = (now)=>{
      now *= 0.001;
      var deltaTime = now - then;
      then = now;
      if (this.forward){
        this.posY -= (moveSpeed * deltaTime)* Math.cos(this.camRX);
        this.posX -= (moveSpeed * deltaTime)* Math.sin(this.camRX);
      }
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var matrix = makeCameraMatrix(aspect, this.camRX, this.camRY, this.posX, this.posY, 0);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

     // renderModel(gl, positionBuffer, positionAttributeLocation, {r:100, g:100, b:200, a:255}, colorLocation);
      //renderModel(gl, positionBuffer1, positionAttributeLocation, {r:200, g:100, b:200, a:255}, colorLocation);
      modelList.forEach(it=>{
        //it.render(gl, it.positionBuffer, positionAttributeLocation, it.color, colorLocation);
        renderModel(gl, it.positionBuffer, 6 , positionAttributeLocation, it.color, colorLocation);
      });

      requestAnimationFrame(drawScene);
    }
    requestAnimationFrame(drawScene);
    
  }
}

function makeModel(gl, vertexList, color, renderFunction){
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexList), gl.STATIC_DRAW);  
  return {
    positionBuffer,
    color
  }
}

/*function setCamera(gl, matrixLocation){
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var matrix = makeCameraMatrix(aspect, this.camRX, this.camRY, this.posX, this.posY, 0);
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
}*/

function renderModel(gl, glBuffer, bufLength, positionAttributeLocation, color, colorLocation){

  gl.uniform4f(colorLocation, color.r/255, color.g/255, color.b/255, color.a/255);
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

  // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 2 компоненты на итерацию
  var type = gl.FLOAT;   // наши данные - 32-битные числа с плавающей точкой
  var normalize = false; // не нормализовать данные
  var stride = 0;        // 0 = перемещаться на size * sizeof(type) каждую итерацию для получения следующего положения
  var offset = 0;        // начинать с начала буфера
  gl.vertexAttribPointer(
  positionAttributeLocation, size, type, normalize, stride, offset);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  //var count = positions.length / size;
  var count = bufLength; 
  gl.drawArrays(primitiveType, offset, count); 
}

function makeHorizontalPlaneModel(v1, v2, z){
  var positions = [
    v1.x, v1.y, z,
    v1.x, v2.y, z,
    v2.x, v1.y, z,
    v1.x, v2.y, z,
    v2.x, v2.y, z,
    v2.x, v1.y, z,
  ]; 
  return positions;  
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


class Player{
  constructor (){
    this.posX = 0;
    this.posY = 0;
    this.posZ = 0;
    this.RX = 0;
    this.RY = 0;

    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
  }



}


module.exports = GLCanvas;