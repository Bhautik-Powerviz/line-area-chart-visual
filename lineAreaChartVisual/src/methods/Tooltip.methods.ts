import { Visual } from "../visual";
import { Selection } from "d3-selection";
import { BarType } from "../enum";
import { IVisualCategoryData, IVisualTooltipData } from "../visual-data.model";
import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import { GetFormattedNumber } from "./NumberFormat.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderTooltipByChartType = (self: Visual, normalBarG: D3Selection<SVGElement>, stackedBarG: D3Selection<SVGElement>, groupedBarG: D3Selection<SVGElement>): void => {
    if (self.chartSettings.barType === BarType.Normal) {
        RenderTooltip(self, normalBarG.selectAll(".bar"));
    } else if (self.chartSettings.barType === BarType.Stacked) {
        RenderTooltip(self, stackedBarG.selectAll(".stackedBar"));
    } else if (self.chartSettings.barType === BarType.Grouped) {
        RenderTooltip(self, groupedBarG.selectAll(".groupedBar"));
    } else if (self.chartSettings.barType === BarType.GroupedStacked) {
        RenderTooltip(self, stackedBarG.selectAll(".stackedBar"));
    }
}

export const RenderTooltip = (self: Visual, selection: D3Selection<SVGElement>) => {
    if (!self.tooltipServiceWrapper) {
        return;
    }

    self.tooltipService.addTooltip(
        selection,
        (d: any) => {
            return getTooltipData(self.chartSettings.barType === BarType.Normal ? d : d?.tooltip);
        },
        (d) => (self.isGroupedBarChart ? d.tooltip.selectionId : d.selectionId)
    );

    const getTooltipData = (value: IVisualCategoryData): VisualTooltipDataItem[] => {
        const tooltipData: IVisualTooltipData[] = [
            {
                displayName:
                    self.chartSettings.barType !== BarType.Normal
                        ? self.isMultiMeasureValues
                            ? "Measure"
                            : self.subCategoryDisplayName
                        : self.categoryDisplayName,
                value:
                    typeof value.category === "string"
                        ? value.category.includes(self.othersBarText)
                            ? self.othersBarText.toUpperCase()
                            : value.category.toUpperCase()
                        : value.category,
                color: "transparent",
            },
            {
                displayName: self.isGroupedStackedBar ? value.groupedCategory! : value.category,
                value: GetFormattedNumber(self, parseFloat(value.value.toFixed(2)), true),
                color: value.styles!.bar.fillColor,
                pattern: self.getPatternByCategoryName(value.category)?.patternIdentifier,
            },
        ];

        if (self.chartSettings.barType !== BarType.Normal) {
            tooltipData.unshift({
                displayName: self.categoryDisplayName,
                value: typeof value.parentCategory === "string" ? value.parentCategory.toUpperCase() : value.parentCategory!,
                color: "transparent",
            });
        }

        if (self.errorBarsSettings.isShowTooltip) {
            if (value.tooltipUpperBoundValue) {
                tooltipData.push({
                    displayName: "Upper",
                    value: value.tooltipUpperBoundValue,
                    color: "transparent",
                });
            }

            if (value.tooltipLowerBoundValue) {
                tooltipData.push({
                    displayName: "Lower",
                    value: value.tooltipLowerBoundValue,
                    color: "transparent",
                });
            }
        }

        value.tooltipFields?.forEach((data) => {
            tooltipData.push({
                displayName: data.displayName,
                value:
                    typeof data.value === "number"
                        ? GetFormattedNumber(self, parseFloat(parseInt(data.value).toFixed(2)), true)
                        : parseInt(data.value).toFixed(2),
                color: data.color ?? "transparent",
            });
        });
        return tooltipData;
    };
}
