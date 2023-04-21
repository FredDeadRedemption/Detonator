function randomColor() {
  const number = Math.random();
  let color;

  if (number <= 0.25) {
    color = "rgb(255, 165, 0)";
  } else if (number > 0.25 && number <= 0.5) {
    color = "rgb(60, 179, 113)";
  } else if (number > 0.5 && number <= 0.75) {
    color = "rgb(255, 0, 0)";
  } else if (number > 0.75) {
    color = "rgb(143, 188, 255)";
  }

  return color;
}

exports.randomColor = randomColor;
