const Control = require('./control.component.js');
const GLUtils = require('./gl-utils.js');
const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');

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
    this.posX=-2;
    this.posY=-2;
    this.posZ = -3;
    this.forward = false;
    this.tryJump = false;

    this.node.addEventListener('mousemove', (e)=>{
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
      if (e.code == 'Space'){
        this.tryJump = true;
      } 
    });

    document.addEventListener('keyup', (e)=>{
      if (e.code == 'KeyW'){
        this.forward = false;
      }  
      if (e.code == 'Space'){
        this.tryJump = false;
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
    gl.enable(gl.DEPTH_TEST);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);


/*var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = makeHorizontalPlaneModel({x:0, y:0}, {x:10.5, y:10.4}, -1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var positionBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);

    var positions1 = makeHorizontalPlaneModel({x:20, y:20}, {x:30.5, y:30.4}, -1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions1), gl.STATIC_DRAW);
*/  
    
  /*  let modelList = [];
    for (let i = 0; i<10; i++){
      let model = makeModel(
        gl, 
        //makeHorizontalPlaneModel({x:0 + i*15, y:0}, {x:10.5+ i*15, y:10.4}, -1),
        makeBoxModel({x:0 + i*5, y:0, z:-2-i}, 10, 10, 1),
        {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
      );
      modelList.push(model);
      console.log(model);
    }
    */
    const mapa=[
      '00000000000000000000',
      '00000000000000000000',
      '00000000000000000000',
      '00000000000000000000',
      '000ww0wwww0000000000',
      '000000000w0000000000',
      '000000000w0000000000',
      '000000000w0000000000',
      '000000000wwwww000000',
      '00000000000x00000000',
      '00000000000b00000000',
      '00000bb0000000000000',
      '00000000000000000000',
      '000000000b00b0000000',
      '000000000000b0000000',
      '000000000000b0000000',
      '000000000b0000000000',
      '00000000000000000000',
      '00000000000000000000',
      '00000000000000000000',
    ];

    let modelList=[];
    for (let i = 0; i<mapa.length; i++){
      for (let j = 0; j<mapa[0].length; j++){
        let h = 0 ;
        if (mapa[i][j]=='0'){
          h=0;
        }
        if (mapa[i][j]=='w'){
          h=10;
        }
        if (mapa[i][j]=='b'){
          h=2;
        }
        if (mapa[i][j]=='x'){
          h=5;
        }
        let ob = new AABB(gl, new Vector3d(i*5, j*5, -20), new Vector3d((i+1)*5, (j+1)*5, h), 
          {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
        );
        modelList.push(ob);
      }  
    }

   



    var moveSpeed = 5;
    var gravSpeed = -5;

    var then = 0;
    var drawScene = (now)=>{
      now *= 0.001;
      var deltaTime = now - then;
      then = now;

      gravSpeed>-5? gravSpeed -= 0.3 : -5;

      if (this.posZ > 30) {
        console.log('death');
        this.camRX=0;
        this.camRY=0;
        this.posX=-2;
        this.posY=-2;
        this.posZ = -3;
        this.forward = false;
        this.tryJump = false;
      } 

    /*  let inBoxA = (px, py) => {
        let inb = false;
        modelList.forEach((it, i)=>{
          if (inBox(0 +15*i, 0, 10+15*i, 10, px, py)){
            inb = true;
          }  
        });
        return inb;
      }*/

      let inBoxA = (px, py, pz) => {
        let inb = false;
        modelList.forEach((it, i)=>{
         // if (inQube(0 +5*i, 0, 10+5*i, 10, px, py, pz, -20,-2 - i)){
           if (it.inside(new Vector3d(px, py, pz))){
            inb = true;
          }  
        });
        return inb;
      }

      let nz = this.posZ - (gravSpeed * deltaTime);
      if (inBoxA(-this.posX, -this.posY, -nz-2)){
        //this.posZ = nz>=0 ? 0 : nz;
        //this.posZ = nz;
        //if (this.posZ>=0){
          this.onFloor = true//}
      } else {
        this.posZ = nz;
        this.onFloor = false;
      }

      if (this.tryJump){
        if (this.onFloor){
          gravSpeed = 15;
          this.onFloor = false;
          
        }
        this.tryJump =false;
      }

      if (this.forward){
        let ny = this.posY - (moveSpeed * deltaTime)* Math.cos(this.camRX);
        let nx = this.posX - (moveSpeed * deltaTime)* Math.sin(this.camRX);
        
        //let op = clipRect(15, 0 , 10, 10, -nx, -ny);
        
        
       // if (this.posZ>0.0002){

        if (!inBoxA(-nx, -ny, -this.posZ-2)){
          this.posY = ny;
          this.posX = nx;
        } else {
          if (!inBoxA(-this.posX, -ny, -this.posZ-2)){
            this.posY = ny;
          } else {
            if (!inBoxA(-ny, -this.posX, -this.posZ-2)){
              this.posX = nx;
            } else {
              
            }    
          }  
        }
    /*  } else {
        this.posY = ny;
        this.posX = nx;  
      }*/
      }
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var matrix = makeCameraMatrix(aspect, this.camRX, this.camRY, this.posX, this.posY, this.posZ);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

     // renderModel(gl, positionBuffer, positionAttributeLocation, {r:100, g:100, b:200, a:255}, colorLocation);
      //renderModel(gl, positionBuffer1, positionAttributeLocation, {r:200, g:100, b:200, a:255}, colorLocation);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      modelList.forEach(it=>{
        //it.render(gl, it.positionBuffer, positionAttributeLocation, it.color, colorLocation);
        //renderModel(gl, it.positionBuffer, 6*6 , positionAttributeLocation, it.color, colorLocation);
        it.render(gl, positionAttributeLocation, colorLocation);
      });

      requestAnimationFrame(drawScene);
    }
    requestAnimationFrame(drawScene);
    
  }
}

function makeModel(gl, vertexList, color){
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

function vertex(x, y, z){
  return {x, y, z}
}

function inBox(x1, y1, x2, y2, x3, y3) {
  let n = 1;
  var bou = ((x3 <= x1 + n) && (x3 > x2 - n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
      (x3 > x1 - n) && (x3 <= x2 + n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
      (x3 <= x1 + n) && (x3 > x2 - n) && (y3 > y1 - n) && (y3 <= y2 + n) ||
      (x3 > x1 - n) && (x3 <= x2 + n) && (y3 > y1 - n) && (y3 <= y2 + n));
  return bou;
}

function inQube(x1, y1, x2, y2, x3, y3, z3, zs, ze){
  let res = inBox(x1, y1, x2, y2, x3, y3);
  if ((z3>zs)&&(z3<=ze)){
    return res;
  }
  else {
    return false;
  }
}


function clipRect(x0, y0, l, w, px, py){
  if ((px>x0) && (px<(x0+l))){
    if (py>=y0){
      return {x:px, y:y0}
    }
    if (py<=y0+w){
      return {x:px, y:y0+w}
    }
  }
  if ((py>y0) && (py<(y0+w))){
    if (px>=x0){
      return {x:x0, y:py}
    }
    if (px<=x0+l){
      return {x:x0+l, y:py}
    }
  }
  return {x:px, y:py}
}

function makeBoxModel(v0, l, w, h){
  return makeBoxModelFromVertexList(
    [
      vertex(v0.x, v0.y, v0.z),
      vertex(v0.x + l, v0.y, v0.z),
      vertex(v0.x + l, v0.y + w, v0.z),
      vertex(v0.x, v0.y + w, v0.z),
      vertex(v0.x, v0.y, v0.z + h),
      vertex(v0.x + l, v0.y, v0.z + h),
      vertex(v0.x + l, v0.y + w, v0.z + h),
      vertex(v0.x, v0.y + w, v0.z + h)
    ]
  );
}

function makeBoxModelFromVertexList(va){
  var positions = [
    va[0].x, va[0].y, va[0].z,
    va[1].x, va[1].y, va[1].z,
    va[2].x, va[2].y, va[2].z,
    va[2].x, va[2].y, va[2].z,
    va[3].x, va[3].y, va[3].z,
    va[0].x, va[0].y, va[0].z,

    va[4].x, va[4].y, va[4].z,
    va[5].x, va[5].y, va[5].z,
    va[6].x, va[6].y, va[6].z,
    va[6].x, va[6].y, va[6].z,
    va[7].x, va[7].y, va[7].z,
    va[4].x, va[4].y, va[4].z,

    va[0].x, va[0].y, va[0].z,
    va[1].x, va[1].y, va[1].z,
    va[1+4].x, va[1+4].y, va[1+4].z,
    va[0].x, va[0].y, va[0].z,
    va[1+4].x, va[1+4].y, va[1+4].z,
    va[0+4].x, va[0+4].y, va[0+4].z,

    va[1].x, va[1].y, va[1].z,
    va[2].x, va[2].y, va[2].z,
    va[2+4].x, va[2+4].y, va[2+4].z,
    va[1].x, va[1].y, va[1].z,
    va[2+4].x, va[2+4].y, va[2+4].z,
    va[1+4].x, va[1+4].y, va[1+4].z,

    va[2].x, va[2].y, va[2].z,
    va[3].x, va[3].y, va[3].z,
    va[3+4].x, va[3+4].y, va[3+4].z,
    va[2].x, va[2].y, va[2].z,
    va[3+4].x, va[3+4].y, va[3+4].z,
    va[2+4].x, va[2+4].y, va[2+4].z,

    va[3].x, va[3].y, va[3].z,
    va[0].x, va[0].y, va[0].z,
    va[0+4].x, va[0+4].y, va[0+4].z,
    va[3].x, va[3].y, va[3].z,
    va[0+4].x, va[0+4].y, va[0+4].z,
    va[3+4].x, va[3+4].y, va[3+4].z,
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