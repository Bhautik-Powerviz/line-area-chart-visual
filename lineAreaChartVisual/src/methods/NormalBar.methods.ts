import { Visual } from "../visual";
import { select as d3Select, Selection } from "d3-selection";
import { max as d3Max } from "d3-array";
import { EDynamicDeviationDisplayTypes } from "../enum";
import { IVisualCategoryData } from "../visual-data.model";
import { IPatternProps } from "../visual-settings.model";
import { easeLinear, scaleLinear } from "d3";
import { RenderDynamicDeviation } from "./DynamicDeviation.methods";
import { GetNormalBarAnnotationDataPoint, RenderBarAnnotations } from "./Annotations.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const GetNormalBarWidth = (self: Visual, barData: IVisualCategoryData): number => {
	if (self.isHorizontalChart) {
		const getBarWidth = (d) => {
			if (self.isLeftYAxis) {
				return d.value >= 0 ? self.xScale(d.value) - self.xScale(0) : self.xScale(0) - self.xScale(d.value);
			} else {
				return d.value >= 0 ? self.xScale(0) - self.xScale(d.value) : self.xScale(d.value) - self.xScale(0);
			}
		};
		return getBarWidth(barData);
	} else {
		const barWidth = self.scaleBandWidth / 2;
		return barWidth;
	}
};

export const GetNormalBarHeight = (self: Visual, barData: IVisualCategoryData): number => {
	if (self.isHorizontalChart) {
		const barHeight = self.scaleBandWidth / 2;
		return barHeight;
	} else {
		const getBarHeight = (d) => {
			if (self.isBottomXAxis) {
				return d.value >= 0 ? self.yScale(0) - self.yScale(d.value) : self.yScale(d.value) - self.yScale(0);
			} else {
				return d.value >= 0 ? self.yScale(d.value) - self.yScale(0) : self.yScale(0) - self.yScale(d.value);
			}
		};
		return getBarHeight(barData);
	}
};

export const FormattingNormalVerticalBars = (
	self: Visual,
	foreignObjectSelection: D3Selection<SVGElement>,
	divSelection: D3Selection<HTMLElement>,
	isUpdateMode: boolean
): void => {
	const barWidth = self.scaleBandWidth;
	const paddingScale = scaleLinear()
		.domain([0, 100])
		.range([0, barWidth / 2]);

	const min = self.minScaleRangeFromSettings;
	const max = self.maxScaleRangeFromSettings;

	const getBarMinValue = (currentVal: number): number => {
		return self.yScale(currentVal < min && min > 0 ? min : currentVal);
	}

	const getBarCurrentValue = (currentVal: number): number => {
		return self.yScale(currentVal > max && max > 0 ? max : currentVal);
	}

	const getBarHeight = (d) => {
		if (self.isBottomXAxis) {
			return d.value >= 0 ? getBarMinValue(0) - getBarCurrentValue(d.value) : getBarCurrentValue(d.value) - getBarMinValue(0);
		} else {
			return d.value >= 0 ? getBarCurrentValue(d.value) - getBarMinValue(0) : getBarMinValue(0) - getBarCurrentValue(d.value);
		}
	};

	const getBarPadding = (d: IVisualCategoryData): { topBarPadding: number; bottomBarPadding: number } => {
		let topBarPadding = paddingScale(self.chartSettings.barXPadding);
		let bottomBarPadding = paddingScale(self.chartSettings.barYPadding);
		const barHeight = getBarHeight(d);
		if (barHeight / 2 < topBarPadding) {
			const diff = topBarPadding - barHeight / 2;
			topBarPadding -= diff;
		}
		if (barHeight / 2 < bottomBarPadding) {
			const diff = bottomBarPadding - barHeight / 2;
			bottomBarPadding -= diff;
		}
		return { topBarPadding, bottomBarPadding };
	};

	const getBarX = (d: IVisualCategoryData) => {
		return self.xScale(d.category) ?? 0;
	};

	const getBarYByAxisMaxRange = (barValue: number): number => {
		if (barValue > max && max > 0) {
			return max;
		} else {
			return barValue;
		}
	}

	const getBarY = (d: IVisualCategoryData) => {
		return d.value >= 0 ? self.yScale(self.isBottomXAxis ? getBarYByAxisMaxRange(d.value) : min) ?? 0 : self.yScale(!self.isBottomXAxis ? getBarYByAxisMaxRange(d.value) : 0) ?? 0;
	};

	if (!isUpdateMode) {
		foreignObjectSelection
			.attr("width", barWidth)
			.attr("height", 0)
			.classed("fade-off-bar", (d) => d.isFadeOffBar)
			.attr("x", (d) => getBarX(d))
			.attr("y", self.height)
			.transition()
			.duration(self.tickDuration)
			.ease(easeLinear)
			.attr("height", (d) => getBarHeight(d))
			.attr("y", (d) => getBarY(d))
			.on("end", () => {
				RenderBarAnnotations(self, GetNormalBarAnnotationDataPoint);
			});
	} else {
		foreignObjectSelection
			.attr("width", barWidth)
			.transition()
			.duration(self.tickDuration)
			.ease(easeLinear)
			.attr("height", (d) => getBarHeight(d))
			.attr("x", (d) => getBarX(d))
			.attr("y", (d) => getBarY(d))
			.on("end", () => {
				RenderBarAnnotations(self, GetNormalBarAnnotationDataPoint);
			});
	}

	const isCreateOwnDynamicDeviation: boolean =
		self.dynamicDeviationSettings.isEnabled && self.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn;

	foreignObjectSelection.on("mouseover", function (d) {
		if (isCreateOwnDynamicDeviation || self.isDynamicDeviationButtonSelected) {
			if (self.fromCategoryValueDataPair && !self.toCategoryValueDataPair) {
				const data: any = d3Select(this).datum();
				const toCategoryValueDataPair = { category: data.category, value: data.value };
				RenderDynamicDeviation(self, self.fromCategoryValueDataPair, toCategoryValueDataPair);
				self.toCategoryValueDataPair = undefined!;
			}
		}
	});

	divSelection
		.style("width", "100%")
		// .style("height", `calc(100% - ${self.isLabelImageWithinBar ? self.axisLabelImageHeight / 2 : 0}px)`)
		.style("height", "100%")
		.style("position", "absolute")
		// .style(
		//     "top",
		//     (self.isLabelImageWithinBar && self.labelImagePositionWithinBar === Position.Top ? self.axisLabelImageHeight / 2 : 0) + "px"
		// )
		.style("top", "unset")
		.style("left", "unset")
		.style("display", "flex")
		.style("align-items", "self-end")
		.style("justify-content", "center")
		// .attr("fill", (d) => {
		//     return self.getNormalBarFill(d);
		// })
		.each((d, i, nodes) => {
			const bar = d3Select(nodes[i]);
			const { topBarPadding, bottomBarPadding } = getBarPadding(d);
			self.setBarBackground(bar, d.pattern, d.styles?.bar?.fillColor, d.isOther);
			bar
				.style("border-top-left-radius", topBarPadding + "px")
				.style("border-top-right-radius", topBarPadding + "px")
				.style("border-bottom-left-radius", bottomBarPadding + "px")
				.style("border-bottom-right-radius", bottomBarPadding + "px");
		})
		.style("background-size", (d) => {
			const pattern: IPatternProps = d.pattern;
			return self.getBarBackgroundSize(pattern, barWidth);
		})
		.style("background-position", "bottom")
		.style("background-repeat", "repeat")
		.style("border-style", "solid")
		.style("border-color", (d) => self.getBarBorderColor(d.styles?.bar?.fillColor, d.pattern))
		.style("border-width", (d) => self.getBarBorderWidth(d.pattern) + "px")
		.style("opacity", (d) => (self.xScale(d.category) >= 0 ? 1 : 0));
	// .style("display", (d) => (self.yScale(d.value) < 0 || (getBarY(d) + getBarHeight(d)) > self.height) ? "none" : "flex");

	SetVerticalBarDivVariationWidth(self, divSelection, barWidth, paddingScale, getBarHeight);
};

export const FormattingNormalHorizontalBars = (
	self: Visual,
	foreignObjectSelection: D3Selection<SVGElement>,
	divSelection: D3Selection<HTMLElement>,
	isUpdateMode: boolean
): void => {
	const barHeight = self.scaleBandWidth;
	const paddingScale = scaleLinear()
		.domain([0, 100])
		.range([0, barHeight / 2]);

	const min = self.minScaleRangeFromSettings;
	const max = self.maxScaleRangeFromSettings;

	const getBarMinValue = (currentVal: number): number => {
		return self.xScale(currentVal < min && min > 0 ? min : currentVal);
	}

	const getBarCurrentValue = (currentVal: number): number => {
		return self.xScale(currentVal > max && max > 0 ? max : currentVal);
	}

	const getBarWidth = (d) => {
		if (self.isLeftYAxis) {
			return d.value >= 0 ? getBarCurrentValue(d.value) - getBarMinValue(0) : getBarMinValue(0) - getBarCurrentValue(d.value);
		} else {
			return d.value >= 0 ? getBarMinValue(0) - getBarCurrentValue(d.value) : getBarCurrentValue(d.value) - getBarMinValue(0);
		}
	};

	const getBarPadding = (d: IVisualCategoryData): { rightBarPadding: number; leftBarPadding: number } => {
		let leftBarPadding = paddingScale(self.chartSettings.barXPadding);
		let rightBarPadding = paddingScale(self.chartSettings.barYPadding);
		const barWidth = getBarWidth(d);
		if (barWidth / 2 < leftBarPadding) {
			const diff = leftBarPadding - barWidth / 2;
			leftBarPadding -= diff;
		}
		if (barWidth / 2 < rightBarPadding) {
			const diff = rightBarPadding - barWidth / 2;
			rightBarPadding -= diff;
		}
		return { leftBarPadding, rightBarPadding };
	};

	const getBarYByAxisMaxRange = (barValue: number): number => {
		if (barValue > max && max > 0) {
			return max;
		} else {
			return barValue;
		}
	}

	const getBarX = (d: IVisualCategoryData) => {
		return (d.value >= 0 ? self.xScale(self.isLeftYAxis ? min : getBarYByAxisMaxRange(d.value)) : self.xScale(!self.isLeftYAxis ? min : getBarYByAxisMaxRange(d.value))) ?? 0;
	};

	const getBarY = (d: IVisualCategoryData) => {
		return self.yScale(d.category) ?? 0;
	};

	if (!isUpdateMode) {
		foreignObjectSelection
			.attr("width", 0)
			.attr("height", barHeight)
			.classed("fade-off-bar", (d) => d.isFadeOffBar)
			.attr("x", d => getBarX(d))
			.attr("y", (d) => getBarY(d))
			// .on("click", function () {
			//     self.highlightActiveBar(d3.select(self), self.normalBarG.selectAll("foreignObject"));
			// })
			.transition()
			.duration(self.tickDuration)
			.ease(easeLinear)
			.attr("width", (d) => getBarWidth(d))
			.on("end", () => {
				RenderBarAnnotations(self, GetNormalBarAnnotationDataPoint);
			});
	} else {
		foreignObjectSelection
			.attr("height", barHeight)
			// .on("click", function () {
			//     self.highlightActiveBar(d3.select(self), self.normalBarG.selectAll("foreignObject"));
			// })
			.transition()
			.duration(self.tickDuration)
			.ease(easeLinear)
			.attr("width", (d) => {
				return getBarWidth(d);
			})
			.attr("x", (d) => getBarX(d))
			.attr("y", (d) => getBarY(d))
			.on("end", () => {
				RenderBarAnnotations(self, GetNormalBarAnnotationDataPoint);
			});
	}

	const isCreateOwnDynamicDeviation: boolean =
		self.dynamicDeviationSettings.isEnabled && self.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn;
	foreignObjectSelection.on("mouseover", function (d) {
		if (isCreateOwnDynamicDeviation || self.isDynamicDeviationButtonSelected) {
			if (self.fromCategoryValueDataPair && !self.toCategoryValueDataPair) {
				const data: any = d3Select(this).datum();
				const toCategoryValueDataPair = { category: data.category, value: data.value };
				RenderDynamicDeviation(self, self.fromCategoryValueDataPair, toCategoryValueDataPair);
				self.toCategoryValueDataPair = undefined!;
			}
		}
	});

	divSelection
		// .style("width", `calc(100% - ${self.isLabelImageWithinBar ? self.axisLabelImageWidth / 2 : 0}px)`)
		.style("width", "100%")
		.style("height", "100%")
		.style("position", "absolute")
		.style("top", "unset")
		// .style(
		//     "left",
		//     self.isLabelImageWithinBar && self.labelImagePositionWithinBar === Position.Left ? self.axisLabelImageWidth / 2 + "px" : 0
		// )
		.style("left", "unset")
		.style("display", "flex")
		.style("align-items", "center")
		.attr("fill", (d) => {
			return self.getNormalBarFill(d);
		})
		.each((d, i, nodes) => {
			const bar = d3Select(nodes[i]);
			const { leftBarPadding, rightBarPadding } = getBarPadding(d);
			self.setBarBackground(bar, d.pattern, d.styles?.bar?.fillColor, d.isOther);
			bar
				.style("border-top-left-radius", leftBarPadding + "px")
				.style("border-top-right-radius", rightBarPadding + "px")
				.style("border-bottom-left-radius", leftBarPadding + "px")
				.style("border-bottom-right-radius", rightBarPadding + "px");
		})
		.style("background-size", (d) => {
			const pattern: IPatternProps = d.pattern;
			return self.getBarBackgroundSize(pattern, getBarWidth(d));
		})
		.style("background-position", "left")
		.style("background-repeat", "repeat")
		.style("border-style", "solid")
		.style("border-color", (d) => self.getBarBorderColor(d.styles?.bar?.fillColor, d.pattern))
		.style("border-width", (d) => self.getBarBorderWidth(d.pattern) + "px")
		.style("opacity", (d) => (self.yScale(d.category) >= 0 ? 1 : 0));
	// .style("display", (d) => (self.xScale(d.value) - getBarWidth(d) < 0 || (getBarWidth(d)) > self.width) ? "none" : "flex");

	SetHorizontalBarDivVariationWidth(self, divSelection, barHeight, paddingScale, getBarWidth);
};

export const SetVerticalBarDivVariationWidth = (
	self: Visual,
	barSelection: D3Selection<HTMLElement>,
	barWidth: number,
	paddingScale: any,
	getBarHeight: Function
): void => {
	const topBarPadding = paddingScale(self.chartSettings.barXPadding);
	const bottomBarPadding = paddingScale(self.chartSettings.barYPadding);
	const padding = d3Max([topBarPadding, bottomBarPadding]) * 2;

	barSelection.style("width", function (d) {
		const bar = d3Select(this).node() as HTMLElement;
		const barHeight = getBarHeight(d);
		const topBarPadding = parseFloat(bar.style.borderTopLeftRadius);
		const bottomBarPadding = parseFloat(bar.style.borderBottomLeftRadius);
		const curBarPadding = d3Max([topBarPadding, bottomBarPadding])! * 2;
		if (barHeight < padding) {
			d3Select(this).style("left", `calc(50% - ${curBarPadding / 2}px)`);
			return (curBarPadding * 100) / barWidth + "%";
		} else {
			return "100%";
		}
	});
};

export const SetHorizontalBarDivVariationWidth = (
	self: Visual,
	barSelection: D3Selection<HTMLElement>,
	barHeight: number,
	paddingScale: any,
	getBarWidth: Function
): void => {
	const leftBarPadding = paddingScale(self.chartSettings.barXPadding);
	const rightBarPadding = paddingScale(self.chartSettings.barYPadding);
	const padding = d3Max([leftBarPadding, rightBarPadding]) * 2;

	barSelection.style("height", function (d) {
		const bar = d3Select(this).node() as HTMLElement;
		const barWidth = getBarWidth(d);
		const leftBarPadding = parseFloat(bar.style.borderTopLeftRadius);
		const rightBarPadding = parseFloat(bar.style.borderBottomLeftRadius);
		const curBarPadding = d3Max([leftBarPadding, rightBarPadding])! * 2;
		if (barWidth < padding) {
			d3Select(this).style("top", `calc(50% - ${curBarPadding / 2}px)`);
			return (curBarPadding * 100) / barHeight + "%";
		} else {
			return "100%";
		}
	});
};

export const RenderNormalBars = (self: Visual, normalBarsG: any, barData: IVisualCategoryData[]): void => {
	barData.forEach((d) => {
		const width = GetNormalBarWidth(self, d);
		const height = GetNormalBarHeight(self, d);
		d.styles!.bar.width = width;
		d.styles!.bar.height = height;
	});

	const { x, y } = self.isHasImagesData ? self.getBarXYTranslateVal() : { x: 0, y: 0 };
	normalBarsG.attr("transform", `translate(${x}, ${y})`);
	const barSelection = normalBarsG.selectAll(".normalBarG").data(barData, (d: any) => d.id);
	if (self.isLabelImageWithinAxis) {
		barSelection.selectAll(".bar").selectAll(".barImageLabel").remove();
	}

	barSelection.join(
		(enter) => {
			const foreignObject = enter
				.append("g")
				.classed(self.annotationBarClass, true)
				.classed("normalBarG", true)
				.append("foreignObject")
				.attr("refLineId", (d) => self.getBarIdByCategory(d.category));
			const div = foreignObject
				.append("xhtml:div")
				.attr("class", "bar")
				.attr("id", (d) => self.getBarIdByCategory(d.category));
			self.isHorizontalChart
				? FormattingNormalHorizontalBars(self, foreignObject, div, false)
				: FormattingNormalVerticalBars(self, foreignObject, div, false);
			return div;
		},
		(update) => {
			const foreignObject = update.select("foreignObject");
			const div = update.attr("refLineId", (d) => self.getBarIdByCategory(d.category)).select(".bar");
			self.isHorizontalChart
				? FormattingNormalHorizontalBars(self, foreignObject, div, true)
				: FormattingNormalVerticalBars(self, foreignObject, div, true);
		}
	);
};

export const CheckIsBarAlreadySelected = (barSelection: D3Selection<HTMLElement>): boolean => {
	return barSelection.attr("class")?.split(" ")?.includes("already-active-bar");
}

export const SetActiveBarClass = (barSelection: D3Selection<HTMLElement>): void => {
	barSelection.classed("active-bar", true).classed("fade-off-bar", false).classed("already-active-bar", true);
}

export const SetActiveBarsClass = (barSelection: D3Selection<HTMLElement>): void => {
	barSelection.classed("active-bar", true).classed("fade-off-bar", false).classed("already-active-bar", false);
}

export const SetFadeOffBarsClass = (barSelection: D3Selection<HTMLElement>): void => {
	barSelection.classed("fade-off-bar", true).classed("active-bar", false).classed("already-active-bar", false);
}

export const HighlightActiveBar = (activeBar: D3Selection<HTMLElement>, barSelection: D3Selection<HTMLElement>): void => {
	const isBarAlreadyActive = CheckIsBarAlreadySelected(activeBar);
	if (isBarAlreadyActive) {
		SetActiveBarsClass(barSelection);
	} else {
		SetFadeOffBarsClass(barSelection);
		SetActiveBarClass(activeBar);
	}
}