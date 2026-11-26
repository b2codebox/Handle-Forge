// Email-name generator: readable word pairs + a number up to 25.
// Rules: total length 10-15 characters, number 01-25 (always two digits).
// A liked name expands into its family: the same word pair with 01..25.

const FIRST_PARTS = [
  "fruit", "garden", "quiet", "clever", "happy", "sunny", "silver", "rustic",
  "amber", "cosmic", "velvet", "copper", "urban", "wilder", "maple", "river",
  "forest", "lunar", "solar", "mellow", "brisk", "brave", "misty", "noble",
  "plucky", "rapid", "shady", "stormy", "tidy", "vivid", "zesty", "ancient",
  "breezy", "crimson", "dusty", "eager", "fuzzy", "gentle", "hidden", "ivory",
  "jolly", "lucky", "mossy", "nimble", "olive", "peppy", "wild", "witty",
  "paper", "candle", "harbor", "pocket", "meadow", "ember",
  "orbit", "cobalt", "ashen", "birch", "cedar", "frost", "glow", "hazel",
  "indigo", "juniper", "kiwi", "lilac", "nutmeg", "opal", "pine",
  "quartz", "robin", "sage", "teal", "umber", "violet", "willow", "yarrow"
];

const SECOND_PARTS = [
  "lover", "keeper", "fox", "otter", "badger", "harbor", "meadow", "canyon",
  "sparrow", "falcon", "ember", "beacon", "orchid", "thistle", "pebble",
  "willow", "hunter", "seeker", "smith", "trail", "ridge", "cove", "grove",
  "fern", "moss", "birch", "crow", "wren", "lark", "finch", "brook", "cliff",
  "drift", "gleam", "hollow", "field", "stone", "cloud", "rider", "walker",
  "gazer", "dream", "spark", "thrift", "vale", "watch", "whistle", "wing",
  "wood", "yard", "bloom", "creek", "dawn", "dusk", "flint", "frost", "glade",
  "harvest", "isle", "jewel", "knoll", "lantern", "mist", "nest", "oak",
  "path", "quill", "reef", "shore", "tide", "vine", "wave"
];

const MIN_LEN = 10;
const MAX_LEN = 15;
const MIN_NUM = 1;
const MAX_NUM = 25;
const NUM_SPAN = MAX_NUM - MIN_NUM + 1;
const FAMILY_COUNT = NUM_SPAN;

// The suffix is always two digits, so the word pair must be 8-13 characters.
const BASE_MIN = MIN_LEN - 2;
const BASE_MAX = MAX_LEN - 2;

// 5,513 of the 5,544 possible pairs already fit, so a draw needs ~1.01 tries.
// This cap only bounds the worst case.
const TRIES = 8;
const FALLBACK_BASE = "gardenkeeper";
const CHIP_COUNT = 6;

const recent = [];
let familyBase = "";
// The bare name and the extension are kept apart, so adding an extension never
// affects how families, exports or the length rule work.
let currentName = "";
let extension = "";

const handleEl = document.getElementById("handle");
const lengthEl = document.getElementById("length");
const numberEl = document.getElementById("number");
const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy");
const copyLabel = document.getElementById("copy-label");
const likeBtn = document.getElementById("like");
const recentEl = document.getElementById("recent");
const recentBox = document.getElementById("recent-box");
const clearBtn = document.getElementById("clear");
const familyEl = document.getElementById("family");
const familyBox = document.getElementById("family-box");
const copyAllBtn = document.getElementById("copyall");
const copyAllLabel = document.getElementById("copyall-label");
const exportBtn = document.getElementById("export");
const domainSelect = document.getElementById("domain");
const extendBtn = document.getElementById("extend");

const pick = (list) => list[(Math.random() * list.length) | 0];
const twoDigits = (number) => (number < 10 ? "0" + number : "" + number);

// Chips are created and bound once, then only re-labelled, so neither a draw
// nor a family click allocates DOM.
//
// Each list is one tab stop: the chip with tabIndex 0. Arrow keys move the
// stop inside the list, so 31 chips never need 31 presses of Tab.
function createChips(listEl, count) {
  const group = { chips: [], current: 0 };

  for (let i = 0; i < count; i += 1) {
    const chip = document.createElement("li");
    chip.hidden = true;
    chip.tabIndex = -1;
    chip.setAttribute("role", "button");

    chip.addEventListener("click", () => {
      setCurrent(group, i);
      copyText(chip.textContent, () => flashChip(chip));
    });

    chip.addEventListener("keydown", (event) => {
      const key = event.key;
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        copyText(chip.textContent, () => flashChip(chip));
        return;
      }

      const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : key === "ArrowLeft" || key === "ArrowUp" ? -1 : 0;
      if (!step && key !== "Home" && key !== "End") return;
      event.preventDefault();

      const visible = group.chips.filter((chip) => !chip.hidden);
      const at = visible.indexOf(chip);
      const next =
        key === "Home" ? visible[0]
        : key === "End" ? visible[visible.length - 1]
        : visible[(at + step + visible.length) % visible.length];

      if (next) focusChip(group, group.chips.indexOf(next));
    });

    listEl.appendChild(chip);
    group.chips.push(chip);
  }

  return group;
}

function setCurrent(group, index) {
  group.chips[group.current].tabIndex = -1;
  group.current = index;
  group.chips[index].tabIndex = 0;
}

function focusChip(group, index) {
  setCurrent(group, index);
  group.chips[index].focus();
}

const recentGroup = createChips(recentEl, CHIP_COUNT);
const familyGroup = createChips(familyEl, FAMILY_COUNT);
const chips = recentGroup.chips;
const familyChips = familyGroup.chips;

function nextName() {
  for (let attempt = 0; attempt < TRIES; attempt += 1) {
    const first = pick(FIRST_PARTS);
    const second = pick(SECOND_PARTS);
    const size = first.length + second.length;

    // Check the length before building the string, so a rejected try allocates
    // nothing at all.
    if (size < BASE_MIN || size > BASE_MAX) continue;

    const name = first + second + twoDigits(MIN_NUM + ((Math.random() * NUM_SPAN) | 0));
    if (recent.indexOf(name) === -1) return name;
  }

  return FALLBACK_BASE + twoDigits(MIN_NUM + ((Math.random() * NUM_SPAN) | 0));
}

function show(name) {
  currentName = name;
  render();
}

function render() {
  // A <wbr> before the @ lets a narrow screen break an address after the name
  // instead of chopping the domain.
  handleEl.textContent = currentName;
  if (extension) handleEl.append(document.createElement("wbr"), extension);
  handleEl.classList.toggle("has-ext", extension !== "");
  lengthEl.textContent = currentName.length + " characters";
  numberEl.textContent = "number " + currentName.slice(-2);
  extendBtn.textContent = extension ? "Remove extension" : "Add extension";
  extendBtn.setAttribute("aria-pressed", String(extension !== ""));
  // A family already on screen follows the extension as it is added or removed.
  if (!familyBox.hidden) paintFamily();
}

function renderRecent() {
  const count = recent.length;

  for (let i = 0; i < CHIP_COUNT; i += 1) {
    const chip = chips[i];
    if (i < count) {
      const name = recent[i];
      chip.textContent = name;
      chip.title = "Copy " + name;
      chip.hidden = false;
    } else if (!chip.hidden) {
      chip.hidden = true;
    }
  }

  // Keep the tab stop on a chip that is actually shown.
  setCurrent(recentGroup, chips[recentGroup.current].hidden ? 0 : recentGroup.current);

  // Nothing generated yet: hide the whole recent block rather than show bare
  // chrome with nothing under it.
  recentBox.hidden = count === 0;
}

// The liked name minus its suffix, plus 01..25, then the current extension.
function paintFamily() {
  for (let i = 0; i < FAMILY_COUNT; i += 1) {
    const name = familyBase + twoDigits(MIN_NUM + i) + extension;
    const chip = familyChips[i];
    chip.textContent = name;
    chip.title = "Copy " + name;
    chip.hidden = false;
  }
}

function showFamily() {
  familyBase = currentName.slice(0, -2);
  paintFamily();

  familyBox.hidden = false;
  setCurrent(familyGroup, familyChips[familyGroup.current].hidden ? 0 : familyGroup.current);
  likeBtn.classList.add("on");
  likeBtn.setAttribute("aria-pressed", "true");
}

function hideFamily() {
  if (familyBox.hidden) return;
  familyBox.hidden = true;
  likeBtn.classList.remove("on");
  likeBtn.setAttribute("aria-pressed", "false");
}

// The whole family as plain text, one name per line.
function familyText() {
  let text = "";
  for (let i = 0; i < FAMILY_COUNT; i += 1) {
    text += familyBase + twoDigits(MIN_NUM + i) + extension + "\n";
  }
  return text;
}

let swapTimer = 0;
let copyTimer = 0;
let chipTimer = 0;

function generate(animate) {
  const name = nextName();
  hideFamily();

  if (animate) {
    window.clearTimeout(swapTimer);
    handleEl.classList.add("swap");
    swapTimer = window.setTimeout(() => {
      show(name);
      handleEl.classList.remove("swap");
    }, 130);
  } else {
    show(name);
  }

  recent.unshift(name);
  if (recent.length > CHIP_COUNT) recent.pop();
  renderRecent();
}

function flash(btn, labelEl) {
  labelEl.textContent = "Copied";
  btn.classList.add("done");
  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => {
    labelEl.textContent = labelEl.dataset.label;
    btn.classList.remove("done");
  }, 1400);
}

function flashChip(chip) {
  chip.classList.add("copied");
  window.clearTimeout(chipTimer);
  chipTimer = window.setTimeout(() => chip.classList.remove("copied"), 900);
}

function legacyCopy(text, done) {
  // The Clipboard API can be blocked, for example inside a framed preview.
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
  } catch {}
  area.remove();
  done();
}

function copyText(text, done) {
  if (!text) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => legacyCopy(text, done));
  } else {
    legacyCopy(text, done);
  }
}

generateBtn.addEventListener("click", () => generate(true));
copyBtn.addEventListener("click", () => copyText(handleEl.textContent, () => flash(copyBtn, copyLabel)));

extendBtn.addEventListener("click", () => {
  extension = extension ? "" : domainSelect.value;
  render();
});

// Picking another domain swaps the extension on a name that already has one.
domainSelect.addEventListener("change", () => {
  if (!extension) return;
  extension = domainSelect.value;
  render();
});
copyAllBtn.addEventListener("click", () => copyText(familyText(), () => flash(copyAllBtn, copyAllLabel)));

likeBtn.addEventListener("click", () => {
  if (likeBtn.classList.contains("on")) hideFamily();
  else showFamily();
});

exportBtn.addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([familyText()], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  // The domain belongs in the name: families of different domains must not
  // overwrite each other on download.
  link.download = familyBase + extension + ".txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && event.target === document.body) {
    event.preventDefault();
    generate(true);
  }
});

clearBtn.addEventListener("click", () => {
  recent.length = 0;
  renderRecent();
});

generate(false);
