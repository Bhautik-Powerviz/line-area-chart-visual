export enum EVisualConfig {
  ChartConfig = "chartConfig",
  DataColorsConfig = "dataColorsConfig",
  XGridLinesConfig = "xGridLinesConfig",
  YGridLinesConfig = "yGridLinesConfig",
  GridLinesConfig = "gridLinesConfig",
  DataLabelsConfig = "dataLabelsConfig",
  RankingConfig = "rankingConfig",
  SortingConfig = "sortingConfig",
  TooltipConfig = "tooltipConfig",
  PatternConfig = "patternConfig",
  XAxisConfig = "xAxisConfig",
  YAxisConfig = "yAxisConfig",
  ReferenceLinesConfig = "referenceLinesConfig",
  BarChartRaceConfig = "barChartRaceConfig",
  ErrorBarsConfig = "errorBarsConfig",
  SeriesLabelConfig = "seriesLabelConfig",
  SmallMultiplesConfig = "smallMultiplesConfig",
  DynamicDeviationConfig = "dynamicDeviationConfig",
  CutAndClipAxisConfig = "cutAndClipAxisConfig",
}

export enum EVisualSettings {
  ChartSettings = "chartSettings",
  DataColorsSettings = "dataColorsSettings",
  XAxisSettings = "xAxisSettings",
  YAxisSettings = "yAxisSettings",
  NumberSettings = "numberSettings",
  DataLabelsSettings = "dataLabelsSettings",
  GridLinesSettings = "gridLinesSettings",
  RankingSettings = "rankingSettings",
  SortingSettings = "sortingSettings",
  Legend = "legend",
  TooltipSettings = "tooltipSettings",
  PatternSettings = "patternSettings",
  ReferenceLinesSettings = "referenceLinesSettings",
  BarChartRaceSettings = "barChartRaceSettings",
  ErrorBarsSettings = "errorBarsSettings",
  SeriesLabelSettings = "seriesLabelSettings",
  SmallMultiplesSettings = "smallMultiplesSettings",
  DynamicDeviationSettings = "dynamicDeviationSettings",
  CutAndClipAxisSettings = "cutAndClipAxisSettings",
}

export enum BarType {
  Normal = "normal",
  Stacked = "stacked",
  Grouped = "grouped",
  GroupedStacked = "groupedStacked",
}

export enum DataRolesName {
  Category = "category",
  SubCategory = "subCategory",
  RaceBarData = "raceBarData",
  SmallMultiples = "smallMultiples",
  Value = "measure",
  Tooltips = "tooltip",
  ImagesData = "imagesData",
  UpperBound = "upperBound",
  LowerBound = "lowerBound",
}

export enum Position {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
  Start = "start",
  End = "end",
}

export enum DisplayUnits {
  Auto = "auto",
  None = "none",
  Thousands = "thousands",
  Millions = "millions",
  Billions = "billions",
  Trillions = "trillions",
}

export enum LineType {
  Dotted = "dotted",
  Dashed = "dashed",
  Solid = "solid",
}

export enum EGridLinesSettings {
  xGridLines = "xGridLines",
  yGridLines = "yGridLines",
  show = "show",
  lineType = "lineType",
  lineWidth = "lineWidth",
  lineColor = "lineColor",
}

export enum BarDistanceType {
  Auto = "auto",
  Custom = "custom",
}

export enum EAutoCustomType {
  Auto = "auto",
  Custom = "custom",
}

export enum Orientation {
  Vertical = "vertical",
  Horizontal = "horizontal",
}

export enum EChartSettings {
  barDistanceType = "barDistanceType",
  barDistance = "barDistance",
  GroupedBarDistanceType = "groupedBarDistanceType",
  GroupedBarDistance = "groupedBarDistance",
  orientation = "orientation",
  BarType = "barType",
  MaxSubcategoriesLength = "maxSubcategoriesLength",
  PrevBarType = "prevBarType",
  BarXPadding = "barXPadding",
  BarYPadding = "barYPadding",
  IsShowBarBorder = "isShowBarBorder",
  BarBorderColor = "barBorderColor",
  BarBorderWidth = "barBorderWidth",
  IsPercentageStackedBar = "isPercentageStackedBar",
  BarComparisonMode = "barComparisonMode",
  IsIBCSThemeEnabled = "isIBCSThemeEnabled",
  BarHighlightType = "barHighlightType",
  IsShowDataLabelForHighlightedBars = "isShowDataLabelForHighlightedBars",
  HighlightedBarRecentColor = "highlightedBarRecentColor",
  HighlightedBarMinColor = "highlightedBarMinColor",
  HighlightedBarMaxColor = "highlightedBarMaxColor",
}

export interface IVisualTooltipData {
  displayName: string;
  value: string;
  color?: string;
}

export enum FontStyle {
  None = "none",
  Bold = "bold",
  Italic = "italic",
  UnderLine = "underline",
}

export enum DataLabelsPlacement {
  End = "end",
  Center = "center",
  Base = "base",
  OutSide = "outSide",
}

export enum DataLabelsFontSizeType {
  Auto = "auto",
  Custom = "custom",
}

export enum EDataLabelsSettings {
  showDataLabels = "showDataLabels",
  showTotalLabels = "showTotalLabels",
  showLabelsBelowReferenceLine = "showLabelsBelowReferenceLine",
  color = "color",
  borderColor = "borderColor",
  borderWidth = "borderWidth",
  displayUnits = "displayUnits",
  valueDecimalPlaces = "valueDecimalPlaces",
  orientation = "orientation",
  fontSize = "fontSize",
  pieDataLabelFontSize = "pieDataLabelFontSize",
  fontFamily = "fontFamily",
  showBackground = "showBackground",
  backgroundColor = "backgroundColor",
  transparency = "transparency",
  fontStyle = "fontStyle",
  placement = "placement",
  fontSizeType = "fontSizeType",
  dataLabelsType = "dataLabelsType",
  dataLabels = "dataLabels",
  totalLabels = "totalLabels",
  TextStrokeColor = "textStrokeColor",
  TextStrokeWidth = "textStrokeWidth",
  DisplayStyleType = "displayStyleType",
}

export enum EDataColorsSettings {
  dataType = "dataType",
  barColor = "barColor",
  bar = "bar",
  fillmin = "fillmin",
  midcolor = "midcolor",
  fillmid = "fillmid",
  fillmax = "fillmax",
  fillnull = "fillnull",
  fillType = "fillType",
  numberOfClasses = "numberOfClasses",
  byCategoryColors = "byCategoryColors",
  schemeColors = "schemeColors",
  reverse = "reverse",
  isGradient = "isGradient",
  singleColor = "singleColor",
  defaultColor = "defaultColor",
  selectedCategoryName = "selectedCategoryName",
  selectedCategoryColor = "selectedCategoryColor",
  colorBlindSafe = "colorBlindSafe",
  isGradientWithinBar = "isGradientWithinBar",
  SubCategoriesColorMap = "subCategoriesColorMap",
}

export enum ColorPaletteType {
  Single = "single",
  PowerBi = "powerBi",
  Gradient = "gradient",
  ByCategory = "byCategory",
  Sequential = "sequential",
  Diverging = "diverging",
  Qualitative = "qualitative",
  NoColor = "noColor",
  IBCSTheme = "ibcsTheme",
}

export enum RankingFilterType {
  TopN = "topN",
  BottomN = "bottomN",
}

export enum ERankingSettings {
  filterType = "filterType",
  count = "count",
  showRemainingAsOthers = "showRemainingAsOthers",
  isCategoriesRanking = "isCategoriesRanking",
  isSubcategoriesRanking = "isSubcategoriesRanking",
  subCategoriesRanking = "subCategoriesRanking",
  barColor = "barColor",
  isRankingEnabled = "isRankingEnabled",
}

export enum ESortingSettings {
  IsCustomSortEnabled = "isCustomSortEnabled",
  SortBy = "sortBy",
  SortOrder = "sortOrder",
  Axis = "axis",
  Legend = "legend",
  SmallMultiples = "smallMultiples",
  IsMeasure = "isMeasure",
  IsMultiMeasure = "isMultiMeasure",
}

export enum ESortFor {
  Category = "category",
  Subcategory = "subcategory",
  Both = "both",
}

export enum ESortBy {
  Value = "value",
  Name = "name",
  TotalValue = "total-value",
}

export enum ESortOrder {
  Ascending = "ascending",
  Descending = "descending",
}

export enum ILegendPosition {
  TopLeft = "TopLeft",
  TopCenter = "TopCenter",
  TopRight = "TopRight",
  BottomLeft = "BottomLeft",
  BottomCenter = "BottomCenter",
  BottomRight = "BottomRight",
  LeftTop = "LeftTop",
  LeftCenter = "LeftCenter",
  LeftBottom = "LeftBottom",
  RightTop = "RightTop",
  RightCenter = "RightCenter",
  RightBottom = "RightBottom",
}

export enum LegendType {
  Legend = "legend",
}

export enum DataLabelsType {
  DataLabels = "dataLabels",
  TotalLabels = "totalLabels",
}

export enum TooltipType {
  Default = "default",
  ReportPage = "reportPage",
}

export enum PatternType {
  VerticalPatterns = "verticalPatterns",
  HorizontalPatterns = "horizontalPatterns",
}

export enum EPatternSettings {
  enable = "enable",
  patterns = "patterns",
  patternByCategories = "patternByCategories",
  othersPattern = "othersPattern",
  inheritParentPattern = "inheritParentPattern",
  patternIdentifier = "patternIdentifier",
  isImagePattern = "isImagePattern",
  dimensions = "dimensions",
  showBorder = "showBorder",
  borderWidth = "borderWidth",
  byCategory = "byCategory",
  singlePattern = "singlePattern",
  ImageFile = "imageFile",
  imageBase64Url = "imageBase64Url",
}

export enum EXAxisSettings {
  position = "position",
  isDisplayTitle = "isDisplayTitle",
  titleName = "titleName",
  titleColor = "titleColor",
  titleFontSize = "titleFontSize",
  titleFontFamily = "titleFontFamily",
  isDisplayLabel = "isDisplayLabel",
  labelColor = "labelColor",
  labelFontFamily = "labelFontFamily",
  labelFontSize = "labelFontSize",
  labelTilt = "labelTilt",
  labelCharLimit = "labelCharLimit",
  isLabelAutoTilt = "isLabelAutoTilt",
  isLabelAutoCharLimit = "isLabelAutoCharLimit",
  isDisplayImage = "isDisplayImage",
  IsImageWithinAxis = "isImageWithinAxis",
  IsImageWithinBar = "isImageWithinBar",
  ImageWithinBarPosition = "imageWithinBarPosition",
  ImageStyle = "imageStyle",
  BorderWidth = "borderWidth",
  BorderColor = "borderColor",
  IsShowImageBorder = "isShowImageBorder",
  MinimumRange = "minimumRange",
  MaximumRange = "maximumRange",
  IsLogarithmScale = "isLogarithmScale",
  CategoryType = "categoryType",
}

export enum EYAxisSettings {
  position = "position",
  isDisplayTitle = "isDisplayTitle",
  titleName = "titleName",
  titleColor = "titleColor",
  titleFontSize = "titleFontSize",
  titleFontFamily = "titleFontFamily",
  isDisplayLabel = "isDisplayLabel",
  labelColor = "labelColor",
  labelFontFamily = "labelFontFamily",
  labelFontSize = "labelFontSize",
  labelCharLimit = "labelCharLimit",
  isDisplayImage = "isDisplayImage",
  IsImageWithinAxis = "isImageWithinAxis",
  IsImageWithinBar = "isImageWithinBar",
  ImageWithinBarPosition = "imageWithinBarPosition",
  ImageStyle = "imageStyle",
  BorderWidth = "borderWidth",
  BorderColor = "borderColor",
  IsShowImageBorder = "isShowImageBorder",
  MinimumRange = "minimumRange",
  MaximumRange = "maximumRange",
  IsLogarithmScale = "isLogarithmScale",
  IsInvertRange = "isInvertRange",
  CategoryType = "categoryType",
}

export enum EBarChartRaceSettings {
  AllowTransition = "allowTransition",
  BarTransitionDuration = "barTransitionDuration",
  DataChangeInterval = "dataChangeInterval",
  LabelColor = "labelColor",
  LabelFontSize = "labelFontSize",
  LabelFontSizeType = "labelFontSizeType",
  LabelFontFamily = "labelFontFamily",
  TickerButtonRadius = "tickerButtonRadius",
  TickerButtonRadiusType = "tickerButtonRadiusType",
  TickerButtonColor = "tickerButtonColor",
}

export enum ESeriesLabelSettings {
  IsSeriesLabelEnabled = "isSeriesLabelEnabled",
  SeriesPosition = "seriesPosition",
  FontColor = "fontColor",
  FontSize = "fontSize",
  FontFamily = "fontFamily",
  FontStyle = "fontStyle",
  MaximumWidth = "maximumWidth",
  IsWordWrapEnabled = "isWordWrapEnabled",
  BackgroundColor = "backgroundColor",
  ShowBackground = "showBackground",
  Transparency = "transparency",
}

export enum ESmallMultiplesLayoutType {
  Grid = "grid",
  ScaledRows = "scaled-rows",
  RankedPanels = "ranked-panels"
}

export enum ESmallMultiplesDisplayType {
  Fixed = "fixed",
  Fluid = "Fluid",
}

export enum ESmallMultiplesViewType {
  Pagination = "pagination",
  Scroll = "scroll"
}

export enum ESmallMultiplesSettings {
  IsSmallMultiplesEnabled = "isSmallMultiplesEnabled",
  LayoutPane = "layoutPane",
  StylePane = "stylePane",
  ViewPane = "viewPane",
  AxisPane = "axisPane",
  HeaderPane = "headerPane",
  BackgroundPane = "backgroundPane",
  BorderPane = "borderPane",
  ShadowPane = "shadowPane",
  LayoutType = "layoutType",
  DisplayType = "displayType",
  ViewType = "viewType",
  Rows = "rows",
  Columns = "columns",
  xAxisType = "xAxisType",
  yAxisType = "yAxisType",
  xAxisPosition = "xAxisPosition",
  yAxisPosition = "yAxisPosition",
  InnerSpacing = "innerSpacing",
  OuterSpacing = "outerSpacing",
  Header = "header",
  FontFamily = "fontFamily",
  FontSize = "fontSize",
  FontColor = "fontColor",
  FontStyle = "fontStyle",
  Alignment = "alignment",
  Position = "position",
  IsTextWrapEnabled = "isTextWrapEnabled",
  Background = "background",
  BackgroundType = "type",
  Type = "type",
  PanelColor = "panelColor",
  AlternateColor = "alternateColor",
  Transparency = "transparency",
  Border = "border",
  IsShowBorder = "isShowBorder",
  Style = "style",
  Width = "width",
  Radius = "radius",
  Color = "color",
  Shadow = "shadow",
  VerticalOffset = "verticalOffset",
  HorizontalOffset = "horizontalOffset",
  Blur = "blur",
  Spread = "spread",
  Inset = "inset"
}

export enum ESmallMultiplesAxisType {
  Uniform = "uniform",
  Individual = "individual"
}

export enum ESmallMultiplesXAxisPosition {
  All = "all",
  FrozenTopColumn = "frozenTopColumn",
  FrozenBottomColumn = "frozenBottomColumn",
  FrozenTopAndBottomColumn = "frozenTopAndBottomColumn"
}

export enum ESmallMultiplesYAxisPosition {
  All = "all",
  FrozenLeftColumn = "frozenLeftColumn",
  FrozenRightColumn = "frozenRightColumn",
  FrozenLeftAndRightColumn = "frozenLeftAndRightColumn"
}

export enum ESmallMultiplesHeaderDisplayType {
  None = "none",
  TitleOnly = "titleOnly",
  TitleAndTotalValue = "titleAndTotalValue",
  TitleAndAverageValue = "titleAndAverageValue"
}

export enum ESmallMultiplesHeaderAlignment {
  Left = "left",
  Center = "center",
  Right = "right",
}

export enum ESmallMultiplesHeaderPosition {
  Top = "top",
  Bottom = "bottom"
}

export enum ESmallMultiplesBackgroundType {
  All = "all",
  AlternateItem = "alternateItem",
  AlternateRows = "alternateRows",
  AlternateColumns = "alternateColumns"
}

export enum ESmallMultiplesShadowType {
  None = "none",
  Simple = "shadow",
  StandOut = "standOut",
  Custom = "custom"
}

export enum EErrorBarsSettings {
  IsEnabled = "isEnabled",
  RelationshipToMeasure = "relationshipToMeasure",
  LineColor = "lineColor",
  AreaColor = "areaColor",
  LineWidth = "lineWidth",
  AreaTransparency = "areaTransparency",
  IsShowErrorArea = "isShowErrorArea",
  IsShowTooltip = "isShowTooltip",
  IsShowMarkers = "isShowMarkers",
  IsShowDashLine = "isShowDashLine",
  TooltipLabelFormat = "tooltipLabelFormat",
  Markers = "markers",
  MarkerShape = "shape",
  MarkerSize = "size",
  MarkerIsMatchSeriesColor = "isMatchSeriesColor",
  MarkerColor = "color",
  MarkerTransparency = "transparency",
}

export enum EDynamicDeviationSettings {
  IsEnabled = "isEnabled",
  DisplayType = "displayType",
  FromIndex = "fromIndex",
  ToIndex = "toIndex",
  Position = "position",
  LabelDisplayType = "labelDisplayType",
  LabelFontSize = "labelFontSize",
  LabelFontColor = "labelFontColor",
  LabelFontFamily = "labelFontFamily",
  IsShowLabelBorder = "isShowLabelBorder",
  BorderWidth = "borderWidth",
  BorderColor = "borderColor",
  IsShowLabelBackground = "isShowLabelBackground",
  BackgroundColor = "backgroundColor",
  BackgroundColorTransparency = "backgroundColorTransparency",
  ConnectorType = "connectorType",
  ConnectorColor = "connectorColor",
  ConnectorWidth = "connectorWidth",
  ConnectingLineColor = "connectingLineColor",
  connectingLineWidth = "connectingLineWidth",
  IsShowStartIndicator = "isShowStartIndicator",
  IsBarBorderEnabled = "isBarBorderEnabled",
}

export enum ECutAndClipAxisSettings {
  IsEnabled = "isEnabled",
  BreakStart = "breakStart",
  BreakEnd = "breakEnd",
  MarkerStrokeColor = "markerStrokeColor",
  MarkerBackgroundColor = "markerBackgroundColor",
}

export enum ERelationshipToMeasure {
  Absolute = "absolute",
  Relative = "relative",
}

export enum EErrorBarsBound {
  UpperBoundValue = "upperBoundValue",
  LowerBoundValue = "lowerBoundValue",
}

export enum EErrorBarsTooltipLabelFormat {
  Absolute = "absolute",
  RelativeNumeric = "relativeNumeric",
  RelativePercentage = "relativePercentage",
}

export enum ImageLabelType {
  IsImageWithinAxis = "isImageWithinAxis",
  IsImageWithinBar = "isImageWithinBar",
}

export enum EXYAxisNames {
  X = "X",
  Y = "Y",
}

export enum EReferenceLinesType {
  Value = "value",
  Ranking = "ranking",
}

export enum EStartEndPosition {
  Start = "start",
  End = "end",
}

export enum EBeforeAfterPosition {
  Before = "before",
  After = "after",
}

export enum ELCRPosition {
  Left = "left",
  Centre = "center",
  Right = "right",
}

export enum EBarComparisonMode {
  Auto = "auto",
  Compare = "compare",
}

export enum EPlayPauseButton {
  Play = "play",
  Pause = "pause",
}

export enum EErrorBarsMarkerShape {
  Circle = "circle",
  Square = "square",
  Close = "close",
  Dash = "dash",
  Minus = "minus",
  Plus = "plus",
}

export enum ELabelPosition {
  Top = "top",
  Below = "below",
}

export enum LassoSelectionMode {
  Rectangular = "rectangular",
  ReverseRectangular = "reverse-rectangular",
}

export enum AxisCategoryType {
  Continuous = "continuous",
  Categorical = "categorical",
}

export enum SemanticNegativeNumberFormats {
  X = "X",
  MinusX = "MinusX",
  XMinus = "XMinus",
  XInBrackets = "XInBrackets",
}

export enum SemanticPositiveNumberFormats {
  X = "X",
  PlusX = "PlusX",
  XPlus = "XPlus",
}

export enum EDynamicDeviationDisplayTypes {
  Auto = "auto",
  CreateYourOwn = "create-your-own",
  CustomRange = "custom-range",
  FirstToLast = "first-to-last",
  LastToFirst = "last-to-first",
  FirstToLastActual = "first-to-last-actual",
  LastToFirstActual = "last-to-first-actual",
  MinToMax = "min-to-max",
  PenultimateToLast = "penultimate-to-last",
}

export enum EDynamicDeviationLabelDisplayTypes {
  Value = "value",
  Percentage = "percentage",
  Both = "both",
}

export enum EDynamicDeviationConnectingLineTypes {
  Arrow = "arrow",
  Bar = "bar",
  Dots = "dots",
}

export enum EReferenceLineComputation {
  Min = "min",
  Max = "max",
  Average = "average",
  Median = "median",
  Fixed = "fixed",
}

export enum EBarHighlightType {
  None = "none",
  MinMax = "min/max",
  FirstLast = "first/last",
  Last = "last",
}

export enum EDataLabelsDisplayStyleType {
  All = "all",
  MinMax = "min/max",
  FirstLast = "first/last",
  Last = "last",
}
