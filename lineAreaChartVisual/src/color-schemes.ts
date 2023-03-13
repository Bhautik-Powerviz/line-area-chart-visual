/*
 * This product includes color specifications and designs developed by Cynthia
 * Brewer (http://colorbrewer.org/).
 
 https://groups.google.com/forum/?fromgroups=#!topic/d3-js/iyXFgJR1JY0
 */

export const COLORBREWER = {
  ibcsTheme: {
    "IBCS Colors": { colors: ["#DBDBDB", "#BEBEBE", "#808080", "#6D6D6D", "#505050", "#404040"], colorBlindSafe: true },
  },
  sequential: {
    Blue: { colors: ["#AED8F1", "#86B8E1", "#5E99D0", "#3679C0", "#0E59AF"], colorBlindSafe: true },
    Green: { colors: ["#B7E1B9", "#92CC95", "#6EB871", "#49A34D", "#248E29"], colorBlindSafe: true },
    Red: { colors: ["#FBC2BE", "#E69995", "#D1706C", "#BC4743", "#A71E1A"], colorBlindSafe: true },
    Orange: { colors: ["#FAC796", "#F4AE73", "#ED954F", "#E77C2B", "#E06207"], colorBlindSafe: true },
    Yellow: { colors: ["#F0E69D", "#E7D976", "#DDCC50", "#D4BE29", "#CAB102"], colorBlindSafe: true },
    Brown: { colors: ["#F0C294", "#D6A278", "#BC815B", "#A2613F", "#7B3014"], colorBlindSafe: true },
    Grey: { colors: ["#D3D3D3", "#A3A3A3", "#7C7C7C", "#494949", "#2F2F2F"], colorBlindSafe: true },
    Pink: { colors: ["#FFB3C1", "#F28DA4", "#E46686", "#D73F68", "#C9184A"], colorBlindSafe: true },
    Purple: { colors: ["#e3d0ed", "#c3b0d9", "#a392c6", "#8374b2", "#63589f"], colorBlindSafe: true },
    Magneta: { colors: ["#F3CBD3", "#B0769D", "#8E4C82", "#7D3775", "#6C2167"], colorBlindSafe: true },
    Burgle: { colors: ["#FFC6C4", "#672044"], colorBlindSafe: true },
    Mint: { colors: ["#CCE1CF", "#A2C3B6", "#77A49D", "#4D8684", "#0D585F"], colorBlindSafe: true },
    Teal: { colors: ["#c1dede", "#2A5674"], colorBlindSafe: true },
  },
  diverging: {
    "Blue to Green": {
      colors: ["#26456E", "#1C5998", "#3A87B7", "#67ADD4", "#A2C18F", "#69A761", "#5C9A55", "#3F7C3A"],
      colorBlindSafe: false,
    },
    "Red to Green": {
      colors: ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"],
      colorBlindSafe: false,
    },
    "Red to Blue": { colors: ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"], colorBlindSafe: true },
    "Red to Grey": {
      colors: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#e0e0e0", "#bababa", "#878787", "#4d4d4d"],
      colorBlindSafe: true,
    },
    "Orange to Purple": { colors: ["#e66101", "#F8A44C", "#b2abd2", "#5e3c99"], colorBlindSafe: true },
    "Brown to Green": { colors: ["#A6611A", "#DFC27D", "#80CDC1", "#018571"], colorBlindSafe: true },
    "Pink to Green": { colors: ["#c51b7d", "#de77ae", "#f7f7f7", "#7fbc41", "#4d9221"], colorBlindSafe: true },
    "Purple to Green": { colors: ["#762a83", "#c2a5cf", "#a6dba0", "#008837"], colorBlindSafe: true },
    Fall: {
      colors: ["#3D5941", "#778868", "#B5B991", "#F6EDBD", "#EDBB8A", "#DE8A5A", "#CA562C"],
      colorBlindSafe: true,
    },
    Coral: { colors: ["#E57F84", "#F4EAE6", "#2F5061"], colorBlindSafe: true },
    Geyser: {
      colors: ["#009392", "#39B185", "#9CCB86", "#E9E29C", "#EEB479", "#E88471", "#CF597E"],
      colorBlindSafe: false,
    },
    "Army Rose": { colors: ["#798234", "#A3AD62", "#D0D3A2", "#F0C6C3", "#DF91A3", "#D46780"], colorBlindSafe: true },
    Tropic: { colors: ["#009B9E", "#42B7B9", "#A7D3D4", "#E4C1D9", "#D691C1", "#C75DAB"], colorBlindSafe: false },
    TealRose: {
      colors: ["#009392", "#72aaa1", "#b1c7b3", "#f1eac8", "#e5b9ad", "#d98994", "#d0587e"],
      colorBlindSafe: false,
    },
    Jade: { colors: ["#dec286", "#e9e29c", "#9ccb86", "#39b185", "#009392"], colorBlindSafe: false },
    Hiroshige: {
      colors: [
        "#E76254",
        "#EF8A47",
        "#F7AA58",
        "#FFD06F",
        "#FFE6B7",
        "#AADCE0",
        "#72BCD5",
        "#528FAD",
        "#376795",
        "#1E466E",
      ],
      colorBlindSafe: true,
    },
  },
  qualitative: {
    Dark: {
      colors: ["#1B9E77", "#D95F02", "#7570B3", "#E7298A", "#66A61E", "#E6AB02", "#A6761D", "#666666"],
      colorBlindSafe: false,
    },
    Paired: {
      colors: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00"],
      colorBlindSafe: false,
    },
    Pastel: {
      colors: [
        "#66C5CC",
        "#F6CF71",
        "#F89C74",
        "#DCB0F2",
        "#87C55F",
        "#9EB9F3",
        "#FE88B1",
        "#C9DB74",
        "#8BE0A4",
        "#B497E7",
        "#D3B484",
        "#B3B3B3",
      ],
      colorBlindSafe: false,
    },
    Warm: {
      colors: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"],
      colorBlindSafe: false,
    },
    Mist: {
      colors: ["#66C2A5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"],
      colorBlindSafe: false,
    },
    Cotton: {
      colors: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5"],
      colorBlindSafe: false,
    },
    Antique: {
      colors: [
        "#855C75",
        "#D9AF6B",
        "#AF6458",
        "#736F4C",
        "#526A83",
        "#625377",
        "#68855C",
        "#9C9C5E",
        "#A06177",
        "#8C785D",
        "#467378",
        "#7C7C7C",
      ],
      colorBlindSafe: false,
    },
    Bold: {
      colors: [
        "#7F3C8D",
        "#11A579",
        "#3969AC",
        "#F2B701",
        "#E73F74",
        "#80BA5A",
        "#E68310",
        "#008695",
        "#CF1C90",
        "#F97B72",
        "#4B4B8F",
        "#A5AA99",
      ],
      colorBlindSafe: false,
    },
    Cross: {
      colors: ["#c969a1", "#ce4441", "#ee8577", "#EB7926", "#FFBB44", "#859B6C", "#62929A", "#004F63", "#122451"],
      colorBlindSafe: false,
    },
    "Medium Contrast ": {
      colors: ["#e69f00", "#56b4e9", "#009e73", "#0072b2", "#d55e00", "#cc79a7", "8F5575"],
      colorBlindSafe: true,
    },
    "Tol ": {
      colors: ["#332288", "#117733", "#44AA99", "#88CCEE", "#DDCC77", "#CC6677", "#7D136F", "#69003B"],
      colorBlindSafe: true,
    },
    Prism: {
      colors: [
        "#5F4690",
        "#1D6996",
        "#38A6A5",
        "#0F8554",
        "#73AF48",
        "#EDAD08",
        "#E17C05",
        "#CC503E",
        "#94346E",
        "#6F4070",
        "#994E95",
        "#666666",
      ],
      colorBlindSafe: false,
    },
    Rainbow: {
      colors: [
        "#777EE1",
        "#F1DA33",
        "#F8A42D",
        "#56C05B",
        "#F2554D",
        "#42B2EA",
        "#9C65C4",
        "#FFCA2F",
        "#526476",
        "#33ABA0",
      ],
      colorBlindSafe: false,
    },
    Vibrant: {
      colors: [
        "#1F77B4",
        "#FF7F0E",
        "#2CA02C",
        "#D62728",
        "#9467BD",
        "#8C564B",
        "#E377C2",
        "#7F7F7F",
        "#BCBD22",
        "#17BECF",
      ],
      colorBlindSafe: false,
    },
    Vivid: {
      colors: [
        "#E58606",
        "#5D69B1",
        "#52BCA3",
        "#99C945",
        "#CC61B0",
        "#24796C",
        "#DAA51B",
        "#2F8AC4",
        "#764E9F",
        "#ED645A",
        "#CC3A8E",
        "#A5AA99",
      ],
      colorBlindSafe: false,
    },
    Soft: { colors: ["#E1EBB1", "#acedc7", "#7A3406", "#7CE3F1", "#FFB000", "#ff5230"], colorBlindSafe: true },
    "Wong ": {
      colors: ["#885100", "#56b4e9", "#004d2a", "#f0e442", "#0072b2", "#d55e00", "#cc79a7"],
      colorBlindSafe: false,
    },
  },
};

// black, #e69f00, #56b4e9, #118800,#f0e442, #0072b2, #d55e00 -> black, #e69f00, #56b4e9, #118800,#f0e442, #0072b2
// #332288, #117733, #44aa99, #88ccee, #ddcc77, #cc6677, #cc6677, #882255 -> #332288, #117733, #44aa99, #88ccee, #ddcc77, #cc6677, #cc6677, #882255

//  IBM - #648fff, #785ef0, #dc267f, #fe6100, #ffb000 - true
//  Bright -  #4477AA, #EE6677, #228833, #CCBB44, #66CCEE, #AA3377, #BBBBBB - false
//  Vibrant - #EE7733, #0077BB, #33BBEE, #EE3377, #CC3311, #009988, #BBBBBB - false
//  Muted -  #CC6677, #332288, #DDCC77, #117733, #88CCEE, #882255, #44AA99, #999933, #AA4499, #DDDDDD
//  Medium Contrast - #6699CC, #004488, #EECC66, #994455, #997700, #f0a3b3 - true
//  Pale - #BBCCEE, #CCEEFF, #CCDDAA, #EEEEBB, #FFCCCC, #DDDDDD - false
//  Light -  #77AADD, #EE8866, #EEDD88, #FFAABB, #99DDFF, #44BB99, #BBCC33, #AAAA00, #DDDDDD - false

// Okabe_lto - #e69f00,#56b4e9,#009e73,#f0e442,#0072b2,#d55e00,#cc79a7,#000000 - true
// #ee6677, #283,#47a, #cb4, #6ce, #a37,#bbb
