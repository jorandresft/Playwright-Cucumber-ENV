const report = require("multiple-cucumber-html-reporter");

report.generate({
  jsonDir: "test-results",
  reportPath: "test-results",
  reportName: "Playwright Automation Report",
  pageTitle: "Guru99",
  displayDuration: false,
  metadata: {
    browser: {
      name: "chrome",
      version: "127",
    },
    device: "JFT",
    platform: {
      name: "Windows",
      version: "10",
    },
  },
  customData: {
    title: "Test info",
    data: [
      { label: "Project", value: "Guru99 project" },
      { label: "Release", value: "1.2.3" },
      { label: "Cycle", value: "Smoke-1" }
    ],
  },
});