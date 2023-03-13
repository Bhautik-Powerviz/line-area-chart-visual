/*
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
import { DisplayUnits, ILegendPosition, SemanticNegativeNumberFormats, SemanticPositiveNumberFormats } from "./enum";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
  public license = new License();
  public chartConfig = new ChartConfig();
  public dataColorsConfig = new DataColorsConfig();
  public numberSettings = new NumberSettings();
  public dataLabelsConfig = new DataLabelsConfig();
  public gridLinesConfig = new GridLinesConfig();
  public rankingConfig = new RankingConfig();
  public sortingConfig = new SortingConfig();
  public legend = new Legend();
  public patternConfig = new PatternConfig();
  public xAxisConfig = new XAxisConfig();
  public yAxisConfig = new YAxisConfig();
  public referenceLinesConfig = new ReferenceLinesConfig();
  public barChartRaceConfig = new BarChartRaceConfig();
  public errorBarsConfig = new ErrorBarsConfig();
  public editor = new Editor();
  public visualSetting = new VisualSetting();
  public seriesLabelConfig = new SeriesLabelConfig();
  public smallMultiplesConfig = new SmallMultiplesConfig();
  public dynamicDeviationConfig = new DynamicDeviationConfig();
  public cutAndClipAxisConfig = new CutAndClipAxisConfig();
}

export class License {
  public purchased: string = "";
  public customer: string = "";
  public key: string = "";
}

export class ChartConfig {
  public chartSettings: string = "{}";
}

export class DataColorsConfig {
  public dataColorsSettings: string = "{}";
}

export class DataLabelsConfig {
  public dataLabelsSettings: string = "{}";
}

export class GridLinesConfig {
  public gridLinesSettings: string = "{}";
}

export class RankingConfig {
  public rankingSettings: string = "{}";
}

export class SortingConfig {
  public sortingSettings: string = "{}";
}

export class SeriesLabelConfig {
  public seriesLabelSettings: string = "{}";
}

export class SmallMultiplesConfig {
  public smallMultiplesSettings: string = "{}";
}

export class DynamicDeviationConfig {
  public dynamicDeviationSettings: string = "{}";
}

export class CutAndClipAxisConfig {
  public cutAndClipAxisSettings: string = "{}";
}

export class PatternConfig {
  public patternSettings: string = "{}";
}

export class XAxisConfig {
  public xAxisSettings: string = "{}";
}

export class YAxisConfig {
  public yAxisSettings: string = "{}";
}

export class ReferenceLinesConfig {
  public referenceLinesSettings: string = "{}";
}

export class BarChartRaceConfig {
  public barChartRaceSettings: string = "{}";
}

export class ErrorBarsConfig {
  public errorBarsSettings: string = "{}";
}

export class NumberSettings {
  public show: boolean = true;
  public decimalSeparator: string = ".";
  public thousandsSeparator: string = ",";
  public decimalPlaces: number = 0;
  public displayUnits: DisplayUnits = DisplayUnits.Auto;
  public prefix: string = "";
  public suffix: string = "";
  public thousands: string = "K";
  public million: string = "M";
  public billion: string = "B";
  public trillion: string = "T";
  public isSemanticFormattingEnabled: boolean = false;
  public negativeNumberColor: string = "#d0021b";
  public negativeNumberFormat: SemanticNegativeNumberFormats = SemanticNegativeNumberFormats.MinusX;
  public positiveNumberColor: string = "#17b169";
  public positiveNumberFormat: SemanticPositiveNumberFormats = SemanticPositiveNumberFormats.X;
}

export class Legend {
  public show: boolean = true;
  public legendPosition: string = "TopLeft";
  public showTitle: boolean = true;
  public legendTitle: string = "";
  public legendColor: string = "#000";
  public fontSize: string = "8";
  public fontFamily: string = "Segoe UI";
}

export class Editor {
  public conditionalFormatting: string = "";
  public annotations: string = "[]";
}

export class VisualSetting {
  public advancedSettings: boolean = true;
  public lasso: boolean = true;
  public reverseLasso: boolean = true;
  public tableView: boolean = true;
}
