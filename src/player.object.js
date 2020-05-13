class Player{
  constructor(world){
    //this.world = world;  
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

    this.moveSpeed = 5;
  }

  rotateCam(dx, dy){
    this.camRX += dx / 100;
    this.camRY += dy / 100;
    if (this.camRY>0){ this.camRY=0 }
    if (this.camRY<-Math.PI){ this.camRY=-Math.PI}
  }

  moveForward(){

  }
}