const func = async () => {
  // to do: let the user choose the output file path of the resized image
  document.getElementById("output-path").innerText =
    await window.apis.getOutputPath();
};

func();

const form = document.getElementById("image-form");
const slider = document.getElementById("slider");
const img = document.getElementById("img");

// On Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const imgPath = img.files[0].path;
  const quality = slider.value;

  await window.apis.getImgPathAndQuality({ imgPath, quality });
});

// On Done
window.apis.onDone(() => {
  M.toast({ html: `Image resized to ${slider.value}% quality` });
});
