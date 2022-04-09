import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import Tooglable from "./Tooglable";
import i18n from "../i18n/index";

describe("<Toogable />", () => {
  const buttonLabel = "show";
  let component;

  beforeEach(() => {
    component = render(
      <Tooglable buttonLabel={buttonLabel}>
        <div>testDivContent</div>
      </Tooglable>
    );
  });

  test("renders its children", () => {
    component.getByText("testDivContent");
  });

  test("renders its children but they are not visible", () => {
    const el = component.getByText("testDivContent");
    expect(el.parentNode).not.toBeVisible();
  });

  test("after clicking its children must be shown", () => {
    const button = component.getByText(buttonLabel);
    fireEvent.click(button);

    const el = component.getByText("testDivContent");
    expect(el.parentNode).toBeVisible();
  });

  test("toggled content can be closed", () => {
    const button = component.getByText(buttonLabel);
    fireEvent.click(button);

    const el = component.getByText("testDivContent");
    expect(el.parentNode).toBeVisible();

    const cancelButton = component.getByText(i18n.TOGGABLE.CANCEL_BUTTON);
    fireEvent.click(cancelButton);

    expect(el.parentNode).not.toBeVisible();
  });
});
