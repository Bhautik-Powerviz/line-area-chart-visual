import { Visual } from "../visual";
import powerbi from "powerbi-visuals-api";
import { GetAxisDomainMinMax } from "./Axis.methods";
import { axisBottom, axisLeft, axisRight, axisTop, scaleLinear, scaleSymlog } from "d3";
import { Position } from "../enum";

export const RenderLinearCutAxis = (self: Visual): void => {
    SetLinearCutAxisDomain(self, false, self.categoricalData);
    SetLinearCutAxisRange(self, self.width, self.height);
    CallLinearCutScaleOnAxisGroup(self);
}

export const SetLinearCutAxisDomain = (self: Visual, isOnlySetDomain: boolean, categoricalData: powerbi.DataViewCategorical): void => {
    const { min, max } = GetAxisDomainMinMax(self, categoricalData);
    const isLinearScale: boolean = typeof self.chartData.map((d) => d.value)[0] === "number";
    const isLogarithmScale: boolean | undefined = self.axisByBarOrientation.isLogarithmScale;

    if (self.isHorizontalChart) {
        if (!isOnlySetDomain) {
            self.beforeCutLinearScale = isLogarithmScale ? scaleSymlog().nice() : scaleLinear().nice();
            self.afterCutLinearScale = isLogarithmScale ? scaleSymlog().nice() : scaleLinear().nice();
        }

        if (isLinearScale) {
            if (self.isLeftYAxis) {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]);
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]);
            } else {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]);
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]);
            }
        }
    } else {
        if (!isOnlySetDomain) {
            self.beforeCutLinearScale = isLogarithmScale ? scaleSymlog().nice() : scaleLinear().nice();
            self.afterCutLinearScale = isLogarithmScale ? scaleSymlog().nice() : scaleLinear().nice();
        }

        if (isLinearScale) {
            if (self.isBottomXAxis) {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]);
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]);
            } else {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]);
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]);
            }
        }
    }
}

export const SetLinearCutAxisRange = (self: Visual, xScaleWidth: number, yScaleHeight: number): void => {
    const beforeCutDomain = self.beforeCutLinearScale.domain();
    const afterCutDomain = self.afterCutLinearScale.domain();
    const min = beforeCutDomain[0];
    const max = afterCutDomain[1];
    const beforeCutValue = self.cutAndClipAxisSettings.breakStart - min;
    const afterCutValue = max - self.cutAndClipAxisSettings.breakEnd;
    const maxWithoutCuttingValue = beforeCutValue + afterCutValue;
    const beforeCutAreaInPercentage = (beforeCutValue * 100) / maxWithoutCuttingValue;
    const afterCutAreaInPercentage = (afterCutValue * 100) / maxWithoutCuttingValue;
    const width = xScaleWidth - self.groupedStackedBarsLabelWidth;
    const height = yScaleHeight - self.groupedStackedBarsLabelHeight;
    const beforeCutLinearScaleArea =
        ((yScaleHeight - self.groupedStackedBarsLabelWidth) * beforeCutAreaInPercentage) / 100;
    const afterCutLinearScaleArea =
        ((yScaleHeight - self.groupedStackedBarsLabelWidth) * afterCutAreaInPercentage) / 100;
    self.beforeCutLinearScaleArea = beforeCutLinearScaleArea;
    self.afterCutLinearScaleArea = afterCutLinearScaleArea;

    if (self.isHorizontalChart) {
        if (self.isLeftYAxis) {
            self.beforeCutLinearScale.range([
                self.groupedStackedBarsLabelWidth,
                beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap,
            ]);

            self.afterCutLinearScale.range([beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2, xScaleWidth]);
        } else {
            self.afterCutLinearScale.range([
                width - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap,
                self.groupedStackedBarsLabelWidth,
            ]);

            self.beforeCutLinearScale.range([
                xScaleWidth,
                width - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2,
            ]);
        }
    } else {
        if (self.isBottomXAxis) {
            self.beforeCutLinearScale.range([
                height,
                height - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2,
            ]);

            self.afterCutLinearScale.range([height - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap, 0]);
        } else {
            self.afterCutLinearScale.range([beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2, height]);

            self.beforeCutLinearScale.range([0, beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap]);
        }
    }
}

export const CallLinearCutScaleOnAxisGroup = (self: Visual): void => {
    if (self.isBottomXAxis) {
        self.xAxisG.attr("transform", "translate(0," + self.height + ")");
    } else {
        self.xAxisG.attr("transform", "translate(0," + 0 + ")");
    }

    if (self.isLeftYAxis) {
        self.yAxisG.attr("transform", `translate(0, 0)`);
    } else {
        self.yAxisG.attr("transform", `translate(${self.width}, 0)`);
    }

    if (self.isHorizontalChart) {
        if (self.xAxisSettings.position === Position.Bottom) {
            self.beforeCutLinearXAxisG
                .attr("transform", `translate(0, ${0})`)
                .call(axisBottom(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 90));
            self.afterCutLinearXAxisG
                .attr("transform", `translate(0, ${0})`)
                .call(axisBottom(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 90));
        } else if (self.xAxisSettings.position === Position.Top) {
            self.beforeCutLinearXAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisTop(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 90));
            self.afterCutLinearXAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisTop(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 90));
        }
    } else {
        if (self.yAxisSettings.position === Position.Left) {
            self.beforeCutLinearYAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisLeft(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 70));
            self.afterCutLinearYAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisLeft(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 70));
        } else if (self.yAxisSettings.position === Position.Right) {
            self.beforeCutLinearYAxisG
                .attr("transform", `translate(${0}, 0)`)
                .call(axisRight(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 70));
            self.afterCutLinearYAxisG
                .attr("transform", `translate(${0}, 0)`)
                .call(axisRight(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 70));
        }
    }
}
