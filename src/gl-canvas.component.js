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
      void main() {
        gl_FragColor = vec4(1, 0, 0.5, 1);
      }
    `;
    
    let gl = this.context;
    var vertexShader = GLUtils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = GLUtils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = GLUtils.createProgram(gl, vertexShader, fragmentShader);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

   /* var positions = [
      0, 0, 0,
      0, 0.5, 0,
      0.4, 0, 0
    ];*/
    var positions = makeHorizontalPlaneModel({x:0, y:0}, {x:10.5, y:10.4}, -1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);



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
      var matrix = m4.perspective(1, aspect, 1, 2000);
      
      matrix = m4.xRotate(matrix, this.camRY);
      matrix = m4.yRotate(matrix, 0);
      matrix = m4.zRotate(matrix, this.camRX);
      matrix = m4.scale(matrix, 1, 1, 1);
      matrix = m4.translate(matrix, this.posX, this.posY, 0);
      //console.log(matrix);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);
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
      var count = positions.length / size;
      gl.drawArrays(primitiveType, offset, count);
      requestAnimationFrame(drawScene);
    }
    requestAnimationFrame(drawScene);
    
  }
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


module.exports = GLCanvas;