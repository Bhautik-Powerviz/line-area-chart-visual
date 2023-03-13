import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import { useInView } from "react-intersection-observer";
import { InView } from "react-intersection-observer";
import { ILayoutItemProps, ISmallMultiplesLayoutProps } from "../visual-settings.model";
import { ESmallMultiplesBackgroundType, ESmallMultiplesShadowType } from "../enum";
import { parseColorString } from "powerbi-visuals-utils-colorutils";

const ReactGridLayoutProvider = WidthProvider(RGL);

function SmallMultiplesLayout(props: ISmallMultiplesLayoutProps) {
  const { ref, inView, entry } = useInView({
    threshold: 1,
  });

  const settings = props.smallMultiplesSettings;
  const backgroundSettings = settings.background;
  const borderSettings = settings.border;
  const shadowSettings = settings.shadow;

  const getItemBackgroundColor = (layout: ILayoutItemProps) => {
    const { R: r1, G: g1, B: b1 } = parseColorString(backgroundSettings.panelColor);
    const { R: r2, G: g2, B: b2 } = parseColorString(backgroundSettings.alternateColor);

    const panelColor = `rgba(${r1}, ${g1}, ${b1}, ${backgroundSettings.transparency / 100})`;
    const alternateColor = `rgba(${r2}, ${g2}, ${b2}, ${backgroundSettings.transparency / 100})`;

    switch (settings.background.type) {
      case ESmallMultiplesBackgroundType.All:
        return panelColor;
      case ESmallMultiplesBackgroundType.AlternateItem:
        if (layout.x % 2 === 0) {
          return panelColor;
        } else {
          return alternateColor;
        }
      case ESmallMultiplesBackgroundType.AlternateRows:
        if (layout.y % 2 === 0) {
          return panelColor;
        } else {
          return alternateColor;
        }
      case ESmallMultiplesBackgroundType.AlternateColumns:
        if (layout.x % 2 === 0) {
          return panelColor;
        } else {
          return alternateColor;
        }
    }
  };

  const getBoxShadow = () => {
    switch (shadowSettings.type) {
      case ESmallMultiplesShadowType.None:
        return null;
      case ESmallMultiplesShadowType.Simple:
        return "rgba(0, 0, 0, 0.24) 0px 3px 8px";
      case ESmallMultiplesShadowType.StandOut:
        return "rgba(0, 0, 0, 0.35) 0px 5px 15px";
      case ESmallMultiplesShadowType.Custom:
        return `${shadowSettings.horizontalOffset}px ${shadowSettings.verticalOffset}px ${shadowSettings.blur}px ${
          shadowSettings.spread
        }px ${shadowSettings.color} ${shadowSettings.inset ? "inset" : ""}`;
    }
  };

  function generateDOM() {
    return props.layouts.map((d, i) => {
      return (
        <div ref={ref} key={d.i}>
          <InView
            id={d.i}
            data-id={i}
            data-chart-loaded={false}
            data-visibility={inView}
            as="div"
            className="small-multiple-chart-wrapper"
            style={{
              backgroundColor: getItemBackgroundColor(d),
              borderStyle: borderSettings.isShowBorder ? borderSettings.style : "none",
              borderWidth: borderSettings.isShowBorder ? borderSettings.width : 0,
              borderColor: borderSettings.color,
              borderRadius: borderSettings.isShowBorder ? borderSettings.radius : 0,
              boxSizing: "border-box",
              boxShadow: getBoxShadow(),
              padding: `${props.containerPadding[1]}px ${props.containerPadding[0]}px`,
            }}
            onChange={(inView, entry) => {
              entry.target.setAttribute("data-visibility", String(inView));
              if (inView) {
                props.onCellRendered(entry);
              }
            }}
          ></InView>
        </div>
      );
    });
  }

  return (
    <ReactGridLayoutProvider
      width={props.width}
      cols={props.cols}
      className={props.className}
      rowHeight={props.rowHeight}
      layout={props.layouts}
      measureBeforeMount={props.measureBeforeMount}
      compactType={props.compactType}
      margin={props.margin}
      onResize={(nodes, node) => {
        props.onCellRendered({ target: document.getElementById(node.i) });
      }}
    >
      {generateDOM()}
    </ReactGridLayoutProvider>
  );
}

export default SmallMultiplesLayout;
