/* Anime Island character pages: shared renderer.
   Reads window.CHARACTER (defined in each characters/<slug>.html) and builds the page.
   You normally never edit this file. To change a character's content, edit that
   character's own page file. See the guide at the top of characters/monkey-d-luffy.html. */
(function () {
  var C = window.CHARACTER;
  var app = document.getElementById("app");
  if (!C || !app) return;

  var IMG = "../images/";
  var ROSTER_URL = "../index.html";

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function paras(parent, body) {
    (Array.isArray(body) ? body : [body]).forEach(function (t) {
      parent.appendChild(h("p", null, t));
    });
  }

  /* ----- theme ----- */
  var root = document.documentElement;
  root.style.setProperty("--c1", C.colors[0]);
  root.style.setProperty("--c2", C.colors[1]);
  root.style.setProperty("--accent", C.accent);
  if (C.framing) {
    if (C.framing.scale != null) root.style.setProperty("--s", C.framing.scale);
    if (C.framing.x) root.style.setProperty("--x", C.framing.x);
    if (C.framing.y) root.style.setProperty("--y", C.framing.y);
  }
  document.title = C.name + " | Anime Island";

  /* ----- brand bar ----- */
  var bar = h("header", "bar");
  var brand = h("h1", "brand");
  brand.style.fontSize = "0";
  var brandLink = h("a");
  brandLink.href = ROSTER_URL;
  brandLink.setAttribute("aria-label", "Anime Island, back to the roster");
  var logo = new Image();
  logo.src = IMG + "logo.png";
  logo.alt = "Anime Island";
  brandLink.appendChild(logo);
  brand.appendChild(brandLink);
  var back = h("a", "back", "Back to roster");
  back.href = ROSTER_URL;
  bar.appendChild(brand);
  bar.appendChild(back);
  app.appendChild(bar);

  /* ----- hero ----- */
  var wrap = h("div", "hero-wrap");
  var hero = h("section", "hero");
  hero.setAttribute("aria-label", C.name);

  hero.appendChild(h("div", "hero-shade"));

  var copy = h("div", "hero-copy");
  if (C.status) copy.appendChild(h("span", "status-tag", C.status));

  var nameEl = h("h1", "hero-name");
  var nameText = h("span", "name-text", C.name);
  var nameLogo = new Image();
  nameLogo.className = "name-logo";
  nameLogo.alt = "";
  nameLogo.addEventListener("load", function () { nameEl.classList.add("has-logo"); });
  nameLogo.addEventListener("error", function () { nameEl.classList.remove("has-logo"); });
  nameEl.appendChild(nameLogo);
  nameEl.appendChild(nameText);
  nameLogo.src = C.nameImage || (IMG + C.slug + "-logo.png");
  copy.appendChild(nameEl);

  if (C.facts && C.facts.length) {
    var dl = h("dl", "facts");
    C.facts.forEach(function (f) {
      var row = h("div");
      row.appendChild(h("dt", null, f.label));
      row.appendChild(h("dd", null, Array.isArray(f.value) ? f.value.join(", ") : f.value));
      dl.appendChild(row);
    });
    copy.appendChild(dl);
  }
  hero.appendChild(copy);

  var renderBox = h("div", "hero-render");
  var ghost = h("div", "ghost");
  ghost.innerHTML =
    '<svg viewBox="0 0 100 120" aria-hidden="true" fill="currentColor">' +
    '<circle cx="50" cy="34" r="21"/><path d="M6 120c0-26 18-44 44-44s44 18 44 44z"/></svg>';
  ghost.appendChild(h("span", null, "Render soon"));
  renderBox.appendChild(ghost);
  var render = new Image();
  render.alt = C.name;
  render.draggable = false;
  render.addEventListener("error", function () { hero.classList.add("no-render"); });
  render.addEventListener("load", function () { hero.classList.remove("no-render"); });
  renderBox.appendChild(render);
  render.src = C.image || (IMG + C.slug + ".png");
  hero.appendChild(renderBox);

  wrap.appendChild(hero);
  app.appendChild(wrap);

  /* ----- jump links ----- */
  var jump = h("ul", "jump");
  jump.setAttribute("aria-label", "Sections");
  (C.sections || []).forEach(function (s) {
    var li = h("li");
    var a = h("a", null, s.title);
    a.href = "#" + s.id;
    li.appendChild(a);
    jump.appendChild(li);
  });
  app.appendChild(jump);

  /* ----- block renderers ----- */
  var R = {
    text: function (b) {
      var p = h("div", "panel" + (b.wide ? " wide" : ""));
      if (b.heading) p.appendChild(h("h3", null, b.heading));
      paras(p, b.body);
      return p;
    },
    list: function (b) {
      var p = h("div", "panel" + (b.wide ? " wide" : ""));
      if (b.heading) p.appendChild(h("h3", null, b.heading));
      var ul = h("ul", "list");
      b.items.forEach(function (t) { ul.appendChild(h("li", null, t)); });
      p.appendChild(ul);
      return p;
    },
    terms: function (b) {
      var p = h("div", "panel" + (b.wide ? " wide" : ""));
      if (b.heading) p.appendChild(h("h3", null, b.heading));
      var dl = h("dl", "terms");
      b.items.forEach(function (it) {
        dl.appendChild(h("dt", null, it.term));
        dl.appendChild(h("dd", null, it.text));
      });
      p.appendChild(dl);
      return p;
    },
    steps: function (b, frag) {
      b.items.forEach(function (it, i) {
        var p = h("div", "panel");
        var head = h("div", "step-head");
        head.appendChild(h("span", "step-n", String(i + 1)));
        head.appendChild(h("h3", null, it.heading));
        p.appendChild(head);
        paras(p, it.body);
        frag.appendChild(p);
      });
    },
    relations: function (b, frag) {
      b.items.forEach(function (it) {
        var p = h("div", "panel");
        var top = h("div", "rel-top");
        top.appendChild(h("h3", null, it.name));
        if (it.tag) top.appendChild(h("span", "tag " + (it.tone || ""), it.tag));
        p.appendChild(top);
        paras(p, it.text);
        frag.appendChild(p);
      });
    },
    moves: function (b, frag) {
      b.items.forEach(function (it) {
        var p = h("div", "panel move");
        if (it.label || it.slot != null) p.appendChild(h("div", "slot-n", it.label || ("Slot " + it.slot)));
        p.appendChild(h("h3", null, it.name));
        if (it.variants) {
          var v = h("p", "variants");
          v.appendChild(h("b", null, it.variantLabel || "Variant"));
          v.appendChild(document.createTextNode(it.variants));
          p.appendChild(v);
        }
        if (it.note) p.appendChild(h("p", "move-note", it.note));
        frag.appendChild(p);
      });
    },
    note: function (b) {
      var n = h("div", "note");
      if (b.label) n.appendChild(h("b", null, b.label));
      n.appendChild(h("span", null, b.text));
      return n;
    }
  };

  /* ----- sections ----- */
  var sections = h("div", "sections");
  (C.sections || []).forEach(function (s) {
    var sec = h("section", "section");
    sec.id = s.id;
    var head = h("div", "section-head");
    head.appendChild(h("h2", null, s.title));
    sec.appendChild(head);

    var blocks = h("div", "blocks");
    (s.blocks || []).forEach(function (b) {
      var fn = R[b.type];
      if (!fn) return;
      if (fn.length === 2) fn(b, blocks);
      else blocks.appendChild(fn(b));
    });
    sec.appendChild(blocks);
    sections.appendChild(sec);
  });
  app.appendChild(sections);

  /* ----- footer ----- */
  var foot = h("footer", "foot");
  var fl = h("a", null, "Back to the Season 1 roster");
  fl.href = ROSTER_URL;
  foot.appendChild(fl);
  foot.appendChild(h("span", null, "Anime Island, a Roblox anime show."));
  app.appendChild(foot);
})();
