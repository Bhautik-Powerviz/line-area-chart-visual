import { Visual } from "../visual";
import { Selection } from "d3-selection";
import { LineType } from "../enum";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderXGridLines = (self: Visual): void => {
    const isLinearScale: boolean = typeof self.chartData.map((d) => d.value)[0] === "number";
    const xScaleTicks =
        self.isHorizontalChart && isLinearScale ? self.xScale.ticks(self.width / 90) : self.xScale.domain();
    const gridLinesSelection = self.xGridLinesG.selectAll("line").data(xScaleTicks);
    self.xGridLinesSelection = gridLinesSelection.join(
        (enter) => {
            const lines = enter.append("line");
            FormattingXGridLines(self, lines);
            return lines;
        },
        (update) => {
            FormattingXGridLines(self, update);
            return update;
        }
    );
}

export const RenderYGridLines = (self: Visual): void => {
    let yScaleTicks;
    if (self.isCutAndClipAxisEnabled && !self.isHorizontalChart) {
        yScaleTicks = [
            ...self.afterCutLinearScale.ticks(self.afterCutLinearScaleArea / 70),
            ...self.beforeCutLinearScale.ticks(self.beforeCutLinearScaleArea / 70),
        ];
    } else {
        yScaleTicks = self.isHorizontalChart ? self.yScale.domain() : self.yScale.ticks(self.height / 70);
    }
    const gridLinesSelection = self.yGridLinesG.selectAll("line").data(yScaleTicks);
    self.yGridLinesSelection = gridLinesSelection.join(
        (enter) => {
            const lines = enter.append("line");
            FormattingYGridLines(self, lines);
            return lines;
        },
        (update) => {
            FormattingYGridLines(self, update);
            return update;
        }
    );
}

export const FormattingXGridLines = (self: Visual, lineSelection: D3Selection<SVGElement>): void => {
    lineSelection
        .attr("class", self.xGridSettings.lineType)
        .classed("grid-line", true)
        .attr("x1", (d) => self.xScale(d))
        .attr("x2", (d) => self.xScale(d))
        .attr("y1", self.margin.top)
        .attr("y2", self.height)
        .attr("stroke", self.xGridSettings.lineColor)
        .attr("stroke-width", self.xGridSettings.lineWidth)
        .attr("opacity", 1)
        .attr(
            "stroke-dasharray",
            self.xGridSettings.lineType === LineType.Dotted
                ? `0, ${self.xGridSettings.lineWidth * 8} `
                : `${self.xGridSettings.lineWidth * 10}, ${self.xGridSettings.lineWidth * 10}`
        )
        .style("display", self.xGridSettings.show ? "block" : "none");
}

export const FormattingYGridLines = (self: Visual, lineSelection: D3Selection<SVGElement>): void => {
    lineSelection
        .attr("class", self.yGridSettings.lineType)
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("x2", self.width)
        .attr("y1", (d) => self.yScale(d))
        .attr("y2", (d) => self.yScale(d))
        .attr("stroke", self.yGridSettings.lineColor)
        .attr("stroke-width", self.yGridSettings.lineWidth)
        .attr("opacity", 1)
        .attr(
            "stroke-dasharray",
            self.yGridSettings.lineType === LineType.Dotted
                ? `0, ${self.yGridSettings.lineWidth * 8} `
                : `${self.yGridSettings.lineWidth * 10}, ${self.yGridSettings.lineWidth * 10} `
        )
        .style("display", self.yGridSettings.show ? "block" : "none");
}