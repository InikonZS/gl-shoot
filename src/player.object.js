const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');

class Player{
  constructor(){
    //this.gl = gl; 
  }
  getPosVector(){
    return new Vector3d(-this.posX, -this.posY, - this.posZ);
  }
  spawn(){
    this.camRX=0;
    this.camRY=0;
    this.posX=-2;
    this.posY=-2;
    this.posZ = -3;
    this.forward = false;
    this.tryJump = false;  
    this.onFloor = false;
    this.alive = true;

    this.gravSpeed = -15;
    this.moveSpeed = 15;
  }

  rotateCam(dx, dy){
    this.camRX += dx / 100;
    this.camRY += dy / 100;
    if (this.camRY>0){ this.camRY=0 }
    if (this.camRY<-Math.PI){ this.camRY=-Math.PI}
  }

  render(){

  }

  moveForward(){

  }

  procMoves(world, deltaTime){
    this.gravSpeed>-15? this.gravSpeed -= 0.3 : -15;

    let nz = this.posZ - (this.gravSpeed * deltaTime);
      if (world.react(new Vector3d(-this.posX, -this.posY, -nz-2))){  //(inBoxA(-this.posX, -this.posY, -nz-2)){
        this.onFloor = true;
      } else {
        this.posZ = nz;
        this.onFloor = false;
      }

      if (world.react(new Vector3d(-this.posX, -this.posY, -nz-2+3))){ 
        this.gravSpeed = -15;
      }

      if (this.tryJump){
        if (this.onFloor){
          this.gravSpeed = 15;
          this.onFloor = false;
          
        }
        this.tryJump =false;
      }

      if (this.forward){
        let ny = this.posY - (this.moveSpeed * deltaTime)* Math.cos(this.camRX);
        let nx = this.posX - (this.moveSpeed * deltaTime)* Math.sin(this.camRX);
        

        if (!world.react(new Vector3d(-nx, -ny, -this.posZ-2))){//(!inBoxA(-nx, -ny, -this.posZ-2)){
          this.posY = ny;
          this.posX = nx;
        } else {
          if (!world.react(new Vector3d(-this.posX, -ny, -this.posZ-2))){// (!inBoxA(-this.posX, -ny, -this.posZ-2)){
            this.posY = ny;
          } else {
            if (!world.react(new Vector3d(-nx, -this.posY, -this.posZ-2))){///(!inBoxA(-nx, -this.posY, -this.posZ-2)){
              this.posX = nx;
            } else {
              
            }    
          }  
        }

      }
  }
}

module.exports = Player;