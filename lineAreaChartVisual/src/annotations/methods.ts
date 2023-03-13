export const splitRGB = function (rgb) {
  // if(typeof rgb === 'object' && rgb !== null){
  //   rgb = "rgb("+rgb.rgb().join()+")";
  // }
  var c = rgb.slice(rgb.indexOf("(") + 1, rgb.indexOf(")")).split(",");
  var flag = false,
    obj;
  c = c.map(function (n, i) {
    return i !== 3 ? parseInt(n, 10) : (flag = true), parseFloat(n);
  });
  obj = {
    r: c[0],
    g: c[1],
    b: c[2],
  };
  if (flag) obj.a = c[3];
  else obj.a = 1;

  return obj;
};

export const adjoinRGB = (rgb) => {
  if (typeof rgb.a === "number" || typeof rgb.a === "string") {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};
