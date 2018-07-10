const reactWebpackBuildHelper = require("react-webpack-build-helper");
const SockJS = require("sockjs-client");
const url = require("url");
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
const devBuildHelper = new reactWebpackBuildHelper.DevBuildHelper();

const connection = new SockJS(
  url.format({
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    pathname: "/sockjs-node"
  })
);

connection.onclose = function() {
  if (typeof console !== "undefined" && typeof console.info === "function") {
    console.info(
      "The development server has disconnected.\nRefresh the page if necessary."
    );
  }
};

connection.onmessage = function(e) {
  let message = JSON.parse(e.data);
  let formatMessage = null;
  switch (message.type) {
    case "hash":
      console.log(message.data);
      break;
    case "still-ok":
    case "ok":
      devBuildHelper.showSuccess();
      break;
    case "content-changed":
      window.location.reload();
      break;
    case "warnings":
      formatMessage = formatWebpackMessages({
        errors: [],
        warnings: message.data
      });

      devBuildHelper.showWarnings(formatMessage.warnings);
      break;
    case "errors":
      formatMessage = formatWebpackMessages({
        errors: message.data,
        warnings: []
      });

      devBuildHelper.showErrors(formatMessage.errors);
      break;
    default:
  }
};
