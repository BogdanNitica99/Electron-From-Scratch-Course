const func = async () => {
  // to do: let the user choose the output file path of the resized image
  document.getElementById("output-path").innerText =
    await window.apis.getOutputPath();
};

const form = document.getElementById("image-form");
const slider = document.getElementById("slider");
const img = document.getElementById("img");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const imgPath = img.files[0].path;
  const quality = slider.value;

  await window.apis.getImgPathAndQuality({ imgPath, quality });
});

func();
