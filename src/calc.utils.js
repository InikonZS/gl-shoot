const Vector3d = require('./vector3d.object.js');

function getNormal(u, v, w){
  let nv = {x: v.x-u.x, y: v.y-u.y, z: v.z-u.z}  
  let nw = {x: w.x-u.x, y: w.y-u.y, z: w.z-u.z}  
  let n = {x: nv.y*nw.z - nv.z*nw.y, y: nv.z * nw.x - nv.x * nw.z, z: nv.x * nw.y - nv.y * nw.x}
  let d = Math.hypot(n.x, n.y, n.z);
  return {x: n.x/d, y: n.y/d, z: n.z/d}
}

function getValueD(v, n){
  let d = -(v.x*n.x + v.y*n.y + v.z*n.z);
  return d;
}

function solveLinear(v1, v2, u, v, w){
  let n = getNormal (u, v, w);
  
  let d = getValueD(u, n);
  let nv = {x: v1.x-v2.x, y: v1.y-v2.y, z: v1.z-v2.z};
  let h = (n.x*v1.x + n.y*v1.y + n.z*v1.z +d) / (-(n.x*nv.x + n.y*nv.y + n.z*nv.z));
  console.log(h, d);
  return {x: v1.x + h*nv.x, y: v1.y + h*nv.y, z: v1.z + h*nv.z}
}

function getMatrixProduct(m1, m2) {
  const res = [];
  //const resl = Math.min(m1.length, m2[0].length);
  resl = m1.length;
  for (let i = 0; i < resl; i += 1) {
    const rw = [];
    for (let j = 0; j < resl; j += 1) {
      let rws = 0;
      for (let k = 0; k < m2.length; k += 1) {
        rws += m1[i][k] * m2[k][j];
      }
      rw.push(rws);
    }
    res.push(rw);
  }
  return res;
}

function vecMul(a, b){
  let vm = (a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);
  return vm;
}

function inTriangle(a, b, c, p){
  let al = a.subVector(b).abs();
  let bl = b.subVector(c).abs();
  let cl = c.subVector(a).abs();
  let ap = a.subVector(p).abs();
  let bp = b.subVector(p).abs();
  let cp = c.subVector(p).abs();
  let pa = (ap+bp+al)/2;
  let pb = (bp+cp+bl)/2;
  let pc = (cp+ap+cl)/2;
  let sa = Math.sqrt(pa*(pa-ap)*(pa-bp)*(pa-al));
  let sb = Math.sqrt(pb*(pb-bp)*(pb-cp)*(pb-bl));
  let sc = Math.sqrt(pc*(pc-cp)*(pc-ap)*(pc-cl));

  let pr = (al+bl+cl)/2;
  let s = Math.sqrt(pr*(pr-al)*(pr-bl)*(pr-cl));

  return (sa+sb+sc)<=(s+0.01);

 /* let m1 = vecMul(a,p);
  let m2 = vecMul(b,p);
  let m3 = vecMul(c,p);
  return (m1>=0 && m2>=0 && m3>=0)||(m1<=0 && m2<=0 && m3<=0);*/
}

function onLine(a, b, p){
  let al = a.subVector(b).abs();
  let ap = a.subVector(p).abs();  
  let bp = b.subVector(p).abs();
  return (ap+bp)<=(al+0.01);
}

module.exports = {
  getMatrixProduct,
  solveLinear,
  getNormal,
  getValueD,
  vecMul,
  inTriangle,
  onLine
}