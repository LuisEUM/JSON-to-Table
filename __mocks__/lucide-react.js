// Mock for lucide-react icons
const React = require("react");

// Create a mock component for each icon
const createIconMock = (name) => {
  const IconComponent = (props) => {
    return React.createElement("svg", {
      ...props,
      "data-testid": `lucide-icon-${name}`,
    });
  };
  IconComponent.displayName = name;
  return IconComponent;
};

// Mock all the icons used in the project
const Circle = createIconMock("Circle");

// Export the mocked components
module.exports = {
  Circle,
  // Add other icons as needed
};
