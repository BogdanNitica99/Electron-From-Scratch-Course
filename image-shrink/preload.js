const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("apis", {
  getOutputPath: () => ipcRenderer.invoke("outputPath"),
  getImgPathAndQuality: (obj) => ipcRenderer.send("imgPathAndQuality", obj),
  onDone: (callback) => ipcRenderer.on("image:done", callback),
});
