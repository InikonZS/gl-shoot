const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');

class Bullet{
  constructor(gl, xVector3d, sVector3d){
    this.gl = gl;
    this.cVector3d = xVector3d.addVector(sVector3d.mul(0.02));
    this.model = new AABB(gl, this.cVector3d.add(-0.5, -0.5, -0.5), this.cVector3d.add(+0.5, +0.5, +0.5),
      {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
    );
    this.speed = sVector3d;
  }

  render(positionAttributeLocation, colorLocation, deltaTime){
    this.cVector3d = this.cVector3d.addVector(this.speed.mul(deltaTime));
    this.model = new AABB(this.gl, this.cVector3d.add(-0.5, -0.5, -0.5), this.cVector3d.add(+0.5, +0.5, +0.5),
      {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
    );
    this.model.render(this.gl, positionAttributeLocation, colorLocation);
  }
}

module.exports = Bullet;