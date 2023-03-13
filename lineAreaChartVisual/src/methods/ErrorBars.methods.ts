import { Visual } from "../visual";
import { select as d3Select, Selection } from "d3-selection";
import { IVisualCategoryData } from "../visual-data.model";
import { ErrorBarsMarkers } from "../error-bars-markers";
import { BarType } from "../enum";
import { area } from "d3";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderErrorBarsLine = (self: Visual, errorBarsData: IVisualCategoryData[]): void => {
    const THIS = self;
    if (self.errorBarsSettings.isShowMarkers) {
        RenderErrorBarsMarker(self);
    }

    errorBarsData = self.errorBarsSettings.isEnabled ? errorBarsData : [];

    const errorBarsLineSelection = self.errorBarsLinesG
        .selectAll(".errorLineG")
        .data(errorBarsData, (d, i) => d.boundsTotal + i);
    errorBarsLineSelection.join(
        (enter) => {
            const lineGSelection = enter.append("g").attr("class", "errorLineG");
            const lineBorderSelection = lineGSelection.append("line").attr("class", "errorLineBorder");
            const lineSelection = lineGSelection
                .append("line")
                .attr("class", "errorLine")
                .each(function (d) {
                    if (THIS.errorBarsSettings.isShowMarkers) {
                        if (d.upperBoundValue) {
                            d3Select(this).attr("marker-end", "url(#errorBarsMarker)");
                        }

                        if (d.lowerBoundValue) {
                            d3Select(this).attr("marker-start", "url(#errorBarsMarker)");
                        }
                    } else {
                        d3Select(this).attr("marker-end", "");
                        d3Select(this).attr("marker-start", "");
                    }
                });

            self.isHorizontalChart
                ? FormattingHorizontalErrorBarsLine(self, lineSelection, lineBorderSelection, false)
                : FormattingVerticalErrorBarsLine(self, lineSelection, lineBorderSelection, false);
            return lineSelection;
        },
        (update) => {
            const lineBorderSelection = update.selectAll(".errorLineBorder");
            const lineSelection = update.selectAll(".errorLine").each(function (d) {
                if (THIS.errorBarsSettings.isShowMarkers) {
                    if (d.upperBoundValue) {
                        d3Select(this).attr("marker-end", "url(#errorBarsMarker)");
                    }

                    if (d.lowerBoundValue) {
                        d3Select(this).attr("marker-start", "url(#errorBarsMarker)");
                    }
                } else {
                    d3Select(this).attr("marker-end", "");
                    d3Select(this).attr("marker-start", "");
                }
            });

            self.isHorizontalChart
                ? FormattingHorizontalErrorBarsLine(self, lineSelection, lineBorderSelection, true)
                : FormattingVerticalErrorBarsLine(self, lineSelection, lineBorderSelection, true);
        }
    );

    if (self.errorBarsSettings.isShowErrorArea && self.isShowErrorBars) {
        DrawErrorBarsArea(self, errorBarsData);
    } else {
        DrawErrorBarsArea(self, []);
    }

    DrawErrorBarsLinesDash(this, self.errorBarsSettings.isShowDashLine ? errorBarsData : []);
}

export const RenderErrorBarsMarker = (self: Visual): void => {
    const markerSettings = self.errorBarsSettings.markers;
    const marker = ErrorBarsMarkers.find((marker) => marker.shape === markerSettings.shape)!;
    self.errorBarsMarker
        .attr("id", "errorBarsMarker")
        .attr("viewBox", `0 0 ${marker.vw} ${marker.vh}`)
        .attr("refX", marker.vw / 2)
        .attr("refY", marker.vh / 2)
        .attr("markerWidth", markerSettings.size)
        .attr("markerHeight", markerSettings.size)
        .attr("opacity", markerSettings.transparency / 100);

    self.errorBarsMarkerPath.attr("d", marker.path).attr("fill", markerSettings.color);
}

export const FormattingHorizontalErrorBarsLine = (self: Visual, lineSelection: D3Selection<SVGElement>, lineBorderSelection: D3Selection<SVGElement>, isUpdateMode: boolean): void => {
    const setXYPos = (selection: any) => {
        if (!isUpdateMode) {
            selection
                .attr("y1", (d) => GetErrorBarLineYPos(self, d))
                .attr("y2", (d) => GetErrorBarLineYPos(self, d))
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("x1", (d) => self.xScale(d.lowerBoundValue ?? d.value))
                .attr("x2", (d) => self.xScale(d.upperBoundValue ?? d.value));
        } else {
            selection
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("y1", (d) => GetErrorBarLineYPos(self, d))
                .attr("y2", (d) => GetErrorBarLineYPos(self, d))
                .attr("x1", (d) => self.xScale(d.lowerBoundValue ?? d.value))
                .attr("x2", (d) => self.xScale(d.upperBoundValue ?? d.value));
        }
    };

    SetErrorBarLineStyle(self, lineSelection, lineBorderSelection);
    setXYPos(lineSelection);
    setXYPos(lineBorderSelection);
}

export const FormattingVerticalErrorBarsLine = (self: Visual, lineSelection: D3Selection<SVGElement>, lineBorderSelection: D3Selection<SVGElement>, isUpdateMode: boolean): void => {
    const setXYPos = (selection: D3Selection<SVGElement>) => {
        if (!isUpdateMode) {
            selection
                .attr("x1", (d) => GetErrorBarLineXPos(self, d))
                .attr("x2", (d) => GetErrorBarLineXPos(self, d))
                .attr("y1", (d) => self.height)
                .attr("y2", (d) => self.height)
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("y1", (d) => self.yScale(d.lowerBoundValue ?? d.value))
                .attr("y2", (d) => self.yScale(d.upperBoundValue ?? d.value));
        } else {
            selection
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("x1", (d) => GetErrorBarLineXPos(self, d))
                .attr("x2", (d) => GetErrorBarLineXPos(self, d))
                .attr("y1", (d) => self.yScale(d.lowerBoundValue ?? d.value))
                .attr("y2", (d) => self.yScale(d.upperBoundValue ?? d.value));
        }
    };

    SetErrorBarLineStyle(self, lineSelection, lineBorderSelection);
    setXYPos(lineSelection);
    setXYPos(lineBorderSelection);
}

export const GetErrorBarLineYPos = (self: Visual, d: any): number => {
    const isGroupedBarChart = self.chartSettings.barType === BarType.Grouped;
    return (
        self.yScale(d.category) +
        (isGroupedBarChart ? self.groupedBarBandScale(d.bandScaleKey) + self.groupedBarScaleBandWidth / 2 : 0)
    );
}

export const SetErrorBarLineStyle = (self: Visual, lineSelection: D3Selection<SVGElement>, lineBorderSelection: D3Selection<SVGElement>): void => {
    lineSelection
        .attr("stroke", self.errorBarsSettings.lineColor)
        .attr("stroke-width", self.errorBarsSettings.lineWidth);

    lineBorderSelection.attr("stroke", "#ffffff").attr("stroke-width", self.errorBarsSettings.lineWidth + 1.4);
}

export const GetErrorBarLineXPos = (self: Visual, d: any): number => {
    const isGroupedBarChart = self.chartSettings.barType === BarType.Grouped;
    return (
        self.xScale(d.category) +
        (isGroupedBarChart ? self.groupedBarBandScale(d.bandScaleKey) + self.groupedBarScaleBandWidth / 2 : 0)
    );
}

export const DrawErrorBarsArea = (self: Visual, errorBarsData: IVisualCategoryData[]): void => {
    self.errorBarsAreaPath
        .datum(errorBarsData)
        .attr("fill", self.errorBarsSettings.areaColor)
        .attr("stroke", self.errorBarsSettings.areaColor)
        .attr("stroke-width", 1.5)
        .attr("opacity", self.errorBarsSettings.areaTransparency / 100);

    if (self.isHorizontalChart) {
        self.errorBarsAreaPath
            // .transition()
            // .duration(this.tickDuration)
            // .ease(d3.easeLinear)
            .attr(
                "d",
                area()
                    .y((d: any) => GetErrorBarLineYPos(self, d))
                    .x0((d: any) => self.xScale(d.lowerBoundValue ?? d.value))
                    .x1((d: any) => self.xScale(d.upperBoundValue ?? d.value))
            );
    } else {
        self.errorBarsAreaPath
            // .transition()
            // .duration(this.tickDuration)
            // .ease(d3.easeLinear)
            .attr(
                "d",
                area()
                    .x((d: any) => GetErrorBarLineXPos(self, d))
                    .y0((d: any) => self.yScale(d.lowerBoundValue ?? d.value))
                    .y1((d: any) => self.yScale(d.upperBoundValue ?? d.value))
            );
    }
}

export const DrawErrorBarsLinesDash = (self: Visual, errorBarsData: IVisualCategoryData[]): void => {
    const boundKeys = ["upperBoundValue", "lowerBoundValue"];
    const linesDashData = errorBarsData.reduce((acc, cur: any) => {
        boundKeys.forEach((k) => {
            acc = cur[k] ? [...acc, { category: cur.category, value: cur[k], bandScaleKey: cur.bandScaleKey }] : acc;
        });
        return acc;
    }, []);

    const errorBarsLinesDashSelection = self.errorBarsLinesDashG
        .selectAll(".errorLineDashG")
        .data(linesDashData, (d, i) => d.value + i);
    errorBarsLinesDashSelection.join(
        (enter) => {
            const lineGSelection = enter.append("g").attr("class", "errorLineDashG");
            const lineBorderSelection = lineGSelection.append("line").attr("class", "errorLineDashBorder");
            const lineSelection = lineGSelection.append("line").attr("class", "errorLineDash");
            self.isHorizontalChart
                ? FormattingHorizontalErrorBarsLineDash(self, lineSelection, lineBorderSelection, false)
                : FormattingVerticalErrorBarsLineDash(self, lineSelection, lineBorderSelection, false);
            return lineSelection;
        },
        (update) => {
            const lineBorderSelection = update.selectAll(".errorLineDashBorder");
            const lineSelection = update.selectAll(".errorLineDash");
            self.isHorizontalChart
                ? FormattingHorizontalErrorBarsLineDash(self, lineSelection, lineBorderSelection, true)
                : FormattingVerticalErrorBarsLineDash(self, lineSelection, lineBorderSelection, true);
        }
    );
}

export const FormattingHorizontalErrorBarsLineDash = (self: Visual, lineSelection: D3Selection<SVGElement>, lineBorderSelection: D3Selection<SVGElement>, isUpdateMode: boolean): void => {
    const dashSize = 5;
    const setXYPos = (selection: any) => {
        if (!isUpdateMode) {
            selection
                .attr("y1", (d) => GetErrorBarLineYPos(this, d) - dashSize)
                .attr("y2", (d) => GetErrorBarLineYPos(this, d) + dashSize)
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("x1", (d) => self.xScale(d.lowerBoundValue ?? d.value))
                .attr("x2", (d) => self.xScale(d.upperBoundValue ?? d.value));
        } else {
            selection
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("y1", (d) => GetErrorBarLineYPos(this, d) - dashSize)
                .attr("y2", (d) => GetErrorBarLineYPos(this, d) + dashSize)
                .attr("x1", (d) => self.xScale(d.lowerBoundValue ?? d.value))
                .attr("x2", (d) => self.xScale(d.upperBoundValue ?? d.value));
        }
    };

    SetErrorBarLineStyle(self, lineSelection, lineBorderSelection);
    setXYPos(lineSelection);
    setXYPos(lineBorderSelection);
}

export const FormattingVerticalErrorBarsLineDash = (self: Visual, lineSelection: D3Selection<SVGElement>, lineBorderSelection: D3Selection<SVGElement>, isUpdateMode: boolean): void => {
    const dashSize = 5;
    const setXYPos = (selection: any) => {
        if (!isUpdateMode) {
            selection
                .attr("x1", (d) => GetErrorBarLineXPos(this, d) - dashSize)
                .attr("x2", (d) => GetErrorBarLineXPos(this, d) + dashSize)
                .attr("y1", (d) => self.height)
                .attr("y2", (d) => self.height)
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("y1", (d) => self.yScale(d.value))
                .attr("y2", (d) => self.yScale(d.value));
        } else {
            selection
                // .transition()
                // .duration(this.tickDuration)
                // .ease(d3.easeLinear)
                .attr("x1", (d) => GetErrorBarLineXPos(this, d) - dashSize)
                .attr("x2", (d) => GetErrorBarLineXPos(this, d) + dashSize)
                .attr("y1", (d) => self.yScale(d.value))
                .attr("y2", (d) => self.yScale(d.value));
        }
    };

    SetErrorBarLineStyle(this, lineSelection, lineBorderSelection);
    setXYPos(lineSelection);
    setXYPos(lineBorderSelection);
}