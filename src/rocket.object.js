const Vector3d = require('./vector3d.object.js');
const getModel = require('./model.object.js');

class Rocket{
  constructor(gl, aVector3d, bVector3d, color) {
    this.aVector3d = aVector3d;
    this.bVector3d = bVector3d;
    this.lwh = this.bVector3d.subVector(this.aVector3d);
    let vertexList = getModel()[0];
    let normalList = getModel()[1];

    console.log(normalList);
    this.vertexList = vertexList;
    this.color = color;

    //for (let i=0; i<this.vertexList)

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexList), gl.STATIC_DRAW); 
    
    this.glPositionBuffer = positionBuffer;

    var normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalList), gl.STATIC_DRAW); 
    
    this.normBuffer = normBuffer;
  }
  
  inside(vector3d){
    let v = vector3d;
    let a = this.aVector3d;
    let b = this.bVector3d;
    return inQube(a.x, a.y, b.x, b.y, v.x, v.y, v.z, a.z, b.z);
  }

  render(gl, positionAttributeLocation, positionNormLocation, colorLocation){
    let b=100;
    let cl=this.vertexList.length;
  /*  let i = 0;
    while (cl>b*3){
      renderModel(gl, this.glPositionBuffer, 3*b*i, b*3, positionAttributeLocation, this.color, colorLocation); 
      i++;   
      cl-=b*3;
    }*/
    renderModel(gl, this.glPositionBuffer, this.normBuffer, 0, cl/3, positionAttributeLocation, positionNormLocation, this.color, colorLocation);
  }

}

function renderModel(gl, glBuffer,normBuffer, offset ,bufLength, positionAttributeLocation, positionNormLocation, color, colorLocation){

  gl.uniform4f(colorLocation, color.r/255, color.g/255, color.b/255, color.a/255);
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

  // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 2 компоненты на итерацию
  var type = gl.FLOAT;   // наши данные - 32-битные числа с плавающей точкой
  var normalize = false; // не нормализовать данные
  var stride = 0;        // 0 = перемещаться на size * sizeof(type) каждую итерацию для получения следующего положения
  //var offset = 0;        // начинать с начала буфера
  gl.vertexAttribPointer(
  positionAttributeLocation, size, type, normalize, stride, offset);

  gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);

  // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
  //var size = 3;          // 2 компоненты на итерацию
 // var type = gl.FLOAT;   // наши данные - 32-битные числа с плавающей точкой
 // var normalize = false; // не нормализовать данные
 // var stride = 0;        // 0 = перемещаться на size * sizeof(type) каждую итерацию для получения следующего положения
  //var offset = 0;        // начинать с начала буфера
  gl.vertexAttribPointer(
  positionNormLocation, size, type, normalize, stride, offset);

  var primitiveType = gl.TRIANGLES;
 // var offset = 0;
  //var count = positions.length / size;
  var count = bufLength; 
  gl.drawArrays(primitiveType, offset, count); 
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


module.exports = Rocket;