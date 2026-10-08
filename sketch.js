
let products = [];
let collageItems = [];
let petals = [];
let stars = [];

let selectedIndex = 0;
let bloom = 0;
let targetBloom = 0;
let storm = false;
let collageHover = -1;
let hoveredJewel = false;

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

  if (!Array.isArray(products)) {
    products = Object.values(products);
  }

  products = products.filter(p => p.image);

  for (let p of products) {
    p.ready = false;
    p.brightest = { x: 0.5, y: 0.5 };

    loadImage(
      p.image,
      img => {
        p.img = img;
        p.brightest = findBrightestPoint(img);
        p.ready = true;
      },
      () => console.log("Image error:", p.image)
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

// BACKGROUND

function createStars() {
  stars = [];

  for (let i = 0; i < 110; i++) {
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

  fill(255, 255, 255, 120);
  circle(width * 0.28, height * 0.4, 650);

  fill(247, 183, 205, 55);
  circle(width * 0.78, height * 0.65, 560);

  fill(238, 173, 210, 35);
  circle(width * 0.16, height * 0.83, 440);

  for (let s of stars) {
    let a = 110 + 100 *
      sin(frameCount * 0.025 + s.phase);

    fill(255, 255, 255, a);
    circle(s.x, s.y, s.r);
  }
}

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

  bloomButton.mousePressed(() => {
    targetBloom = targetBloom === 1 ? 0 : 1;
    updateBloomButton();
  });

  nextButton.mousePressed(() => {
    if (products.length === 0) return;

    selectedIndex =
      (selectedIndex + 1) % products.length;

    bloom = 0;
    targetBloom = 1;
    updateBloomButton();
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

function updateBloomButton() {
  bloomButton.html(
    targetBloom === 1
      ? "CLOSE THE FLOWER ✿"
      : "OPEN THE FLOWER ✿"
  );
}

// MAIN ANIMATION

function draw() {
  drawBackground();

  bloom = lerp(bloom, targetBloom, 0.055);

  let c = flowerCenter();

  let jewelSize = min(
    width * 0.28,
    height * 0.48,
    370
  );

  hoveredJewel =
    bloom > 0.8 &&
    dist(mouseX, mouseY, c.x, c.y) <
      jewelSize * 0.48;

  drawFloatingPetals();
  drawBloomCollage();
  drawFlower(c.x, c.y);
  drawJewelry(c.x, c.y, jewelSize);

  if (bloom > 0.65) {
    drawHologram();
  }

  drawHeader();
}

function flowerCenter() {
  return {
    x: width * 0.38,
    y: height * 0.57
  };
}

// BLOOM COLLAGE MACHINE

function createBloomCollage() {
  collageItems = [];

  if (products.length < 2) return;

  let positions = [
    [0.12, 0.35],
    [0.21, 0.78],
    [0.58, 0.27],
    [0.61, 0.80],
    [0.84, 0.24],
    [0.88, 0.78]
  ];

  let indices = products.map((p, i) => i);
  indices = shuffle(indices);

  // Do not repeat the central product
  indices = indices.filter(i => i !== selectedIndex);

  let count = min(6, indices.length);

  for (let i = 0; i < count; i++) {
    let pos = positions[i];

    collageItems.push({
      index: indices[i],
      x: width * pos[0] + random(-18, 18),
      y: height * pos[1] + random(-18, 18),
      size: random(100, 160),
      angle: random(-0.18, 0.18),
      phase: random(TWO_PI)
    });
  }
}

function drawBloomCollage() {
  collageHover = -1;

  for (let i = 0; i < collageItems.length; i++) {
    let item = collageItems[i];
    let p = products[item.index];

    if (!p || !p.ready) continue;

    let floating =
      sin(frameCount * 0.018 + item.phase) * 7;

    let d = dist(
      mouseX,
      mouseY,
      item.x,
      item.y + floating
    );

    let hovered = d < item.size * 0.52;

    if (hovered) collageHover = i;

    push();
    translate(item.x, item.y + floating);
    rotate(item.angle);
    scale(hovered ? 1.18 : 1);

    drawingContext.shadowBlur = hovered ? 30 : 15;
    drawingContext.shadowColor = "#e9a4c1";

    noStroke();
    fill(255, 250, 252, 245);
    circle(0, 0, item.size + 18);

    drawingContext.shadowBlur = 0;

    image(p.img, 0, 0, item.size, item.size);

    if (hovered) {
      drawSparkle(p.brightest, item.size);
    }

    noFill();
    stroke(225, 145, 180, 160);
    strokeWeight(1.5);
    circle(0, 0, item.size + 20);

    pop();
  }
}

// FLOWER

function drawFlower(cx, cy) {
  let flowerSize = min(
    width * 0.62,
    height * 0.88,
    720
  );

  push();
  translate(cx, cy);

  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = "#e9a6bd";

  for (let i = 0; i < 12; i++) {
    drawFlowerPetal(
      TWO_PI * i / 12,
      flowerSize * 0.37,
      flowerSize * 0.26,
      bloom,
      i,
      0
    );
  }

  for (let i = 0; i < 9; i++) {
    drawFlowerPetal(
      TWO_PI * i / 9 + 0.2,
      flowerSize * 0.29,
      flowerSize * 0.22,
      bloom,
      i,
      1
    );
  }

  for (let i = 0; i < 7; i++) {
    drawFlowerPetal(
      TWO_PI * i / 7 + 0.4,
      flowerSize * 0.22,
      flowerSize * 0.19,
      bloom,
      i,
      2
    );
  }

  drawingContext.shadowBlur = 0;

  noStroke();
  fill(255, 245, 248, 210);

  circle(
    0,
    0,
    flowerSize * (0.22 + bloom * 0.13)
  );

  pop();
}

function drawFlowerPetal(
  angle,
  length,
  petalWidth,
  openAmount,
  index,
  layer
) {
  push();
  rotate(angle);

  let spread = openAmount * length * 0.6;
  let lift = (1 - openAmount) * length * 0.28;

  translate(0, -spread + lift);

  rotate(
    sin(frameCount * 0.012 + index) * 0.025
  );

  let colors = [
    color(246, 175, 195, 220),
    color(255, 198, 215, 230),
    color(255, 220, 229, 240)
  ];

  fill(colors[layer]);
  stroke(255, 240, 245, 120);
  strokeWeight(1);

  beginShape();
  vertex(0, 0);

  bezierVertex(
    -petalWidth * 0.7,
    -length * 0.25,
    -petalWidth * 0.85,
    -length * 0.85,
    0,
    -length
  );

  bezierVertex(
    petalWidth * 0.85,
    -length * 0.85,
    petalWidth * 0.7,
    -length * 0.25,
    0,
    0
  );

  endShape(CLOSE);

  stroke(255, 255, 255, 65);
  line(0, -length * 0.15, 0, -length * 0.8);

  pop();
}

// CENTRAL JEWELRY

function drawJewelry(cx, cy, size) {
  let p = currentProduct();
  if (!p || !p.ready) return;

  let appear = constrain(
    map(bloom, 0.35, 0.95, 0, 1),
    0,
    1
  );

  if (appear <= 0) return;

  push();
  translate(cx, cy);

  scale(appear * (hoveredJewel ? 1.12 : 1));

  translate(
    0,
    sin(frameCount * 0.022) * 6
  );

  drawingContext.shadowBlur =
    hoveredJewel ? 45 : 25;

  drawingContext.shadowColor = "#ffffff";

  noStroke();
  fill(255, 251, 252, 240);
  ellipse(0, 0, size * 1.12, size * 1.12);

  drawingContext.shadowBlur = 0;

  image(p.img, 0, 0, size, size);

  if (hoveredJewel) {
    drawSparkle(p.brightest, size);
  }

  // Small sparkling diamonds around the ring
  for (let i = 0; i < 12; i++) {
    let a = TWO_PI * i / 12 + frameCount * 0.002;
    let r = size * 0.63;

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

// SEARCHING FOR THE BRIGHTEST POINT

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

      // Ignore nearly white backgrounds
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

  line(
    -radius * 0.5,
    -radius * 0.5,
    radius * 0.5,
    radius * 0.5
  );

  line(
    -radius * 0.5,
    radius * 0.5,
    radius * 0.5,
    -radius * 0.5
  );

  noStroke();
  fill(255);
  circle(0, 0, 6);

  drawingContext.shadowBlur = 0;
  pop();
}

// HOLOGRAM

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

  fill(255, 245, 250, 220);
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
  text(
    "MOMNT / BLOOM COLLECTION",
    x + 24,
    y + 36
  );

  fill(90, 44, 66);
  textSize(22);
  text(
    p.name || "Jewelry",
    x + 24,
    y + 78,
    w - 48,
    165
  );

  fill(176, 100, 132);
  textSize(12);
  text(
    "A MOMENT OF BEAUTY",
    x + 24,
    y + h - 85
  );

  fill(155, 66, 109);
  textSize(15);
  text(
    "DISCOVER THIS JEWEL ↗",
    x + 24,
    y + h - 38
  );

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

  text(
    "LOVE ✿ LIGHT ✿ JEWELRY",
    width - 35,
    61
  );

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

  // Select a jewel from the collage
  if (collageHover >= 0) {
    let item = collageItems[collageHover];

    selectedIndex = item.index;

    bloom = 0;
    targetBloom = 1;
    updateBloomButton();

    return;
  }

  let p = currentProduct();
  if (!p) return;

  // Open the original product page
  if (bloom > 0.65) {
    let x = width * 0.69;
    let y = height * 0.30;
    let w = min(390, width * 0.28);
    let h = 360;

    if (
      mouseX > x &&
      mouseX < x + w &&
      mouseY > y &&
      mouseY < y + h
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

  // Open or close the flower
  let c = flowerCenter();

  if (
    dist(mouseX, mouseY, c.x, c.y) <
    min(width * 0.3, height * 0.42)
  ) {
    targetBloom = targetBloom === 1 ? 0 : 1;
    updateBloomButton();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createStars();
  createPetals();
  createBloomCollage();
}
