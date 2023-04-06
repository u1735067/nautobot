import { render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import Layout from "../Layout";

jest.mock("react-router-dom", () => ({
    useLocation: jest.fn(),
}));

describe("Layout", () => {
    const mockLocation = { pathname: "/test" };
    beforeEach(() => {
        useLocation.mockReturnValue(mockLocation);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render Menu, Alert, and children", () => {
        render(
            <Layout>
                <div data-testid="child-div">Child Text</div>
            </Layout>
        );

        const alert = screen.getByRole("alert");
        expect(alert.innerHTML).toBe("Current route is /test");
        const childrenDom = screen.getByTestId("child-div");
        expect(childrenDom.innerHTML).toBe("Child Text");
    });
});
