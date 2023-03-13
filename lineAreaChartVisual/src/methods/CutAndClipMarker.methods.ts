import { Visual } from "../visual";
import { Selection } from "d3-selection";
import { IVisualCategoryData } from "../visual-data.model";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderCutAndClipMarkerOnAxis = (self: Visual): void => {
    const width = 12;
    const height = self.isHorizontalChart ? 12 : 6;
    self.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
    const cutAndClipMarkerG = self.axisCutAndClipMarkerG
        .append("g")
        .attr("class", "cutAndClipMarkerG")
        .attr("clip-path", "url(#cutMarkerClipOnAxis)");
    const beforeCutDomain = self.beforeCutLinearScale?.domain() ?? [0, 0];
    const afterCutDomain = self.afterCutLinearScale?.domain() ?? [0, 0];
    const secG = cutAndClipMarkerG.append("g");
    const transX = self.xScale(self.isLeftYAxis ? beforeCutDomain[1] : afterCutDomain[0]);

    const cutMarkerClipG = self.axisCutAndClipMarkerG.append("g").attr("class", "cutMarkerClipG");

    if (self.isHorizontalChart) {
        if (self.isGroupedBarChart) {
            secG.attr(
                "transform",
                `translate(${transX - (!self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : 0)}, ${self.isBottomXAxis ? self.height : 0
                })`
            );
        } else {
            secG.attr("transform", `translate(${transX}, ${self.isBottomXAxis ? self.height : 0})`);
        }
    } else {
        secG.attr(
            "transform",
            `translate(${self.isLeftYAxis ? -(width / 2) : self.width - width / 2}, ${self.yScale(self.cutAndClipAxisSettings.breakEnd) -
            (self.isBottomXAxis ? 0 : self.barCutAndClipMarkerLinesGap / 2)
            })`
        );
    }

    if (self.isHorizontalChart) {
        cutMarkerClipG
            .append("clipPath")
            .attr("id", "cutMarkerClipOnAxis")
            .append("rect")
            .attr("width", 100)
            .attr("height", height)
            .attr(
                "transform",
                `translate(${self.xScale(self.cutAndClipAxisSettings.breakStart) - 50}, ${(self.isBottomXAxis ? self.height : 0) - height / 2
                })`
            );

        secG
            .append("rect")
            .attr("width", width / 2)
            .attr("height", height + width / 2)
            .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
            .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
            .attr("stroke-width", "3px")
            .attr("transform", `translate(${0}, ${- (height + width / 2) / 2}) rotate(${self.cutAndClipMarkerTilt})`);
    } else {
        secG
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
            .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
            .attr("stroke-width", "3px")
            .attr("stroke-dasharray", `${width} ${self.cutAndClipMarkerHeight} `)
            .attr(
                "transform",
                `translate(${0}, ${((width - 3) * self.cutAndClipMarkerTilt) / 100}) rotate(${- self.cutAndClipMarkerTilt})`
            );
    }
}

export const GetIsCutAndClipAxisEnabled = (self: Visual): boolean => {
    const breakStart = self.cutAndClipAxisSettings.breakStart;
    const breakEnd = self.cutAndClipAxisSettings.breakEnd;
    const minValue = self.minCategoryValueDataPair.value;
    const maxValue = self.maxCategoryValueDataPair.value;

    return (
        self.cutAndClipAxisSettings.isEnabled &&
        breakEnd > breakStart &&
        (minValue >= 0 ? breakStart > 0 : breakStart > minValue) &&
        breakEnd < maxValue &&
        (self.isNormalBarChart || self.isGroupedBarChart)
    );
}

export const RenderBarCutAndClipMarker = (self: Visual, barData: IVisualCategoryData[]): void => {
    const filteredData = barData.filter((d) => d.value > self.cutAndClipAxisSettings.breakStart);
    const imageGSelection = self.barCutAndClipMarkersG
        .selectAll(".barCutAndClipMarkersG")
        .data(filteredData, (d) => Math.random());
    imageGSelection.join(
        (enter) => {
            const clipG = enter.append("g").attr("clip-path", (d) => {
                return self.isGroupedBarChart
                    ? `url(#${self.getTrimmedString(d?.category)} - ${self.getTrimmedString(d?.subCategory)}Clip)`
                    : `url(#${self.getBarIdByCategory(d?.category)}Clip)`;
            });
            const imageG = clipG.append("g").attr("class", "barCutAndClipMarkersG");
            const rect = imageG.append("rect").attr("class", "barCutAndClipRect");
            self.isHorizontalChart
                ? FormattingVerticalBarCutAndClipMarker(self, imageG, rect)
                : FormattingHorizontalBarCutAndClipMarker(self, imageG, rect);
        },
        (update) => {
            const rect = update.select(".barCutAndClipRect");
            self.isHorizontalChart
                ? FormattingVerticalBarCutAndClipMarker(self, update, rect)
                : FormattingHorizontalBarCutAndClipMarker(self, update, rect);
        }
    );
}

export const FormattingVerticalBarCutAndClipMarker = (self: Visual, imageGSelection: D3Selection<SVGElement>, rectSelection: D3Selection<SVGElement>): void => {
    const beforeCutScaleDomain = self.beforeCutLinearScale?.domain() ?? [0, 0];
    const transX = self.xScale(self.isLeftYAxis ? beforeCutScaleDomain[1] : beforeCutScaleDomain[1]);
    const rectHeight = self.isGroupedBarChart ? self.groupedBarScaleBandWidth : self.scaleBandWidth / 2;

    imageGSelection.attr("transform", (d) => {
        if (self.isGroupedBarChart) {
            return `translate(${transX - (!self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : 0)}, ${self.yScale(d.category) + self.groupedBarBandScale(d.bandScaleKey)
                })`;
        } else {
            return `translate(${transX - (!self.isLeftYAxis ? -self.cutAndClipMarkerWidth : 0)}, ${self.yScale(d?.category) - rectHeight / 2
                })`;
        }
    });

    rectSelection
        .attr("width", self.cutAndClipMarkerWidth)
        .attr("height", rectHeight + 8)
        .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
        .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
        .attr("stroke-width", "3px")
        .attr("transform", `translate(${0}, ${- self.cutAndClipMarkerWidth / 2}) rotate(${self.cutAndClipMarkerTilt})`);
}

export const FormattingHorizontalBarCutAndClipMarker = (self: Visual, imageGSelection: D3Selection<SVGElement>, rectSelection: D3Selection<SVGElement>): void => {
    const afterCutScaleDomain = self.afterCutLinearScale?.domain() ?? [0, 0];
    const transY = self.yScale(afterCutScaleDomain?.length ? afterCutScaleDomain[0] : 0);
    const rectWidth = self.isGroupedBarChart ? self.groupedBarScaleBandWidth : self.scaleBandWidth / 2;

    imageGSelection.attr("transform", (d) => {
        if (self.isGroupedBarChart) {
            return `translate(${self.groupedBarBandScale(d.bandScaleKey) + self.xScale(d.category)}, ${transY - (!self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : 0)
                })`;
        } else {
            return `translate(${self.xScale(d.category) - rectWidth / 2}, ${transY - (!self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : 0)
                })`;
        }
    });

    rectSelection
        .attr("width", rectWidth + self.cutAndClipMarkerDiff)
        .attr("height", self.cutAndClipMarkerHeight)
        .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
        .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
        .attr("stroke-width", "3px")
        .attr(
            "transform",
            `translate(${- self.cutAndClipMarkerHeight / 2}, ${((rectWidth - self.cutAndClipMarkerHeight / 2) * self.cutAndClipMarkerTilt) / 100
            }) rotate(${- self.cutAndClipMarkerTilt})`
        );
}