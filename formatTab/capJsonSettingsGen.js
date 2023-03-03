const fs = require("fs");
//const { visualPath, sectionKVPair, formatTab } = require("./waterfallInput");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let chartPath = "Initial value";

const allCharts = [
  {
    name: "LineAreaChartVisual",
    path: "./lineAreaChartVisualInput.js",
  }
];

const allChartsNames = allCharts.map((chart, index) => `${index + 1}. ${chart.name}`).join("\n");

rl.question(`Pick your chart input type \n${allChartsNames}\n`, function (num) {
  const index = num - 1;
  if (!allCharts[index]) {
    console.log(`Please enter value from 1 to ${allCharts.length}`);
    return;
  }
  chartPath = allCharts[index].path;
  const toGenerateEnumerationTs = false;
  rl.question("Do you want to generate Enumeration.ts for this? (Y/N): ", function (ans) {
    fileGen(chartPath);
    if (ans.toUpperCase() === "Y") {
      generateEnumeration(chartPath);
    }
    rl.close();
  });
});

function fileGen(chartPath) {
  const { visualPath, sectionKVPair, formatTab } = require(chartPath);

  //Below code is to generate capabilities.json file

  let objects = {};

  sectionKVPair.forEach((obj, index) => {
    Object.keys(obj).forEach(key => {
      objects[key] = {};
      objects[key].displayName = sectionKVPair[index][key];
      objects[key].properties = {};

      formatTab[key].forEach(obj => {
        objects[key].properties[obj.technicalName] = {};
        objects[key].properties[obj.technicalName].displayName = obj.displayName;
        objects[key].properties[obj.technicalName].description = obj.description;
        const type = obj.type;
        if (type === "color") {
          objects[key].properties[obj.technicalName].type = {
            fill: {
              solid: {
                color: true,
              },
            },
          };
        } else if (type === "dropdown") {
          objects[key].properties[obj.technicalName].type = {};
          let enumeration = [];
          obj.options.forEach(option => {
            let objVal = {};
            objVal.displayName = option.key;
            objVal.value = option.value;
            enumeration.push(objVal);
            objects[key].properties[obj.technicalName].type.enumeration = enumeration;
          });
        } else if (type === "font") {
          objects[key].properties[obj.technicalName].type = {
            formatting: {
              fontFamily: true,
            },
          };
        } else if (type === "fontSize") {
          objects[key].properties[obj.technicalName].type = {
            formatting: {
              fontSize: true,
            },
          };
        } else if (type === "alignment") {
          objects[key].properties[obj.technicalName].type = {
            formatting: {
              alignment: true,
            },
          };
        } else if (type === "labelDisplayUnits") {
          objects[key].properties[obj.technicalName].type = {
            formatting: {
              labelDisplayUnits: true,
            },
          };
        } else {
          objects[key].properties[obj.technicalName].type = {
            [obj.type]: true,
          };
        }
      });
    });
  });

  let capabilities = {};

  fs.readFile(`${visualPath}/capabilities.json`, "utf-8", function (err, data) {
    capabilities = JSON.parse(data);
    capabilities.objects = objects;
    const jsonData = JSON.stringify(capabilities);

    fs.writeFile(`${visualPath}/capabilities.json`, jsonData, function (err, data) {
      if (err) {
        return console.log(err);
      } else {
        return console.log("Capability JSON file has been edited successfully");
      }
    });
  });

  //Below code is to generate settings.ts file

  let objectCreationLines = "";
  let classCreationLines = "";

  function getClassNameFromObj(obj) {
    const firstLetter = obj.slice(0, 1).toUpperCase();
    const className = firstLetter + obj.slice(1);
    return className;
  }

  function createObject(obj) {
    return `public ${obj} = new ${getClassNameFromObj(obj)}();`;
  }

  function getClassPropertyDeclarations(arr) {
    let declarations = "";

    arr.forEach(content => {
      const type = {
        bool: "boolean",
        numeric: "number",
        integer: "number",
        text: "string",
        color: "string",
        dropdown: "string",
        font: "string",
        fontSize: "string",
        alignment: "string",
        labelDisplayUnits: "string",
      };
      const value = type[content.type] === "string" ? `"${content.defaultValue}"` : content.defaultValue;
      declarations += `public ${content.technicalName}: ${type[content.type]} = ${value};`;
    });

    return declarations;
  }

  function createClass(obj, obj2) {
    return `export class ${getClassNameFromObj(obj2)} {
        ${getClassPropertyDeclarations(obj[obj2])}
  }\n`;
  }

  sectionKVPair.forEach((obj, index) => {
    Object.keys(obj).forEach(key => {
      objectCreationLines += "   " + createObject(key) + "\n";
      classCreationLines += createClass(formatTab, key);
    });
  });

  const settingsTSData = `/*
*  Power BI Visualizations
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
 ${objectCreationLines}
}

${classCreationLines}
`;

  fs.writeFile(`${visualPath}/src/settings.ts`, settingsTSData, function (err, data) {
    if (err) {
      return console.log(err);
    } else {
      return console.log("Settings.ts file has been created successfully");
    }
  });
}

function generateEnumeration(chartPath) {
  const { visualPath, sectionKVPair, formatTab } = require(chartPath);

  let allFunctions = ``;
  let allCalledFunctions = [];

  sectionKVPair.forEach((obj, index) => {
    const key = Object.keys(obj)[0];
    const fn = `get${key.charAt(0).toUpperCase() + key.slice(1)}Selection`;

    allCalledFunctions.push(`       ${fn}(),`);

    const allPropertiesIterated = formatTab[key].map(
      el => `      {
        name: '${el.technicalName}',
        isShow: true
      },`,
    );

    allFunctions += `
function ${fn}(): EnumerateSectionType {
  return {
    name: '${key}',
    isShow: true,
    properties: [
${allPropertiesIterated.join("\n")}
    ]
  }
}
`;
  });

  let template = `import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { VisualSettings } from "./settings";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";

export class Enumeration {
  public static GET(): EnumerateSectionType[] {
    return [
${allCalledFunctions.join("\n")}
    ];
  }
}

${allFunctions}
`;

  fs.writeFile(`${visualPath}/src/Enumeration.ts`, template, function (err, data) {
    if (err) {
      return console.log(err);
    } else {
      return console.log("Enumeration.ts is created successfully.");
    }
  });
}
