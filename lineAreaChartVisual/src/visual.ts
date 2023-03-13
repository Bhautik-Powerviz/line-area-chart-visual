"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IDataViewCategoricalColumn = powerbi.DataViewCategorical;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;
import {
  ILegendsDataPoint,
  IReferenceLinesData,
  IVisualCategoryData,
  IVisualSubCategoryData,
  IVisualTooltipData,
} from "./visual-data.model";
import {
  BarType,
  ColorPaletteType,
  DataLabelsPlacement,
  DataRolesName,
  EVisualConfig,
  EVisualSettings,
  FontStyle,
  ILegendPosition,
  Orientation,
  PatternType,
  Position,
  RankingFilterType,
  ESortOrder,
  ESortBy,
  DataLabelsType,
  ERelationshipToMeasure,
  EErrorBarsTooltipLabelFormat,
  LassoSelectionMode,
  AxisCategoryType,
  DataLabelsFontSizeType,
  EDynamicDeviationDisplayTypes,
  EBarHighlightType,
  EDataLabelsDisplayStyleType,
  ESmallMultiplesAxisType,
  ESmallMultiplesViewType,
  ESortingSettings
} from "./enum";
import {
  IGridLinesSettings,
  INumberSettings,
  IXAxisSettings,
  IYAxisSettings,
  IXGridLinesSettings,
  IYGridLinesSettings,
  IChartSettings,
  IDataLabelsSettings,
  IDataColorsSettings,
  IRankingSettings,
  ILegendSettings,
  IPatternSettings,
  IPatternProps,
  GradientPatternProps,
  IReferenceLinesSettings,
  IConditionalFormattingCondition,
  ISortingSettings,
  IDataLabelsProps,
  IRaceBarChartSettings,
  IErrorBarsSettings,
  ISeriesLabelSettings,
  IDynamicDeviationSettings,
  ICategoryValuePair,
  ICutAndClipAxisSettings,
  ISmallMultiplesSettings,
  IAxisConfig,
  IBrushConfig,
  ISmallMultiplesGridItemContent,
  IAxisSortSettings,
  ILegendSortSettings,
} from "./visual-settings.model";
import {
  BAR_CHART_RACE_SETTINGS,
  CHART_SETTINGS,
  CUT_AND_CLIP_AXIS_SETTINGS,
  DATA_COLORS,
  DATA_LABELS_SETTINGS,
  DYNAMIC_DEVIATION_SETTINGS,
  ERROR_BARS_SETTINGS,
  GRID_LINES_SETTINGS,
  PATTERN_SETTINGS,
  RANKING_SETTINGS,
  SERIES_LABEL_SETTINGS,
  SORTING_SETTINGS,
  X_AXIS_SETTINGS,
  Y_AXIS_SETTINGS,
} from "./constants";
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import { Shadow } from "@truviz/shadow/dist/Shadow";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";
import { Enumeration } from "./Enumeration";
import { paidProperties } from "./PaidProperties";
import { VisualSettings } from "./settings";
import ChartSettings from "./settings-pages/ChartSettings";
import DataColorsSettings from "./settings-pages/DataColorsSettings";
import DataLabelsSettings from "./settings-pages/DataLabelsSettings";
import GridLinesSettings from "./settings-pages/GridLinesSettings";
import RankingSettings from "./settings-pages/RankingSettings";
import SortingSettings from "./settings-pages/SortingSettings";
import PatternSettings from "./settings-pages/PatternSettings";
import XAxisSettings from "./settings-pages/XAxisSettings";
import YAxisSettings from "./settings-pages/YAxisSettings";
import ReferenceLinesComponent from "./settings-pages/ReferenceLines";
import BarChartRaceSettings from "./settings-pages/BarChartRaceSettings";
import ErrorBarsSettings from "./settings-pages/ErrorBarsSettings";
import SeriesLabelSettings from "./settings-pages/SeriesLabelSettings";
import DynamicDeviationSettings from "./settings-pages/DynamicDeviationSettings";
import CutAndClipAxisSettings from "./settings-pages/CutAndClipAxisSettings";
import SmallMultiplesSettings from "./settings-pages/SmallMultiplesSettings";
import { Components } from "@truviz/shadow/dist/types/EditorTypes";
import { createPatternsDefs, generatePattern, isConditionMatch, parseConditionalFormatting } from "./methods";
import { clearLegends } from "./legendHelper";
import { GetXScale } from './methods/XAxis.methods';
import { HighlightActiveBar, RenderNormalBars } from './methods/NormalBar.methods';
import { RenderStackedBars } from './methods/StackedBar.methods';
import { RenderGroupedBars } from './methods/GroupedBars.methods';
import { RenderDataLabels, RenderOutsideDataLabels } from './methods/DataLabels.methods';
import { RenderStackedBarsInsideDataLabels } from './methods/StackedBarDataLabels.methods';
import { RenderBorderBar } from './methods/BorderBar.methods';
import { GetIsCutAndClipAxisEnabled, RenderCutAndClipMarkerOnAxis } from './methods/CutAndClipMarker.methods';
import { RenderErrorBarsLine } from './methods/ErrorBars.methods';
import { RemoveDynamicDeviation, RenderDynamicDeviation, RenderDynamicDeviationIcon, SetDynamicDeviationDataAndDrawLines } from './methods/DynamicDeviation.methods';
import { CreateSmallMultiples, SetSmallMultiplesSettings } from './methods/SmallMultiples.methods';
import { DrawHorizontalBrush, DrawVerticalBrush, RenderBrush } from './methods/Brush.methods';
import { HideDataLabelsBelowReferenceLines, RenderReferenceLines, SetReferenceLinesData } from './methods/ReferenceLines.methods';
import { RenderLabelImageOnStackedBar } from './methods/BarImageLabels.methods';
import { Behavior, BehaviorOptions } from './methods/Behaviour.methods';
import { RenderRaceBarDataLabel, RenderRaceBarTickerButton, UpdateTickerButton } from './methods/RaceBar.methods';
import { RenderLegends, SetLegendsData } from './methods/Legend.methods';
import { RenderTooltip, RenderTooltipByChartType } from './methods/Tooltip.methods';
import { RenderStackedBarClip } from './methods/StackedBarClip.methods';
import { RenderGroupedStackedBarsAxisLabel } from './methods/GroupedStackedBarsAxisLabel.methods';
import { ApplyIBCSTheme, ApplyPreviousSettingsAfterIBCSApplied } from './methods/IBCS.methods';

// Interactivity
import { interactivitySelectionService, interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { GetYScale } from "./methods/YAxis.methods";
import { RenderXYAxis, RenderXYAxisTitle } from "./methods/Axis.methods";
import { RenderLinearCutAxis } from "./methods/CutAndClip.methods";
import { RenderBarCutAndClipMarker } from "./methods/CutAndClipMarker.methods";
import { RenderSeriesLabels } from "./methods/SeriesLabels.methods";
import { InitiateRectangularLasso, RenderLassoButton, RenderReverseLassoButton, ShowAndHideLassoIcon } from "./methods/Lasso.methods";
import { GetFormattedNumber } from "./methods/NumberFormat.methods";
import { SetNormalBarColors, SetRemainingAsOthersDataColor, SetStackedGroupedBarColors, SetSubCategoriesColor } from "./methods/DataColors.methods";
import VisualAnnotations from "./annotations/VisualAnnotations";

export class Visual extends Shadow {
  public chartContainer: HTMLElement;
  public hostContainer: HTMLElement;
  public visualUpdateOptions: ShadowUpdateOptions;
  public tooltipServiceWrapper: ITooltipServiceWrapper;
  public colorPalette: IColorPalette;
  public visualHost: IVisualHost;
  public interactivityService: interactivityBaseService.IInteractivityService<IVisualCategoryData>;
  public behavior: Behavior;
  private selectionManager: ISelectionManager;
  public tooltipService: ITooltipServiceWrapper;

  // props
  width: number;
  height: number;
  settingsBtnWidth: number = 152;
  settingsBtnHeight: number = 0;
  minScaleBandWidth: number = 25;
  viewPortWidth: number;
  viewPortHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartData: IVisualCategoryData[];
  clonedChartData: IVisualCategoryData[];
  othersBarData: IVisualCategoryData[];
  stackedBarChartData: any[] = [];
  groupedBarChartData: any[] = [];
  isChartInit: boolean = false;
  isInFocusMode: boolean = false;
  isHorizontalChart: boolean = false;
  isLastChartTypeIsHorizontal: boolean = false;
  axisTitleMargin: number;
  isRankingSettingsChanged: boolean = false;
  categoriesName: string[] = [];
  subCategoriesName: string[] = [];
  othersBarText = "Others";
  isNoDataColors: boolean;
  groupedBarScaleBandWidth: number;
  isHasImagesData: boolean;
  isMultiMeasureValues: boolean;
  isPercentageStackedBar: boolean;
  conditionalFormattingConditions: IConditionalFormattingCondition[] = [];
  annotationBarClass: string = "annotation-bar";
  barElementIdPrefix: string = "bar";
  isShowSeriesLabel: boolean = false;
  isIBCSThemeAlreadyApplied: boolean = false;
  categoricalDisplayNamesId: string;
  minScaleRangeFromSettings: number = 0;
  maxScaleRangeFromSettings: number = 0;

  // data
  categoricalData: powerbi.DataViewCategorical;
  originalCategoricalData: IDataViewCategoricalColumn;
  categoricalMetadata: any;
  categoricalCategoriesLastIndex: number = 0;
  categoricalLegendsData: any;
  categoryTitle: string;
  valuesTitle: string;
  categoryDisplayName: string;
  subCategoryDisplayName: string;
  valueDisplayName: string;
  settingsPopupOptionsWidth: number;
  settingsPopupOptionsHeight: number;
  isHasCategories: boolean;
  isHasSubcategories: boolean;
  isHadSubcategories: boolean;
  subCategories: { name: string; color: string }[] = [];
  categoriesForLegend: { name: string; color: string }[] = [];
  subCategoriesMap: { [key: string]: IVisualSubCategoryData } = {};
  categoriesList: string[] = [];
  categoricalSubCategoriesList: string[] = [];
  stackedGroupedSubCategoryNames: string[] = [];
  referenceLinesData: (IReferenceLinesData & IReferenceLinesSettings)[] = [];
  categoricalSubcategoriesNames: string[] = [];
  totalCategoricalFieldsCount: number;
  axisByBarOrientation: Partial<IXAxisSettings | IYAxisSettings>;
  categoricalMeasureDisplayName: string[] = [];
  settingsBeforeIBCSApplied: any;
  isNormalBarChart: boolean;
  isGroupedBarChart: boolean;
  isStackedBarChart: boolean;
  categoricalReferenceLinesValues: any[] = [];
  categoricalReferenceLinesNames: string[] = [];
  visualAnnotations: VisualAnnotations;
  subCategoriesColorMap: any = {};
  categoricalDataPairs: any[] = [];
  powerBiNativeSortOrder = {
    1: ESortOrder.Ascending,
    2: ESortOrder.Descending
  };
  categoricalDataPairsSortedByHigherValues: any[] = [];

  // svg
  svg: any;
  container: any;
  gradientColorScale = d3.scaleLinear();

  // xAxis
  xAxisG: any;
  xScale: any;
  groupedBarBandScale: any;
  domXAxisG: any;
  xScalePaddingOuter: number = 0.25;
  xScale2: any;
  xAxisTitleG: any;
  xAxisTitleText: any;
  xAxisTitleSize: number;
  xScaleGHeight: number = 0;
  xScaleWidth: number;
  scaleBandWidth: number = 0;
  isBottomXAxis: boolean = true;
  xAxisTickHeight: number = 0;
  axisLabelImageWidth: number = 0;
  axisLabelImageHeight: number = 0;
  isXIsNumericAxis: boolean = false;
  isXIsContinuousAxis: boolean = false;
  numericCategoriesBandScale: any;
  clonedNumericCategoriesBandScale: any;
  brushScaleBand: any;
  brushScaleBandClone: any;
  brushScaleBandBandwidth: number;
  totalBarsCount: number;
  xAxisLabelTrimMinWidth: number = 350;
  xAxisLabelTrimMinHeight: number = 350;

  // yAxis
  yAxisG: any;
  yScale: any;
  yLogScaleForView: any;
  domYAxisG: any;
  yAxisTitleText: any;
  yAxisTitleG: any;
  yAxisTitleSize: number;
  yScaleGWidth: number = 200;
  yScaleHeight: number;
  isLeftYAxis: boolean = true;
  yAxisTickHeight: number = 0;
  isYIsNumericAxis: boolean = false;
  isYIsContinuousAxis: boolean = false;

  // brush
  brushG: any;
  brushHeight: number;
  brushWidth: number;
  isHorizontalBrushDisplayed: boolean;
  isVerticalBrushDisplayed: boolean;
  isScrollBrushDisplayed: boolean;
  isBarChartDrawn: boolean = false;
  newScaleDomainByBrush: string[] = [];

  // Grid Lines
  xGridLinesG: any;
  yGridLinesG: any;
  xGridLinesSelection: any;
  yGridLinesSelection: any;

  // Bar
  normalBarG: any;
  stackedBarG: any;
  stackedBarDataLabelsG: any;
  groupedBarG: any;
  isDrawBorderBar: boolean;
  isBottomLabelImageWithinBar: boolean;
  isLeftLabelImageWithinBar: boolean;
  isGroupedStackedBar: boolean;
  rectForOutsideClick: any;
  barAreaClipId: string = "barAreaClip";
  barAreaClip: Selection<SVGElement>;

  // Clip
  stackedBarClipG: any;

  // Stacked Border
  borderBarG: any;

  // Data Labels
  outsideDataLabelsG: any;
  insideDataLabelsG: any;
  barToLabelDistance: number = 10;

  // Legend
  legend: any;
  legendsData: ILegendsDataPoint[] = [];
  legendViewPort: { width: number; height: number } = {
    width: 0,
    height: 0,
  };
  legendMarginLeft: number = 0;
  legendViewPortWidth: number = 0;
  legendViewPortHeight: number = 0;

  // settings
  chartSettings: IChartSettings;
  dataColorsSettings: IDataColorsSettings;
  xAxisSettings: IXAxisSettings;
  yAxisSettings: IYAxisSettings;
  numberSettings: INumberSettings;
  dataLabelsSettings: IDataLabelsSettings;
  gridSettings: IGridLinesSettings;
  xGridSettings: IXGridLinesSettings;
  yGridSettings: IYGridLinesSettings;
  rankingSettings: IRankingSettings;
  sortingSettings: ISortingSettings;
  patternSettings: IPatternSettings;
  legendSettings: ILegendSettings;
  referenceLinesSettings: IReferenceLinesSettings[] = [];
  barChartRaceSettings: IRaceBarChartSettings;
  errorBarsSettings: IErrorBarsSettings;
  seriesLabelSettings: ISeriesLabelSettings;
  dynamicDeviationSettings: IDynamicDeviationSettings;
  lastDynamicDeviationSettings: IDynamicDeviationSettings;
  cutAndClipAxisSettings: ICutAndClipAxisSettings;
  smallMultiplesSettings: ISmallMultiplesSettings;

  // label images on bars
  labelImageOnStackedBarG: any;
  isRightImageRightYAxisPosition: boolean;
  isLabelImageWithinAxis: boolean;
  isLabelImageWithinBar: boolean;
  labelImagePositionWithinBar: Position;
  labelImageBorderWidth: number;
  imageBorderColor: string;
  isShowLabelImage: boolean;
  isShowImageBorder: boolean;

  // grouped-stacked axis label
  groupedStackedBarsLabelG: any;
  groupedStackedBarsLabelWidth: number = 0;
  groupedStackedBarsLabelHeight: number = 0;

  // reference lines
  referenceLinesContainerG: any;
  referenceLineLayersG: any;

  // race bar char
  ticker: any;
  tickerButtonG: any;
  isTickerButtonDrawn: boolean = false;
  tickIndex: number = -1;
  tickDuration: number = 0;
  maxBarCount: number = 2;
  raceBarKeysList: string[] = [];
  raceBarKeysLength: number;
  raceBarKeyOnTick: string;
  raceBarDataLabelOnTick: string;
  raceBarChartData: IVisualCategoryData[] = [];
  isBarRacePlaying: boolean = false;
  isChartIsRaceBarChart: boolean = false;
  isLabelWithoutTransition: boolean = true;

  // dace bar date label
  raceBarDateLabelG: any;
  raceBarDateLabelText: any;
  isRaceBarDataLabelDrawn: boolean = false;
  formatRaceBarDateLabel = d3.timeFormat("%d %b %y");

  // Error Bars
  isShowErrorBars: boolean;
  isHasErrorUpperBounds: boolean;
  isHasErrorLowerBounds: boolean;
  errorBarsLinesG: any;
  errorBarsLinesDashG: any;
  errorBarsAreaG: any;
  errorBarsAreaPath: any;
  errorBarsMarkersG: any;
  errorBarsMarkerDef: any;
  errorBarsMarker: any;
  errorBarsMarkerPath: any;

  // Lasso
  lasso: any;
  lassoButton: any;
  reverseLassoButton: any;
  lassoSelectionMode: LassoSelectionMode;
  lassoCanvas: any;
  lassoCanvasScale: number = 1;
  isLassoEnabled: boolean;

  // Series Label
  seriesLabelG: any;
  isSeriesLabelWithIBCSThemeApplied: boolean;
  isSeriesLabelWithoutIBCSThemeApplied: boolean;

  // Dynamic Deviation
  dynamicDeviationG: any;
  isDynamicDeviationButtonSelected: boolean;
  isDeviationCreatedAfterButtonClicked: boolean;
  firstCategoryValueDataPair: ICategoryValuePair;
  lastCategoryValueDataPair: ICategoryValuePair;
  minCategoryValueDataPair: ICategoryValuePair;
  maxCategoryValueDataPair: ICategoryValuePair;
  fromCategoryValueDataPair: ICategoryValuePair;
  toCategoryValueDataPair: ICategoryValuePair;

  // Cut & Clip
  isShowRegularXAxis: boolean;
  isShowRegularYAxis: boolean;
  isCutAndClipAxisEnabled: boolean;
  isCutAndClipAxisEnabledLastValue: boolean;
  beforeCutLinearXAxisG: any;
  afterCutLinearXAxisG: any;
  beforeCutLinearYAxisG: any;
  afterCutLinearYAxisG: any;
  beforeCutLinearScale: any;
  afterCutLinearScale: any;
  beforeCutLinearScaleArea: number;
  afterCutLinearScaleArea: number;
  barCutAndClipMarkersG: any;
  axisCutAndClipMarkerG: any;
  barCutAndClipMarkerLinesGap: number = 6;
  cutAndClipMarkerTilt: number = 15;
  cutAndClipMarkerWidth: number = 6;
  cutAndClipMarkerHeight: number = 6;
  cutAndClipMarkerDiff: number = 8;

  // SMALL MULTIPLES
  smallMultiplesContainer: HTMLElement;
  hyperListMainContainer: HTMLElement;
  uniformAxisContainer: HTMLElement;
  uniformSmallMultiplesXAxisContainer: HTMLElement;
  uniformSmallMultiplesYAxisContainer: HTMLElement;
  hyperListMainContainerId: string;
  smallMultiplesCategoricalDataField: any;
  smallMultiplesCategoricalDataSourceName: string;
  isSmallMultiplesEnabled: boolean = false;
  isHasSmallMultiplesData: boolean = false;
  smallMultiplesCategoriesName: string[];
  smallMultiplesDataPairs: any[];
  smallMultiplesGridItemContent: { [index: string]: ISmallMultiplesGridItemContent } = {};
  currentSmallMultipleIndex: number = 0;
  isSMUniformXAxis: boolean;
  smallMultiplesLayoutScrollbarWidth: number = 10;

  // PAGINATION
  SMPaginationPanel: HTMLDivElement;
  SMCurrentPage: number = 1;
  SMTotalItems: number = 0;
  SMItemsPerPage: number = 0;
  SMTotalPages: number = 0;
  SMFirstItemIndexOnCurrentPage: number = 0;
  SMPaginationPanelHeight: number = 0;

  constructor(options: VisualConstructorOptions) {
    super(options, VisualSettings, {
      landingPage: {
        description: "Test",
        sliderImages: [],
        title: "Test",
        versionInfo: "test",
      },
      valueRole: ["measure", "tooltip", "upperBound", "lowerBound", "imagesData"],
      measureRole: ["category", "subCategory", "raceBarData"],
      components: [
        {
          name: "Chart Settings",
          sectionName: "chartConfig",
          propertyName: "chartSettings",
          Component: () => ChartSettings,
        },
        {
          name: "Small Multiples",
          sectionName: EVisualConfig.SmallMultiplesConfig,
          propertyName: EVisualSettings.SmallMultiplesSettings,
          Component: () => SmallMultiplesSettings,
        },
        {
          name: "Sorting",
          sectionName: "sortingConfig",
          propertyName: "sortingSettings",
          Component: () => SortingSettings,
        },
        {
          name: "Color Palette",
          sectionName: "dataColorsConfig",
          propertyName: "dataColorsSettings",
          Component: () => DataColorsSettings,
        },
        {
          name: "Dynamic Deviation",
          sectionName: "dynamicDeviationConfig",
          propertyName: "dynamicDeviationSettings",
          Component: () => DynamicDeviationSettings,
        },
        {
          name: "Cut/Clip Axis",
          sectionName: "cutAndClipAxisConfig",
          propertyName: "cutAndClipAxisSettings",
          Component: () => CutAndClipAxisSettings,
        },
        {
          name: "Data Labels",
          sectionName: "dataLabelsConfig",
          propertyName: "dataLabelsSettings",
          Component: () => DataLabelsSettings,
        },
        {
          name: "Series Labels",
          sectionName: "seriesLabelConfig",
          propertyName: "seriesLabelSettings",
          Component: () => SeriesLabelSettings,
        },
        {
          name: "Fill Patterns",
          sectionName: "patternConfig",
          propertyName: "patternSettings",
          Component: () => PatternSettings,
        },
        {
          name: "Ranking",
          sectionName: "rankingConfig",
          propertyName: "rankingSettings",
          Component: () => RankingSettings,
        },
        {
          name: "X-Axis Settings",
          sectionName: "xAxisConfig",
          propertyName: "xAxisSettings",
          Component: () => XAxisSettings,
        },
        {
          name: "Y-Axis Settings",
          sectionName: "yAxisConfig",
          propertyName: "yAxisSettings",
          Component: () => YAxisSettings,
        },
        {
          name: "Reference Lines",
          sectionName: "referenceLinesConfig",
          propertyName: "referenceLinesSettings",
          Component: () => ReferenceLinesComponent,
        },
        {
          name: "Conditional Formatting",
          sectionName: "editor",
          propertyName: "conditionalFormatting",
          Component: Components.ConditionalFormatting,
        },
        {
          name: "Grid Lines",
          sectionName: "gridLinesConfig",
          propertyName: "gridLinesSettings",
          Component: () => GridLinesSettings,
        },
        {
          name: "Bar Chart Race",
          sectionName: "barChartRaceConfig",
          propertyName: "barChartRaceSettings",
          Component: () => BarChartRaceSettings,
        },
        {
          name: "Error Bars Settings",
          sectionName: "errorBarsConfig",
          propertyName: "errorBarsSettings",
          Component: () => ErrorBarsSettings,
        },
      ],
    });
    this.init(this.afterUpdate, this.getEnumeration, paidProperties);
    this.chartContainer = this.getVisualContainer();
    this.tooltipService = createTooltipServiceWrapper(options.host.tooltipService, options.element);

    this.hostContainer = d3.select(this.chartContainer).node().parentElement;
    this.visualHost = options.host;
    this.interactivityService = interactivitySelectionService.createInteractivitySelectionService(this.visualHost);
    this.selectionManager = options.host.createSelectionManager();
    this.behavior = new Behavior();
    this.colorPalette = options.host.colorPalette;
    this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
    this.lasso = null;
    this.initChart();
  }

  public getEnumeration(): EnumerateSectionType[] {
    return Enumeration.GET();
  }

  public initChart(): void {
    this.axisTitleMargin = 10;
    this.brushWidth = 10;
    this.brushHeight = 10;
    this.margin = {
      top: 10,
      right: 30,
      bottom: 100 + this.axisTitleMargin,
      left: 60 + this.axisTitleMargin,
    };

    this.svg = d3.select(this.chartContainer).append("svg").classed("barChart", true).attr("id", "barChart");

    // SMALL MULTIPLES
    this.smallMultiplesContainer = document.createElement("div");
    this.chartContainer.appendChild(this.smallMultiplesContainer);
    this.smallMultiplesContainer.id = "smallMultiplesContainer";

    this.hyperListMainContainerId = "hyperListMainContainerId";
    this.hyperListMainContainer = document.createElement("div");
    this.hyperListMainContainer.id = this.hyperListMainContainerId;
    this.smallMultiplesContainer.appendChild(this.hyperListMainContainer);

    this.uniformAxisContainer = document.createElement("div");
    this.uniformAxisContainer.id = "uniformAxisContainer";
    this.smallMultiplesContainer.appendChild(this.uniformAxisContainer);

    this.SMPaginationPanel = document.createElement("div");
    this.SMPaginationPanel.id = "smallMultiplesPaginationPanel";
    this.chartContainer.appendChild(this.SMPaginationPanel);

    this.rectForOutsideClick = this.svg.append("rect").lower().attr("class", "outside-click-rect");

    this.brushG = this.svg.append("g").attr("class", "brush");

    this.container = this.svg.append("g").classed("container", true);

    this.barAreaClip = this.container.append("clipPath").attr("id", this.barAreaClipId)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0);

    this.xAxisG = this.container.append("g").classed("xAxisG", true);

    this.beforeCutLinearXAxisG = this.xAxisG.append("g").classed("beforeCutLinearXAxisG", true);
    this.afterCutLinearXAxisG = this.xAxisG.append("g").classed("afterCutLinearXAxisG", true);

    this.domXAxisG = this.container.append("g").classed("domXAxisG", true);

    this.xAxisTitleG = this.container.append("g").classed("xAxisTitleG", true);

    this.xAxisTitleText = this.xAxisTitleG.append("text").classed("xAxisTitle", true).attr("text-anchor", "middle");

    this.yAxisG = this.container.append("g").classed("yAxisG", true);

    this.beforeCutLinearYAxisG = this.yAxisG.append("g").classed("beforeCutLinearYAxisG", true);
    this.afterCutLinearYAxisG = this.yAxisG.append("g").classed("afterCutLinearYAxisG", true);

    this.domYAxisG = this.container.append("g").classed("domYAxisG", true);

    this.yAxisTitleG = this.container.append("g").classed("yAxisTitleG", true);

    this.yAxisTitleText = this.yAxisTitleG
      .append("text")
      .classed("yAxisTitle", true)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle");

    this.xGridLinesG = this.container.append("g").classed("xGridLinesG", true);

    this.yGridLinesG = this.container.append("g").classed("yGridLinesG", true);

    this.normalBarG = this.container.append("g").classed("normalBarG", true);

    this.stackedBarG = this.container.append("g").classed("stackedBarsG", true);

    this.stackedBarClipG = this.container.append("g").classed("stackedBarClipG", true);

    this.borderBarG = this.container.append("g").classed("borderBarG", true);

    this.stackedBarDataLabelsG = this.container.append("g").classed("stackedBarDataLabelsG", true);

    this.groupedBarG = this.container.append("g").classed("groupedBarsG", true);

    this.errorBarsAreaG = this.container.append("g").classed("errorBarsAreaG", true);

    this.errorBarsAreaPath = this.errorBarsAreaG.append("path").attr("class", "errorBarsArea");

    this.errorBarsLinesDashG = this.container.append("g").classed("errorBarsLinesDashG", true);

    this.errorBarsLinesG = this.container.append("g").classed("errorBarsLinesG", true);

    this.errorBarsMarkersG = this.container.append("g").classed("errorBarsMarkersG", true);

    this.errorBarsMarkerDef = this.errorBarsMarkersG.append("defs").attr("class", "errorBarsMarkerDefs");

    this.errorBarsMarker = this.errorBarsMarkerDef.append("marker").attr("class", "errorBarsMarker");

    this.errorBarsMarkerPath = this.errorBarsMarker.append("path").attr("class", "errorBarsMarkerPath");

    this.outsideDataLabelsG = this.container.append("g").classed("outsideDataLabelsG", true);

    this.insideDataLabelsG = this.container.append("g").classed("insideDataLabelsG", true);

    this.labelImageOnStackedBarG = this.container.append("g").classed("labelImageOnStackedBarG", true);

    this.groupedStackedBarsLabelG = this.container.append("g").classed("groupedStackedBarsLabelG", true);

    this.barCutAndClipMarkersG = this.container.append("g").classed("barCutAndClipMarkersG", true);

    this.axisCutAndClipMarkerG = this.container.append("g").classed("axisCutAndClipMarkerG", true);

    this.referenceLinesContainerG = this.container.append("g").classed("referenceLinesContainerG", true);

    this.referenceLineLayersG = this.container.append("g").classed("referenceLineLayersG", true);

    this.seriesLabelG = this.container.append("g").classed("seriesLabelsG", true);

    this.dynamicDeviationG = this.container.append("g").classed("dynamicDeviationG", true);

    this.tickerButtonG = this.svg.append("g").classed("tickerButtonG", true);

    this.raceBarDateLabelG = this.svg.append("g").classed("raceBarDateLabelG", true);

    RenderReverseLassoButton(this);
    RenderLassoButton(this);
    RenderDynamicDeviationIcon(this);

    this.lassoCanvas = d3.create("canvas").attr("class", "lassoselector");
    this.hostContainer.appendChild(this.lassoCanvas.node());

    this.isChartInit = true;
  }

  public afterUpdate(vizOptions: ShadowUpdateOptions) {
    if (this.handleValidation(vizOptions)) {
      this.isChartInit = false;
      return;
    } else if (!this.isChartInit) {
      this.initChart();
    }

    try {
      this.visualUpdateOptions = vizOptions;
      this.isInFocusMode = vizOptions.options.isInFocus;
      this.conditionalFormattingConditions = parseConditionalFormatting(vizOptions.formatTab);

      const popupOptions = document.querySelector(".popup-options");
      const popupOptionsHeader = document.querySelector(".popup-options-header");
      this.settingsPopupOptionsWidth = popupOptions ? popupOptions.clientWidth + 13 ?? 0 : 0;
      this.settingsPopupOptionsHeight = popupOptions ? popupOptions.clientHeight ?? 0 : 0;
      this.settingsBtnWidth = vizOptions.options.isInFocus ? this.settingsPopupOptionsWidth : 0;
      this.settingsBtnHeight = popupOptionsHeader ? popupOptionsHeader.clientHeight : 0;

      const formatTab = this.visualUpdateOptions.formatTab;
      const chartConfig = JSON.parse(formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]);
      this.chartSettings = {
        ...CHART_SETTINGS,
        ...chartConfig,
      };

      // const categorical = JSON.parse(JSON.stringify(this.visualUpdateOptions.options.dataViews[0].categorical))
      // const isHasCategoricalLegendsDataValues: boolean = this.originalCategoricalData.values.some((value) => value.source.groupName);
      // const categoricalMeasureValues = this.originalCategoricalData.values.filter((value) => value.source.roles.measure)
      //     .map((value) => value.source.displayName)
      //     .filter((item, i, ar) => ar.indexOf(item) === i);
      // const isMultiMeasureValues: boolean = categoricalMeasureValues?.length > 1;
      // this.categoricalMetadata = this.visualUpdateOptions.options.dataViews[0].metadata;
      // this.categoricalLegendsData = this.categoricalMetadata.columns.find((value) => value.roles.subCategory);

      // this.isEligibleGroupedStackedBarChart = isMultiMeasureValues && this.categoricalLegendsData;

      // if (this.chartSettings.barType !== BarType.GroupedStacked) {
      //     if (this.categoricalLegendsData && isMultiMeasureValues) {
      //         this.visualUpdateOptions.options.dataViews[0].categorical.values.forEach((d, i) => {
      //             if (d.source.displayName !== categoricalMeasureValues[0]) {
      //                 this.visualUpdateOptions.options.dataViews[0].categorical.values.splice(i, 1);
      //             }
      //         });
      //     }
      // }

      this.categoricalData = this.visualUpdateOptions.options.dataViews[0].categorical as any;

      const categoricalDisplayNamesId =
        this.categoricalData.categories.map((s) => s.source.displayName) +
        "-" +
        this.categoricalData.values.map((d) => d.source.displayName).join("-");

      // if (!this.originalCategoricalData || categoricalDisplayNamesId !== this.categoricalDisplayNamesId) {
      this.originalCategoricalData = JSON.parse(
        JSON.stringify(this.visualUpdateOptions.options.dataViews[0].categorical)
      );
      // }  

      this.categoricalCategoriesLastIndex = this.originalCategoricalData.categories.filter(d => Object.keys(d.source.roles).includes(DataRolesName.Category)).length - 1;
      this.categoricalDisplayNamesId =
        this.categoricalData.categories.map((s) => s.source.displayName) +
        "-" +
        this.categoricalData.values.map((d) => d.source.displayName).join("-");

      this.categoricalMetadata = this.visualUpdateOptions.options.dataViews[0].metadata;
      this.viewPortWidth = vizOptions.options.viewport.width;
      this.viewPortHeight = vizOptions.options.viewport.height;
      this.width = vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width;
      this.height = vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height;

      this.setVisualSettings();

      this.isShowSeriesLabel =
        (this.chartSettings.barType === BarType.Stacked || this.chartSettings.barType === BarType.GroupedStacked) &&
        this.seriesLabelSettings.isSeriesLabelEnabled;

      // SMALL MULTIPLES
      this.smallMultiplesCategoricalDataField = this.categoricalData.categories.find(d => Object.keys(d.source.roles).includes(DataRolesName.SmallMultiples));
      this.isHasSmallMultiplesData = !!this.smallMultiplesCategoricalDataField;

      if (this.isHasSmallMultiplesData) {
        this.smallMultiplesCategoricalDataSourceName = this.smallMultiplesCategoricalDataField.source.displayName;
      }

      d3.select(this.SMPaginationPanel).style("display", "none");

      // SMALL MULTIPLE CHART
      if (this.isSmallMultiplesEnabled && this.isHasSmallMultiplesData) {
        d3.select(this.hyperListMainContainer)
          .style("opacity", "1")
          .style("pointer-events", "auto");

        this.svg.attr("pointer-events", "none");
        this.svg.attr("opacity", 0);

        if (this.smallMultiplesSettings.viewType === ESmallMultiplesViewType.Pagination) {
          d3.select(this.SMPaginationPanel).style("display", "flex");
          this.SMPaginationPanelHeight = 35;
        } else {
          d3.select(this.SMPaginationPanel).style("display", "none");
          this.SMPaginationPanelHeight = 0;
        }

        // WIDTH/HEIGHT TO SMALL MULTIPLE CONTAINER
        this.smallMultiplesContainer.style.width = vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width + "px";
        this.smallMultiplesContainer.style.height = vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height - this.SMPaginationPanelHeight + "px";

        this.SMPaginationPanel.style.width = "100%";
        this.SMPaginationPanel.style.height = this.SMPaginationPanelHeight + "px";

        // WIDTH / HEIGHT TO HYPERLIST CONTAINER
        // this.hyperListContainerG
        //   .style("width", this.width + this.yScaleGWidth + "px")
        //   .style("height", this.height + "px")
        //   .style("transform", "translate(" + 0 + "px" + "," + 0 + "px" + ")")

        this.setCategoricalDataBySmallMultiplesCategoryOrder();

        this.axisByBarOrientation =
          this.chartSettings.orientation === Orientation.Horizontal ? this.xAxisSettings : this.yAxisSettings;
        this.xAxisTitleSize = this.getTextSize(this.xAxisSettings.titleFontSize, this.xAxisSettings.isDisplayTitle);
        this.yAxisTitleSize = this.getTextSize(this.yAxisSettings.titleFontSize, this.yAxisSettings.isDisplayTitle);

        this.setMargins();
        this.setChartWidthHeight();

        // const initialChartDataByBrushScaleBand = this.setInitialChartDataByBrushScaleBand(this.categoricalData);

        // this.setChartData(this.categoricalData, this.categoricalMetadata);

        this.groupedStackedBarsLabelWidth = this.isGroupedStackedBar ? 80 : 0;
        this.groupedStackedBarsLabelHeight = this.isGroupedStackedBar
          ? this.getTextSize(this.xAxisSettings.labelFontSize, true) * 1.25
          : 0;

        // this.isCutAndClipAxisEnabled = this.getIsCutAndClipAxisEnabled();
        this.isCutAndClipAxisEnabled = false;

        this.isShowRegularXAxis =
          (!this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
          (this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
          !this.isCutAndClipAxisEnabled;
        this.isShowRegularYAxis =
          (!this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
          (this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
          !this.isCutAndClipAxisEnabled;

        if (
          this.isCutAndClipAxisEnabledLastValue !== this.isCutAndClipAxisEnabled ||
          this.isHorizontalChart !== this.isLastChartTypeIsHorizontal
        ) {
          this.xAxisG.selectAll(".domain").remove();
          this.xAxisG.selectAll(".tick").remove();
          this.yAxisG.selectAll(".domain").remove();
          this.yAxisG.selectAll(".tick").remove();
        }

        // this.isCutAndClipAxisEnabledLastValue = this.getIsCutAndClipAxisEnabled();
        this.isCutAndClipAxisEnabledLastValue = false;

        this.isLastChartTypeIsHorizontal = this.chartSettings.orientation === Orientation.Horizontal;

        if (this.isCutAndClipAxisEnabled) {
          RenderLinearCutAxis(this);

          if (this.isHorizontalChart) {
            this.xAxisG.classed("cut-clip-axis", true);
            this.yAxisG.classed("cut-clip-axis", false);
          } else {
            this.xAxisG.classed("cut-clip-axis", false);
            this.yAxisG.classed("cut-clip-axis", true);
          }

          this.xScale = GetXScale;
          this.xScale2 = GetXScale;
          this.yScale = GetYScale;
        } else {
          this.xAxisG.classed("cut-clip-axis", false);
          this.yAxisG.classed("cut-clip-axis", false);
          this.container.select(".barCutAndClipMarkersG").selectAll("*").remove();
        }

        const smallMultiplesDataPair = this.smallMultiplesDataPairs[0];
        const dataValuesIndexes = Object.keys(smallMultiplesDataPair).splice(2);

        // const axisConfig: IAxisConfig = {
        //   categoricalData: this.categoricalData,
        //   width: this.width / 2,
        //   height: this.height / 2,
        //   xAxisG: this.xAxisG.node(),
        //   yAxisG: this.yAxisG.node(),
        //   xAxisYPos: this.height / 2,
        //   yAxisXPos: this.width / 2
        // };

        // this.drawXYAxis(axisConfig);

        if (this.isCutAndClipAxisEnabled) {
          RenderCutAndClipMarkerOnAxis(this);
        } else {
          this.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
        }

        // this.uniformSmallMultiplesXAxisContainer.style.transform = "translate(" + 0 + "px" + "," + this.height + "px" + ")";
        // this.hyperListMainContainer.style.transform = "translate(" + this.margin.left + "px" + "," + 0 + "px" + ")";

        CreateSmallMultiples(this);
      }

      if (!this.isHasSmallMultiplesData) {
        // REGULAR BAR CHART
        d3.select(this.SMPaginationPanel).selectAll("*").remove();

        if (!this.isHasSmallMultiplesData) {

          d3.select(this.hyperListMainContainer)
            .style("opacity", "0")
            .style("pointer-events", "none");
          d3.select(this.uniformAxisContainer).selectAll("*").remove();

          this.svg.attr("pointer-events", "default");
          this.svg.attr("opacity", 1);

          this.categoricalData = JSON.parse(JSON.stringify(this.originalCategoricalData));
          const clonedCategoricalData = JSON.parse(JSON.stringify(this.visualUpdateOptions.options.dataViews[0].categorical));
          this.setInitialChartDataByBrushScaleBand(this.categoricalData, clonedCategoricalData, this.width, this.height);

          this.axisByBarOrientation =
            this.chartSettings.orientation === Orientation.Horizontal ? this.xAxisSettings : this.yAxisSettings;
          this.xAxisTitleSize = this.getTextSize(this.xAxisSettings.titleFontSize, this.xAxisSettings.isDisplayTitle);
          this.yAxisTitleSize = this.getTextSize(this.yAxisSettings.titleFontSize, this.yAxisSettings.isDisplayTitle);

          this.setMargins();
          this.setChartWidthHeight();

          if (!this.isScrollBrushDisplayed) {
            this.initChartConfigByChartSettings(this.categoricalData);
          }

          this.svg.attr("transform", "translate(" + 0 + "," + 0 + ")");

          if (
            this.legendSettings.show &&
            this.chartSettings.barType !== BarType.Normal &&
            this.dataColorsSettings.fillType !== ColorPaletteType.NoColor
          ) {
            SetLegendsData(this);
            RenderLegends(this);
          } else {
            clearLegends();
            this.legendViewPort.width = 0;
            this.legendViewPort.height = 0;
            this.legendViewPortWidth = 0;
            this.legendViewPortHeight = 0;
          }

          this.svg
            .attr("width", vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
            .attr("height", vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height);

          this.renderContextMenu();

          this.rectForOutsideClick
            .attr("fill", "transparent")
            .attr("width", vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
            .attr("height", vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height);

          this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

          createPatternsDefs(this.svg);

          this.groupedStackedBarsLabelWidth = this.isGroupedStackedBar ? 80 : 0;
          this.groupedStackedBarsLabelHeight = this.isGroupedStackedBar
            ? this.getTextSize(this.xAxisSettings.labelFontSize, true) * 1.25
            : 0;

          this.isCutAndClipAxisEnabled = GetIsCutAndClipAxisEnabled(this);

          this.isShowRegularXAxis =
            (!this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
            (this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
            !this.isCutAndClipAxisEnabled;
          this.isShowRegularYAxis =
            (!this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
            (this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
            !this.isCutAndClipAxisEnabled;

          if (
            this.isCutAndClipAxisEnabledLastValue !== this.isCutAndClipAxisEnabled ||
            this.isHorizontalChart !== this.isLastChartTypeIsHorizontal
          ) {
            this.xAxisG.selectAll(".domain").remove();
            this.xAxisG.selectAll(".tick").remove();
            this.yAxisG.selectAll(".domain").remove();
            this.yAxisG.selectAll(".tick").remove();
          }

          this.isCutAndClipAxisEnabledLastValue = GetIsCutAndClipAxisEnabled(this);
          this.isLastChartTypeIsHorizontal = this.chartSettings.orientation === Orientation.Horizontal;

          if (this.isCutAndClipAxisEnabled) {
            RenderLinearCutAxis(this);

            if (this.isHorizontalChart) {
              this.xAxisG.classed("cut-clip-axis", true);
              this.yAxisG.classed("cut-clip-axis", false);
            } else {
              this.xAxisG.classed("cut-clip-axis", false);
              this.yAxisG.classed("cut-clip-axis", true);
            }

            this.xScale = GetXScale;
            this.xScale2 = GetXScale;
            this.yScale = GetYScale;
          } else {
            this.xAxisG.classed("cut-clip-axis", false);
            this.yAxisG.classed("cut-clip-axis", false);
            this.container.select(".barCutAndClipMarkersG").selectAll("*").remove();
          }

          const axisConfig: IAxisConfig = {
            categoricalData: this.categoricalData,
            width: this.width,
            height: this.height,
            xAxisG: this.xAxisG.node(),
            yAxisG: this.yAxisG.node(),
            xAxisYPos: this.height,
            yAxisXPos: this.width
          };

          RenderXYAxis(this, axisConfig);

          if (this.isCutAndClipAxisEnabled) {
            RenderCutAndClipMarkerOnAxis(this);
          } else {
            this.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
          }

          if (this.isIBCSThemeAlreadyApplied && !this.chartSettings.isIBCSThemeEnabled) {
            ApplyPreviousSettingsAfterIBCSApplied(this);
          }

          if (!this.isIBCSThemeAlreadyApplied && this.chartSettings.isIBCSThemeEnabled) {
            ApplyIBCSTheme(this);
          }

          if (!this.chartSettings.isIBCSThemeEnabled) {
            this.isIBCSThemeAlreadyApplied = false;
            // this.drawSeriesLabel([]);
            // this.isShowSeriesLabel = false;
          }

          if (this.isShowSeriesLabel) {
            RenderSeriesLabels(this, this.stackedBarChartData);

            if (this.isIBCSThemeAlreadyApplied) {
              this.isSeriesLabelWithoutIBCSThemeApplied = true;
            }
          } else {
            RenderSeriesLabels(this, []);
          }

          RenderBrush(this, true);

          this.barAreaClip
            .attr("width", this.width)
            .attr("height", this.height);

          if (!this.isScrollBrushDisplayed) {
            this.drawBarChart(
              this.chartData,
              this.groupedBarChartData,
              this.stackedBarChartData,
              this.getGroupedBarsDataLabelsData(this.groupedBarChartData)
            );
          }

          if (this.categoricalCategoriesLastIndex !== 0) {
            this.interactivityService.clearSelection();
          }

          const onBarClick = (barElement) => {
            this.handleCreateOwnDynamicDeviationOnBarClick(barElement);
          }

          this.setAndBindChartBehaviorOptions(this.normalBarG, this.stackedBarG, this.groupedBarG, onBarClick);
          this.behavior.renderSelection(this.interactivityService.hasSelection());

          // // this.drawBrush();
          RenderTooltipByChartType(this, this.normalBarG, this.stackedBarG, this.groupedBarG);

          if (this.isChartIsRaceBarChart) {
            RenderRaceBarDataLabel(this);
            if (!this.isTickerButtonDrawn) {
              RenderRaceBarTickerButton(this);
            } else {
              UpdateTickerButton(this);
            }
          } else {
            this.tickerButtonG.selectAll("*")?.remove();
            this.raceBarDateLabelText?.text("");
            this.isTickerButtonDrawn = false;
          }

          const formatTab = this.visualUpdateOptions.formatTab;
          formatTab[EVisualConfig.XAxisConfig][EVisualSettings.XAxisSettings] = JSON.stringify({
            ...this.xAxisSettings,
            titleName: this.xAxisSettings.titleName,
            labelCharLimit: this.xAxisSettings.labelCharLimit,
          });

          formatTab[EVisualConfig.YAxisConfig][EVisualSettings.YAxisSettings] = JSON.stringify({
            ...this.yAxisSettings,
            titleName: this.yAxisSettings.titleName,
          });

          this.chartContainer.style.top = this.settingsBtnHeight + "px";
          this.lassoCanvas.attr("width", this.viewPortWidth + "px").attr("height", this.viewPortHeight + "px");
          InitiateRectangularLasso(this);
          ShowAndHideLassoIcon(this);

          d3.select(".dynamic-deviation-button").style(
            "display",
            this.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn ? "flex" : "none"
          );
          if (this.dynamicDeviationSettings.isEnabled && this.chartSettings.barType === BarType.Normal) {
            SetDynamicDeviationDataAndDrawLines(this);
          } else {
            RemoveDynamicDeviation(this);
          }

          this.visualHost.persistProperties({
            merge: [
              {
                objectName: EVisualConfig.DynamicDeviationConfig,
                displayName: EVisualSettings.DynamicDeviationSettings,
                properties: {
                  [EVisualSettings.DynamicDeviationSettings]: JSON.stringify({
                    ...this.dynamicDeviationSettings,
                    SHOW_IN_LEFT_MENU: this.isNormalBarChart ? true : false,
                  }),
                },
                selector: null,
              },
              {
                objectName: EVisualConfig.CutAndClipAxisConfig,
                displayName: EVisualSettings.CutAndClipAxisSettings,
                properties: {
                  [EVisualSettings.CutAndClipAxisSettings]: JSON.stringify({
                    ...this.cutAndClipAxisSettings,
                    SHOW_IN_LEFT_MENU: this.isNormalBarChart ? true : false,
                  }),
                },
                selector: null,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  handleCreateOwnDynamicDeviationOnBarClick(barElement: HTMLElement): void {
    const THIS = this;
    const isCreateOwnDynamicDeviation: boolean =
      this.dynamicDeviationSettings.isEnabled &&
      this.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn;

    if (isCreateOwnDynamicDeviation || THIS.isDynamicDeviationButtonSelected) {
      const data: any = d3.select(barElement).datum();
      if (THIS.fromCategoryValueDataPair && !THIS.toCategoryValueDataPair) {
        THIS.toCategoryValueDataPair = { category: data.category, value: data.value };
        RenderDynamicDeviation(this, THIS.fromCategoryValueDataPair, THIS.toCategoryValueDataPair);
        d3.select(".dynamic-deviation-button").classed("selected", false);
        THIS.isDynamicDeviationButtonSelected = false;
        THIS.normalBarG.selectAll(".bar").style("cursor", "auto");

        if (
          !THIS.isDeviationCreatedAfterButtonClicked &&
          THIS.dynamicDeviationSettings.displayType !== EDynamicDeviationDisplayTypes.CreateYourOwn
        ) {
          THIS.isDeviationCreatedAfterButtonClicked = true;
          THIS.dynamicDeviationSettings.displayType = EDynamicDeviationDisplayTypes.CreateYourOwn;

          THIS.visualHost.persistProperties({
            merge: [
              {
                objectName: "dynamicDeviationConfig",
                displayName: "dynamicDeviationSettings",
                properties: {
                  dynamicDeviationSettings: JSON.stringify({
                    ...THIS.dynamicDeviationSettings,
                    displayType: EDynamicDeviationDisplayTypes.CreateYourOwn,
                    lastDisplayType: EDynamicDeviationDisplayTypes.CreateYourOwn,
                  }),
                },
                selector: null,
              },
            ],
          });
        }
      }

      if (!THIS.fromCategoryValueDataPair && !THIS.toCategoryValueDataPair) {
        THIS.fromCategoryValueDataPair = { category: data.category, value: data.value };
      }
    }

    if (!isCreateOwnDynamicDeviation && !THIS.isDynamicDeviationButtonSelected) {
      HighlightActiveBar(d3.select(barElement), THIS.normalBarG.selectAll("foreignObject"));
    }
  }

  // SMALL MULTIPLES

  setCategoricalDataBySmallMultiplesCategoryOrder(): void {
    const clonedCategoricalData: powerbi.DataViewCategorical = JSON.parse(JSON.stringify(this.originalCategoricalData));
    const categoricalAllCategoriesDataFields = clonedCategoricalData.categories.filter(
      (value) => Object.keys(value.source.roles).includes(DataRolesName.Category)
    );
    const categoricalCategoriesDataField = categoricalAllCategoriesDataFields[categoricalAllCategoriesDataFields.length - 1];
    const categoricalMeasuresDataFields = clonedCategoricalData.values.filter(
      (value) => Object.keys(value.source.roles).includes(DataRolesName.Value)
    );
    const categoricalSmallMultiplesDataField = clonedCategoricalData.categories.find(
      (value) => Object.keys(value.source.roles).includes(DataRolesName.SmallMultiples)
    );
    const categoricalCategoriesValues = categoricalCategoriesDataField?.values.filter((item, i, ar) => ar.indexOf(item) === i) ?? [];
    const categoricalSmallMultiplesValues = categoricalSmallMultiplesDataField?.values.filter((item, i, ar) => ar.indexOf(item) === i) ?? [];

    this.categoriesList = <string[]>categoricalCategoriesValues;
    this.smallMultiplesCategoriesName = <string[]>categoricalSmallMultiplesValues;

    if (!!categoricalSmallMultiplesDataField) {
      const categoricalDataPairsForGrouping = categoricalSmallMultiplesDataField.values.reduce(
        (arr, category: string, index: number) => {
          const obj = { category: category, total: 0, [`index-${index}`]: index };
          return [...arr, obj];
        },
        []
      );

      const categoricalDataPairsGroup = d3.group(categoricalDataPairsForGrouping, (d: any) => d.category);
      this.smallMultiplesDataPairs = categoricalSmallMultiplesValues.map((category) =>
        Object.assign({}, ...categoricalDataPairsGroup.get(category))
      );

      this.smallMultiplesDataPairs.forEach(d => {
        const keys = Object.keys(d).splice(2);
        let total = 0;
        keys.forEach(key => {
          const index = +key.split("-")[1];
          total += +categoricalMeasuresDataFields[0].values[index];
        });
        d.total = total;
      });

      this.sortSmallMultiplesDataPairs();

      let iterator: number = 0;
      this.smallMultiplesDataPairs.forEach((dataPair) => {
        const keys = Object.keys(dataPair).splice(2);
        keys.forEach((key) => {
          const index = +key.split("-")[1];
          this.categoricalData.categories.forEach((categoricalRaceBarValue, i) => {
            categoricalRaceBarValue.values[iterator] = clonedCategoricalData.categories[i].values[index];
          })

          this.categoricalData.values.forEach((categoricalValue, i: number) => {
            categoricalValue.values[iterator] = clonedCategoricalData.values[i].values[index];

            if (categoricalValue.highlights) {
              categoricalValue.highlights[iterator] = clonedCategoricalData.values[i].highlights[index];
            }
          });

          iterator++;
        });
      });
    };
  }

  sortSmallMultiplesDataPairs(): void {
    const sortByValuesList: string[] = [this.smallMultiplesCategoricalDataSourceName, ...this.categoricalMeasureDisplayName];

    const sort = this.sortingSettings.smallMultiples;
    const smallMultipleSortSettings = !sort.sortBy || !sortByValuesList.includes(sort.sortBy)
      ? { sortBy: sortByValuesList[1], sortOrder: ESortOrder.Descending, isMeasure: true, isMultiMeasure: false }
      : sort;

    if (smallMultipleSortSettings.isMeasure) {
      if (smallMultipleSortSettings.sortOrder === ESortOrder.Descending) {
        this.smallMultiplesDataPairs.sort((a, b) => b.total - a.total);
      } else if (smallMultipleSortSettings.sortOrder === ESortOrder.Ascending) {
        this.smallMultiplesDataPairs.sort((a, b) => a.total - b.total);
      }
    } else {
      if (smallMultipleSortSettings.sortOrder === ESortOrder.Descending) {
        this.smallMultiplesDataPairs.sort((a, b) => a.category.localeCompare(b.category));
      } else if (smallMultipleSortSettings.sortOrder === ESortOrder.Ascending) {
        this.smallMultiplesDataPairs.sort((a, b) => b.category.localeCompare(a.category));
      }
    }

    this.smallMultiplesCategoriesName = this.smallMultiplesDataPairs.map(d => d.category);
  }




  getTextHeight(fontSize: number, fontFamily: string, fontStyle: string, isDisplay: boolean): number {
    let textSize: number;
    const textEle = this.svg
      .append("text")
      .attr("opacity", "0")
      .attr("font-size", fontSize)
      .attr("font-family", fontFamily)
      .attr("display", isDisplay ? "block" : "none")
      .style("font-weight", fontStyle.includes(FontStyle.Bold) ? "bold" : "")
      .style("font-style", fontStyle.includes(FontStyle.Italic) ? "italic" : "")
      .style("text-decoration", fontStyle.includes(FontStyle.UnderLine) ? "underline" : "")
      .text("text")
      .attr("", function () {
        textSize = this.getBBox().height;
      });
    textEle.remove();
    return textSize;
  }

  setAndBindChartBehaviorOptions(normalBarG: Selection<SVGElement>, stackedBarG: Selection<SVGElement>, groupedBarG: Selection<SVGElement>, onBarClick: Function): void {
    if (this.interactivityService) {
      let barNodeData = [];
      let barSelection;

      if (this.isNormalBarChart) {
        barSelection = normalBarG.selectAll(".bar");
        barSelection.each(function () {
          barNodeData.push(d3.select(this).datum());
        });
      } else if (this.isGroupedBarChart) {
        barSelection = groupedBarG.selectAll(".groupedBar");
        barSelection.each(function () {
          barNodeData.push(d3.select(this).datum());
        });
      } else if (this.isStackedBarChart || this.isGroupedStackedBar) {
        barSelection = stackedBarG.selectAll(".bar");
        // barSelection.each(function () {
        //     barNodeData.push(d3.select(this).datum());
        // });
        barNodeData = this.stackedBarChartData.reduce((arr, d) => {
          d.components.forEach((item: any, i) => {
            arr = [...arr, item];
          });
          return arr;
        }, []);
      }

      this.interactivityService.applySelectionStateToData(barNodeData);
      const behaviorOptions: BehaviorOptions = {
        selection: barSelection,
        clearCatcher: this.svg,
        interactivityService: this.interactivityService,
        dataPoints: barNodeData,
        behavior: this.behavior,
        isLassoEnabled: false,
        isClearPreviousSelection: this.categoricalCategoriesLastIndex !== 0,
        onBarClick: onBarClick
      };
      this.interactivityService.bind(behaviorOptions);
    }
  }

  initChartConfigByChartSettings(categoricalData: IDataViewCategoricalColumn): void {
    this.setChartData(categoricalData, this.categoricalMetadata);

    if (
      this.rankingSettings.subCategoriesRanking.count < this.originalCategoricalData.values?.length &&
      this.rankingSettings.isSubcategoriesRanking
    ) {
      this.setChartDataByRanking();

      if (this.categoricalLegendsData) {
        this.categoriesForLegend = JSON.parse(JSON.stringify(this.subCategories));
      }
    }

    if (
      (this.chartSettings.barType === BarType.Stacked || this.chartSettings.barType === BarType.GroupedStacked) &&
      this.dataLabelsSettings.dataLabels.placement === DataLabelsPlacement.OutSide
    ) {
      this.dataLabelsSettings.dataLabels.placement = DataLabelsPlacement.End;
    }

    if (this.patternSettings.enable) {
      this.setVisualPatternData();
    }

    this.categoriesList = this.chartData.map((d) => d.category);
    this.categoricalSubCategoriesList = this.chartData[
      this.isHorizontalChart ? this.chartData.length - 1 : 0
    ]?.subCategories.map((d) => d.category);
    this.categoricalSubCategoriesList = this.categoricalSubCategoriesList.filter(
      (item, i, ar) => ar.indexOf(item) === i
    );

    if (this.isHasImagesData) {
      this.setLabelImagePositionProps();
    }

    this.setColorsByDataColorsSettings();

    if (this.rankingSettings.showRemainingAsOthers || this.rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
      SetRemainingAsOthersDataColor(this);
    }

    if (this.conditionalFormattingConditions.length) {
      this.setConditionalFormattingColor();
    }

    this.chartData.forEach((d) => {
      if (d.category === this.othersBarText) {
        d.styles.bar.fillColor = "rgb(84, 84, 84)";
      }

      d.subCategories.forEach((s) => {
        if (d.category === this.othersBarText) {
          s.styles.bar.fillColor = "rgb(84, 84, 84)";
        }
      });
    });

    this.setBarHighlightColor();

    // this.sortSubcategoriesData();

    const barType = this.chartSettings.barType;
    if (barType === BarType.Stacked || barType === BarType.Grouped || barType === BarType.GroupedStacked) {
      this.setStackedGroupedBarChartData();
    }

    if (this.patternSettings.enable && this.patternSettings?.patterns?.length) {
      this.setVisualPatternData();
    }

    if (this.isCutAndClipAxisEnabled && this.isScrollBrushDisplayed) {
      RenderCutAndClipMarkerOnAxis(this);
    } else {
      this.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
    }
  }

  setBrushScaleBandDomain(categoricalData: any): void {
    const innerPadding = this.getXScaleInnerPadding();
    if (this.isHorizontalChart) {
      this.brushScaleBand = d3.scaleBand().paddingOuter(this.xScalePaddingOuter).paddingInner(innerPadding);
      this.brushScaleBand.domain(categoricalData.categories[this.categoricalCategoriesLastIndex].values.map((d) => <string>d));
    } else {
      this.brushScaleBand = d3.scaleBand().paddingOuter(this.xScalePaddingOuter).paddingInner(innerPadding);
      this.brushScaleBand.domain(categoricalData.categories[this.categoricalCategoriesLastIndex].values.map((d) => <string>d));
    }
  }

  setBrushScaleBandRange(width: number, height: number): void {
    if (this.isHorizontalChart) {
      this.brushScaleBand.range(this.xAxisSettings.position === Position.Bottom ? [height, 0] : [0, width]);
    } else {
      this.brushScaleBand.range(this.yAxisSettings.position === Position.Left ? [0, width] : [width, 0]);
    }
  }

  setSortingSettings(): void {
    const formatTab = this.visualUpdateOptions.formatTab;
    const sortingConfig = JSON.parse(formatTab[EVisualConfig.SortingConfig][EVisualSettings.SortingSettings]);
    this.sortingSettings = {
      ...SORTING_SETTINGS,
      ...sortingConfig,
    };

    if (this.isSmallMultiplesEnabled && this.isHasSmallMultiplesData &&
      this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform) {
      this.sortingSettings = {
        ...this.sortingSettings,
        [ESortingSettings.Axis]: {
          ...this.sortingSettings[ESortingSettings.Axis],
          [ESortingSettings.SortBy]: this.categoryDisplayName,
          [ESortingSettings.IsMeasure]: false
        }
      }
    }
  }

  sortBrushCategoriesData(
    data: { category: string }[],
    categoryKey: string,
    measureKeys: string[],
    measureValues: any[],
    isSortByHigherValuesOnly: boolean = false
  ): void {
    const axisSortByValuesList: string[] = [this.categoryDisplayName, ...this.categoricalMeasureDisplayName];

    if (this.categoricalMeasureDisplayName?.length > 1) {
      axisSortByValuesList.push(ESortBy.TotalValue);
    }

    let axis: IAxisSortSettings;
    let axisSettings: IAxisSortSettings;

    if (this.sortingSettings.isCustomSortEnabled) {
      axis = this.sortingSettings.axis;
      axisSettings =
        !axis.sortBy || !axisSortByValuesList.includes(axis.sortBy)
          ? { sortBy: axisSortByValuesList[1], sortOrder: ESortOrder.Descending, isMeasure: true, isMultiMeasure: false }
          : axis;

      if (isSortByHigherValuesOnly && !axisSettings.isMeasure) {
        axisSettings.sortBy = this.categoricalMeasureDisplayName[0];
      }
    } else {
      const categoricalCategoryField = this.categoricalMetadata.columns.find(d => Object.keys(d.roles).includes(DataRolesName.Category));
      const categoricalMeasureFields = this.categoricalMetadata.columns.filter(d => Object.keys(d.roles).includes(DataRolesName.Value));
      const categoricalMeasureField = categoricalMeasureFields.find(d => Object.keys(d).includes("sort"));
      const isNativeSortByAxis = Object.keys(categoricalCategoryField).includes("sort");
      const isNativeSortByMeasure = !!categoricalMeasureField;

      if (isNativeSortByAxis) {
        axisSettings = { sortBy: categoricalCategoryField.displayName, sortOrder: this.powerBiNativeSortOrder[categoricalCategoryField.sort], isMeasure: false, isMultiMeasure: false };
      }

      if (isNativeSortByMeasure) {
        axisSettings = { sortBy: categoricalMeasureField.displayName, sortOrder: this.powerBiNativeSortOrder[categoricalMeasureField.sort], isMeasure: true, isMultiMeasure: false };
      }

      if (isSortByHigherValuesOnly && isNativeSortByAxis) {
        axisSettings.sortBy = this.categoricalMeasureDisplayName[0];
      }
    }

    if (isSortByHigherValuesOnly) {
      axisSettings.isMeasure = true;
    }

    const isHasLegendData = this.categoricalData.values.filter((value) => value.source.groupName)?.length > 0;

    const sortByName = () => {
      if (this.isHorizontalChart) {
        if (axisSettings.sortOrder === ESortOrder.Descending) {
          data.sort((a, b) => b[categoryKey].localeCompare(a[categoryKey]));
        } else {
          data.sort((a, b) => a[categoryKey].localeCompare(b[categoryKey]));
        }
      } else {
        if (axisSettings.sortOrder === ESortOrder.Descending) {
          data.sort((a, b) => a[categoryKey].localeCompare(b[categoryKey]));
        } else {
          data.sort((a, b) => b[categoryKey].localeCompare(a[categoryKey]));
        }
      }
    };

    const sortByMeasure = (measureValues: any[]) => {
      const index = measureValues.find((d) => d.source.displayName === axisSettings.sortBy)?.source?.index;
      const measureIndex = `measure${index}`;
      if (isSortByHigherValuesOnly) {
        data.sort((a, b) =>
          this.isHorizontalChart ? a[measureIndex] - b[measureIndex] : b[measureIndex] - a[measureIndex]
        );
      } else {
        if (axisSettings.sortOrder === ESortOrder.Ascending) {
          data.sort((a, b) => {
            return this.isHorizontalChart ? b[measureIndex] - a[measureIndex] : a[measureIndex] - b[measureIndex];
          });
        } else if (axisSettings.sortOrder === ESortOrder.Descending) {
          data.sort((a, b) =>
            this.isHorizontalChart ? a[measureIndex] - b[measureIndex] : b[measureIndex] - a[measureIndex]
          );
        }
      }
    };

    const sortByMultiMeasure = (measureKeys: string[], measureValues: any[]) => {
      let getValue: Function;
      if (this.isChartIsRaceBarChart) {
        getValue = (d: IVisualCategoryData | IVisualSubCategoryData) =>
          Object.keys(d)
            .splice(1)
            .reduce((value, key) => {
              const index = +key.split("-")[1];
              measureValues.forEach((measureValue) => {
                value += measureValue.values[index] ?? 0;
              });
              return value;
            }, 0);
      } else {
        getValue = (d: any) =>
          measureKeys.reduce((value, key) => {
            value += d[key];
            return value;
          }, 0);
      }

      if (axisSettings.sortOrder === ESortOrder.Ascending) {
        data.sort((a, b) => {
          return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
        });
      } else if (axisSettings.sortOrder === ESortOrder.Descending) {
        data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
      }
    };

    // Axis Settings
    if (axisSettings.isMeasure) {
      if (isHasLegendData || this.isChartIsRaceBarChart) {
        const index = measureValues.find((d) => d.source.displayName === axisSettings.sortBy)?.source?.index;
        const newMeasureKeys = measureKeys.filter((key) => key.includes(index));
        const newMeasureValues = measureValues.filter((d) => d.source.displayName === axisSettings.sortBy);
        sortByMultiMeasure(newMeasureKeys, newMeasureValues);
      } else {
        sortByMeasure(measureValues);
      }
    } else if (axisSettings.isMultiMeasure) {
      sortByMultiMeasure(measureKeys, measureValues);
    } else {
      sortByName();
    }
  }

  setBrushCategoriesDataByRanking(clonedCategoricalData: any): void {
    const rankingSettings = this.rankingSettings;
    const dataLength = this.categoricalData.categories[this.categoricalCategoriesLastIndex].values.length;

    const setCategories = (startIndex: number, endIndex: number) => {
      clonedCategoricalData.categories.forEach((d, i) => {
        d.values = this.categoricalData.categories[i].values.slice(startIndex, endIndex);
      });
    };

    const setValues = (startIndex: number, endIndex: number) => {
      clonedCategoricalData.values.forEach((d, i) => {
        d.values = this.categoricalData.values[i].values.slice(startIndex, endIndex);
      });
    };

    if (rankingSettings.isCategoriesRanking) {
      if (rankingSettings.filterType === RankingFilterType.TopN) {
        if (this.isHorizontalChart) {
          setCategories(dataLength - rankingSettings.count, dataLength);
          setValues(dataLength - rankingSettings.count, dataLength);
        } else {
          setCategories(0, rankingSettings.count);
          setValues(0, rankingSettings.count);
        }
      }

      if (rankingSettings.filterType === RankingFilterType.BottomN) {
        if (this.isHorizontalChart) {
          if (rankingSettings.count <= dataLength) {
            setCategories(0, rankingSettings.count);
            setValues(0, rankingSettings.count);
          }
        } else {
          if (rankingSettings.count <= dataLength) {
            setCategories(dataLength - rankingSettings.count, dataLength);
            setValues(dataLength - rankingSettings.count, dataLength);
          }
        }
      }

      if (rankingSettings.showRemainingAsOthers) {
        const identity = this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId();
        const othersDataField: IVisualCategoryData = {
          id: "",
          category: this.othersBarText,
          groupedCategory: this.othersBarText,
          value: 0,
          styles: { bar: { fillColor: "rgb(84, 84, 84)" } },
          subCategories: [],
          tooltipFields: [],
          selectionId: identity,
          selected: false,
          identity,
          isHighlight: false,
        };
        if (this.isHorizontalChart) {
          clonedCategoricalData.categories.forEach((d, i) => {
            d.values = [...d.values, othersDataField.category];
          });
        } else {
          clonedCategoricalData.categories.forEach((d, i) => {
            d.values = [...d.values, othersDataField.category];
          });
        }
      }
    }

    return clonedCategoricalData;
  }

  setCategoricalDataPairsByRanking(): void {
    const rankingSettings = this.rankingSettings;
    let othersBarData;
    if (rankingSettings.isCategoriesRanking) {
      if (rankingSettings.filterType === RankingFilterType.TopN) {
        if (this.isHorizontalChart) {
          othersBarData = this.categoricalDataPairs.slice(0, this.categoricalDataPairs.length - rankingSettings.count);
          this.categoricalDataPairs = this.categoricalDataPairs.slice(
            this.categoricalDataPairs.length - rankingSettings.count,
            this.categoricalDataPairs.length
          );
        } else {
          othersBarData = this.categoricalDataPairs.slice(rankingSettings.count, this.categoricalDataPairs.length);
          this.categoricalDataPairs = this.categoricalDataPairs.slice(0, rankingSettings.count);
        }
      }
      if (rankingSettings.filterType === RankingFilterType.BottomN) {
        if (this.isHorizontalChart) {
          if (rankingSettings.count <= this.categoricalDataPairs.length) {
            othersBarData = this.categoricalDataPairs.slice(rankingSettings.count, this.categoricalDataPairs.length);
            this.categoricalDataPairs = this.categoricalDataPairs.slice(0, rankingSettings.count);
          }
        } else {
          if (rankingSettings.count <= this.categoricalDataPairs.length) {
            othersBarData = this.categoricalDataPairs.slice(
              0,
              this.categoricalDataPairs.length - rankingSettings.count
            );
            this.categoricalDataPairs = this.categoricalDataPairs.slice(
              this.categoricalDataPairs.length - rankingSettings.count,
              this.categoricalDataPairs.length
            );
          }
        }
      }

      const keys = Object.keys(this.categoricalDataPairs[0]).slice(1);
      if (rankingSettings.showRemainingAsOthers) {
        const othersDataField: any = {
          category: this.othersBarText,
        };
        keys.forEach((key) => {
          othersDataField[key] = d3.sum(othersBarData, (d) => d[key]);
        });
        if (this.isHorizontalChart) {
          this.categoricalDataPairs.unshift(othersDataField);
        } else {
          this.categoricalDataPairs.push(othersDataField);
        }
      }
    }
  }

  sortBrushSubCategoriesData(categoricalData: powerbi.DataViewCategorical): void {
    let legendSettings: ILegendSortSettings;
    if (this.sortingSettings.isCustomSortEnabled) {
      legendSettings = this.sortingSettings.legend;
    } else {
      const categoricalSubCategoryField = this.categoricalMetadata.columns.find(d => Object.keys(d.roles).includes(DataRolesName.SubCategory));

      if (categoricalSubCategoryField) {
        const isNativeSortByLegend = Object.keys(categoricalSubCategoryField).includes("sort");
        if (isNativeSortByLegend) {
          legendSettings = { sortBy: categoricalSubCategoryField.displayName, sortOrder: this.powerBiNativeSortOrder[categoricalSubCategoryField.sort] };
        } else {
          legendSettings = this.sortingSettings.legend;
        }
      } else {
        legendSettings = this.sortingSettings.legend;
      }
    }

    const isHasCategoricalLegendsDataValues: boolean = categoricalData.values.some((value) => value.source.groupName);
    if (legendSettings.sortOrder === ESortOrder.Descending) {
      if (isHasCategoricalLegendsDataValues) {
        categoricalData.values.sort((a, b) => (a.source.groupName as string).localeCompare(b.source.groupName as string));
      } else {
        categoricalData.values.sort((a, b) => (a.source.displayName as string).localeCompare(b.source.displayName as string));
      }
    } else if (legendSettings.sortOrder === ESortOrder.Ascending) {
      if (isHasCategoricalLegendsDataValues) {
        categoricalData.values.sort((a, b) => (b.source.groupName as string).localeCompare(a.source.groupName as string));
      } else {
        categoricalData.values.sort((a, b) => (b.source.displayName as string).localeCompare(a.source.displayName as string));
      }
    }
  }

  setCategoricalDataBySubCategoriesRanking(categoricalData: any): void {
    const subCategoriesRankingSettings = this.rankingSettings.subCategoriesRanking;
    const categoricalValues = categoricalData.values as any;
    if (this.rankingSettings.isSubcategoriesRanking) {
      if (subCategoriesRankingSettings.filterType === RankingFilterType.TopN) {
        if (this.isHorizontalChart) {
          categoricalData.values = categoricalValues.slice(
            categoricalValues.length - subCategoriesRankingSettings.count,
            categoricalValues.length
          );
        } else {
          categoricalData.values = categoricalValues.slice(0, subCategoriesRankingSettings.count);
        }
      }

      if (subCategoriesRankingSettings.filterType === RankingFilterType.BottomN) {
        if (this.isHorizontalChart) {
          if (subCategoriesRankingSettings.count <= categoricalValues.length) {
            categoricalData.values = categoricalValues.slice(0, subCategoriesRankingSettings.count);
          }
        } else {
          if (subCategoriesRankingSettings.count <= categoricalValues.length) {
            categoricalData.values = categoricalValues.slice(
              categoricalValues.length - subCategoriesRankingSettings.count,
              categoricalValues.length
            );
          }
        }
      }
    }
  }

  setInitialChartDataByBrushScaleBand(categoricalData: powerbi.DataViewCategorical, clonedCategoricalData: powerbi.DataViewCategorical, brushScaleWidth: number, brushScaleHeight: number): powerbi.DataViewCategorical {
    if (this.isHorizontalChart) {
      categoricalData.categories.forEach((d) => {
        d.values = d.values.reverse();
      });

      categoricalData.values.forEach((d) => {
        d.values = d.values.reverse();

        if (d.highlights) {
          d.highlights = d.highlights.reverse();
        }
      });
    }

    const keys = categoricalData.values
      .map((v) => v.source.displayName)
      .filter((item, i, ar) => ar.indexOf(item) === i);

    const maxSubcategoriesLength = this.chartSettings.maxSubcategoriesLength;
    let categoricalSubcategoriesDataValues = categoricalData.values.filter((value) => value.source.groupName);
    if (
      !this.rankingSettings.isSubcategoriesRanking &&
      categoricalSubcategoriesDataValues.length &&
      categoricalData.values.length > 0 &&
      categoricalData.values.length > maxSubcategoriesLength
    ) {
      categoricalData.values.splice(maxSubcategoriesLength * keys.length, categoricalData.values.length);
    }

    this.sortBrushSubCategoriesData(categoricalData);
    this.setCategoricalDataBySubCategoriesRanking(categoricalData);

    categoricalSubcategoriesDataValues = categoricalData.values.filter((value) => value.source.groupName);

    const categoricalCategoriesValues = categoricalData.categories[this.categoricalCategoriesLastIndex];
    const categoricalMeasureValues = categoricalData.values.filter((value) => value.source.roles.measure);
    const categoricalMeasureDisplayName: any[] = categoricalMeasureValues
      .map((value) => value.source.displayName)
      .filter((item, i, ar) => ar.indexOf(item) === i);
    const categoricalRaceBarValues = categoricalData.categories.filter((value) => value.source.roles.raceBarData);
    const categories = categoricalCategoriesValues?.values.filter((item, i, ar) => ar.indexOf(item) === i) ?? [];
    this.isMultiMeasureValues = categoricalMeasureDisplayName.length > 1;
    this.isChartIsRaceBarChart = categoricalRaceBarValues.length > 0;
    this.categoryDisplayName = categoricalData.categories[this.categoricalCategoriesLastIndex]?.source.displayName;
    this.categoricalMeasureDisplayName = categoricalMeasureValues
      .map((value) => value.source.displayName)
      .filter((item, i, ar) => ar.indexOf(item) === i);

    if (!!categoricalRaceBarValues.length) {
      const categoricalDataPairsForGrouping = categoricalData.categories[this.categoricalCategoriesLastIndex].values.reduce(
        (arr, category: string, index: number) => {
          const obj = { category: category, [`index-${index}`]: index };
          return [...arr, obj];
        },
        []
      );

      const categoricalDataPairsGroup = d3.group(categoricalDataPairsForGrouping, (d: any) => d.category);
      this.categoricalDataPairs = categories.map((category) =>
        Object.assign({}, ...categoricalDataPairsGroup.get(category))
      );
    } else {
      this.categoricalDataPairs = categoricalData.categories[this.categoricalCategoriesLastIndex].values.reduce(
        (arr, category: string, index: number) => {
          const obj = { category: category };
          categoricalData.values.forEach((d) => {
            const roles = Object.keys(d.source.roles);
            roles.forEach((role) => {
              if (d.source.groupName) {
                obj[`${role}${d.source.index}${d.source.groupName}`] = d.values[index];
              } else {
                obj[`${role}${d.source.index}`] = d.values[index];
              }
            });
          });
          return [...arr, obj];
        },
        []
      );
    }

    this.categoricalDataPairsSortedByHigherValues = JSON.parse(JSON.stringify(this.categoricalDataPairs));

    // SORTED CATEGORICAL DATA PAIRS BY HIGHER VALUES 
    if (this.isMultiMeasureValues && !categoricalSubcategoriesDataValues.length) {
      const measureKeys = categoricalMeasureValues.map((d) => DataRolesName.Value + d.source.index);
      this.sortBrushCategoriesData(this.categoricalDataPairs, "category", measureKeys, categoricalMeasureValues);
    }

    if (categoricalSubcategoriesDataValues.length) {
      const measureKeys = categoricalSubcategoriesDataValues.map(
        (d) => DataRolesName.Value + d.source.index + d.source.groupName
      );
      this.sortBrushCategoriesData(this.categoricalDataPairs, "category", measureKeys, categoricalMeasureValues);
    }

    if (!this.isMultiMeasureValues && !categoricalSubcategoriesDataValues.length) {
      const measureKey = categoricalMeasureValues.map((d) => DataRolesName.Value + d.source.index);
      this.sortBrushCategoriesData(this.categoricalDataPairs, "category", measureKey, categoricalMeasureValues);
      this.sortBrushCategoriesData(this.categoricalDataPairsSortedByHigherValues, "category", measureKey, categoricalMeasureValues, true);
    }

    this.setCategoricalDataPairsByRanking();

    const clonedCategoricalRaceBarValues = clonedCategoricalData.categories.filter(
      (value) => value.source.roles.raceBarData
    );

    if (!!categoricalRaceBarValues.length) {
      let iterator: number = 0;
      this.categoricalDataPairs.forEach((dataPair) => {
        const keys = Object.keys(dataPair).splice(1);
        keys.forEach((key) => {
          const index = +key.split("-")[1];
          categoricalData.categories[this.categoricalCategoriesLastIndex].values[iterator] = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values[index];

          if (!!categoricalRaceBarValues.length) {
            categoricalRaceBarValues.forEach((categoricalRaceBarValue, i: number) => {
              categoricalRaceBarValue.values[iterator] = clonedCategoricalRaceBarValues[i].values[index];
            });
          }

          categoricalData.values.forEach((categoricalValue, i: number) => {
            categoricalValue.values[iterator] = clonedCategoricalData.values[i].values[index];

            if (categoricalValue.highlights) {
              categoricalValue.highlights[iterator] = clonedCategoricalData.values[i].highlights[index];
            }
          });

          iterator++;
        });
      });
    } else {
      categoricalData.categories[this.categoricalCategoriesLastIndex].values = this.categoricalDataPairs.map((d) => d.category);
      categoricalData.values.forEach((d, i) => {
        if (d.source.groupName) {
          d.values = this.categoricalDataPairs.map(
            (pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${d.source.groupName}`]
          );
        } else {
          d.values = this.categoricalDataPairs.map(
            (pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}`]
          );
        }
      });
    }

    // this.setBrushCategoriesDataByRanking(this.categoricalData);
    const dataLength = categoricalData.categories[this.categoricalCategoriesLastIndex].values.length;

    this.setBrushScaleBandDomain(categoricalData);

    this.setBrushScaleBandRange(brushScaleWidth, brushScaleHeight);

    this.brushScaleBandClone = this.brushScaleBand.copy();
    this.scaleBandWidth = this.brushScaleBandClone.bandwidth();
    this.brushScaleBandBandwidth = this.brushScaleBandClone.bandwidth();
    this.totalBarsCount = categoricalData.categories[this.categoricalCategoriesLastIndex].values.filter(
      (item, i, ar) => ar.indexOf(item) === i
    ).length;

    this.xScale = this.brushScaleBand;
    this.xScale2 = this.brushScaleBandClone;
    this.numericCategoriesBandScale = this.xScale;
    this.clonedNumericCategoriesBandScale = this.xScale2;

    const barDistance = Math.floor(this.brushScaleBandBandwidth) > this.minScaleBandWidth ? Math.floor(this.brushScaleBandBandwidth) : this.minScaleBandWidth;
    const expectedWidth = (barDistance * this.width) / this.brushScaleBandBandwidth;
    const expectedHeight = (barDistance * this.height) / this.brushScaleBandBandwidth;

    const minIndex = d3.minIndex(this.categoricalDataPairs, (d) => d3.sum(Object.keys(d), (key) => (key.includes("measure") ? d[key] : 0)));
    const maxIndex = d3.maxIndex(this.categoricalDataPairs, (d) => d3.sum(Object.keys(d), (key) => (key.includes("measure") ? d[key] : 0)));

    this.minCategoryValueDataPair = {
      category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[minIndex],
      value: <number>categoricalData.values[0].values[minIndex],
    };
    this.maxCategoryValueDataPair = {
      category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[maxIndex],
      value: <number>categoricalData.values[0].values[maxIndex],
    };

    this.firstCategoryValueDataPair = {
      category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[0],
      value: <number>categoricalData.values[0].values[0],
    };
    this.lastCategoryValueDataPair = {
      category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[dataLength - 1],
      value: <number>categoricalData.values[0].values[dataLength - 1],
    };

    if (this.isHorizontalChart) {
      if (Math.ceil(this.height) < expectedHeight) {
        this.isScrollBrushDisplayed = true;
        this.isVerticalBrushDisplayed = true;
        DrawVerticalBrush(this, barDistance, this.totalBarsCount, false);
      } else {
        this.isScrollBrushDisplayed = false;
        this.isVerticalBrushDisplayed = false;
        this.brushG.selectAll("*").remove();
      }
    } else {
      if (Math.ceil(this.width) < expectedWidth) {
        this.isScrollBrushDisplayed = true;
        this.isHorizontalBrushDisplayed = true;
        const brushXPos = this?.margin?.left ?? 0;
        const brushYPos = this.viewPortHeight - this.brushHeight - this.settingsBtnHeight - this.legendViewPort.height;

        const config: IBrushConfig = {
          brushG: this.brushG.node(),
          brushXPos: brushXPos,
          brushYPos: 100000,
          barDistance: barDistance,
          totalBarsCount: this.totalBarsCount,
          isOnlySetScaleDomainByBrush: false,
          scaleWidth: brushScaleWidth,
          scaleHeight: brushScaleHeight,
          smallMultiplesGridItemId: null,
          categoricalData: categoricalData
        }

        DrawHorizontalBrush(this, config);
      } else {
        this.isScrollBrushDisplayed = false;
        this.isHorizontalBrushDisplayed = false;
        this.brushG.selectAll("*").remove();
      }
    }

    if (this.width < expectedWidth || this.height < expectedHeight) {
      const startIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
      const endIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
        this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
      );

      const clonedCategoricalData = JSON.parse(JSON.stringify(categoricalData));

      clonedCategoricalData.categories.forEach((d, i) => {
        d.values = categoricalData.categories[i].values.slice(startIndex, endIndex + 1);
      });

      clonedCategoricalData.values.forEach((d, i) => {
        d.values = categoricalData.values[i].values.slice(startIndex, endIndex + 1);

        if (d.highlights) {
          d.highlights = categoricalData.values[i].highlights.slice(startIndex, endIndex + 1);
        }
      });

      this.setChartData(clonedCategoricalData, this.categoricalMetadata);
    }

    return categoricalData;
  }

  private renderContextMenu(): void {
    this.svg.on("contextmenu", (event) => {
      const dataPoint: any = d3.select(event.target).datum();
      this.selectionManager.showContextMenu(dataPoint && (dataPoint.identity ?? {}), {
        x: event.clientX,
        y: event.clientY,
      });
      event.preventDefault();
    });
  }

  setConditionalFormattingColor(): void {
    this.chartData.forEach((d) => {
      if (this.chartSettings.barType === BarType.Normal) {
        const conditionalFormattingColor = this.addConditionalFormattingColor(d, d.category);
        if (conditionalFormattingColor.match) {
          d.styles.bar.fillColor = conditionalFormattingColor.color;
        }
      } else {
        d.subCategories.forEach((s) => {
          const conditionalFormattingColor = this.addConditionalFormattingColor(s, d.category);
          if (conditionalFormattingColor.match) {
            s.styles.bar.fillColor = conditionalFormattingColor.color;
          }
        });
      }
    });
  }

  getTextSize(fontSize: number, isDisplay: boolean): number {
    let textSize: number;
    const textEle = this.svg
      .append("text")
      .attr("opacity", "0")
      .attr("font-size", fontSize)
      .attr("display", isDisplay ? "block" : "none")
      .text("text")
      .attr("", function () {
        textSize = this.getBBox().height;
      });
    textEle.remove();
    return textSize;
  }

  getCategoricalValuesIndexByKey(key: string): number {
    return this.visualUpdateOptions.options.dataViews[0].categorical.values?.findIndex(
      (data) => data.source.roles[key] === true
    );
  }

  getCategoricalCategoriesIndexByKey(key: string): number {
    return this.visualUpdateOptions.options.dataViews[0].categorical.categories?.findIndex(
      (data) => data.source.roles[key] === true
    );
  }

  getPureParsedString(text: string): string {
    return text.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
  }

  setChartData(categorical: any, categoricalMetadata: any): void {
    this.categoricalMetadata = categoricalMetadata;
    this.categoricalLegendsData = this.categoricalMetadata.columns.find((value) => value.roles.subCategory);

    const categoricalLegendsDataValues: any[] = categorical.values
      .map((value) => value.source.groupName)
      .filter((item, i, ar) => ar.indexOf(item) === i);
    const categoricalMeasureValues: any[] = categorical.values.filter((value) => value.source.roles.measure);
    const categoricalMeasureDisplayName: any[] = categoricalMeasureValues
      .map((value) => value.source.displayName)
      .filter((item, i, ar) => ar.indexOf(item) === i);
    const categoricalUpperBoundValues: any[] = categorical.values.filter((value) => value.source.roles.upperBound);
    const categoricalLowerBoundValues: any[] = categorical.values.filter((value) => value.source.roles.lowerBound);
    const categoricalRaceBarDataValues: any[] = categorical.categories.filter(
      (value) => value.source.roles.raceBarData
    );
    const categoricalTooltipValues: any[] = categorical.values.filter((value) => value.source.roles.tooltip);
    const categoricalImagesDataValues: any[] = categorical.values.filter((value) => value.source.roles.imagesData);
    const categoricalReferenceLinesValues: any[] = categorical.values.filter(
      (value) => value.source.roles.referenceLines
    );
    this.categoricalReferenceLinesValues = categoricalReferenceLinesValues ?? [];

    const upperBoundValues = categorical.values.find((value) => value.source.roles.upperBound)?.values ?? [];
    const lowerBoundValues = categorical.values.find((value) => value.source.roles.lowerBound)?.values ?? [];
    const uniqueCategories = categorical.categories[this.categoricalCategoriesLastIndex].values.filter((item, i, ar) => ar.indexOf(item) === i);
    this.categoricalReferenceLinesNames = this.categoricalReferenceLinesValues.map((d) => d.source.displayName);
    this.categoricalReferenceLinesNames = this.categoricalReferenceLinesNames.filter(
      (item, i, ar) => ar.indexOf(item) === i
    );

    this.categoryTitle = categorical.categories[this.categoricalCategoriesLastIndex].source.displayName;
    this.valuesTitle = categorical.values[0].source.displayName;
    this.categoryDisplayName = categorical.categories[this.categoricalCategoriesLastIndex]?.source.displayName;
    this.subCategoryDisplayName = this.categoricalLegendsData?.displayName;
    this.categoricalMeasureDisplayName = categoricalMeasureDisplayName;
    this.valueDisplayName = categorical.values[0]?.source.displayName;
    this.isMultiMeasureValues = categoricalMeasureDisplayName.length > 1;
    this.isHasSubcategories = !!this.categoricalLegendsData || this.isMultiMeasureValues;
    this.isHasCategories = this.getCategoricalCategoriesIndexByKey(DataRolesName.Category) !== -1;
    this.isHasImagesData =
      categoricalImagesDataValues &&
      categoricalImagesDataValues[0] &&
      (categoricalImagesDataValues[0].source.type.text === "ImageUrl" ||
        categoricalImagesDataValues[0].source.type.category === "ImageUrl");
    this.isChartIsRaceBarChart = !!categoricalRaceBarDataValues.length;
    this.raceBarKeysList = [];
    this.isHasErrorLowerBounds = this.getCategoricalValuesIndexByKey(DataRolesName.LowerBound) !== -1;
    this.isHasErrorUpperBounds = this.getCategoricalValuesIndexByKey(DataRolesName.UpperBound) !== -1;
    this.isShowErrorBars = this.isHasErrorLowerBounds || this.isHasErrorUpperBounds;

    this.isXIsNumericAxis = categorical.categories[this.categoricalCategoriesLastIndex].source.type.numeric;
    this.isYIsNumericAxis = categorical.categories[this.categoricalCategoriesLastIndex].source.type.numeric;

    this.isXIsContinuousAxis = this.isXIsNumericAxis && this.xAxisSettings.categoryType === AxisCategoryType.Continuous;
    this.isYIsContinuousAxis = this.isYIsNumericAxis && this.yAxisSettings.categoryType === AxisCategoryType.Continuous;

    const raceBarKeyLabelList: { key: string; label: string }[] =
      categoricalRaceBarDataValues[0]?.values
        ?.reduce((arr, cur, index) => {
          const values = categoricalRaceBarDataValues.map((r) => r.values[index]);
          const key = values.join("-");
          const label = values.join(" ");
          arr = [...arr, { key, label }];
          return arr;
        }, [])
        .filter((item, i, ar) => ar.findIndex((f) => f.key === item.key) === i) ?? [];

    // SET CHART SETTINGS
    const formatTab = this.visualUpdateOptions.formatTab;
    const chartConfig = JSON.parse(formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]);
    this.chartSettings = {
      ...CHART_SETTINGS,
      ...chartConfig,
    };

    // SET NUMBER SETTINGS
    this.numberSettings = formatTab[EVisualSettings.NumberSettings];

    // SET ERROR BARS SETTINGS
    const errorBarsConfig = JSON.parse(formatTab[EVisualConfig.ErrorBarsConfig][EVisualSettings.ErrorBarsSettings]);
    this.errorBarsSettings = {
      ...ERROR_BARS_SETTINGS,
      ...errorBarsConfig,
    };

    this.isGroupedStackedBar = this.isMultiMeasureValues && !!this.categoricalLegendsData;

    let categoricalCategories: { name: string; color: string }[] = [];

    this.setAutoBarType();

    this.isNormalBarChart = this.chartSettings.barType === BarType.Normal;
    this.isGroupedBarChart = this.chartSettings.barType === BarType.Grouped;
    this.isStackedBarChart = this.chartSettings.barType === BarType.Stacked;

    if (this.chartSettings.barType === BarType.Grouped || this.chartSettings.barType === BarType.Normal) {
      this.chartSettings.isPercentageStackedBar = false;
    }

    this.isPercentageStackedBar =
      this.chartSettings.barType === BarType.Stacked && this.chartSettings.isPercentageStackedBar;

    // Set Total Categorical Data Fields Count
    if (this.chartSettings.barType === BarType.Stacked) {
      this.totalCategoricalFieldsCount =
        categoricalLegendsDataValues.length +
        categoricalTooltipValues.length +
        categoricalRaceBarDataValues.length +
        categoricalMeasureValues.length;
    }

    if (this.isMultiMeasureValues) {
      this.subCategories = categoricalMeasureDisplayName.map((value) => ({
        name: value,
        color: "",
      }));
      this.categoriesForLegend = JSON.parse(JSON.stringify(this.subCategories));
    }

    if (this.categoricalLegendsData) {
      categoricalCategories = categoricalLegendsDataValues.map((value) => ({
        name: value.toString(),
        color: "",
      }));
      this.categoricalSubcategoriesNames = categoricalCategories.map((d) => d.name);
      // this.categoriesForLegend = JSON.parse(JSON.stringify(this.subCategories));
      // this.subCategories = JSON.parse(JSON.stringify(categoricalCategories));

      if (!this.isGroupedStackedBar) {
        this.subCategories = JSON.parse(JSON.stringify(categoricalCategories));
        this.categoriesForLegend = JSON.parse(JSON.stringify(this.subCategories));
      }
    }

    if (this.isGroupedStackedBar) {
      this.categoriesForLegend = categoricalCategories;
    }

    this.subCategories = this.subCategories.filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
    this.categoriesForLegend = this.categoriesForLegend.filter(
      (v, i, a) => a.findIndex((t) => t.name === v.name) === i
    );

    // FOR LEGEND DATA
    const getLegendCategoriesByCategory = (idx: number): any => {
      const getTooltipFields = (subCatName: string, idx: number): IVisualTooltipData[] => {
        return categoricalTooltipValues
          .filter((val) => val.source.groupName === subCatName)
          .map((d) => ({ displayName: d.source.displayName, value: d.values[idx] }));
      };

      const subCategories = categoricalLegendsDataValues.reduce((arr, cat, i) => {
        const value = categoricalMeasureValues[i].values[idx];
        const category = {
          category: cat,
          value: value ?? 0,
          isHighlight: categoricalMeasureValues[i].highlights
            ? categoricalMeasureValues[i].highlights[idx] !== null
            : false,
          styles: { bar: { fillColor: "" } },
          isOther: false,
          tooltipFields: getTooltipFields(<string>cat, idx) ?? [],
        };
        arr.push(category);
        return arr;
      }, []);
      return subCategories;
    };

    let categoricalDataPairs = [];
    if (!!categoricalRaceBarDataValues.length && !this.categoricalLegendsData) {
      const categoricalDataPairsForGrouping = this.categoricalData.categories[this.categoricalCategoriesLastIndex].values.reduce(
        (arr, category: string, index: number) => {
          const obj = { category: category, [`index-${index}`]: index };
          return [...arr, obj];
        },
        []
      );

      const categoricalDataPairsGroup = d3.group(categoricalDataPairsForGrouping, (d: any) => d.category);
      categoricalDataPairs = uniqueCategories.map((category) =>
        Object.assign({}, ...categoricalDataPairsGroup.get(category))
      );
    }

    const setSubCategoriesByMultiMeasureValues = (idx: number): any => {
      const subCategories = categoricalMeasureDisplayName.reduce((arr, value, i): any[] => {
        const measureValue = categoricalMeasureValues.find((val) => val.source.displayName === value);
        const val = measureValue.values[idx];
        const category = {
          category: value,
          value: val ?? 0,
          isHighlight: measureValue.highlights ? measureValue.highlights[idx] !== null : false,
          styles: { bar: { fillColor: "" } },
          isOther: false,
        };
        arr.push(category);
        return arr;
      }, []);
      subCategories.forEach((s) => {
        s.tooltipFields =
          categoricalTooltipValues?.map((v) => ({ displayName: v.source.displayName, value: v.values[0] })) ?? [];
      });
      return subCategories;
    };

    const setSubCategoriesByMultiMeasureValuesAndCategory = (
      idx: number,
      categoryName: string
    ): { subCategories: IVisualSubCategoryData[]; metaData: { groupedCategoryTotal: { [key: string]: number } } } => {
      const getTooltipFields = (subCatName: string, idx: number): IVisualTooltipData[] => {
        return categoricalTooltipValues
          .filter((val) => val.source.groupName === subCatName)
          .map((d) => ({ displayName: d.source.displayName, value: d.values[idx] }));
      };

      const groupedCategoryTotal = {};
      const subCategories = categoricalLegendsDataValues?.reduce((arr, cat, i): any[] => {
        categoricalMeasureDisplayName.forEach((value, j) => {
          const measureValue = categoricalMeasureValues.find(
            (val) => val.source.displayName === value && val.source.groupName === cat
          );

          const category = {
            category: cat,
            parentCategory: categoryName,
            groupedCategory: value,
            value: measureValue.values[idx] ?? 0,
            styles: { bar: { fillColor: "" } },
            isOther: false,
            isHighlight: measureValue.highlights ? measureValue.highlights[idx] !== null : false,
            tooltipFields: getTooltipFields(<string>cat, idx) ?? [],
          };
          arr.push(category);
        });
        return arr;
      }, []);
      return { subCategories, metaData: { groupedCategoryTotal: groupedCategoryTotal } };
    };

    const getSubCategories = (idx: number, category: string) => {
      if (this.isGroupedStackedBar) {
        return setSubCategoriesByMultiMeasureValuesAndCategory(idx, category);
      } else if (this.categoricalLegendsData) {
        return getLegendCategoriesByCategory(idx);
      } else if (this.isMultiMeasureValues) {
        return setSubCategoriesByMultiMeasureValues(idx);
      } else {
        return [];
      }
    };

    const isErrorBarsAbsoluteRelation =
      this.errorBarsSettings.relationshipToMeasure === ERelationshipToMeasure.Absolute;

    let iterator = 0;
    const data = uniqueCategories.reduce((arr, category) => {
      (!!raceBarKeyLabelList.length ? raceBarKeyLabelList : [{ key: "", label: "" }]).forEach((raceBarKeyLabel) => {
        let raceBarKeyDataLabelPair: { key: string; dataLabel: string; metadata: { [role: string]: string } } = {
          key: "",
          dataLabel: "",
          metadata: {},
        };
        let raceBarKey = raceBarKeyLabel.key;
        let raceBarDataLabel = raceBarKeyLabel.label;

        const subCategories = getSubCategories(<number>iterator, <string>category);
        const value = <number>(
          categorical.values[this.getCategoricalValuesIndexByKey(DataRolesName.Value)]?.values[iterator]
        );

        const highlights = categorical.values[this.getCategoricalValuesIndexByKey(DataRolesName.Value)]?.highlights;
        const isHighlight = highlights?.length ? <boolean>(highlights[iterator] !== null) : false;

        let lb: number;
        let ub: number;
        let lowerBoundValue: number;
        let upperBoundValue: number;

        const checkIfNaN = (bound) => (isNaN(bound) ? undefined : bound);
        if (this.errorBarsSettings.isEnabled) {
          lb = parseFloat(<string>lowerBoundValues[iterator]);
          ub = parseFloat(<string>upperBoundValues[iterator]);
          lowerBoundValue = isErrorBarsAbsoluteRelation ? lb : value + lb;
          upperBoundValue = isErrorBarsAbsoluteRelation ? ub : value + ub;
        }

        if (this.isChartIsRaceBarChart) {
          this.raceBarKeysList.push(raceBarKey);
        }

        const getTooltipFields = (idx: number): IVisualTooltipData[] => {
          return categoricalTooltipValues.map((d) => ({ displayName: d.source.displayName, value: d.values[idx] }));
        };

        const getBoundForTooltip = (isUpperBound: boolean): string => {
          let bound: number;
          switch (this.errorBarsSettings.tooltipLabelFormat) {
            case EErrorBarsTooltipLabelFormat.Absolute:
              bound = isUpperBound ? checkIfNaN(ub) : checkIfNaN(lb);
              break;
            case EErrorBarsTooltipLabelFormat.RelativeNumeric:
              bound = isUpperBound ? checkIfNaN(value + ub) : checkIfNaN(value + lb);
              break;
            case EErrorBarsTooltipLabelFormat.RelativePercentage:
              bound = isUpperBound ? (checkIfNaN(ub) / value) * 100 : (checkIfNaN(lb) / value) * 100;
              break;
          }
          return bound
            ? this.errorBarsSettings.tooltipLabelFormat !== EErrorBarsTooltipLabelFormat.RelativePercentage
              ? GetFormattedNumber(this, bound, true)
              : bound.toFixed(2) + "%"
            : undefined;
        };

        const getBarId = (): string => {
          return (
            category +
            "-" +
            this.totalCategoricalFieldsCount +
            "-" +
            this.chartSettings.barType +
            "-" +
            isHighlight +
            "-"
          );
        };

        let obj: IVisualCategoryData = {
          id: getBarId(),
          category: <string>category.toString(),
          raceBarKey: raceBarKey,
          raceBarDataLabel: raceBarDataLabel,
          value: value ?? 0,
          isHighlight,
          tooltipFields: getTooltipFields(iterator) ?? [],
          subCategories: this.isGroupedStackedBar ? subCategories.subCategories : subCategories,
          isOther: <string>category.toString() === this.othersBarText ? true : false,
          imageDataUrl: <string>(
            categorical.values[this.getCategoricalValuesIndexByKey(DataRolesName.ImagesData)]?.values[iterator]
          ),
          styles: {
            bar: { fillColor: "" },
          },
          metaData: subCategories.metaData,
          selected: false,
          identity: null,
        };

        if (this.errorBarsSettings.isEnabled) {
          obj = {
            ...obj,
            lowerBoundValue: checkIfNaN(lowerBoundValue),
            upperBoundValue: checkIfNaN(upperBoundValue),
            tooltipLowerBoundValue: getBoundForTooltip(false),
            tooltipUpperBoundValue: getBoundForTooltip(true),
            boundsTotal: (checkIfNaN(lowerBoundValue) ?? 0) + (checkIfNaN(upperBoundValue) ?? 0),
          };
        }
        arr.push(obj);
        iterator++;
      });
      return arr;
    }, []);

    const getBoundForSubCategoryTooltip = (
      subCategory: IVisualSubCategoryData,
      isUpperBound: boolean,
      lowerBound: number,
      upperBound: number
    ): string => {
      let bound: number;
      const boundByIdx = isUpperBound ? upperBound : lowerBound;
      switch (this.errorBarsSettings.tooltipLabelFormat) {
        case EErrorBarsTooltipLabelFormat.Absolute:
          bound = boundByIdx;
          break;
        case EErrorBarsTooltipLabelFormat.RelativeNumeric:
          bound = subCategory.value + boundByIdx;
          break;
        case EErrorBarsTooltipLabelFormat.RelativePercentage:
          bound = (boundByIdx / subCategory.value) * 100;
          break;
      }
      return bound
        ? this.errorBarsSettings.tooltipLabelFormat !== EErrorBarsTooltipLabelFormat.RelativePercentage
          ? GetFormattedNumber(this, bound, true)
          : bound.toFixed(2) + "%"
        : undefined;
    };

    const getSubCategoryLowerBoundValue = (categoryIdx: number, subCategoryIdx: number) => {
      return categoricalLowerBoundValues[subCategoryIdx]?.values[categoryIdx];
    };

    const getSubCategoryUpperBoundValue = (categoryIdx: number, subCategoryIdx: number) => {
      return categoricalUpperBoundValues[subCategoryIdx]?.values[categoryIdx];
    };

    if (this.chartSettings.barType === BarType.Grouped && this.errorBarsSettings.isEnabled) {
      data.forEach((d, i) => {
        d.subCategories.forEach((s, j) => {
          const lowerBoundValue = getSubCategoryLowerBoundValue(i, j);
          const upperBoundValue = getSubCategoryUpperBoundValue(i, j);
          s.lowerBoundValue = isErrorBarsAbsoluteRelation ? lowerBoundValue : s.value + lowerBoundValue;
          s.upperBoundValue = isErrorBarsAbsoluteRelation ? upperBoundValue : s.value + upperBoundValue;
          s.tooltipLowerBoundValue = getBoundForSubCategoryTooltip(s, false, lowerBoundValue, upperBoundValue);
          s.tooltipUpperBoundValue = getBoundForSubCategoryTooltip(s, true, lowerBoundValue, upperBoundValue);
          s.boundsTotal = (s.upperBoundValue ?? 0) + (s.lowerBoundValue ?? 0);
        });
      });
    }

    if (this.isChartIsRaceBarChart) {
      this.raceBarKeysList = this.raceBarKeysList.filter((item, i, ar) => ar.indexOf(item) === i);
      this.raceBarKeysLength = this.raceBarKeysList.length - 1;
      this.raceBarKeysList.forEach((raceBarKey) => {
        uniqueCategories.forEach((category) => {
          const isHasCategoryOnDate = data.find((d) => d.raceBarKey === raceBarKey && d.category === category);
          if (!isHasCategoryOnDate) {
            data.push({
              category: <string>category,
              raceBarKey: raceBarKey,
              raceBarDataLabel: "",
              value: 0,
              isOther: false,
              imageDataUrl: null,
              styles: {
                bar: { fillColor: "" },
              },
              subCategories: [],
              selected: false,
              identity: null,
            });
          }
        });
      });
    }

    // this.chartData[this.chartData.length - 2].value = -this.chartData[this.chartData.length - 2].value / 2;
    // this.chartData[this.chartData.length - 1].value = -this.chartData[this.chartData.length - 1].value;

    // data[0].subCategories[0].value = -50000;
    // data[0].subCategories[1].value = -50000;
    // this.chartData[1].subCategories[0].value = -10000;
    // this.chartData[2].subCategories[1].value = -this.chartData[2].subCategories[1].value;

    if (this.isMultiMeasureValues || this.isHasSubcategories) {
      data.forEach((d) => {
        if (d.subCategories.length > 0) {
          d.value = d3.sum(d.subCategories, (cat: any) => cat.value);
        }
      });
    }

    this.setDataSelectionId(categorical, data);

    if (this.isChartIsRaceBarChart) {
      this.setSubCategoriesMap(data);
      this.raceBarChartData = JSON.parse(JSON.stringify(data));
      this.raceBarChartData = uniqueCategories.reduce((acc, category) => {
        this.raceBarKeysList.forEach((key) => {
          acc = [...acc, this.raceBarChartData.find((d) => d.category === category && d.raceBarKey === key)];
        });
        return acc;
      }, []);

      this.tickIndex = -1;
      const setDataWithAllPositiveCategory = () => {
        this.tickIndex++;
        this.chartData = this.raceBarChartData.filter((d) => d.raceBarKey === this.raceBarKeysList[this.tickIndex]);
        this.clonedChartData = JSON.parse(JSON.stringify(this.chartData));
      };

      setDataWithAllPositiveCategory();

      this.raceBarKeyOnTick = this.raceBarKeysList[this.tickIndex];
      this.raceBarDataLabelOnTick = this.chartData[0]?.raceBarDataLabel;

      this.sortCategoriesData();
      // this.sortSubcategoriesData();
    } else {
      this.chartData = data;
      this.clonedChartData = JSON.parse(JSON.stringify(this.chartData));
      this.setSubCategoriesMap(this.chartData);
    }

    if (this.chartData.some((d) => d.category === this.othersBarText)) {
      const othersDataFieldIndex = this.chartData.findIndex((c) => c.category === this.othersBarText);
      const othersDataField = this.chartData.find((c) => c.category === this.othersBarText);
      this.chartData.splice(othersDataFieldIndex, 1);
      this.chartData.push(othersDataField);
    }
  }

  setDataSelectionId(categorical: any, data: IVisualCategoryData[]): void {
    const categoricalData = this.visualUpdateOptions.options.dataViews[0];
    const series: any[] = categoricalData.categorical.values.grouped();
    const selectionIdsMetaData = [];

    let smallMultiplesDataPair;
    let smallMultiplesDataPairIndexes;

    if (this.isSmallMultiplesEnabled && this.isHasSmallMultiplesData) {
      smallMultiplesDataPair = this.smallMultiplesDataPairs.find(d => d.category === this.smallMultiplesCategoriesName[this.currentSmallMultipleIndex]);
      smallMultiplesDataPairIndexes = Object.keys(smallMultiplesDataPair).splice(2).map(d => +d.split("-")[1]);
    }

    data.forEach((d: IVisualCategoryData, i: number) => {
      series.forEach((ser: powerbi.DataViewValueColumnGroup) => {
        ser.values.forEach((s) => {
          const seriesSelectionId = this.visualHost
            .createSelectionIdBuilder()
            .withCategory(categoricalData.categorical.categories[this.categoricalCategoriesLastIndex] as any, this.isSmallMultiplesEnabled && this.isHasSmallMultiplesData ? smallMultiplesDataPairIndexes[i] : i)
            .withSeries(categoricalData.categorical.values as any, ser)
            .withMeasure(s.source.queryName)
            .createSelectionId();

          const obj = {
            category: d.category,
            subCategory: ser.name,
            measure: s.source.displayName,
            selectionId: seriesSelectionId,
          };
          selectionIdsMetaData.push(obj);
        });
      });
    });

    data.forEach((d) => {
      if (this.isNormalBarChart) {
        const selectionId = selectionIdsMetaData.find((a) => a.category === d.category)?.selectionId;
        d.selectionId = selectionId;
        d.identity = selectionId;
      } else {
        d.subCategories.forEach((s) => {
          let selectionId: any;
          if (!this.isGroupedStackedBar) {
            if (this.isMultiMeasureValues && !this.categoricalLegendsData) {
              selectionId = selectionIdsMetaData.find((a) => a.category === d.category)?.selectionId;
            } else {
              selectionId = selectionIdsMetaData.find(
                (a) => a.category === d.category && a.subCategory === s.category
              )?.selectionId;
            }
          } else {
            selectionId = selectionIdsMetaData.find(
              (a) => a.category === d.category && a.subCategory === s.category
            )?.selectionId;
          }

          s.selectionId = selectionId;
          s.identity = selectionId;
        });
      }
    });
  }

  sortSubcategoriesData(): void {
    let legendSettings: ILegendSortSettings;
    if (this.sortingSettings.isCustomSortEnabled) {
      legendSettings = this.sortingSettings.legend;
    } else {
      const categoricalSubCategoryField = this.categoricalMetadata.columns.find(d => Object.keys(d.roles).includes(DataRolesName.SubCategory));

      if (categoricalSubCategoryField) {
        const isNativeSortByLegend = Object.keys(categoricalSubCategoryField).includes("sort");
        if (isNativeSortByLegend) {
          legendSettings = { sortBy: categoricalSubCategoryField.displayName, sortOrder: this.powerBiNativeSortOrder[categoricalSubCategoryField.sort] };
        } else {
          legendSettings = this.sortingSettings.legend;
        }
      } else {
        legendSettings = this.sortingSettings.legend;
      }
    }

    if (legendSettings.sortOrder === ESortOrder.Descending) {
      this.subCategories = this.subCategories.sort((a, b) => a.name.localeCompare(b.name));
      this.subCategoriesName = this.subCategoriesName.sort((a, b) => a.localeCompare(b));
      this.categoriesForLegend = this.categoriesForLegend.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.subCategories = this.subCategories.sort((a, b) => b.name.localeCompare(a.name));
      this.subCategoriesName = this.subCategoriesName.sort((a, b) => b.localeCompare(a));
      this.categoriesForLegend = this.categoriesForLegend.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (legendSettings.sortOrder === ESortOrder.Descending) {
      this.chartData.forEach((d) => {
        d.subCategories.sort((a, b) => a.category.localeCompare(b.category));
      });
    } else if (legendSettings.sortOrder === ESortOrder.Ascending) {
      this.chartData.forEach((d) => {
        d.subCategories.sort((a, b) => b.category.localeCompare(a.category));
      });
    }
  }

  addConditionalFormattingColor(
    node: IVisualCategoryData | IVisualSubCategoryData,
    category: string
  ): { match: boolean; color: string } {
    const conditionalFormattingResult = isConditionMatch(
      node,
      this.conditionalFormattingConditions,
      this.chartSettings.barType,
      category
    );
    return conditionalFormattingResult;
  }

  setSubCategoriesMap(chartData: IVisualCategoryData[]): void {
    chartData.forEach((d) => {
      d.subCategories.forEach((s) => {
        this.subCategoriesMap[s.category] = s;
      });
    });
  }

  setStackedGroupedBarChartData(): void {
    this.categoriesName = this.chartData.map((d) => d.category);
    this.subCategoriesName = this.subCategories.map((d) => d.name);
    this.stackedGroupedSubCategoryNames = [];

    let chartData: any[] = [];
    let groupedChartData: any[] = [];

    if (!this.isGroupedStackedBar) {
      chartData = this.chartData.reduce((arr, d) => {
        const obj = { category: d.category, groupedCategory: "", components: [], tooltipFields: {} };
        d.subCategories.forEach((s) => {
          if (this.chartSettings.barType === BarType.Stacked) {
            obj[s.category] = s.value;
            const subCategorySelectionId = { [s.category]: { selectionId: s.selectionId, isHighlight: s.isHighlight } };
            obj.components.push(subCategorySelectionId);
            obj.tooltipFields[s.category] = s.tooltipFields;
          } else if (this.chartSettings.barType === BarType.Grouped) {
            obj[s.category] = {
              color: s.styles.bar.fillColor,
              pattern: s.pattern,
              value: s.value,
              isHighlight: s.isHighlight,
              tooltipFields: s.tooltipFields,
              lowerBoundValue: s.lowerBoundValue,
              upperBoundValue: s.upperBoundValue,
              tooltipLowerBoundValue: s.tooltipLowerBoundValue,
              tooltipUpperBoundValue: s.tooltipUpperBoundValue,
              boundsTotal: s.boundsTotal,
              isOther: s.isOther,
              selectionId: s.selectionId,
            };
          }
        });
        return [...arr, obj];
      }, []);
    }

    if (this.isGroupedStackedBar) {
      this.chartData.forEach((d) => {
        let chartDataObj = [];
        let groupedChartDataObj = [];
        this.subCategoriesName.forEach((sName) => {
          let cObj = { category: d.category, groupedCategory: sName, components: [], tooltipFields: {} };
          let gObj = { category: d.category, groupedCategory: sName, minValue: d?.minValue, maxValue: d?.maxValue };
          chartDataObj.push(cObj);
          groupedChartDataObj.push(gObj);
        });

        d.subCategories.forEach((s) => {
          const cId = chartDataObj.findIndex((o) => o.groupedCategory === s.groupedCategory);
          if (!chartDataObj[cId][s.category]) {
            chartDataObj[cId][s.category] = s.value;
            chartDataObj[cId].selectionId = s.selectionId;
            const subCategorySelectionId = { [s.category]: { selectionId: s.selectionId, isHighlight: s.isHighlight } };
            chartDataObj[cId].components.push(subCategorySelectionId);
            chartDataObj[cId].tooltipFields = { ...chartDataObj[cId].tooltipFields, [s.category]: s.tooltipFields };
          }

          const gId = groupedChartDataObj.findIndex((o) => o.groupedCategory === s.groupedCategory);
          if (!groupedChartDataObj[gId][s.category]) {
            groupedChartDataObj[gId][s.category] = {
              color: s.styles.bar.fillColor,
              pattern: s.pattern,
              value: s.value,
              isOther: s.isOther,
              minValue: d?.minValue,
              maxValue: d?.maxValue,
            };
          }
        });
        chartData = [...chartData, ...chartDataObj];
        groupedChartData = [...groupedChartData, ...groupedChartDataObj];
      }, []);

      // SET SUBCATEGORIES TOTAL
      this.stackedGroupedSubCategoryNames = Object.keys(
        groupedChartData.length ? groupedChartData[this.isHorizontalChart ? groupedChartData.length - 1 : 0] : {}
      )?.splice(4);

      // SET CATEGORIES FOR LEGEND
      // this.categoriesForLegend = this.categoriesForLegend.filter((category) =>
      //     this.stackedGroupedSubCategoryNames.includes(category.name)
      // );

      if (
        (this.rankingSettings.isCategoriesRanking && this.rankingSettings.showRemainingAsOthers) ||
        (this.rankingSettings.isSubcategoriesRanking && this.rankingSettings.subCategoriesRanking.showRemainingAsOthers)
      ) {
        // this.stackedGroupedSubCategoryNames.push(this.othersBarText);
      }

      this.stackedGroupedSubCategoryNames = this.stackedGroupedSubCategoryNames.filter(
        (v, i, a) => a.findIndex((t) => t === v) === i
      );

      let subCategoriesValuesTotal = 0;
      groupedChartData.forEach((d) => {
        this.stackedGroupedSubCategoryNames.forEach((k) => {
          subCategoriesValuesTotal += d[k] ? Math.abs(+d[k].value) : 0;
        });
        d.value = subCategoriesValuesTotal;
        subCategoriesValuesTotal = 0;
      });
    }

    if (this.chartSettings.isPercentageStackedBar) {
      chartData.forEach((d) => {
        let total = 0;
        this.categoricalSubCategoriesList.forEach((s) => {
          total += (d[s] > 0 ? d[s] : -d[s]);
        });
        this.categoricalSubCategoriesList.forEach((s) => {
          if (d[s] > 0) {
            d[s] = ((d[s] > 0 ? d[s] : -d[s]) / total) * 100;
          } else {
            d[s] = -((d[s] > 0 ? d[s] : -d[s]) / total) * 100;
          }
        });
      })
    }

    let stackKeys = this.isGroupedStackedBar ? this.stackedGroupedSubCategoryNames : this.subCategoriesName;
    const barType = this.chartSettings.barType;
    if (barType === BarType.Stacked || barType === BarType.GroupedStacked) {
      const stackedBarData = d3.stack().keys(stackKeys)(chartData);
      const filteredStackedBarData = stackedBarData.reduce((arr, barData) => {
        const items: any[] = [];
        items["key"] = barData.key;
        items["index"] = barData.index;
        barData.forEach((d) => {
          const isNotValidItem = d.some((item) => isNaN(item));
          if (!isNotValidItem) {
            items.push(d);
          }
        });
        arr = [...arr, items];
        return arr;
      }, []);
      this.stackedBarChartData = filteredStackedBarData;
    }

    if (this.chartSettings.barType === BarType.Stacked || this.chartSettings.barType === BarType.GroupedStacked) {
      chartData.forEach((d: any) => {
        var y0_positive = 0;
        var y0_negative = 0;

        const data = d;
        const getStackedBarId = (key: string, data: any, component: any): string => {
          return (
            key +
            "-" +
            data?.category +
            "-" +
            data?.groupedCategory +
            "-" +
            this.subCategories.findIndex((d) => d.name === key) +
            "-" +
            this.totalCategoricalFieldsCount +
            "-" +
            this.chartSettings.barType +
            "-" +
            component.isHighlight +
            "-" +
            this.isPercentageStackedBar
          );
        };

        const components = stackKeys.reduce((acc, key) => {
          const barColor = this.getSubCategoryColorByCategoryName(key, data?.category, data?.groupedCategory, false);

          const setStackedBarTooltipData = (key: string, value: number, barColor: string, d: any) => {
            const category = this.subCategoriesMap[key];
            return {
              category: key,
              value: value,
              selectionId: this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId(),
              styles: { bar: { fillColor: barColor } },
              tooltipFields: d?.tooltipFields ? d.tooltipFields[key] : [],
              pattern: category.pattern,
            };
          };

          const component = data?.components?.length ? data?.components?.find((c) => c[key])[key] : [];
          const selectionId = barType === BarType.GroupedStacked ? component?.selectionId : component?.selectionId;
          const obj = {
            selectionId: selectionId,
            identity: selectionId,
            id: getStackedBarId(key, data, component),
            tooltip: {
              ...setStackedBarTooltipData(key, data[key], barColor, d),
              parentCategory: data?.category,
              groupedCategory: data?.groupedCategory,
            },
            category: key,
            isHighlight: component?.isHighlight,
            parentCategory: data?.category,
            pattern: this.subCategoriesMap[key]?.pattern,
            barColor: barColor,
            isOther: this.getSubCategoryByCategoryName(key).isOther,
            label: { category: key, value: data[key] },
          };

          if (d[key] >= 0) {
            acc = [
              ...acc,
              {
                key: key,
                1: y0_positive,
                0: (y0_positive += d[key]),
                data: data,
                ...obj,
              },
            ];
          } else if (d[key] < 0) {
            acc = [
              ...acc,
              {
                key: key,
                0: y0_negative,
                1: (y0_negative += d[key]),
                data: data,
                ...obj,
              },
            ];
          }
          return acc;
        }, []);

        d.components = components;
      });
    }

    this.stackedBarChartData = chartData;

    this.chartData.forEach((d) => {
      const stackedData = this.stackedBarChartData.find((s) => s.category === d.category);
      const suvCategoriesNames = this.isGroupedStackedBar ? this.categoricalSubcategoriesNames : this.subCategoriesName;
      const values = suvCategoriesNames.reduce((acc, name) => {
        return [...acc, stackedData[name] ?? 0];
      }, []);
      const minMaxValues = d3.extent(values);
      d.positiveValueTotal = d3.sum(
        values.filter((d) => d >= 0),
        (d) => d
      );
      d.negativeValueTotal = d3.sum(
        values.filter((d) => d <= 0),
        (d) => d
      );
      d.minValue = minMaxValues[0];
      d.maxValue = minMaxValues[1];
    });

    if (barType === BarType.Grouped) {
      this.groupedBarChartData = chartData;
    }

    groupedChartData.forEach((d) => {
      const values = this.stackedGroupedSubCategoryNames.reduce((acc, cur) => {
        acc = d[cur] ? [...acc, d[cur]] : acc;
        return acc;
      }, []);

      const start = d3.sum(
        values.filter((d) => d.value >= 0),
        (d: any) => d.value
      );

      const end = d3.sum(
        values.filter((d) => d.value < 0),
        (d: any) => d.value
      );

      d.minValue = end;
      d.maxValue = start;
      d.positiveValueTotal = start;
      d.negativeValueTotal = end;
    });

    if (barType === BarType.GroupedStacked) {
      this.groupedBarChartData = groupedChartData;
    }

    this.setSubCategoriesMap(this.chartData);

    if (this.chartSettings.isPercentageStackedBar) {
      this.chartData.forEach((d) => {
        d.value = 100;
      });
    }
  }

  setChartDataByRanking(): void {
    const rankingSettings = this.rankingSettings;
    const getOthersSubCategoriesDataField = (values: number, i?: number): IVisualSubCategoryData => {
      return {
        category: i ? this.othersBarText + i : this.othersBarText,
        groupedCategory: i ? this.othersBarText + i : this.othersBarText,
        value: values,
        styles: { bar: { fillColor: "rgb(84, 84, 84)" } },
        tooltipFields: [],
        selectionId: this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId(),
        isHighlight: false,
      };
    };

    const getOthersGroupedSubCategoriesDataField = (
      othersSubCategoriesData: IVisualSubCategoryData[],
      isSubcategoriesRanking: boolean = false
    ): IVisualSubCategoryData[] => {
      const othersDataValues = (groupedCategoryName: string) => {
        if (isSubcategoriesRanking) {
          const data = othersSubCategoriesData.filter((d) => d.groupedCategory === groupedCategoryName);
          return d3.sum(data, (d) => {
            return d.value;
          });
        } else
          return d3.sum(this.othersBarData, (d) => {
            return d.metaData.groupedCategoryTotal[groupedCategoryName];
          });
      };

      return this.subCategories.reduce((arr, s) => {
        const dataField: IVisualSubCategoryData = {
          category: this.othersBarText,
          groupedCategory: s.name,
          value: othersDataValues(s.name),
          styles: { bar: { fillColor: "rgb(84, 84, 84)" } },
          tooltipFields: this.chartData[0]?.subCategories[0]?.tooltipFields,
          selectionId: this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId(),
          isHighlight: false,
        };
        return [...arr, dataField];
      }, []);
    };

    // if (rankingSettings.isCategoriesRanking) {
    //     if (rankingSettings.filterType === RankingFilterType.TopN) {
    //         if (this.isHorizontalChart) {
    //             this.othersBarData = this.chartData.slice(0, this.chartData.length - rankingSettings.count);
    //             this.chartData = this.chartData.slice(this.chartData.length - rankingSettings.count, this.chartData.length);
    //         } else {
    //             this.othersBarData = this.chartData.slice(rankingSettings.count, this.chartData.length);
    //             this.chartData = this.chartData.slice(0, rankingSettings.count);
    //         }
    //     }
    //     if (rankingSettings.filterType === RankingFilterType.BottomN) {
    //         if (this.isHorizontalChart) {
    //             if (rankingSettings.count <= this.chartData.length) {
    //                 this.othersBarData = this.chartData.slice(rankingSettings.count, this.chartData.length);
    //                 this.chartData = this.chartData.slice(0, rankingSettings.count);
    //             }
    //         } else {
    //             if (rankingSettings.count <= this.chartData.length) {
    //                 this.othersBarData = this.chartData.slice(0, this.chartData.length - rankingSettings.count);
    //                 this.chartData = this.chartData.slice(this.chartData.length - rankingSettings.count, this.chartData.length);
    //             }
    //         }
    //     }

    //     if (rankingSettings.showRemainingAsOthers) {
    //         const othersDataValues = d3.sum(this.othersBarData, (d) => d.value);
    //         const identity = this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId();
    //         const othersDataField: IVisualCategoryData = {
    //             category: this.othersBarText,
    //             groupedCategory: this.othersBarText,
    //             value: othersDataValues,
    //             styles: { bar: { fillColor: "rgb(84, 84, 84)" } },
    //             subCategories: this.isGroupedStackedBar
    //                 ? getOthersGroupedSubCategoriesDataField(this.othersBarData)
    //                 : [getOthersSubCategoriesDataField(othersDataValues)],
    //             tooltipFields: this.chartData[0].tooltipFields,
    //             selectionId: identity,
    //             selected: false,
    //             identity,
    //             isHighlight: false
    //         };
    //         if (this.isHorizontalChart) {
    //             this.chartData.unshift(othersDataField);
    //         } else {
    //             this.chartData.push(othersDataField);
    //         }
    //     }
    // }

    if (this.chartSettings.barType !== BarType.Normal && rankingSettings.isSubcategoriesRanking) {
      if (rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
        const categoricalSubcategoriesDataValues = this.originalCategoricalData.values;
        const othersCategoricalSubcategoriesDataValues = categoricalSubcategoriesDataValues.filter(d => !this.subCategories.map(s => s.name).includes(d.source.groupName as string));

        this.chartData.forEach((d, i) => {
          const index = this.originalCategoricalData.categories[this.categoricalCategoriesLastIndex].values.findIndex(s => s === d.category);
          const total = d3.sum(othersCategoricalSubcategoriesDataValues, d => +d.values[index] as number);
          const othersSubCategoriesDataField = getOthersSubCategoriesDataField(total);
          d.subCategories.push(othersSubCategoriesDataField);
        })
      }
    }

    // if (this.chartSettings.barType !== BarType.Normal && rankingSettings.isSubcategoriesRanking) {
    //   const count = rankingSettings.subCategoriesRanking.count;
    //   const subCategoriesCount = this.isGroupedStackedBar ? count * this.subCategories.length : count;

    //   if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
    //     this.chartData.forEach((data, i) => {
    //       if (rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
    //         const othersSubCategoriesData = data.subCategories.slice(subCategoriesCount, categoricalSubcategoriesDataValues.length);
    //         data.subCategories = data.subCategories.slice(0, subCategoriesCount);
    //         if (!this.isGroupedStackedBar) {
    //           const othersSubCategoriesDataValues = d3.sum(othersSubCategoriesData, (d) => d.value);
    //           const othersSubCategoriesDataField = getOthersSubCategoriesDataField(othersSubCategoriesDataValues, i);
    //           if (othersSubCategoriesData.length) {
    //             data.subCategories.push(othersSubCategoriesDataField);
    //           }
    //         } else {
    //           const othersSubCategoriesDataField = getOthersGroupedSubCategoriesDataField(
    //             othersSubCategoriesData,
    //             true
    //           );
    //           if (othersSubCategoriesData.length) {
    //             othersSubCategoriesDataField.forEach((field) => {
    //               data.subCategories.push(field);
    //             });
    //           }
    //         }
    //       } else {
    //         data.subCategories = data.subCategories.slice(0, subCategoriesCount);
    //       }
    //       data.value = d3.sum(data.subCategories, (d) => d.value);
    //     });
    //   }

    //   if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
    //     this.chartData.forEach((data, i) => {
    //       if (subCategoriesCount <= data.subCategories.length) {
    //         if (rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
    //           const othersSubCategoriesData = data.subCategories.slice(
    //             0,
    //             data.subCategories.length - subCategoriesCount
    //           );

    //           data.subCategories = data.subCategories.slice(
    //             data.subCategories.length - subCategoriesCount,
    //             data.subCategories.length
    //           );
    //           if (!this.isGroupedStackedBar) {
    //             const othersSubCategoriesDataValues = d3.sum(othersSubCategoriesData, (d) => d.value);
    //             const othersSubCategoriesDataField = getOthersSubCategoriesDataField(othersSubCategoriesDataValues, i);
    //             if (othersSubCategoriesData.length) {
    //               data.subCategories.push(othersSubCategoriesDataField);
    //             }
    //           } else {
    //             const othersSubCategoriesDataField = getOthersGroupedSubCategoriesDataField(
    //               othersSubCategoriesData,
    //               true
    //             );
    //             if (othersSubCategoriesData.length) {
    //               othersSubCategoriesDataField.forEach((field) => {
    //                 data.subCategories.push(field);
    //               });
    //             }
    //           }
    //         } else {
    //           data.subCategories = data.subCategories.slice(
    //             data.subCategories.length - subCategoriesCount,
    //             data.subCategories.length
    //           );
    //         }
    //         data.value = d3.sum(data.subCategories, (d) => d.value);
    //       }
    //     });
    //   }
    // }

    if (this.rankingSettings.isCategoriesRanking || this.rankingSettings.isSubcategoriesRanking) {
      const subCategories = [];
      this.subCategories = [];
      this.chartData.forEach((data) => {
        data.subCategories.forEach((sub) => {
          const isAlreadyHasCategory = subCategories.some(
            (d) => d.name === (this.isGroupedStackedBar ? sub.groupedCategory : sub.category)
          );
          if (!isAlreadyHasCategory) {
            subCategories.push({ name: this.isGroupedStackedBar ? sub.groupedCategory : sub.category, color: "" });
          }
        });
      });
      this.subCategories = subCategories;
    }

    this.setSubCategoriesMap(this.chartData);
  }

  setAutoBarType(): void {
    const barType = this.chartSettings.barType;
    if (!this.isGroupedStackedBar) {
      if (barType === BarType.Normal && this.isHasSubcategories) {
        this.chartSettings.barType = BarType.Grouped;
      } else if (barType !== BarType.Normal && !this.isHasCategories) {
        this.chartSettings.barType = BarType.Normal;
      }

      if (!this.isHasSubcategories) {
        this.chartSettings.barType = BarType.Normal;
      }

      if (
        barType === BarType.GroupedStacked &&
        (!!!this.categoricalLegendsData || !this.isMultiMeasureValues) &&
        this.isHasSubcategories
      ) {
        this.chartSettings.barType = BarType.Grouped;
      }
    } else {
      this.chartSettings.barType = BarType.GroupedStacked;
    }
  }

  setVisualSettings(): void {
    const formatTab = this.visualUpdateOptions.formatTab;

    const chartConfig = JSON.parse(formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]);
    this.chartSettings = {
      ...CHART_SETTINGS,
      ...chartConfig,
    };
    this.isHorizontalChart = this.chartSettings.orientation === Orientation.Horizontal;

    this.setAutoBarType();
    this.isHadSubcategories = !!this.categoricalLegendsData;

    const dataColorsConfig = JSON.parse(formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings]);
    this.dataColorsSettings = {
      ...DATA_COLORS,
      ...dataColorsConfig,
    };

    const xAxisConfig = JSON.parse(formatTab[EVisualConfig.XAxisConfig][EVisualSettings.XAxisSettings]);
    this.xAxisSettings = {
      ...X_AXIS_SETTINGS,
      ...xAxisConfig,
    };

    const yAxisConfig = JSON.parse(formatTab[EVisualConfig.YAxisConfig][EVisualSettings.YAxisSettings]);
    this.yAxisSettings = {
      ...Y_AXIS_SETTINGS,
      ...yAxisConfig,
    };

    if (this.isHorizontalChart) {
      this.minScaleRangeFromSettings = this.xAxisSettings.minimumRange;
      this.maxScaleRangeFromSettings = this.xAxisSettings.maximumRange;
    } else {
      this.minScaleRangeFromSettings = this.yAxisSettings.minimumRange;
      this.maxScaleRangeFromSettings = this.yAxisSettings.maximumRange;
    }

    if (this.chartSettings.isPercentageStackedBar) {
      this.xAxisSettings.minimumRange = 0;
      this.xAxisSettings.maximumRange = 0;
      this.yAxisSettings.minimumRange = 0;
      this.yAxisSettings.maximumRange = 0;
    }

    this.numberSettings = formatTab[EVisualSettings.NumberSettings];
    this.legendSettings = formatTab[EVisualSettings.Legend];
    this.isBottomXAxis = this.xAxisSettings.position === Position.Bottom;
    this.isLeftYAxis = this.yAxisSettings.position === Position.Left;

    const dataLabelsConfig = JSON.parse(formatTab[EVisualConfig.DataLabelsConfig][EVisualSettings.DataLabelsSettings]);

    if (this.dataLabelsSettings?.dataLabels?.placement !== dataLabelsConfig?.dataLabels?.placement) {
      this.isLabelWithoutTransition = true;
    }

    this.dataLabelsSettings = {
      ...DATA_LABELS_SETTINGS,
      ...dataLabelsConfig,
    };

    const gridLinesConfig = JSON.parse(formatTab[EVisualConfig.GridLinesConfig][EVisualSettings.GridLinesSettings]);
    this.gridSettings = {
      ...GRID_LINES_SETTINGS,
      ...gridLinesConfig,
    };

    this.xGridSettings = this.gridSettings.xGridLines;
    this.yGridSettings = this.gridSettings.yGridLines;

    const clonedRankingSettings = JSON.parse(JSON.stringify(this.rankingSettings ?? {}));
    const rankingConfig = JSON.parse(formatTab[EVisualConfig.RankingConfig][EVisualSettings.RankingSettings]);
    this.rankingSettings = {
      ...RANKING_SETTINGS,
      ...rankingConfig,
    };
    this.isRankingSettingsChanged = JSON.stringify(clonedRankingSettings) !== JSON.stringify(this.rankingSettings);

    const patternConfig = JSON.parse(formatTab[EVisualConfig.PatternConfig][EVisualSettings.PatternSettings]);
    this.patternSettings = {
      ...PATTERN_SETTINGS,
      ...patternConfig,
    };

    const referenceLinesConfig = JSON.parse(
      formatTab[EVisualConfig.ReferenceLinesConfig][EVisualSettings.ReferenceLinesSettings]
    );
    this.referenceLinesSettings = Object.keys(referenceLinesConfig).length > 0 ? referenceLinesConfig : [];

    const raceBarChartConfig = JSON.parse(
      formatTab[EVisualConfig.BarChartRaceConfig][EVisualSettings.BarChartRaceSettings]
    );
    this.barChartRaceSettings = {
      ...BAR_CHART_RACE_SETTINGS,
      ...raceBarChartConfig,
    };

    const seriesLabelConfig = JSON.parse(
      formatTab[EVisualConfig.SeriesLabelConfig][EVisualSettings.SeriesLabelSettings]
    );
    this.seriesLabelSettings = {
      ...SERIES_LABEL_SETTINGS,
      ...seriesLabelConfig,
    };

    if (
      this.isHorizontalChart &&
      (this.seriesLabelSettings.seriesPosition === Position.Left ||
        this.seriesLabelSettings.seriesPosition === Position.Right)
    ) {
      this.seriesLabelSettings.seriesPosition = Position.Top;
    }

    if (
      !this.isHorizontalChart &&
      (this.seriesLabelSettings.seriesPosition === Position.Top ||
        this.seriesLabelSettings.seriesPosition === Position.Bottom)
    ) {
      this.seriesLabelSettings.seriesPosition = Position.Left;
    }

    this.lastDynamicDeviationSettings = this.dynamicDeviationSettings;

    const dynamicDeviationConfig = JSON.parse(
      formatTab[EVisualConfig.DynamicDeviationConfig][EVisualSettings.DynamicDeviationSettings]
    );
    this.dynamicDeviationSettings = {
      ...DYNAMIC_DEVIATION_SETTINGS,
      ...dynamicDeviationConfig,
    };

    const cutAndClipAxisConfig = JSON.parse(
      formatTab[EVisualConfig.CutAndClipAxisConfig][EVisualSettings.CutAndClipAxisSettings]
    );
    this.cutAndClipAxisSettings = {
      ...CUT_AND_CLIP_AXIS_SETTINGS,
      ...cutAndClipAxisConfig,
    };

    const errorBarsConfig = JSON.parse(formatTab[EVisualConfig.ErrorBarsConfig][EVisualSettings.ErrorBarsSettings]);
    this.errorBarsSettings = {
      ...ERROR_BARS_SETTINGS,
      ...errorBarsConfig,
    };

    SetSmallMultiplesSettings(this);
    this.setSortingSettings();

    // Hide the Errors Bars Settings based on Bar Type
    this.toggleDisplayErrorBarsSettings();

    // SET TRANSITION DURATION
    this.tickDuration = this.barChartRaceSettings.allowTransition ? this.barChartRaceSettings.barTransitionDuration : 0;

    this.isNoDataColors = this.dataColorsSettings.fillType === ColorPaletteType.NoColor;
    if (this.isNoDataColors) {
      this.chartSettings.isShowBarBorder = true;
    }
    this.isDrawBorderBar = this.chartSettings.isShowBarBorder || this.patternSettings.showBorder;

    // this.sortCategoriesData();
  }

  toggleDisplayErrorBarsSettings(): void {
    const toggleSettings = (isShow: boolean): void => {
      this.visualHost.persistProperties({
        merge: [
          {
            objectName: "errorBarsConfig",
            displayName: "errorBarsSettings",
            properties: { errorBarsSettings: JSON.stringify({ ...this.errorBarsSettings, SHOW_IN_LEFT_MENU: isShow }) },
            selector: null,
          },
        ],
      });
    };

    const barType = this.chartSettings.barType;
    if (barType === BarType.Stacked || barType === BarType.GroupedStacked) {
      toggleSettings(false);
    } else {
      toggleSettings(true);
    }
  }

  setLabelImagePositionProps(): void {
    this.isShowLabelImage =
      this.isHasImagesData &&
      (this.isHorizontalChart ? this.yAxisSettings.isDisplayImage : this.xAxisSettings.isDisplayImage) &&
      !this.isGroupedBarChart &&
      !this.isGroupedStackedBar;

    this.isLabelImageWithinAxis =
      this.isShowLabelImage &&
      (this.isHorizontalChart ? this.yAxisSettings.isImageWithinAxis : this.xAxisSettings.isImageWithinAxis);

    this.isLabelImageWithinBar =
      this.isShowLabelImage &&
      (this.isHorizontalChart ? this.yAxisSettings.isImageWithinBar : this.xAxisSettings.isImageWithinBar);

    this.labelImagePositionWithinBar = !this.isHorizontalChart
      ? this.xAxisSettings.imageWithinBarPosition
      : this.yAxisSettings.imageWithinBarPosition;

    this.labelImageBorderWidth = !this.isHorizontalChart
      ? this.xAxisSettings.imageStyle.borderWidth
      : this.yAxisSettings.imageStyle.borderWidth;

    if (
      this.isHorizontalChart &&
      (this.labelImagePositionWithinBar === Position.Bottom || this.labelImagePositionWithinBar === Position.Top)
    ) {
      this.labelImagePositionWithinBar = Position.Left;
    }

    this.isBottomLabelImageWithinBar =
      this.isShowLabelImage && this.isLabelImageWithinBar && this.labelImagePositionWithinBar === Position.Bottom;
    this.isLeftLabelImageWithinBar =
      this.isShowLabelImage && this.isLabelImageWithinBar && this.labelImagePositionWithinBar === Position.Left;
    this.isRightImageRightYAxisPosition = this.isShowLabelImage && !this.isLeftLabelImageWithinBar && !this.isLeftYAxis;
    this.isShowImageBorder = this.isHorizontalChart
      ? this.yAxisSettings.isShowImageBorder
      : this.xAxisSettings.isShowImageBorder;
    this.imageBorderColor = this.isHorizontalChart
      ? this.yAxisSettings.imageStyle.borderColor
      : this.xAxisSettings.imageStyle.borderColor;
  }

  getPatternByCategoryName(categoryName: string): IPatternProps {
    if (categoryName.includes(this.othersBarText)) {
      return this.patternSettings.othersPattern;
    } else {
      if (this.patternSettings.byCategory) {
        return this.patternSettings.patterns?.find((p) => p.category === categoryName);
      } else {
        const patternType: PatternType =
          this.chartSettings.orientation === Orientation.Horizontal
            ? PatternType.HorizontalPatterns
            : PatternType.VerticalPatterns;
        return this.patternSettings[patternType]?.find((p) => p.category === categoryName);
      }
    }
  }

  setVisualPatternData(): void {
    this.chartData.forEach((d) => {
      d.pattern = this.getPatternByCategoryName(d.category);

      if (d.isOther) {
        d.pattern = this.patternSettings.othersPattern;
      }
    });

    this.chartData.forEach((d) => {
      d.subCategories.forEach((s) => {
        s.pattern = this.getPatternByCategoryName(s.category);

        if (s.isOther) {
          s.pattern = this.patternSettings.othersPattern;
        }
      });
    });
  }

  autoSetStackedBarType(): void {
    if (this.chartSettings.barType === BarType.Normal && this.isHasSubcategories && !this.isHadSubcategories) {
      this.chartSettings.barType = BarType.Stacked;
      // this.dataColorsSettings.fillType = ColorPaletteType.PowerBi;
    }

    if (this.chartSettings.barType === BarType.Normal && this.isHasSubcategories && !this.isHadSubcategories) {
      this.chartSettings.barType = BarType.Stacked;
      // this.dataColorsSettings.fillType = ColorPaletteType.PowerBi;
    }

    if (
      (this.chartSettings.prevBarType === BarType.Normal || this.chartSettings.prevBarType === undefined) &&
      this.chartSettings.barType === BarType.Normal &&
      this.isHasSubcategories
    ) {
      this.chartSettings.barType = BarType.Stacked;
      // this.dataColorsSettings.fillType = ColorPaletteType.PowerBi;
    }

    if (!this.isHasSubcategories) {
      this.chartSettings.barType = BarType.Normal;
      // this.dataColorsSettings.barColor = ColorPaletteType.Single;
    }
  }

  setColorsByDataColorsSettings(): void {
    this.subCategoriesColorMap = {};
    SetNormalBarColors(this);
    if (!this.isNormalBarChart) {
      SetStackedGroupedBarColors(this);
    }
    SetSubCategoriesColor(this);

    if (!this.isNormalBarChart) {
      const subCategoriesColorMap = {};
      (this.isGroupedStackedBar ? this.categoriesForLegend : this.subCategories).forEach((d) => {
        subCategoriesColorMap[d.name] = d.color;
      });
      this.subCategoriesColorMap = subCategoriesColorMap;
    }
  }

  setMargins(): void {
    const isAddMarginForAxisLabelImage =
      this.isHasImagesData &&
      this.xAxisSettings.isDisplayImage &&
      !this.isHorizontalChart &&
      this.isLabelImageWithinAxis;
    if (this.xAxisSettings.position === Position.Bottom) {
      this.margin.bottom =
        this.xScaleGHeight +
        this.xAxisTitleSize +
        // (this.xAxisSettings?.isDisplayTitle ? this.axisTitleMargin : 0) +
        this.axisTitleMargin +
        this.brushHeight +
        (isAddMarginForAxisLabelImage ? this.xAxisTickHeight : 0) -
        (!isAddMarginForAxisLabelImage || this.xAxisSettings.isDisplayLabel ? 0 : this.xAxisTickHeight);

      this.margin.top = 0;
    } else if (this.xAxisSettings.position === Position.Top) {
      this.margin.bottom = this.brushHeight;
      this.margin.top =
        this.xScaleGHeight +
        this.xAxisTitleSize +
        this.axisTitleMargin +
        (isAddMarginForAxisLabelImage ? this.xAxisTickHeight : 0) -
        (!isAddMarginForAxisLabelImage || this.xAxisSettings.isDisplayLabel ? 0 : this.xAxisTickHeight);
    }

    if (this.yAxisSettings.position === Position.Left) {
      this.margin.left = this.yScaleGWidth + this.yAxisTitleSize + this.axisTitleMargin;
      this.margin.right = this.brushWidth;
    } else if (this.yAxisSettings.position === Position.Right) {
      this.margin.left = this.axisTitleMargin;
      this.margin.right = this.yScaleGWidth + this.yAxisTitleSize + this.axisTitleMargin + this.brushWidth;
    }

    this.setChartWidthHeight();
  }

  setChartWidthHeight(): void {
    const options = this.visualUpdateOptions;
    this.viewPortWidth = options.options.viewport.width;
    this.viewPortHeight = options.options.viewport.height;
    this.width =
      this.viewPortWidth - this.margin.left - this.margin.right - this.settingsBtnWidth - this.legendViewPort.width;
    this.height =
      this.viewPortHeight - this.margin.bottom - this.margin.top - this.settingsBtnHeight - this.legendViewPort.height;
  }

  drawBarChart(
    chartData: IVisualCategoryData[],
    groupedBarChartData: any[],
    stackedBarChartData: any[],
    groupedBarsDataLabelsData: any[]
  ): void {
    if (this.getCategoricalValuesIndexByKey(DataRolesName.Value) !== -1) {
      if (this.xAxisSettings.isDisplayTitle || this.yAxisSettings.isDisplayTitle) {
        RenderXYAxisTitle(this);
      }

      switch (this.chartSettings.barType) {
        case BarType.Normal:
          d3.select(".stackedBarsG").selectAll("*").remove();
          RenderGroupedBars(this, []);
          RenderNormalBars(this, this.normalBarG, chartData);
          RenderBorderBar(this, []);
          RenderBarCutAndClipMarker(this, this.isCutAndClipAxisEnabled ? chartData : []);
          RenderLabelImageOnStackedBar(this, this.isShowLabelImage && this.isLabelImageWithinBar ? chartData : []);
          RenderStackedBarClip(this, this.isCutAndClipAxisEnabled ? chartData : []);
          RenderGroupedStackedBarsAxisLabel(this, []);
          RenderErrorBarsLine(this, this.isShowErrorBars ? chartData : []);
          break;
        case BarType.Stacked:
          RenderNormalBars(this, this.normalBarG, []);
          RenderGroupedBars(this, []);
          RenderStackedBars(this, stackedBarChartData);
          RenderStackedBarClip(this, chartData);
          RenderBorderBar(this, this.isDrawBorderBar ? chartData : []);
          RenderBarCutAndClipMarker(this, []);
          RenderLabelImageOnStackedBar(this, this.isShowLabelImage && this.isLabelImageWithinBar ? chartData : []);
          RenderGroupedStackedBarsAxisLabel(this, []);
          RenderErrorBarsLine(this, []);
          break;
        case BarType.GroupedStacked:
          RenderNormalBars(this, this.normalBarG, []);
          RenderGroupedBars(this, []);
          RenderStackedBars(this, stackedBarChartData);
          RenderStackedBarClip(this, groupedBarChartData);
          RenderBorderBar(this, this.isDrawBorderBar ? groupedBarChartData : []);
          RenderBarCutAndClipMarker(this, []);
          RenderLabelImageOnStackedBar(this, []);
          RenderGroupedStackedBarsAxisLabel(this, groupedBarChartData);
          RenderErrorBarsLine(this, []);
          break;
        case BarType.Grouped:
          RenderNormalBars(this, this.normalBarG, []);
          RenderStackedBars(this, []);
          RenderGroupedBars(this, groupedBarChartData);
          RenderBorderBar(this, []);
          RenderStackedBarClip(this, this.isCutAndClipAxisEnabled ? groupedBarsDataLabelsData : []);
          RenderBarCutAndClipMarker(this, this.isCutAndClipAxisEnabled ? groupedBarsDataLabelsData : []);
          RenderLabelImageOnStackedBar(this, []);
          RenderGroupedStackedBarsAxisLabel(this, []);
          RenderErrorBarsLine(
            this,
            this.isShowErrorBars ? (!!this.categoricalLegendsData ? groupedBarsDataLabelsData : []) : []
          );
          break;
      }
    }

    this.callInsideDataLabelsMethods();
    if (!this.chartSettings.isPercentageStackedBar) {
      this.callOutsideDataLabelsMethods();
    }

    SetReferenceLinesData(this);
    RenderReferenceLines(this, this.referenceLinesData);

    // this.removeActiveBarStyleOnOutsideClick();
    HideDataLabelsBelowReferenceLines(this);
    this.isBarChartDrawn = true;
  }

  setBarHighlightColor(): void {
    if (this.chartSettings.barHighlightType !== EBarHighlightType.None) {
      const setSubcategoriesBarColor = (subCategories: IVisualSubCategoryData[], color: string) => {
        subCategories.forEach((s) => {
          s.styles.bar.fillColor = color;
        });
      };

      if (this.chartSettings.barHighlightType === EBarHighlightType.MinMax) {
        const minData = this.chartData.find((d) => d.category === this.minCategoryValueDataPair.category);
        const maxData = this.chartData.find((d) => d.category === this.maxCategoryValueDataPair.category);

        if (minData) {
          minData.styles.bar.fillColor = this.chartSettings.highlightedBarMinColor;
          setSubcategoriesBarColor(minData.subCategories, this.chartSettings.highlightedBarMinColor);
        }

        if (maxData) {
          maxData.styles.bar.fillColor = this.chartSettings.highlightedBarMaxColor;
          setSubcategoriesBarColor(maxData.subCategories, this.chartSettings.highlightedBarMaxColor);
        }
      } else if (this.chartSettings.barHighlightType === EBarHighlightType.FirstLast) {
        const firstData = this.chartData.find((d) => d.category === this.firstCategoryValueDataPair.category);
        const lastData = this.chartData.find((d) => d.category === this.lastCategoryValueDataPair.category);

        if (firstData) {
          firstData.styles.bar.fillColor = this.chartSettings.highlightedBarRecentColor;
          setSubcategoriesBarColor(firstData.subCategories, this.chartSettings.highlightedBarRecentColor);
        }

        if (lastData) {
          lastData.styles.bar.fillColor = this.chartSettings.highlightedBarRecentColor;
          setSubcategoriesBarColor(lastData.subCategories, this.chartSettings.highlightedBarRecentColor);
        }
      } else if (this.chartSettings.barHighlightType === EBarHighlightType.Last) {
        const lastData = this.chartData.find((d) => d.category === this.lastCategoryValueDataPair.category);

        if (lastData) {
          lastData.styles.bar.fillColor = this.chartSettings.highlightedBarRecentColor;
          setSubcategoriesBarColor(lastData.subCategories, this.chartSettings.highlightedBarRecentColor);
        }
      }
    }
  }

  getFilteredDataLabelsData(chartData: any[], dataLabelsType: DataLabelsType): IVisualCategoryData[] {
    let filteredData = [];
    const minData = chartData.find((d) => d.category === this.minCategoryValueDataPair.category);
    const maxData = chartData.find((d) => d.category === this.maxCategoryValueDataPair.category);
    const firstData = chartData.find((d) => d.category === this.firstCategoryValueDataPair.category);
    const lastData = chartData.find((d) => d.category === this.lastCategoryValueDataPair.category);
    const isDataLabelsEnabled = this.dataLabelsSettings.showDataLabels;

    if (isDataLabelsEnabled) {
      switch (this.dataLabelsSettings[dataLabelsType].displayStyleType) {
        case EDataLabelsDisplayStyleType.All:
          return chartData;
        case EDataLabelsDisplayStyleType.MinMax:
          if (minData) {
            filteredData.push(minData);
          }
          if (maxData) {
            filteredData.push(maxData);
          }
          break;
        case EDataLabelsDisplayStyleType.FirstLast:
          if (firstData) {
            filteredData.push(firstData);
          }
          if (lastData) {
            filteredData.push(lastData);
          }
          break;
        case EDataLabelsDisplayStyleType.Last:
          if (lastData) {
            filteredData.push(lastData);
          }
          break;
      }
    }

    if (this.chartSettings.barHighlightType !== EBarHighlightType.None && !this.dataLabelsSettings.showDataLabels) {
      switch (this.chartSettings.barHighlightType) {
        case EBarHighlightType.MinMax:
          if (minData) {
            filteredData.push(minData);
          }
          if (maxData) {
            filteredData.push(maxData);
          }
          break;
        case EBarHighlightType.FirstLast:
          {
            if (firstData) {
              filteredData.push(firstData);
            }
            if (lastData) {
              filteredData.push(lastData);
            }
          }
          break;
        case EBarHighlightType.Last:
          {
            if (lastData) {
              filteredData.push(lastData);
            }
          }
          break;
      }
    }

    filteredData = filteredData.filter((v, i, a) => a.findIndex((t) => t.category === v.category) === i);
    return filteredData;
  }

  callInsideDataLabelsMethods(): void {
    if (this.dataLabelsSettings.showDataLabels || this.chartSettings.isShowDataLabelForHighlightedBars) {
      switch (this.chartSettings.barType) {
        case BarType.Normal:
          RenderStackedBarsInsideDataLabels(this, []);
          RenderDataLabels(this, this.getFilteredDataLabelsData(this.chartData, DataLabelsType.DataLabels));
          break;
        case BarType.Stacked:
          this.hideNormalGroupedBarsInOutDataLabels();
          RenderStackedBarsInsideDataLabels(
            this, this.getFilteredDataLabelsData(this.stackedBarChartData, DataLabelsType.DataLabels)
          );
          break;
        case BarType.GroupedStacked:
          this.hideNormalGroupedBarsInOutDataLabels();
          RenderStackedBarsInsideDataLabels(
            this, this.getFilteredDataLabelsData(this.stackedBarChartData, DataLabelsType.DataLabels)
          );
          break;
        case BarType.Grouped:
          RenderStackedBarsInsideDataLabels(this, []);
          RenderDataLabels(
            this,
            this.getGroupedBarsDataLabelsData(
              this.getFilteredDataLabelsData(this.groupedBarChartData, DataLabelsType.DataLabels)
            )
          );
          break;
      }
    } else {
      RenderDataLabels(this, []);
      RenderStackedBarsInsideDataLabels(this, []);
    }
  }

  callOutsideDataLabelsMethods(): void {
    if (this.dataLabelsSettings.showTotalLabels) {
      switch (this.chartSettings.barType) {
        case BarType.Stacked:
          this.hideNormalGroupedBarsInOutDataLabels();
          RenderOutsideDataLabels(this, this.getFilteredDataLabelsData(this.chartData, DataLabelsType.TotalLabels));
          break;
        case BarType.GroupedStacked:
          this.hideNormalGroupedBarsInOutDataLabels();
          RenderOutsideDataLabels(this,
            this.getFilteredDataLabelsData(this.groupedBarChartData, DataLabelsType.TotalLabels)
          );
          break;
      }
    } else {
      this.hideNormalGroupedBarsInOutDataLabels();
    }
  }

  hideNormalGroupedBarsInOutDataLabels(): void {
    this.insideDataLabelsG.selectAll("*").attr("display", "none");
    this.outsideDataLabelsG.selectAll("*").attr("display", "none");
  }

  trimLabel(tickEle: any, width: number, charLength: number): void {
    const self = d3.select(tickEle);
    const textLength = self.node().getComputedTextLength();
    const text = self.text();
    const minCharLen = d3.min([Math.round(width / 2 / (textLength / text.length)), charLength]);
    let charLen = 0;
    charLen = textLength > width - width * 0.4 ? minCharLen : charLength;
    if (text.length > charLen) {
      const newText = text.substr(0, charLen);
      self.text(newText + "..");
    }
  }

  trimXAxisTick(tickEle: any, scaleHeight: number): void {
    const self = d3.select(tickEle);
    const textLength = self.node().getComputedTextLength();
    const text = self.text();
    const minCharLen = (scaleHeight * 0.5) * text.length / textLength;

    let charLen = 0;
    if (this.xAxisSettings.isLabelAutoCharLimit) {
      charLen = minCharLen;
    } else {
      charLen = this.xAxisSettings.labelCharLimit;
    }

    const newText = text.substr(0, charLen);
    if (newText.length < text.length) {
      self.text(newText + "..");
    }
  }

  autoTiltXAxisLabel(xAxisG: SVGElement, textEle: any, width: number): void {
    const THIS = this;
    const xAxisSettings = this.xAxisSettings;
    width -= width * 0.16;
    const textBBox = (textEle as SVGSVGElement).getBBox();
    let rotate = 0;

    if (this.scaleBandWidth <= 60) {
      rotate = -35;
    }

    if (width < this.xAxisLabelTrimMinWidth) {
      rotate = -35;
    }

    if (THIS.isHorizontalBrushDisplayed) {
      rotate = THIS.isBottomXAxis ? -90 : 90;
    }

    d3.select(xAxisG)
      .selectAll("text")
      .attr("transform", () => {
        if (xAxisSettings.position === Position.Bottom) {
          if (rotate === 0) {
            return "translate(0, 8)";
          } else {
            return `translate(${xAxisSettings.labelTilt > 20 ? -10 : 0}, 8)rotate(${rotate})`;
          }
        } else if (xAxisSettings.position === Position.Top) {
          if (rotate === 0) {
            return "translate(0, -8)";
          } else {
            return `translate(${xAxisSettings.labelTilt > 20 ? -10 : 0}, -8)rotate(${rotate})`;
          }
        }
      })
      .attr("text-anchor", rotate === 0 ? "middle" : "end");
  }

  wrapAxisLabel(textEle: any, width: number): void {
    const THIS = this;
    const text = d3.select(textEle);
    const isRotatedText = text.attr("transform")?.includes("rotate");
    if (!isRotatedText) {
      let words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.3;
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy"));
      let tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width - width * 0.1) {
          if (THIS.isBottomXAxis) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          } else {
            lineNumber = line.length;
            line.pop();
            tspan.text(line.join(" "));
            tspan.attr("dy", function () {
              const dy = d3.select(this).attr("dy");
              return parseFloat(dy) - lineHeight + "em";
            });
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", --lineNumber * lineHeight + dy - lineHeight + "em")
              .text(word);
          }
        }
      }
    }
  }

  getXAxisLabelTilt(): number {
    let labelTilt = 30;
    if (this.xAxisSettings.isLabelAutoTilt) {
      if (this.viewPortWidth < 186) {
        labelTilt = 90;
      } else if (this.viewPortWidth > 378 && this.viewPortWidth < 576) {
        labelTilt = 60;
      } else if (this.viewPortWidth > 576 && this.viewPortWidth < 768) {
        labelTilt = 40;
      } else if (this.viewPortWidth > 768 && this.viewPortWidth < 992) {
        labelTilt = 25;
      } else if (this.viewPortWidth > 992 && this.viewPortWidth < 1200) {
        if (this.isHorizontalBrushDisplayed) {
          labelTilt = 25;
        } else {
          labelTilt = 0;
        }
      } else if (this.viewPortWidth > 1200) {
        if (this.isHorizontalBrushDisplayed) {
          labelTilt = 25;
        } else {
          labelTilt = 0;
        }
      }
    } else {
      labelTilt = this.xAxisSettings.labelTilt;
    }
    this.xAxisSettings.labelTilt = labelTilt;
    return labelTilt;
  }

  getXScaleInnerPadding(): number {
    const innerPaddingScale = d3.scaleLinear().domain([0, 100]).range([0, 0.5]);
    return innerPaddingScale(this.chartSettings.barDistance);
  }

  getGroupedScaleInnerPadding(): number {
    const innerPaddingScale = d3.scaleLinear().domain([0, 100]).range([0, 0.5]);
    return innerPaddingScale(this.chartSettings.groupedBarDistance);
  }

  setScaleBandWidth(): void {
    const clonedXScale = this.isHorizontalChart
      ? this.numericCategoriesBandScale.copy()
      : this.numericCategoriesBandScale.copy();
    // this.scaleBandWidth = clonedXScale.bandwidth();
    this.scaleBandWidth = clonedXScale.bandwidth() > this.minScaleBandWidth ? clonedXScale.bandwidth() : this.minScaleBandWidth;
  }

  getRoundedBarPath(x: number, y: number, width: number, height: number, r: number[]): string {
    r = [
      Math.min(r[0], height, width),
      Math.min(r[1], height, width),
      Math.min(r[2], height, width),
      Math.min(r[3], height, width),
    ];

    return `M${x + r[0]},${y}h${width - r[0] - r[1]}${this.getRoundedBarArc(r[1], [1, 1, 1, 1])}v${height - r[1] - r[2]
      }${this.getRoundedBarArc(r[2], [1, 1, -1, 1])}h${-width + r[2] + r[3]}${this.getRoundedBarArc(
        r[3],
        [1, 1, -1, -1]
      )}v${-height + r[3] + r[0]}${this.getRoundedBarArc(r[0], [1, 1, 1, -1])}z`;
  }

  getRoundedBarArc(r: number, sign: number[]): string {
    return r ? `a${r * sign[0]},${r * sign[1]} 0 0 1 ${r * sign[2]},${r * sign[3]}` : "";
  }

  getBarPatternFillId(barPattern: IPatternProps, barFillColor: string, isOtherBar: boolean): string {
    if (this.patternSettings.enable) {
      if (isOtherBar) {
        const othersPattern = this.patternSettings.othersPattern;
        if (othersPattern.patternIdentifier && othersPattern.patternIdentifier !== "") {
          return generatePattern(this.svg, othersPattern, barFillColor);
        }
      }
      if (barPattern?.patternIdentifier && barPattern?.patternIdentifier != "") {
        return generatePattern(this.svg, barPattern, barFillColor, false);
      }
    }
    return barFillColor;
  }

  getNormalBarFill(barData: IVisualCategoryData): string {
    if (this.patternSettings.enable) {
      if (barData.isOther) {
        const othersPattern = this.patternSettings.othersPattern;
        if (othersPattern.patternIdentifier && othersPattern.patternIdentifier !== "") {
          return `url('#${generatePattern(this.svg, othersPattern, barData.styles?.bar?.fillColor)}')`;
        }
      }
      if (barData.pattern?.patternIdentifier && barData.pattern?.patternIdentifier != "") {
        return `url('#${generatePattern(this.svg, barData.pattern, barData.styles?.bar?.fillColor, false)}')`;
      }
    }
    return barData.styles?.bar?.fillColor;
  }

  getBarBorderWidth(pattern?: IPatternProps): number {
    if (pattern?.patternIdentifier && this.patternSettings.enable && this.patternSettings.showBorder) {
      return this.patternSettings.borderWidth;
    } else if (this.chartSettings.isShowBarBorder) {
      return this.chartSettings.barBorderWidth;
    } else {
      return 0;
    }
  }

  getBarBorderColor(barColor?: string, pattern?: IPatternProps): string {
    if (pattern?.patternIdentifier && this.patternSettings.enable && this.patternSettings.showBorder) {
      return barColor;
    } else if (this.chartSettings.isShowBarBorder) {
      return this.chartSettings.barBorderColor;
    }
  }

  getGradientPatternProps(): GradientPatternProps {
    const dataColorsSettings = this.dataColorsSettings;
    return {
      isGradientPattern:
        dataColorsSettings.isGradientWithinBar && dataColorsSettings.fillType === ColorPaletteType.Gradient,
      isHorizontalChart: this.isHorizontalChart,
      isMidColor: dataColorsSettings.midcolor,
      color: { start: dataColorsSettings.fillmin, mid: dataColorsSettings.fillmid, stop: dataColorsSettings.fillmax },
    };
  }

  getEncodedGradientPatternDataURL(patternId: string): string {
    const linearGradientUrl = `url(#LINEAR-GRADIENT-${patternId})`;
    const maskUrl = `url(#MASK-${patternId})`;
    const patternNode = document.getElementById(`${patternId}`);
    const linearGradient = document.getElementById(`LINEAR-GRADIENT-${patternId}`);
    const mask = document.getElementById(`MASK-${patternId}`);
    const patternNodeStr = patternNode.outerHTML.toString().replace(/"/g, "'");
    const linearGradientStr = linearGradient.outerHTML.toString().replace(/"/g, "'");
    const maskStr = mask.outerHTML.toString().replace(/"/g, "'");
    const patternEncodedDataUri = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${this.viewPortWidth}' height='${this.viewPortHeight}'> <defs> ${patternNodeStr} ${linearGradientStr} ${maskStr} </defs> <rect fill='${linearGradientUrl}' mask='${maskUrl}' x='0' y='0' width='100%' height='100%'></rect></svg>`
    );
    const encodedPatternDataUrl = `url("data:image/svg+xml;utf8,${patternEncodedDataUri}")`;
    return encodedPatternDataUrl;
  }

  getEncodedPatternDataURL(patternId: string): string {
    const backgroundUrl = "url(#" + patternId + ")";
    const patternNode = document.getElementById(`${patternId}`);
    const patternNodeStr = patternNode.outerHTML.toString().replace(/"/g, "'");
    const patternEncodedDataUri = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${this.viewPortWidth}' height='${this.viewPortHeight}'> <defs> ${patternNodeStr} </defs> <rect fill='${backgroundUrl}' x='0' y='0' width='100%' height='100%'></rect></svg>`
    );
    const encodedPatternDataUrl = `url("data:image/svg+xml;utf8,${patternEncodedDataUri}")`;
    return encodedPatternDataUrl;
  }

  setBarBackground(barNode: any, barPattern: IPatternProps, barFillColor: string, isOtherBar: boolean): void {
    if (!this.isNoDataColors || barPattern?.patternIdentifier) {
      if (this.isNoDataColors && barPattern.patternIdentifier && this.patternSettings.enable === true) {
        const patternId = this.getBarPatternFillId(barPattern, this.chartSettings.barBorderColor, isOtherBar);
        barNode.style("background", this.getEncodedPatternDataURL(patternId));
      } else {
        if (this.patternSettings.enable === true && barPattern?.patternIdentifier) {
          if (!barPattern?.isImagePattern) {
            const patternId = this.getBarPatternFillId(barPattern, barFillColor, isOtherBar);
            if (
              this.dataColorsSettings.isGradientWithinBar &&
              this.dataColorsSettings.fillType === ColorPaletteType.Gradient &&
              !isOtherBar
            ) {
              barNode.style("background", this.getEncodedGradientPatternDataURL(patternId));
            } else {
              barNode.style("background", this.getEncodedPatternDataURL(patternId));
            }
          } else {
            barNode.style("background", `url(${barPattern?.patternIdentifier})`);
          }
        } else {
          barNode.style("background", barFillColor);
        }
      }
    } else {
      barNode.style("background", "#ffffff");
    }
  }

  getBarBackgroundSize(pattern: IPatternProps, barWidth: number): string {
    if (pattern?.isImagePattern) {
      return pattern.dimensions.width > barWidth ? "contain" : "auto";
    }
    return "auto";
  }

  getBarXYTranslateVal(): { x: number; y: number } {
    let x: number = 0;
    let y: number = 0;

    if (this.isHasImagesData) {
      if (this.isHorizontalChart) {
        y = 0;
        if (this.isLeftYAxis) {
          if (this.isLeftLabelImageWithinBar) {
            x = this.axisLabelImageHeight / 2;
          } else {
            x = 0;
          }
        } else {
          if (this.isLeftLabelImageWithinBar) {
            x = 0;
          } else {
            x = -this.axisLabelImageHeight / 2;
          }
        }
      }

      if (!this.isHorizontalChart) {
        x = 0;
        if (this.isBottomXAxis) {
          if (this.isBottomLabelImageWithinBar) {
            y = -this.axisLabelImageHeight / 2;
          } else {
            y = 0;
          }
        } else {
          if (this.isBottomLabelImageWithinBar) {
            y = this.axisLabelImageHeight / 2;
          } else {
            y = 0;
          }
        }
      }
    }
    return { x, y };
  }

  getSubCategoryByCategoryName(subCategoryName: string): IVisualSubCategoryData {
    let subCategory: IVisualSubCategoryData;
    this.chartData.forEach((data) => {
      data.subCategories.find((d) => {
        if (d.category === subCategoryName) {
          subCategory = d;
        }
      });
    });
    return subCategory;
  }

  getSubCategoryColorByCategoryName(
    subCategoryName: string,
    parentCategory: string,
    groupedCategoryName: string,
    isWantPattern: boolean = true
  ): string {
    let subCategory: IVisualSubCategoryData;

    const isNotMeasure = this.conditionalFormattingConditions.some(
      (c) =>
        (c.staticValue === parentCategory && c.applyTo === this.categoryDisplayName.toLowerCase()) ||
        (c.staticValue === subCategoryName && c.applyTo === this.subCategoryDisplayName.toLowerCase())
    );

    this.chartData.forEach((data) => {
      data.subCategories.forEach((d) => {
        if (this.chartSettings.barType === BarType.GroupedStacked) {
          if (isNotMeasure) {
            if (d.category === subCategoryName && d.parentCategory === parentCategory) {
              subCategory = d;
            }
          } else {
            if (d.category === subCategoryName && d.groupedCategory === groupedCategoryName) {
              subCategory = d;
            }
          }
        } else if (this.chartSettings.barType === BarType.Stacked) {
          if (d.category === subCategoryName && data.category === parentCategory) {
            subCategory = d;
          }
        } else {
          if (d.category === subCategoryName) {
            subCategory = d;
          }
        }
      });
    });

    const barFillColor = subCategory ? subCategory.styles.bar.fillColor : "#545454";
    if (this.patternSettings.enable && isWantPattern) {
      if (subCategory.isOther) {
        const othersPattern = this.patternSettings.othersPattern;
        if (othersPattern?.patternIdentifier && othersPattern?.patternIdentifier !== "") {
          return `url('#${generatePattern(this.svg, othersPattern, barFillColor)}')`;
        }
      }
      if (subCategory.pattern && subCategory.pattern.patternIdentifier != "") {
        return `url('#${generatePattern(this.svg, subCategory.pattern, barFillColor, false)}')`;
      }
    }

    return barFillColor;
  }

  getTrimmedString(text: string) {
    return text ? this.getPureParsedString(text.replace(/\s/g, "").trim()) : "";
  }

  getBarIdByCategory(category: string) {
    return this.barElementIdPrefix + this.getTrimmedString(category);
  }

  getGroupedBarsDataLabelsData(
    groupedBarChartData: any[]
  ): { category: string; subCategory: string; value: number; bandScaleKey: string }[] {
    let groupedBarsDataLabelsData = [];
    groupedBarChartData.forEach((d) => {
      const data: any[] = this.subCategoriesName.map((s) => ({
        category: d.category,
        subCategory: s,
        value: d[s]?.value ?? 0,
        upperBoundValue: d[s]?.upperBoundValue ?? 0,
        lowerBoundValue: d[s]?.lowerBoundValue ?? 0,
        boundsTotal: (d[s]?.upperBoundValue ?? 0) + (d[s]?.lowerBoundValue ?? 0),
        bandScaleKey: null,
        pattern: d[s]?.pattern,
      }));

      data.forEach((d, i) => (d.bandScaleKey = i + ""));
      groupedBarsDataLabelsData = [...groupedBarsDataLabelsData, ...data];
    });

    return groupedBarsDataLabelsData;
  }

  // Data Labels
  getDataLabelTextColors(value: number, defaultColor: string): string {
    if (this.numberSettings.isSemanticFormattingEnabled) {
      if (value >= 0) {
        return this.numberSettings.positiveNumberColor;
      } else {
        return this.numberSettings.negativeNumberColor;
      }
    } else {
      return defaultColor;
    }
  }

  getDataLabelsFontSize(dataLabelsSettings: IDataLabelsProps): number {
    if (dataLabelsSettings.fontSizeType === DataLabelsFontSizeType.Auto) {
      const autoWidth =
        (this.isNormalBarChart || this.isStackedBarChart ? this.scaleBandWidth : this.groupedBarScaleBandWidth) / 3.5;
      const min = 7;
      const max = 12;

      if (autoWidth < max && autoWidth > min) {
        return autoWidth;
      } else if (autoWidth > max) {
        return max;
      } else if (autoWidth < min) {
        return min;
      } else if (autoWidth === max || autoWidth === min) {
        return autoWidth;
      }
    } else {
      return dataLabelsSettings.fontSize;
    }
  }

  getDataLabelXY(d: IVisualCategoryData): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.isHorizontalChart) {
      x = this.xScale(
        this.isStackedBarChart || this.isGroupedStackedBar
          ? d.value >= 0
            ? d.positiveValueTotal
            : d.negativeValueTotal
          : d.value
      );
      y =
        this.yScale(d.category) +
        (this.isGroupedStackedBar
          ? this.groupedBarBandScale(d.groupedCategory) + this.groupedBarScaleBandWidth / 2
          : 0);

      if (this.isNormalBarChart || this.isStackedBarChart) {
        y += this.scaleBandWidth / 2;
      }
    } else {
      x =
        this.xScale(d.category) +
        (this.isGroupedStackedBar
          ? this.groupedBarBandScale(d.groupedCategory) + this.groupedBarScaleBandWidth / 2
          : 0);

      if (this.isNormalBarChart || this.isStackedBarChart) {
        x += this.scaleBandWidth / 2;
      }

      y = this.yScale(
        this.isStackedBarChart || this.isGroupedStackedBar
          ? d.value >= 0
            ? d.positiveValueTotal
            : d.negativeValueTotal
          : d.value
      );
    }

    return { x, y };
  }

  // getDataLabelDisplayStyle(labelEle: any): string {
  //   if (this.dataLabelsSettings.dataLabelsType === DataLabelsType.TotalLabels) {
  //     const prop = labelEle.getBoundingClientRect();
  //     let marginLeft = this.margin.left;
  //     let marginRight = this.margin.right;
  //     let marginTop = this.margin.top;
  //     let marginBottom = this.margin.bottom;
  //     let settingsBtnHeight = this.settingsBtnHeight;
  //     const legendPosition = this.legendSettings.legendPosition;

  //     if (this.legendSettings.show) {
  //       switch (legendPosition) {
  //         case ILegendPosition.TopLeft:
  //         case ILegendPosition.TopCenter:
  //         case ILegendPosition.TopRight:
  //           marginTop += this.legendViewPort.height;
  //           break;
  //         case ILegendPosition.BottomLeft:
  //         case ILegendPosition.BottomCenter:
  //         case ILegendPosition.BottomRight:
  //           marginRight -= this.legendViewPort.height;
  //           break;
  //         case ILegendPosition.LeftTop:
  //         case ILegendPosition.LeftCenter:
  //         case ILegendPosition.LeftBottom:
  //           marginLeft += this.legendViewPort.width;
  //           break;
  //         case ILegendPosition.RightTop:
  //         case ILegendPosition.RightCenter:
  //         case ILegendPosition.RightBottom:
  //           marginRight -= this.legendViewPort.width;
  //           break;
  //       }
  //     }

  //     if (
  //       prop.x - this.settingsPopupOptionsWidth < marginLeft ||
  //       prop.bottom > this.viewPortHeight - marginBottom ||
  //       prop.top - settingsBtnHeight < marginTop ||
  //       prop.right > this.viewPortWidth - marginRight
  //     ) {
  //       return "none";
  //     } else {
  //       return "block";
  //     }
  //   }
  // }

  private handleValidation(vizOptions: ShadowUpdateOptions): boolean {
    const propInfo = { condition: undefined };
    const isHasValue = !!vizOptions.options.dataViews[0].categorical.values;

    if (!isHasValue) {
      propInfo.condition = "Add atleast one value";
    }

    if (propInfo.condition) {
      this.displayValidationPage(propInfo.condition);
      return true;
    } else {
      this.removeContainerFromDom(document.querySelector(".validation-page-container"));
    }
    return false;
  }

  public updateChartDimensions(legendContainer: any): void {
    switch (this.legendSettings.legendPosition) {
      case ILegendPosition.TopLeft:
      case ILegendPosition.TopCenter:
      case ILegendPosition.TopRight:
        this.legendViewPort.width = 0;
        this.legendViewPort.height = legendContainer.node().getBoundingClientRect().height;
        this.svg.attr("transform", "translate(" + 0 + "," + this.legendViewPort.height + ")");
        break;
      case ILegendPosition.BottomLeft:
      case ILegendPosition.BottomCenter:
      case ILegendPosition.BottomRight:
        this.legendViewPort.width = 0;
        this.legendViewPort.height = legendContainer.node().getBoundingClientRect().height;
        this.svg.attr("transform", "translate(" + 0 + "," + 0 + ")");
        break;
      case ILegendPosition.LeftTop:
      case ILegendPosition.LeftCenter:
      case ILegendPosition.LeftBottom:
        this.legendViewPort.width = legendContainer.node().getBoundingClientRect().width + 10;
        this.legendViewPort.height = 0;
        this.svg.attr("transform", "translate(" + this.legendViewPort.width + "," + 0 + ")");
        break;
      case ILegendPosition.RightTop:
      case ILegendPosition.RightCenter:
      case ILegendPosition.RightBottom:
        this.legendViewPort.width = legendContainer.node().getBoundingClientRect().width + 10;
        this.legendViewPort.height = 0;
        this.svg.attr("transform", "translate(" + 0 + "," + 0 + ")");
        break;
    }
  }

  sortCategoriesData(): void {
    const axisSortByValuesList: string[] = [this.categoryDisplayName, ...this.categoricalMeasureDisplayName];

    if (this.categoricalMeasureDisplayName?.length > 1) {
      axisSortByValuesList.push(ESortBy.TotalValue);
    }

    const axis = this.sortingSettings.axis;
    const axisSettings =
      !axis.sortBy || !axisSortByValuesList.includes(axis.sortBy)
        ? { sortBy: axisSortByValuesList[1], sortOrder: ESortOrder.Descending, isMeasure: true, isMultiMeasure: false }
        : axis;

    const sortByName = (data: IVisualCategoryData[]) => {
      if (this.isHorizontalChart) {
        if (axisSettings.sortOrder === ESortOrder.Descending) {
          data.sort((a, b) => b.category.localeCompare(a.category));
        } else {
          data.sort((a, b) => a.category.localeCompare(b.category));
        }
      } else {
        if (axisSettings.sortOrder === ESortOrder.Descending) {
          data.sort((a, b) => a.category.localeCompare(b.category));
        } else {
          data.sort((a, b) => b.category.localeCompare(a.category));
        }
      }
    };

    const sortByMeasure = (data: IVisualCategoryData[], isMultiMeasure: boolean = false) => {
      let getValue: Function = (d: IVisualCategoryData) =>
        d.subCategories.reduce((value, s) => {
          if (isMultiMeasure) {
            value += s.value;
          } else {
            value += s.category === axisSettings.sortBy ? s.value : 0;
          }
          return value;
        }, 0);

      if (axisSettings.sortOrder === ESortOrder.Ascending) {
        data.sort((a, b) => {
          return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
        });
      } else if (axisSettings.sortOrder === ESortOrder.Descending) {
        data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
      }
    };

    if (axisSettings.isMeasure) {
      sortByMeasure(this.chartData);
    } else if (axisSettings.isMultiMeasure) {
      sortByMeasure(this.chartData, true);
    } else {
      sortByName(this.chartData);
    }
  }
}
