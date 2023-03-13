import { BarType } from "./enum";
import { PATTERNS } from "./patterns";
import { IVisualCategoryData, IVisualSubCategoryData } from "./visual-data.model";
import { GradientPatternProps } from "./visual-settings.model";

export const splitRGB = function (rgb) {
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
  if (rgb?.a && (typeof rgb.a === "number" || typeof rgb.a === "string")) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};

export const isValidHexColor = (color: string): boolean => {
  const re = /[0-9A-Fa-f]{6}/g;
  return re.test(color);
};

export const createPatternsDefs = (svgRootElement) => {
  let filterDef = svgRootElement.append("defs");

  PATTERNS.map((pattern, i) => {
    let filterPreview = filterDef
      .append("pattern")
      .attr("id", pattern.patternName + "_PREVIEW")
      .attr("class", "patterns-preview")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", pattern.w)
      .attr("height", pattern.h);

    filterPreview
      .append("path")
      .attr("d", pattern.d)
      .attr("stroke", pattern.stroke ? "#000" : "none")
      .attr("stroke-width", pattern.stroke ? "2" : "0")
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", pattern.fill ? "#000" : "none")
      .attr("transform", pattern.translate ? pattern.translate : "");
  });
};

export const generatePattern = (svgRootElement, pattern, color, isLegend = false) => {
  let defs = svgRootElement.select("defs");
  if (defs.empty()) {
    defs = svgRootElement.append("defs");
  }
  let patternId;
  if (pattern.isImagePattern) {
    patternId = "image-pattern".concat("-", Math.floor(Math.random() * 1000) + Date.now().toString());
    let filter = defs.append("pattern").attr("id", patternId);
    if (isLegend) {
      filter
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .attr("viewBox", "0 0 1 1")
        .attr("preserveAspectRatio", "xMidYMid slice");
    } else {
      filter
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", pattern.dimensions.width)
        .attr("height", pattern.dimensions.height);
    }
    let filterImage = filter.append("image").attr("xlink:href", pattern.patternIdentifier);
    if (isLegend) {
      filterImage.attr("width", 1).attr("height", 1).attr("preserveAspectRatio", "xMidYMid slice");
    } else {
      filterImage.attr("height", pattern.dimensions.height).attr("x", 0).attr("y", 0);
    }
  } else {
    let patternObject = PATTERNS.find(({ patternName }) => patternName == pattern.patternIdentifier);
    patternId = patternObject.patternName.concat("-", Math.floor(Math.random() * 1000) + Date.now().toString());
    let filter = defs
      .append("pattern")
      .attr("id", patternId)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", patternObject.w)
      .attr("height", patternObject.h);
    filter
      .append("path")
      .attr("d", patternObject.d)
      .attr("stroke", patternObject.stroke == true ? color : "none")
      .attr("stroke-width", "2")
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", patternObject.fill == true ? color : "none")
      .attr("transform", patternObject.translate ? patternObject.translate : "");
  }
  return patternId;
};

export const parseConditionalFormatting = (SETTINGS) => {
  try {
    let parsed = JSON.parse(SETTINGS.editor.conditionalFormatting);
    if (!parsed.values || !Array.isArray(parsed.values)) return [];
    const flattened = [];
    parsed.values.forEach((el) => {
      flattened.push(...(el.conditions || []));
    });
    if (!Array.isArray(flattened) || !flattened?.length) {
      return [];
    }
    return flattened;
  } catch (e) {
    // console.log("Error parse conditional formatting", SETTINGS.config.conditionalFormatting);
  }
  return [];
};

function matchRuleShort(str, rule) {
  var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

export const isConditionMatch = (
  node: IVisualCategoryData | IVisualSubCategoryData,
  flattened: any,
  barType: BarType,
  barCategory: string
) => {
  let category;
  let value = node.value;

  const isMatchSourceNameCategory = (sourceName) => {
    return barType === BarType.Normal ? true : category === sourceName;
  };

  try {
    if (!Array.isArray(flattened) || !flattened?.length) return { match: false, color: "" };
    let result = { match: false, color: "" };
    for (let index = 0; index < flattened.length; index++) {
      const el = flattened[index];

      if (barType === BarType.GroupedStacked) {
        category = el.applyTo === "measure" ? node.groupedCategory : barCategory;
      } else if (barType === BarType.Stacked || barType === BarType.Grouped) {
        category = el.applyTo === "measure" ? node.category : barCategory;
      } else {
        category = node.category;
      }

      value = node.value;

      if (el.applyTo === "measure") {
        const v = isNaN(+el.staticValue) ? el.staticValue : +el.staticValue; // NaN condition to handle Categorical data columns in Tooltip fieldwell
        const v2 = el.secondaryStaticValue;
        const color = el.color;
        el.operator = isNaN(+el.staticValue) ? "===" : el.operator;
        switch (el.operator) {
          case "===":
            result = { match: value === v && isMatchSourceNameCategory(el.sourceName), color };
            break;
          case "!==":
            result = { match: value !== v && isMatchSourceNameCategory(el.sourceName), color };
            break;
          case "<":
            result = { match: value < v && isMatchSourceNameCategory(el.sourceName), color };
            break;
          case ">":
            result = { match: value > v && isMatchSourceNameCategory(el.sourceName), color };
            break;
          case "<=":
            result = { match: value <= v && isMatchSourceNameCategory(el.sourceName), color };
            break;
          case ">=":
            result = { match: value >= v && isMatchSourceNameCategory(el.sourceName), color };
            break;
          case "<>":
            result = { match: value >= v && value <= +v2 && isMatchSourceNameCategory(el.sourceName), color };
            break;
        }
        if (result.match) {
          return result;
        }
      } else if (el.applyTo === "category") {
        const v = el.staticValue;
        const color = el.color;
        switch (el.operator) {
          case "===":
            result = { match: matchRuleShort(category.toLowerCase(), v.toLowerCase()), color };
            break;
          case "!==":
            result = { match: !matchRuleShort(category.toLowerCase(), v.toLowerCase()), color };
            break;
        }
        if (result.match) {
          return result;
        }
      }
    }
    return { match: false, color: "" };
  } catch (e) {
    console.log("Error fetching conditional formatting colors", value, flattened);
  }
  return { match: false, color: "" };
};
