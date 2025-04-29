import { render } from "@testing-library/react-native";
import React from "react";
import App from "../../App";

describe("Baseline Test Suite", () => {
  it("renders App component without crashing", () => {
    const { getByText } = render(<App />);
    // Check for the default text in the App component
    expect(getByText("Open up App.tsx to start working on your app!")).toBeTruthy();
  });
});
