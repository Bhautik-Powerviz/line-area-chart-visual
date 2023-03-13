import * as React from "react";

const Radio = (props) => {
  const { options, value, onChange, multiple = false } = props;

  const [selectedValue, setSelectedValue] = React.useState(value);

  const clickHandler = (el) => {
    if (multiple) {
      const _value = el.value;
      setSelectedValue((d) => {
        if (d.includes(_value)) {
          const index = d.indexOf(_value);
          d.splice(index, 1);
        } else {
          d.push(_value);
        }
        onChange(d);
        return d;
      });
    } else {
      setSelectedValue(el.value);
      onChange(el.value);
    }
  };

  return (
    <div className="radio-input">
      {options.map((el) => {
        return (
          <div
            onClick={() => clickHandler(el)}
            className={`radio-input-element radio-${el.value} ${
              (!multiple && selectedValue === el.value) || (multiple && selectedValue.includes(el.value))
                ? "radio-input-selected"
                : ""
            }`}
          >
            {el.label}
          </div>
        );
      })}
    </div>
  );
};

export default Radio;
