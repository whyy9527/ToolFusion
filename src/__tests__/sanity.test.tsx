import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

describe("Baseline", () => {
  test("renders without crashing", () => {
    const { getByText } = render(<Text>Hello ToolFusion</Text>);
    expect(getByText("Hello ToolFusion")).toBeTruthy();
  });
});
