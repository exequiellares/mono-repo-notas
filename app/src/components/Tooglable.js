import React, { forwardRef, useImperativeHandle, useState } from "react";
import PropTypes from "prop-types";
import i18n from "../i18n";

const Tooglable = forwardRef(({ children, buttonLabel = "show" }, ref) => {
  const [visible, setVisible] = useState(false);

  const hideWhenVisible = { display: visible ? "none" : "" };
  const showWhenVisible = { display: visible ? "" : "none" };

  const toggleVisibility = () => setVisible(!visible);

  useImperativeHandle(ref, () => {
    return {
      toggleVisibility,
    };
  });

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{buttonLabel}</button>
      </div>

      <div style={showWhenVisible}>
        {children}
        <button onClick={toggleVisibility}>
          {i18n.TOGGABLE.CANCEL_BUTTON}
        </button>
      </div>
    </div>
  );
});

Tooglable.displayName = "Togglable";

Tooglable.propTypes = {
  buttonLabel: PropTypes.string,
};

export default Tooglable;
