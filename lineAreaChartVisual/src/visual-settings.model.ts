import {
  EBarComparisonMode,
  BarDistanceType,
  BarType,
  DataLabelsFontSizeType,
  DataLabelsPlacement,
  DataLabelsType,
  DisplayUnits,
  EBeforeAfterPosition,
  ELCRPosition,
  EReferenceLinesType,
  EStartEndPosition,
  EXYAxisNames,
  FontStyle,
  ILegendPosition,
  LineType,
  Orientation,
  Position,
  RankingFilterType,
  TooltipType,
  ESortOrder,
  ESortBy,
  ESortFor,
  EAutoCustomType,
  ERelationshipToMeasure,
  EErrorBarsTooltipLabelFormat,
  AxisCategoryType,
  SemanticNegativeNumberFormats,
  SemanticPositiveNumberFormats,
  EDynamicDeviationDisplayTypes,
  EDynamicDeviationLabelDisplayTypes,
  EDynamicDeviationConnectingLineTypes,
  EReferenceLineComputation,
  EBarHighlightType,
  EDataLabelsDisplayStyleType,
  ESmallMultiplesLayoutType,
  ESmallMultiplesDisplayType,
  ESmallMultiplesViewType,
  ESmallMultiplesAxisType,
  ESmallMultiplesXAxisPosition,
  ESmallMultiplesYAxisPosition,
  ESmallMultiplesHeaderDisplayType,
  ESmallMultiplesHeaderPosition,
  ESmallMultiplesHeaderAlignment,
  ESmallMultiplesBackgroundType,
  ESmallMultiplesShadowType,
} from "./enum";

import powerbi from "powerbi-visuals-api";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export interface IChartSettings {
  barDistanceType: BarDistanceType;
  groupedBarDistanceType: BarDistanceType;
  barDistance: number;
  groupedBarDistance: number;
  orientation: Orientation;
  barType: BarType;
  maxSubcategoriesLength: number;
  prevBarType: BarType;
  barXPadding: number;
  barYPadding: number;
  isPercentageStackedBar: boolean;
  isHadSubcategories: boolean;
  isShowBarBorder: boolean;
  barBorderColor: string;
  barBorderWidth: number;
  barComparisonMode: EBarComparisonMode;
  isIBCSThemeEnabled: boolean;
  barHighlightType: EBarHighlightType;
  isShowDataLabelForHighlightedBars: boolean;
  highlightedBarRecentColor: string;
  highlightedBarMinColor: string;
  highlightedBarMaxColor: string;
}

export interface IXAxisSettings {
  position: Position;
  isDisplayTitle: boolean;
  titleName: string;
  titleColor: string;
  titleFontSize: number;
  titleFontFamily: string;
  isDisplayLabel: boolean;
  labelColor: string;
  labelFontFamily: string;
  labelFontSize: number;
  labelTilt: number;
  labelCharLimit: number;
  isLabelAutoTilt: boolean;
  isLabelAutoCharLimit: boolean;
  isDisplayImage: boolean;
  isImageWithinAxis: boolean;
  isImageWithinBar: boolean;
  imageWithinBarPosition: Position;
  isShowImageBorder: boolean;
  imageStyle: {
    borderWidth: number;
    borderColor: string;
  };
  minimumRange: number;
  maximumRange: number;
  isLogarithmScale: boolean;
  categoryType: AxisCategoryType;
}

export interface IYAxisSettings {
  position: Position;
  isDisplayTitle: boolean;
  titleName: string;
  titleColor: string;
  titleFontSize: number;
  titleFontFamily: string;
  isDisplayLabel: boolean;
  labelColor: string;
  labelFontFamily: string;
  labelFontSize: number;
  labelCharLimit: number;
  isDisplayImage: boolean;
  isImageWithinAxis: boolean;
  isImageWithinBar: boolean;
  imageWithinBarPosition: Position;
  isShowImageBorder: boolean;
  imageStyle: {
    borderWidth: number;
    borderColor: string;
  };
  minimumRange: number;
  maximumRange: number;
  isLogarithmScale: boolean;
  categoryType: AxisCategoryType;
}

export interface INumberSettings {
  show: boolean;
  decimalSeparator: string;
  thousandsSeparator: string;
  decimalPlaces: number;
  displayUnits: DisplayUnits;
  prefix: string;
  suffix: string;
  thousands: string;
  million: string;
  billion: string;
  trillion: string;
  isSemanticFormattingEnabled: boolean;
  negativeNumberColor: string;
  negativeNumberFormat: SemanticNegativeNumberFormats;
  positiveNumberColor: string;
  positiveNumberFormat: SemanticPositiveNumberFormats;
}

export interface IDataColorsSettings {
  fillmin: string;
  midcolor: boolean;
  fillmid: string;
  fillmax: string;
  fillnull: string;
  fillType: string;
  numberOfClasses: number;
  byCategoryColors: string[];
  schemeColors: string[];
  reverse: boolean;
  isGradient: boolean;
  singleColor: string;
  barColor?: string;
  defaultColor?: string;
  selectedCategoryName?: string;
  selectedCategoryColor?: string;
  colorBlindSafe: boolean;
  isGradientWithinBar: boolean;
  subCategoriesColorMap: { [key: string]: string };
  colorScheme?: string;
}

export interface IDataLabelsSettings {
  showDataLabels: boolean;
  showTotalLabels: boolean;
  showLabelsBelowReferenceLine: boolean;
  dataLabelsType: DataLabelsType;
  dataLabels: IDataLabelsProps;
  totalLabels: IDataLabelsProps;
}

export interface IDataLabelsProps {
  color: string;
  orientation: Orientation;
  fontSize: number;
  fontFamily: string;
  showBackground: boolean;
  backgroundColor: string;
  transparency: number;
  fontStyle: FontStyle[];
  fontSizeType: DataLabelsFontSizeType;
  placement?: DataLabelsPlacement;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  displayStyleType: EDataLabelsDisplayStyleType;
}

export interface IReferenceLinesSettings {
  axis: EXYAxisNames;
  type: EReferenceLinesType;
  measureName: string;
  value: string;
  rankOrder: Position | string;
  computation: EReferenceLineComputation;
  rank: string;
  label: string;
  labelFontFamily: string;
  labelColor: string;
  autoFontSize: boolean;
  labelFontSize: string;
  labelPosition: EBeforeAfterPosition;
  labelAlignment: ELCRPosition;
  lineStyle: LineType;
  lineColor: string;
  autoLineWidth: boolean;
  lineWidth: string;
  styling: any[];
  isHighlightBarArea: boolean;
  barAreaPositionToHighlight: Position;
  linePositionOnBar: Position;
  shadeColor: string;
  transparency: number;
}

export interface IOutsideInsideDataLabelsSettings {
  show: boolean;
  color: string;
  orientation: Orientation;
  fontSize: number;
  fontFamily: string;
  showBackground: boolean;
  backgroundColor: string;
  transparency: number;
  fontStyle: FontStyle;
  placement: DataLabelsPlacement;
  fontSizeType: DataLabelsFontSizeType;
}

export interface IXGridLinesSettings {
  show: boolean;
  lineType: string;
  lineWidth: number;
  lineColor: string;
}

export interface IYGridLinesSettings {
  show: boolean;
  lineType: string;
  lineWidth: number;
  lineColor: string;
}

export interface IGridLinesSettings {
  xGridLines: IXGridLinesSettings;
  yGridLines: IYGridLinesSettings;
}

export interface IRankingSettings {
  filterType: RankingFilterType;
  count: number;
  showRemainingAsOthers: boolean;
  isCategoriesRanking: boolean;
  isSubcategoriesRanking: boolean;
  barColor: string;
  subCategoriesRanking: {
    filterType: RankingFilterType;
    count: number;
    showRemainingAsOthers: boolean;
    barColor: string;
  };
}

export interface IAxisSortSettings {
  sortBy: string;
  sortOrder: ESortOrder;
  isMeasure: boolean;
  isMultiMeasure: boolean;
}

export interface ILegendSortSettings {
  sortBy: string;
  sortOrder: ESortOrder;
}

export interface ISortingSettings {
  isCustomSortEnabled: boolean;
  axis: IAxisSortSettings;
  legend: ILegendSortSettings;
  smallMultiples: {
    sortBy: string;
    sortOrder: ESortOrder;
    isMeasure: boolean;
  };
}

export interface ILegendSettings {
  show: boolean;
  legendPosition: string;
  showTitle: boolean;
  legendTitle: string;
  legendColor: string;
  fontSize: string;
  fontFamily: string;
}

export interface ITooltipSettings {
  type: TooltipType;
  labelTextColor: string;
  valueTextColor: string;
  textSize: number;
  fontStyle: FontStyle;
  backgroundColor: string;
  transparency: number;
}

export interface IPatternSettings {
  enable: boolean;
  showBorder: boolean;
  borderWidth: number;
  patterns: IPatternProps[];
  verticalPatterns: IPatternProps[];
  horizontalPatterns: IPatternProps[];
  singlePattern: ISinglePatternProps;
  othersPattern: IPatternProps;
  inheritParentPattern: boolean;
  byCategory: boolean;
  imageBase64Url: string;
  imageData?: any;
}

export interface IPatternProps {
  category: string;
  patternIdentifier: string;
  isImagePattern: boolean;
  dimensions?: { width: number; height: number };
}

export interface ISinglePatternProps {
  category: string;
  patternIdentifier: string;
  isImagePattern: boolean;
  imageSlicesDataUrls?: string[];
  dimensions?: { width: number; height: number };
}

export interface GradientPatternProps {
  isGradientPattern: boolean;
  isHorizontalChart: boolean;
  isMidColor: boolean;
  color: { start: string; mid: string; stop: string };
}

export interface IConditionalFormattingCondition {
  applyTo: string;
  color: string;
  operator: string;
  secondaryStaticValue: number;
  sourceName: string;
  staticValue: string;
}

export interface IRaceBarChartSettings {
  allowTransition: boolean;
  barTransitionDuration: number;
  dataChangeInterval: number;
  labelColor: string;
  labelFontSize: number;
  labelFontSizeType: EAutoCustomType;
  labelFontFamily: string;
  tickerButtonRadius: number;
  tickerButtonRadiusType: EAutoCustomType;
  tickerButtonColor: string;
}

export interface IErrorBarsSettings {
  isEnabled: boolean;
  relationshipToMeasure: ERelationshipToMeasure;
  lineColor: string;
  lineWidth: number;
  areaColor: string;
  areaTransparency: number;
  isShowErrorArea: boolean;
  isShowTooltip: boolean;
  isShowMarkers: boolean;
  isShowDashLine: boolean;
  tooltipLabelFormat: EErrorBarsTooltipLabelFormat;
  SHOW_IN_LEFT_MENU: boolean;
  markers: {
    shape: string;
    size: number;
    isMatchSeriesColor: boolean;
    color: string;
    transparency: number;
  };
}

export interface IErrorBarsMarker {
  shape: string;
  path: string;
  vw: number;
  vh: number;
}

export interface ILabelValuePair {
  label: string;
  value: string;
}

export interface ILabelColorPair {
  label: string;
  color: string;
}

export interface ISeriesLabelSettings {
  isSeriesLabelEnabled: boolean;
  seriesPosition: Position;
  fontColor: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: FontStyle;
  maximumWidth: number;
  isWordWrapEnabled: boolean;
  showBackground: boolean;
  backgroundColor: string;
  transparency: number;
}

export interface ISmallMultiplesSettings {
  isSmallMultiplesEnabled: boolean;
  layoutType: ESmallMultiplesLayoutType,
  displayType: ESmallMultiplesDisplayType,
  viewType: ESmallMultiplesViewType,
  rows: number;
  columns: number;
  xAxisType: ESmallMultiplesAxisType;
  yAxisType: ESmallMultiplesAxisType;
  xAxisPosition: ESmallMultiplesXAxisPosition;
  yAxisPosition: ESmallMultiplesYAxisPosition;
  innerSpacing: number;
  outerSpacing: number;
  header: {
    displayType: ESmallMultiplesHeaderDisplayType,
    fontFamily: string,
    fontSize: number
    fontColor: string,
    fontStyle: FontStyle,
    alignment: ESmallMultiplesHeaderAlignment,
    position: ESmallMultiplesHeaderPosition,
    isTextWrapEnabled: boolean
  },
  background: {
    type: ESmallMultiplesBackgroundType,
    panelColor: string;
    alternateColor: string;
    transparency: number;
  };
  border: {
    isShowBorder: boolean;
    style: LineType;
    width: number;
    radius: number;
    color: string;
  };
  shadow: {
    type: ESmallMultiplesShadowType;
    verticalOffset: number;
    horizontalOffset: number;
    blur: number;
    spread: number;
    color: string;
    inset: boolean;
  }
}

export interface IDynamicDeviationSettings {
  isEnabled: boolean;
  displayType: EDynamicDeviationDisplayTypes;
  lastDisplayType: EDynamicDeviationDisplayTypes;
  fromIndex: number;
  toIndex: number;
  position: Position;
  labelDisplayType: EDynamicDeviationLabelDisplayTypes;
  labelFontSize: number;
  labelFontColor: string;
  labelFontFamily: string;
  isShowLabelBorder: boolean;
  borderWidth: number;
  borderColor: string;
  isShowLabelBackground: boolean;
  backgroundColor: string;
  backgroundColorTransparency: number;
  connectorType: EDynamicDeviationConnectingLineTypes;
  connectorColor: string;
  connectorWidth: number;
  connectingLineColor: string;
  connectingLineWidth: number;
  isShowStartIndicator: boolean;
  isBarBorderEnabled: boolean;
}

export interface ICategoryValuePair {
  category: string;
  value: number;
}

export interface ICutAndClipAxisSettings {
  isEnabled: boolean;
  breakStart: number;
  breakEnd: number;
  markerStrokeColor: string;
  markerBackgroundColor: string;
}

export interface ISmallMultiplesLayoutProps {
  className: string;
  rowHeight: number;
  items: number;
  cols: number;
  layouts: ILayoutItemProps[],
  width: number,
  measureBeforeMount: boolean,
  compactType: string,
  margin: number[],
  containerPadding: number[],
  onLayoutChange: Function,
  onResize: Function,
  onCellRendered: Function,
  smallMultiplesSettings: ISmallMultiplesSettings
}

export interface ILayoutItemProps {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  isDraggable: boolean;
  isResizable: boolean;
}

export interface IAxisConfig {
  categoricalData: powerbi.DataViewCategorical,
  width: number,
  height: number,
  xAxisG: SVGElement,
  yAxisG: SVGElement,
  xAxisYPos: number,
  yAxisXPos: number,
}

export interface IBrushConfig {
  brushG: SVGElement,
  brushXPos: number;
  brushYPos: number;
  barDistance: number;
  totalBarsCount: number;
  isOnlySetScaleDomainByBrush: boolean;
  scaleWidth: number;
  scaleHeight: number;
  smallMultiplesGridItemContent?: { [category: string]: ISmallMultiplesGridItemContent },
  smallMultiplesGridItemId: string,
  categoricalData: any,
  XAxisG?: SVGElement | null,
  brushNumber?: number
}

export interface ISmallMultiplesGridItemContent {
  svg: SVGElement,
  xAxisG: SVGElement,
  yAxisG: SVGElement,
  normalBarG: SVGElement | null,
  brush: any,
  brushG: Selection<SVGElement> | null,
  xScale: any,
  yScale: any,
  categoricalData: any,
  categoricalDataPairs: any[],
  chartData: any,
  brushNumber?: number
}