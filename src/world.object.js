const AABB = require('./aabb.object.js');
const Vector3d = require('./vector3d.object.js');

class World{
  constructor(gl, map){
    this.map = map;
    this.modelList = makeWorldFromMap(gl, map);
    this.gl = gl;
  }
  
  render(gl, positionAttributeLocation, colorLocation){
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.modelList.forEach(it=>{
      it.render(this.gl, positionAttributeLocation, colorLocation);
    });
  }

  react(vector3d){
    let v = vector3d;
    return intersect(this.modelList, v.x, v.y, v.z);
  }
}

let intersect = (modelList, px, py, pz) => {
  let inb = false;
  modelList.forEach((it, i)=>{
     if (it.inside(new Vector3d(px, py, pz))){
      inb = {stat:true, index:i};
     }  
  });
  return inb;
}

function makeWorldFromMap(gl, mapa){
  let modelList=[];
  for (let i = 0; i<mapa.length; i++){
    for (let j = 0; j<mapa[0].length; j++){
      let h = 0 ;
      let h1 = -20
      if (mapa[i][j]=='0'){
        h=0;
        h1=-20
      }
      if (mapa[i][j]=='w'){
        h=10;
        h1=-20;
      }
      if (mapa[i][j]=='b'){
        h=2;
        h1=-20
      }
      if (mapa[i][j]=='x'){
        h=5;
        h1=-20
      }
      if (mapa[i][j]=='h'){
        h=10;
        h1=7;
        let ob = new AABB(gl, new Vector3d(i*5, j*5, -20), new Vector3d((i+1)*5, (j+1)*5, 0), 
          {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
        );
        modelList.push(ob);
      }
      let ob = new AABB(gl, new Vector3d(i*5, j*5, h1), new Vector3d((i+1)*5, (j+1)*5, h), 
        {r:Math.random()*100+100, g:Math.random()*100+100, b:Math.random()*100+100, a:255}
      );
      modelList.push(ob);
    }  
  }
  return modelList;
}

module.exports = World;