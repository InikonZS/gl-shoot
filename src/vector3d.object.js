class Vector3d{
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  sub(x, y, z, self){
    if (self){
      this.x -= x;  
      this.y -= y; 
      this.z -= z; 
      return this;
    }
    return new Vector3d(this.x-x, this.y-y, this.z-z);
  }

  subVector(v, self){
    if (self){
      this.x -= v.x;  
      this.y -= v.y; 
      this.z -= v.z; 
      return this;
    }
    return new Vector3d(this.x-v.x, this.y-v.y, this.z-v.z);  
  }

  add(x, y, z, self){
    if (self){
      this.x += x;  
      this.y += y; 
      this.z += z; 
      return this;
    }
    return new Vector3d(this.x+x, this.y+y, this.z+z);
  }

  addVector(v, self){
    if (self){
      this.x += v.x;  
      this.y += v.y; 
      this.z += v.z; 
      return this;
    }
    return new Vector3d(this.x+v.x, this.y+v.y, this.z+v.z); 
  }

  mul(c, self){
    if (self){
      this.x *= c;  
      this.y *= c; 
      this.z *= c; 
      return this;
    }
    return new Vector3d(this.x*c, this.y*c, this.z*c);
  }

  isPositive(){
    return (this.x>0)&&(this.y>0)&&(this.z>0);
  }

  abs(){
    return Math.hypot(this.x, this.y, this.z);
  }
}

module.exports = Vector3d;