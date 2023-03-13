import powerbi from "powerbi-visuals-api";
import { SelectableDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivitySelectionService";
import { TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";
import { IPatternProps } from "./visual-settings.model";
import ISelectionId = powerbi.visuals.ISelectionId;

export interface IVisualCategoryData extends TooltipEnabledDataPoint, SelectableDataPoint {
  id: string;
  category: string;
  groupedCategory?: string;
  value: number;
  isHighlight?: boolean;
  raceBarKey?: string;
  raceBarDataLabel?: string;
  minValue?: number;
  maxValue?: number;
  positiveValueTotal?: number;
  negativeValueTotal?: number;
  selectionId?: ISelectionId;
  tooltipFields?: IVisualTooltipData[];
  sortId?: number;
  pattern?: IPatternProps;
  isOther?: boolean;
  imageDataUrl?: string;
  subCategories?: IVisualSubCategoryData[];
  styles?: {
    bar: IChartBarStyles;
  };
  parentCategory?: string;
  components?: any[];
  metaData?: { groupedCategoryTotal?: { [key: string]: number } };
  upperBoundValue?: number;
  lowerBoundValue?: number;
  boundsTotal?: number;
  tooltipUpperBoundValue?: string;
  tooltipLowerBoundValue?: string;
}

export interface IChartBarStyles {
  width?: number;
  height?: number;
  fillColor: string;
}

export interface IVisualSubCategoryData {
  category: string;
  parentCategory?: string;
  groupedCategory?: string;
  value: number;
  isHighlight?: boolean;
  selectionId?: ISelectionId;
  pattern?: IPatternProps;
  isOther?: boolean;
  tooltipFields?: IVisualTooltipData[];
  styles?: {
    bar: IChartBarStyles;
  };
  upperBoundValue?: number;
  lowerBoundValue?: number;
  boundsTotal?: number;
  tooltipUpperBoundValue?: string;
  tooltipLowerBoundValue?: string;
  identity?: any;
  selected?: boolean;
}

export interface IVisualTooltipData {
  displayName: string;
  value: string;
  color?: string;
  pattern?: string;
}

export interface IReferenceLinesData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  textX1: number;
  textY1: number;
  textAnchor: string;
  textAlignment: string;
}

export interface ILegendsDataPoint {
  data: {
    name: string;
    color: string;
    pattern: IPatternProps;
  };
}
