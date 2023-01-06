const path = require("path");
const os = require("os");

// to do: let the user choose the output file path of the resized image
document.getElementById("output-path").innerText = path.join(
  os.homedir(),
  "imageshrink"
);
