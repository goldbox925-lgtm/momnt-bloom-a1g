
let products = [];
let flowerVideo;
let collageItems = [];
let petals = [];
let stars = [];

let selectedIndex = 0;
let bloom = 0;
let storm = false;
let collageHover = -1;
let videoFinished = false;

let bloomButton;
let nextButton;
let stormButton;
let collageButton;

function preload() {
  products = loadJSON("catalog_products.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  imageMode(CENTER);
  rectMode(CENTER);
  textFont("Georgia");

  // REAL PEONY VIDEO
 flowerVideo = createVideo("peony-bloom.mp4");
  flowerVideo.hide();
  flowerVideo.volume(0);
  flowerVideo.pause();

  flowerVideo.elt.addEventListener("ended", () => {
    videoFinished = true;
    flowerVideo.pause();
  });

  if (!Array.isArray(products)) {
    products = Object.values(products);
  }

  products = products.filter(p => p && p.image);

  // Load original jewelry images without changing colors
  for (let p of products) {
    p.ready = false;
    p.brightest = { x: 0.5, y: 0.5 };

    loadImage(
      p.image,
      img => {
        p.brightest = findBrightestPoint(img);
        p.img = img;
        p.ready = true;
      },
      () => console.log("Image not found:", p.image)
    );
  }

  createStars();
  createPetals();
  createBloomCollage();
  createControls();
}

function currentProduct() {
  return products[selectedIndex] || null;
}

function flowerCenter() {
  return {
    x: width * 0.38,
    y: height * 0.56
  };
}

// BACKGROUND

function createStars() {
  stars = [];

  for (let i = 0; i < 120; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      r: random(1, 3),
      phase: random(TWO_PI)
    });
  }
}

function createPetals() {
  petals = [];

  for (let i = 0; i < 65; i++) {
    petals.push({
      x: random(width),
      y: random(height),
      size: random(8, 22),
      speed: random(0.4, 1.4),
      angle: random(TWO_PI),
      spin: random(-0.02, 0.02),
      phase: random(TWO_PI)
    });
  }
}

function drawBackground() {
  background(255, 237, 243);
  noStroke();

  fill(255, 255, 255, 100);
  circle(width * 0.28, height * 0.4, 650);

  fill(247, 183, 205, 55);
  circle(width * 0.78, height * 0.65, 560);

  for (let s of stars) {
    let a = 110 + 100 *
      sin(frameCount * 0.025 + s.phase);

    fill(255, 255, 255, a);
    circle(s.x, s.y, s.r);
  }
}

// FALLING PETALS

function drawFloatingPetals() {
  for (let p of petals) {
    p.y += p.speed * (storm ? 3.5 : 0.35);
    p.x += sin(frameCount * 0.02 + p.phase) *
      (storm ? 1.8 : 0.35);

    p.angle += p.spin;

    if (p.y > height + 30) {
      p.y = -30;
      p.x = random(width);
    }

    push();
    translate(p.x, p.y);
    rotate(p.angle);

    noStroke();
    fill(240, 135, 174, 145);
    ellipse(0, 0, p.size * 0.7, p.size * 1.4);

    fill(255, 214, 229, 110);
    ellipse(
      -p.size * 0.1,
      -p.size * 0.2,
      p.size * 0.3,
      p.size * 0.8
    );

    pop();
  }
}

// VIDEO PLAYBACK

function playBloom() {
  if (!flowerVideo) return;

  bloom = 0;
  videoFinished = false;

  flowerVideo.time(0);
  flowerVideo.play();

  bloomButton.html("REPLAY THE FLOWER ✿");
}

// BUTTONS

function createControls() {
  bloomButton = createButton("OPEN THE FLOWER ✿");
  nextButton = createButton("NEXT JEWEL ↗");
  stormButton = createButton("PETAL STORM ✧");
  collageButton = createButton("SHUFFLE COLLAGE ✿");

  bloomButton.position(35, 110);
  nextButton.position(225, 110);
  stormButton.position(370, 110);
  collageButton.position(535, 110);

  bloomButton.mousePressed(() => playBloom());

  nextButton.mousePressed(() => {
    if (products.length === 0) return;
    selectedIndex = (selectedIndex + 1) % products.length;
    createBloomCollage();
    playBloom();
  });

  stormButton.mousePressed(() => {
    storm = !storm;
  });

  collageButton.mousePressed(() => {
    createBloomCollage();
  });

  for (let b of [
    bloomButton,
    nextButton,
    stormButton,
    collageButton
  ]) {
    b.style("background", "#fff4f7");
    b.style("color", "#63354e");
    b.style("border", "1px solid #dfb8ca");
    b.style("padding", "12px 18px");
    b.style("font-size", "11px");
    b.style("letter-spacing", "1px");
    b.style("cursor", "pointer");
    b.style("border-radius", "25px");
  }
}

// MAIN DRAW

function draw() {
  drawBackground();

  let c = flowerCenter();

  if (flowerVideo && flowerVideo.elt.readyState >= 2) {
    let duration = flowerVideo.duration();
    let time = flowerVideo.time();

    if (duration > 0) {
      let progress = constrain(time / duration, 0, 1);
      bloom = constrain(
        map(progress, 0.55, 0.95, 0, 1),
        0,
        1
      );
    }
  }

  if (videoFinished) bloom = 1;

  drawVideoFlower(c.x, c.y);
  drawFloatingPetals();
  drawBloomCollage();

  let jewelSize = min(
    width * 0.23,
    height * 0.37,
    300
  );

  drawJewelry(c.x, c.y + 20, jewelSize);

  if (bloom > 0.65) {
    drawHologram();
  }

  drawHeader();
}

// REAL FLOWER VIDEO

function drawVideoFlower(cx, cy) {
  if (!flowerVideo || flowerVideo.elt.readyState < 2) return;

  let videoWidth = min(width * 0.65, 900);
  let videoHeight = videoWidth * 9 / 16;

  push();
  imageMode(CENTER);
  image(flowerVideo, cx, cy, videoWidth, videoHeight);
  pop();
}

// COLLAGE MACHINE

function createBloomCollage() {
  collageItems = [];

  if (products.length < 2) return;

  let positions = [
    [0.10, 0.33],
    [0.10, 0.60],
    [0.18, 0.85],
    [0.56, 0.23],
    [0.62, 0.77],
    [0.88, 0.82]
  ];

  let indices = products.map((p, i) => i);
  indices = shuffle(indices);
  indices = indices.filter(i => i !== selectedIndex);

  let count = min(6, indices.length);

  for (let i = 0; i < count; i++) {
    collageItems.push({
      index: indices[i],
      x: width * positions[i][0],
      y: height * positions[i][1],
      size: random(90, 140),
      angle: random(-0.16, 0.16),
      phase: random(TWO_PI)
    });
  }
}

// Draw a circular cropped jewelry image
function drawRoundJewelry(img, x, y, size) {
  push();
  translate(x, y);

  // Soft pearl background and shadow
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = "#e9a4c1";

  noStroke();
  fill(255, 250, 252);
  circle(0, 0, size + 10);

  drawingContext.shadowBlur = 0;

  // Clip the photo to a circle
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(0, 0, size / 2, 0, TWO_PI);
  drawingContext.closePath();
  drawingContext.clip();

  image(img, 0, 0, size, size);

  drawingContext.restore();

  noFill();
  stroke(232, 170, 194, 180);
  strokeWeight(1);
  circle(0, 0, size + 10);

  pop();
}

function drawBloomCollage() {
  collageHover = -1;

  for (let i = 0; i < collageItems.length; i++) {
    let item = collageItems[i];
    let p = products[item.index];

    if (!p || !p.ready) continue;

    let floating =
      sin(frameCount * 0.018 + item.phase) * 7;

    let hovered = dist(
      mouseX,
      mouseY,
      item.x,
      item.y + floating
    ) < item.size * 0.52;

    if (hovered) collageHover = i;

    push();
    translate(item.x, item.y + floating);
    rotate(item.angle);
    scale(hovered ? 1.16 : 1);

    drawRoundJewelry(p.img, 0, 0, item.size);

    if (hovered) {
      drawSparkle(p.brightest, item.size);
    }

    pop();
  }
}

// CENTRAL JEWELRY

function drawJewelry(cx, cy, size) {
  let p = currentProduct();

  if (!p || !p.ready || bloom <= 0) return;

  let hovered =
    dist(mouseX, mouseY, cx, cy) < size * 0.5;

  push();
  translate(cx, cy);

  let appear = bloom * (hovered ? 1.1 : 1);
  scale(appear);

  translate(0, sin(frameCount * 0.022) * 5);

  // Pearl circle instead of white square
  drawRoundJewelry(p.img, 0, 0, size);

  if (hovered) {
    drawSparkle(p.brightest, size);
  }

  // Decorative diamond sparkles
  for (let i = 0; i < 14; i++) {
    let a = TWO_PI * i / 14 + frameCount * 0.002;
    let r = size * 0.60;

    let x = cos(a) * r;
    let y = sin(a) * r;

    let alpha =
      120 + 110 * sin(frameCount * 0.07 + i);

    stroke(255, 255, 255, alpha);
    strokeWeight(1.5);

    line(x - 4, y, x + 4, y);
    line(x, y - 4, x, y + 4);
  }

  pop();
}

// BRIGHTEST POINT

function findBrightestPoint(img) {
  img.loadPixels();

  let best = -1;
  let point = { x: 0.5, y: 0.5 };
  let step = max(1, floor(img.width / 170));

  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      let nx = x / img.width;
      let ny = y / img.height;

      if (
        nx < 0.18 || nx > 0.82 ||
        ny < 0.18 || ny > 0.82
      ) continue;

      let k = 4 * (y * img.width + x);

      let r = img.pixels[k];
      let g = img.pixels[k + 1];
      let b = img.pixels[k + 2];

      let brightness = (r + g + b) / 3;

      if (brightness > 245) continue;

      if (brightness > best) {
        best = brightness;
        point = { x: nx, y: ny };
      }
    }
  }

  return point;
}

// SPARKLE

function drawSparkle(point, size) {
  if (!point) return;

  let x = (point.x - 0.5) * size;
  let y = (point.y - 0.5) * size;
  let radius = 16 + sin(frameCount * 0.18) * 8;

  push();
  translate(x, y);

  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = "#ffffff";

  stroke(255, 248, 215);
  strokeWeight(2.5);

  line(-radius, 0, radius, 0);
  line(0, -radius, 0, radius);

  strokeWeight(1);
  line(-radius * 0.5, -radius * 0.5,
       radius * 0.5, radius * 0.5);
  line(-radius * 0.5, radius * 0.5,
       radius * 0.5, -radius * 0.5);

  noStroke();
  fill(255);
  circle(0, 0, 6);

  drawingContext.shadowBlur = 0;
  pop();
}

// HOLOGRAPHIC PRODUCT PANEL

function drawHologram() {
  let p = currentProduct();
  if (!p) return;

  let x = width * 0.69;
  let y = height * 0.30;
  let w = min(390, width * 0.28);
  let h = 360;

  push();
  rectMode(CORNER);

  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = "#f1a9c6";

  fill(255, 245, 250, 225);
  stroke(220, 145, 180, 170);
  strokeWeight(1.5);
  rect(x, y, w, h, 20);

  drawingContext.shadowBlur = 0;

  stroke(230, 150, 185, 18);
  for (let yy = y + 12; yy < y + h - 12; yy += 8) {
    line(x + 12, yy, x + w - 12, yy);
  }

  noStroke();
  textAlign(LEFT);

  fill(166, 83, 119);
  textSize(12);
  text("MOMNT / BLOOM COLLECTION", x + 24, y + 36);

  fill(90, 44, 66);
  textSize(20);

  let shortName = (p.name || "Jewelry")
    .split(" - ")[0]
    .slice(0, 110);

  text(shortName, x + 24, y + 78, w - 48, 160);

  fill(176, 100, 132);
  textSize(12);
  text("A MOMENT OF BEAUTY", x + 24, y + h - 85);

  fill(155, 66, 109);
  textSize(15);
  text("DISCOVER THIS JEWEL ↗", x + 24, y + h - 38);

  pop();
}

// HEADER

function drawHeader() {
  noStroke();
  textAlign(LEFT);

  fill(108, 55, 83);
  textSize(47);
  text("MOMNT", 35, 61);

  textSize(11);
  text(
    "BLOOM / INTERACTIVE JEWELRY GARDEN",
    38,
    84
  );

  textAlign(RIGHT);
  fill(157, 96, 126);
  textSize(11);
  text("LOVE ✿ LIGHT ✿ JEWELRY", width - 35, 61);

  textSize(10);
  text(
    "CLICK TO BLOOM / HOVER TO SPARKLE",
    width - 35,
    height - 20
  );
}

// MOUSE INTERACTION

function mousePressed() {
  if (mouseY < 170) return;

  if (collageHover >= 0) {
    let item = collageItems[collageHover];

    selectedIndex = item.index;
    createBloomCollage();
    playBloom();

    return;
  }

  let p = currentProduct();
  if (!p) return;

  if (bloom > 0.65) {
    let x = width * 0.69;
    let y = height * 0.30;
    let w = min(390, width * 0.28);
    let h = 360;

    if (
      mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h
    ) {
      if (
        p.source &&
        p.source.startsWith("https://")
      ) {
        window.open(p.source, "_blank");
      }
      return;
    }
  }

  let c = flowerCenter();

  if (
    dist(mouseX, mouseY, c.x, c.y) <
    min(width * 0.3, height * 0.42)
  ) {
    playBloom();
  }
}

// RESIZE

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createStars();
  createPetals();
  createBloomCollage();
}
