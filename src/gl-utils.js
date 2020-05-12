function createShader(gl, type, source) {
  var shader = gl.createShader(type);   // создание шейдера
  gl.shaderSource(shader, source);      // устанавливаем шейдеру его программный код
  gl.compileShader(shader);             // компилируем шейдер
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {                        // если компиляция прошла успешно - возвращаем шейдер
    return shader;
  }
 
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

module.exports = {
  createShader,
  createProgram
};