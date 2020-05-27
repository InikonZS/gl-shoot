const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');
const calc = require('./calc.utils.js');

class Mov{
  constructor(gl, xVector3d, sVector3d, matx){
    this.gl = gl;
    this.matx = matx;
    this.cVector3d = xVector3d.addVector(sVector3d.mul(0.02));
    this.model = new AABB(gl, this.cVector3d.add(-2.5, -2.5, -2.5), this.cVector3d.add(+2.5, +2.5, +2.5),
      {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
    );
    this.speed = sVector3d;
  }

  render(positionAttributeLocation, colorLocation, glm, matx, deltaTime){
    this.matx = matx;
    let gl = this.gl;
    //this.cVector3d = this.cVector3d.addVector(this.speed.mul(deltaTime));

      this.gl.uniformMatrix4fv(glm, false, m4.identity());
      this.model = new AABB(this.gl, this.cVector3d.add(-2.5, -2.5, -2.5), this.cVector3d.add(+2.5, +2.5, +2.5),
      {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
    );
this.model.vertexList = this.getTransformed();
var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertexList), gl.STATIC_DRAW); 
    this.model.glPositionBuffer = positionBuffer;
    this.model.render(this.gl, positionAttributeLocation, colorLocation);

   let wmat = m4.identity();
     this.gl.uniformMatrix4fv(glm, false, wmat);
  }

  getTransformed(){
    let ot =[];
    for (let i=0; i<this.model.vertexList.length/3; i++){
      let v =[[this.model.vertexList[i*3+0]],[this.model.vertexList[i*3+1]],[this.model.vertexList[i*3+2]], [0]];
      //let v =[[this.model.vertexList[i*3+0],this.model.vertexList[i*3+1],this.model.vertexList[i*3+2], 0]];
      let res = calc.getMatrixProduct(matFromM4(this.matx),v);
      ot.push(res[0][0]);
      ot.push(res[1][0]);
      ot.push(res[2][0]);
    }
    return ot;
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
module.exports = Mov;