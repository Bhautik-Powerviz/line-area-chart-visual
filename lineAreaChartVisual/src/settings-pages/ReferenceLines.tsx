import { faGripVertical, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { EReferenceLineComputation, EReferenceLinesType, EXYAxisNames } from "../enum";
import { IReferenceLinesSettings } from "../visual-settings.model";
import AddReferenceLine from "./AddReferenceLine";
import OptionsTooltip from "./OptionsTooltip";
import * as d3 from "d3";

const ReferenceLines = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
  } = props;
  let _initialStates = vizOptions.formatTab[sectionName][propertyName];
  const DEFAULT_VALUE = [];
  const [dragId, setDragId] = React.useState(-1);

  const SingleBox = ({ initEdit, el, removeReferenceLine, i, handleDrag, handleDrop }) => {
    return (
      <div
        className="reference-line-desc-container-all"
        onClick={() => {
          initEdit(i);
        }}
        data-id={i}
        onDragOver={(ev) => ev.preventDefault()}
        onDragStart={handleDrag}
        onDrop={handleDrop}
        draggable={true}
      >
        <FontAwesomeIcon icon={faGripVertical} color="#f1c912" style={{ marginRight: "10px" }} />
        <div className="reference-line-desc-container">
          <div className="reference-line-desc-container-text">
            Reference line on {el.axis} Axis at {getValue(el)}
            {el.type === "value"
              ? `value ${parseFloat(el.value)?.toFixed(2)}`
              : `index ${el.rank} from ${el.rankOrder}`}
          </div>
          <div className="reference-line-desc-container-icons">
            <FontAwesomeIcon icon={faPencilAlt} color="#f1c912" style={{ marginLeft: "10px", fontSize: "16px" }} />
            <FontAwesomeIcon
              icon={faTrash}
              color="#f1c912"
              style={{ marginLeft: "10px", fontSize: "16px" }}
              onClick={(e) => {
                e.stopPropagation();
                removeReferenceLine(e, i);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const getValue = (rLine: IReferenceLinesSettings): void => {
    if (rLine.type === EReferenceLinesType.Value && rLine.axis === EXYAxisNames.Y) {
      let values = [];

      const isSubCategoryMeasure = shadow.categoricalSubCategoriesList.includes(rLine.measureName);
      const isCategoricalReferenceLinesMeasure = shadow.categoricalReferenceLinesNames.includes(rLine.measureName);

      if (isSubCategoryMeasure && shadow.isHasSubcategories) {
        const measureIndex = shadow.chartData[0].subCategories.findIndex((s) => s.category === rLine.measureName);
        values = shadow.chartData.map((d) => d.subCategories[measureIndex].value);
      }

      if (isCategoricalReferenceLinesMeasure) {
        const referenceLineData = shadow.categoricalReferenceLinesValues.filter(
          (d) => d.source.displayName === rLine.measureName
        );
        values = referenceLineData.reduce((arr, cur) => [...arr, ...cur.values], []);
      }

      if (!isSubCategoryMeasure && !isCategoricalReferenceLinesMeasure) {
        values = shadow.chartData.map((d) => d.value);
      }

      switch (rLine.computation) {
        case EReferenceLineComputation.Min:
          rLine.value = d3.min(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Max:
          rLine.value = d3.max(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Average:
          rLine.value = d3.mean(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Median:
          rLine.value = d3.median(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Fixed:
          rLine.value = rLine.value;
          break;
      }
    } else {
      rLine.value = rLine.value;
    }
  };

  try {
    _initialStates = JSON.parse(_initialStates);
    if (!Array.isArray(_initialStates)) {
      _initialStates = DEFAULT_VALUE;
    }
  } catch (e) {
    _initialStates = DEFAULT_VALUE;
  }

  const [initialStates, setInitialStates] = React.useState(_initialStates);

  const applyChanges = (configValues) => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    // closeCurrentSettingHandler();
  };

  const [id, setId] = React.useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const initAdd = () => {
    setId(null);
    setIsDetailsOpen(true);
  };
  const initEdit = (index) => {
    setId(index);
    setIsDetailsOpen(true);
  };

  const closeAddEdit = () => {
    setId(null);
    setIsDetailsOpen(false);
  };

  const onAdd = (details) => {
    initialStates.push(details);
    applyChanges(initialStates);
    closeAddEdit();
  };

  const onDelete = (index) => {
    initialStates.splice(index, 1);
    applyChanges(initialStates);
    closeAddEdit();
  };

  const onUpdate = (index, details) => {
    initialStates[index] = details;
    applyChanges(initialStates);
    closeAddEdit();
  };

  const removeReferenceLine = (e, index) => {
    e.stopPropagation();
    onDelete(index);
  };

  const handleDrag = (ev) => {
    setDragId(ev.currentTarget.getAttribute("data-id"));
  };

  const handleDrop = (ev) => {
    const idOfDroppedBox = +dragId;
    const idOfDroppedOnBox = +ev.currentTarget.getAttribute("data-id");
    setInitialStates((d) => {
      const newState = [...d];
      const elementToBeMoved = newState[idOfDroppedBox];

      if (idOfDroppedBox > idOfDroppedOnBox) {
        newState.splice(idOfDroppedBox, 1);
        newState.splice(idOfDroppedOnBox, 0, elementToBeMoved);
      } else {
        newState.splice(idOfDroppedOnBox + 1, 0, elementToBeMoved);
        newState.splice(idOfDroppedBox, 1);
      }

      applyChanges([...newState]);
      return [...newState];
    });
  };

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          {id || isDetailsOpen ? (
            <>
              <p className="cf-config-title">
                <img
                  onClick={closeAddEdit}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAALCAYAAABLcGxfAAAABHNCSVQICAgIfAhkiAAAALFJREFUKFNjZEAD/69qsb37zdwubHC5GF0OxGdEFvx/UY/7LQPDSxH9SzzYFKNoIEYxXAOxisEa/t9UE3n7neOhMCODGC5nwMX5Pv1lfHNB9xsDI+M/gorBpv8/Bvb0m4t6X4QZGMQZ9S99JaQRHkpvLuh9Ff7zRpTR5Nk3fJpQghWo6Zuw8DthRtkn3wkGK0zBm4u634X5PgsyKj74QTDi4Jou6dYI615uZ2Rk+IuuCQAQgj+2FXscRQAAAABJRU5ErkJggg=="
                  alt=""
                />
                Reference Lines
              </p>

              <AddReferenceLine
                shadow={shadow}
                details={initialStates[id]}
                onAdd={onAdd}
                onDelete={onDelete}
                onUpdate={onUpdate}
                index={id}
              />
            </>
          ) : (
            <>
              <div className="cf-config-title config-title justify-content-between">
                <p>Reference Lines</p>
                <button className="btn-add" title="Create New Reference Line" onClick={initAdd}>
                  +
                </button>
              </div>

              {!!initialStates.length ? (
                initialStates.map((el, i) => (
                  <SingleBox
                    el={el}
                    i={i}
                    initEdit={initEdit}
                    removeReferenceLine={removeReferenceLine}
                    handleDrop={handleDrop}
                    handleDrag={handleDrag}
                  />
                ))
              ) : (
                <div className="cf-create-new-rule">
                  <img
                    src="data:image/png;charset=utf-8;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAFOYwZEAAAACXBIWXMAAAsSAAALEgHS3X78AAAIUklEQVR4nO2dzU4kNxCATbT32X0CWCl34AkCT7Bw2uTErJL7up4A8gQe7pFgTsmeAk+w7BMw3CMBT8AgJbdVJipSnvV43D/utrvbnvokhKZ/7C5X210ul+2txWIhmvJd4zt9bwaAA/N3uMcGAK+U+ikwANh5ZR3Ax9gXQtzaFyultqxD81fWgQ9KqRmKUyPzJ4Ey+/xJKa+klIuXsjJvlFKOfRJaKW1PmQOoCgBe17kYAGbBck6kSm7azVgF7WN2rXK2JvRqzitvdr3DxNNaVfWsjgusks5a5YuPzGsk+m63euw2LAsbAI6EEHuhElZKnZWd703iVnqKkjEAjGNmvFahDC6EEJcA8F4I8UedxMyKBwD4vlwppXbo94MQ4og+/X5tiE9bU3Uulo4PK881eeqaUl+WHYuWsZcB1SXDq8eccWj45eoM0xAo/XD7UmUIRGulpJTzsvMxi3pUdpIbkBd8HSPBMkbvRC8ZK6UuY2fsNPawqLXh5lHsPyqlPlnp7CilHqirer/SC4tRj4vSM48Hz1hKuVP2EPp8yKLeJ5v5vsJl9nLembGpi5KOfhF3tc4XFIeXy62Jvovq8YWnlCuY6rG6NcvjlUXdBLzfyORXIcQp/q+sTiHe8qo0uMl8oWU9bp5xy3pcC7ZAQjItS4u7MJ3RW1H3RW8lzQJ3hD0kq8d4JgN9XhzM/CiEeIu9hCYJ2J/EUaxPYEAk2QeNnpPrcO5sdqNVhbatHeNKazEYLfGyzaMJ7GrQPGJlBoGvhn8jIX/p++FpqNXlNvhQ1tX0ElgI8TP970VgQ8g3Sim0GZyCUfARhn6sCx/a7RDrj0JP9jy9h3v2Od9owUUX7mtHvqgl8G3I6Hqg+1/wfaWj+38KOFFKLcMjXIVuH9MNrFJqQuf+vz+FVxqdqVLKWRPvHd5nOmOT+A5jw4OxRxjhqJSqHX9EEZHzlYYrlUbLfEYp5d8V18yLZPGtw71jeb5Ri5K6jajJCb0RhTGxyZuWWsi6bJxp6fsdHseOnouNbx3Wtmv0YZFYtH6lU4M9Hrljv9L7fXQOPHlsU7V4qCV3Nk5gfqVzhwXOHRY4d1yTA4OGqwcGfVpXbZJcfpZ0zK0Q4tw123MgoDun1IVThalh9FwcKqVuBiosctbW1jfr8GjgwgaBW+ncYYFzhwXOndpuWgCYUNjfuVJKplouPn5pFPaR/i8FpvjM0rl/njy3saQq8RkqlVKeDWG4tM39XnW4ct5qAnCjVQYA3CilDnzuiQHFYWE38Qcr+S+0nEZhb8+nlcZeyldzXhMd/zfw+DCmX/XmPVEY00rhUzTAEwA86jVFbHw0PKMFbVZG5ms8XDCo0K+VUkeuNCkaAMOUrmzFLEkloIUCVdaWKSm5/tI1Rz+JRovWCxyZwWnGOUmv8gp07cheazCVKJ7POLGj4FyZkfLWntfssyTahGIte5nx0mQWi+uejTMtawtMAWFntrUV1e51UBQYDgCnxs/CIHHfoJbeTUsSZCmM9qPXfTZ2AJTR46jEtRnkXRe659q83Ne0fMS6YpmW0RsttKxWgrxXKRslObGtLZ86fK49HtbDdNVoHbvMxaLgUiqgY/u4Obbktj0HhNFCF7bCVdckJbD4prlnqkZ31E1EsEOxW/UdTy5AXBjViOxkbSvLOmNjSXstSUCvAUD2WrLX0oC9lgmSimkZjCRMy5CkZFoGwccBIM3PUapwo5U7LHDubLTAU3uPmaFRd6+cMuztftBTvz1kodsuW8OzWnKHBc4dFjh3Nq6V3jQ27o3eNFjBmcMKzhxWcOawgjOncMxB71OZgLNn6Dyu7O/ZMc5uEoWunVB4zEHZbAmmGHKv3lBY0dQV2R6bIgWvLePINKfP8uRvcOawgjOHFZw5rODMYQVnDis4c6LN6qD5Mzjx/qGLnVcZN1EUbKxTh16cbQC4KOoDksfsJnCMdWieyeEz6Lg1F7FqsI4d3zZ+O6FCSyqmPCWiKDiXWPkcYCMrc5KcOpsLNPV3z/pEzWlF5SBL5MYysm7pwTX4wPsx8koJx4Q9HK17sFbnQqXjjk67xrFn2u964juyF6sGa+V+pTwK96wDgPdCiN8Hvv8W9gp+Ukp98rnJWjDnH5qg32TlkTEp+BQARNVOrCbRhgtpy9rvhRB/DWHb2i7BzRiFEH9SlkHHgY2xeuS4anF8Hg8ODC55SctM3nnutjn2qd00l2y3bPFDwVZ0WHAVSVLu1FO5uKLAhc/KApT+VAjxjvJ1Ek3BtPXjWerbP9aF5HxHNbcTmSmfO1KyM092VdajjqtSWv+7QtLintK1rSi7KsOxK76t8rSGsReyC70M1kFJMz13rQCH+ZFlveu6iV2VgcFIyi6jUKsmxrMnKxxT6r7oPusKZZt7U61F4+ymwSJd+ts7dZ1kKzocWjGK9luLDuWjKB/nixFFwcbi2os+F9nuElqc+5CyvCfjMRqU/j2lf1i0oHgUR4dtRZellduAP9WqGclT24vl4+gwvFn4XHtlq8XHdFVudMiO5YfGFazHbYwvMqYuqa8t6vqj2VUZGWqhbo1cHskIuyqredQSHFFvZNu412siGyu4A4xP1htS2tixLZKLL1Rrr5rWfo6q7BBS0qXL4xQLdlXWg6MqLTiqciCwqzJz2JOVOazgzIllZOnNWjRJbzWdMrGMLK1c7ar8WPRNZis6LrGMrK26/WC2ouMSzdHBzo1hwEZW5rCCM4cVnDms4MwpUjB2C/T0RqYFRhk+91GORVb0HoWdfAaAZxre4gVJ/XhN474jHVrTx0NUbspBM+V6ebgMmFXN/osN77qSOWxkZQ4rOHNYwZnDCs4cVnDOCCH+A/lcR1vBaVm6AAAAAElFTkSuQmCC"
                    alt=""
                  />
                  <p>Create New Reference Line</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  if (id || isDetailsOpen) {
    return (
      <AddReferenceLine
        shadow={shadow}
        details={initialStates[id]}
        onAdd={onAdd}
        onDelete={onDelete}
        onUpdate={onUpdate}
        index={id}
      />
    );
  }
};

export default ReferenceLines;
