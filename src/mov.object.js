const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');
const calc = require('./calc.utils.js');

class Mov{
  constructor(gl, xVector3d, sVector3d, matx){
    this.gl = gl;
    this.matx = matx;
    //this.nmx = matFromM4(matx);
    this.cVector3d = xVector3d.addVector(sVector3d.mul(0.02));
    this.model = new AABB(gl, this.cVector3d.add(-2.5, -2.5, -2.5), this.cVector3d.add(+2.5, +2.5, +2.5),
      {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
    );
    this.speed = sVector3d;
  }

  render(positionAttributeLocation, colorLocation, glm, matx, deltaTime){
    this.matx = matx;
    this.nmx = matFromM4(matx);
    let gl = this.gl;
    //this.cVector3d = this.cVector3d.addVector(this.speed.mul(deltaTime));

      this.gl.uniformMatrix4fv(glm, false, matx);
   /*   this.rmodel = new AABB(this.gl, this.cVector3d.add(-2.5, -2.5, -2.5), this.cVector3d.add(+2.5, +2.5, +2.5),
      {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
    );
this.rmodel.vertexList = this.getTransformed();
var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.rmodel.vertexList), gl.STATIC_DRAW); 
    this.rmodel.glPositionBuffer = positionBuffer;
    this.rmodel.render(this.gl, positionAttributeLocation, colorLocation);
*/ this.model.render(this.gl, positionAttributeLocation, colorLocation);
   let wmat = m4.identity();
     this.gl.uniformMatrix4fv(glm, false, wmat);
  }

  getTransformed(){
    let ot =[];
    for (let i=0; i<this.model.vertexList.length/3; i++){
      let v =[[this.model.vertexList[i*3+0]],[this.model.vertexList[i*3+1]],[this.model.vertexList[i*3+2]], [1]];
      //let v =[[this.model.vertexList[i*3+0],this.model.vertexList[i*3+1],this.model.vertexList[i*3+2], 0]];
      let res = calc.getMatrixProduct(matFromM4(this.matx),v);
    // let res = calc.getMatrixProduct(this.nmx,v);
      ot.push(res[0][0]);
      ot.push(res[1][0]);
      ot.push(res[2][0]);
    }
    return ot;
  }

  reactLine(sv, nv){
    return solveList(this.getTransformed(), sv, nv);
  }
}
function matFromM4(m){
  let res = [];
  for (let i=0; i<4; i++){
    //res.push([m[i*4+0],m[i*4+1],m[i*4+2],m[i*4+3]]);
    res.push([m[0*4+i],m[1*4+i],m[2*4+i],m[3*4+i]]);
  }
  return res;
}

function solveList(vertexList, sv, nv){
  let res =[];
  let dvmin;
  let dvminl=99999;
  for (let i=0; i<vertexList.length; i+=9){
    let v=[];
    for (let j=0; j<3; j+=1){
      v[j] = new Vector3d(vertexList[i+j*3+0], vertexList[i+j*3+1], vertexList[i+j*3+2]);
    }
   
    let dv = calc.lineCrossTriangle(sv, nv.mul(1).addVector(sv), v[0], v[1], v[2]); 
    if (dv && dvminl>dv.subVector(sv).abs()){
      dvmin = dv;
      dvminl = dv.subVector(sv).abs();
    }
  }
  return dvmin;
}

module.exports = Mov;