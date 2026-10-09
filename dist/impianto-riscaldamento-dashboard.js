var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t3, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e5;
  }
  get styleSheet() {
    let t3 = this.o;
    const s4 = this.t;
    if (e && void 0 === t3) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var i = (t3, ...e5) => {
  const o6 = 1 === t3.length ? t3[0] : e5.reduce((e6, s4, o7) => e6 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t3[o7 + 1], t3[0]);
  return new n(o6, t3, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e5 = "";
  for (const s4 of t4.cssRules) e5 += s4.cssText;
  return r(e5);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t3, s4) => t3;
var u = { toAttribute(t3, s4) {
  switch (s4) {
    case Boolean:
      t3 = t3 ? l : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s4) {
  let i5 = t3;
  switch (s4) {
    case Boolean:
      i5 = null !== t3;
      break;
    case Number:
      i5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t3);
      } catch (t4) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t3, s4) => !i2(t3, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t3) {
    this._$Ei(), (this.l ??= []).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t3, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
      void 0 !== h3 && e2(this.prototype, t3, h3);
    }
  }
  static getPropertyDescriptor(t3, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t3) ?? { get() {
      return this[s4];
    }, set(t4) {
      this[s4] = t4;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t3, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t3 = n2(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
      for (const i5 of s4) this.createProperty(i5, t4[i5]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s4 = litPropertyMetadata.get(t3);
      if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t4, s4] of this.elementProperties) {
      const i5 = this._$Eu(t4, s4);
      void 0 !== i5 && this._$Eh.set(i5, t4);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t3, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
  }
  addController(t3) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this._$EO?.delete(t3);
  }
  _$E_() {
    const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
    t3.size > 0 && (this._$Ep = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t3) => t3.hostDisconnected?.());
  }
  attributeChangedCallback(t3, s4, i5) {
    this._$AK(t3, i5);
  }
  _$ET(t3, s4) {
    const i5 = this.constructor.elementProperties.get(t3), e5 = this.constructor._$Eu(t3, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t3, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t3, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t3);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t4 = i5.getPropertyOptions(e5), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t4.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t3, s4, i5, e5 = false, h3) {
    if (void 0 !== t3) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t3]), i5 ??= r6.getPropertyOptions(t3), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r6._$Eu(t3, i5)))) return;
      this.C(t3, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t3, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t3) && (this._$Ej.set(t3, r6 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r6) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e5 && this._$Em !== t3 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t3));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t5, s5] of this._$Ep) this[t5] = s5;
        this._$Ep = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s5, i5] of t4) {
        const { wrapped: t5 } = i5, e5 = this[s5];
        true !== t5 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t3 = false;
    const s4 = this._$AL;
    try {
      t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t3 = false, this._$EM(), s5;
    }
    t3 && this._$AE(s4);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$Eq &&= this._$Eq.forEach((t4) => this._$ET(t4, this[t4])), this._$EM();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t3) => t3;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var u2 = Array.isArray;
var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t3, i5) {
  if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t3, i5) => {
  const s4 = t3.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t3[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t3, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t4 of r6.getAttributeNames()) if (t4.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t4).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t4);
        } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t4));
        if (y2.test(r6.tagName)) {
          const t4 = r6.textContent.split(o3), i6 = t4.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t4[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = r6.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t3, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t3, s4;
  }
};
function M(t3, i5, s4 = t3, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t3), h3._$AT(t3, s4, e5)), void 0 !== e5 ? (s4._$Co ??= [])[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t3, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t3?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t3) : 6 === r6.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t3) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i5 = this) {
    t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i5, _$litType$: s4 } = t3, e5 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t4 = new R(e5, this), s5 = t4.u(this.options);
      t4.p(i5), this.T(s5), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i5 = C.get(t3.strings);
    return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
  }
  k(t3) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t3) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t3 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
      const s5 = i3(t3).nextSibling;
      i3(t3).remove(), t3 = s5;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t3, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t3 = M(this, t3, i5, 0), o6 = !a2(t3) || t3 !== this._$AH && t3 !== E, o6 && (this._$AH = t3);
    else {
      const e6 = t3;
      let n5, r6;
      for (t3 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 ||= !a2(r6) || r6 !== this._$AH[n5], r6 === A ? t3 = A : t3 !== A && (t3 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
  }
};
var z = class extends H {
  constructor(t3, i5, s4, e5, h3) {
    super(t3, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t3, i5 = this) {
    if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i5, s4) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    M(this, t3);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t3, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t4 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
  }
  return h3._$AI(t3), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t3 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t3.firstChild, t3;
  }
  update(t3) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t3 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t3 = Object.create(t3)).wrapped = true), s4.set(r6.name, t3), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t3, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t3, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t3, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t3) {
  return (e5, o6) => "object" == typeof o6 ? r4(t3, e5, o6) : ((t4, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t4), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t3, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/settings-logic.ts
var SETTINGS_SECTIONS = [
  {
    title: "Pompa di integrazione",
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_blocco_attivo",
        label: "Blocco automatico",
        hint: "Tiene ferma la pompa quando il puffer non \xE8 abbastanza pi\xF9 caldo del boiler."
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_forzatura_attiva",
        label: "Accensione forzata",
        hint: "Accende la pompa anche quando l'Elios non la chiama, finch\xE9 il puffer ha calore da cedere."
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_blocco",
        label: "Blocca se il puffer supera il boiler di meno di"
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_sblocco",
        label: "Sblocca quando il puffer supera il boiler di"
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_temp_max",
        label: "Non scaldare la testa del boiler oltre"
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_isteresi_max",
        label: "Isteresi su questa temperatura"
      }
    ]
  },
  {
    title: "Caldaia a pellet (Polygon)",
    fields: [
      {
        kind: "climate",
        entity: "climate.casale_acqua",
        label: "Temperatura dell'acqua della caldaia",
        hint: "Setpoint dell'acqua di riscaldamento. I programmi della scheda di programmazione hanno i loro valori."
      },
      {
        kind: "number",
        entity: "number.casale_setpoint_boiler",
        label: "Setpoint del puffer da 50 litri",
        hint: "Setpoint boiler della Polygon (consenso per l'acqua calda sanitaria)."
      }
    ]
  },
  {
    title: "Salvaguardia accensioni",
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_salvaguardia_attiva",
        label: "Evita partenze inutili",
        hint: "Annulla l'avvio della caldaia quando il puffer \xE8 gi\xE0 caldo."
      },
      {
        kind: "number",
        entity: "input_number.caldaia_salvaguardia_t_puffer",
        label: "Partenza inutile se il puffer \xE8 gi\xE0 sopra"
      }
    ]
  },
  {
    title: "Spegnimento se nessuno \xE8 in casa",
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_attiva",
        label: "Spegni la caldaia con la casa vuota",
        hint: "Usa gli iPhone (iCloud3) e il Wi-Fi CASALE2G. Al rientro riaccende solo se un programma \xE8 attivo."
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_ospiti",
        label: "Ospiti in casa (non spegnere)",
        hint: "Per chi non ha un telefono tracciato."
      },
      { kind: "number", entity: "input_number.caldaia_assenza_minuti", label: "Spegni dopo questi minuti di assenza" },
      { kind: "number", entity: "input_number.caldaia_assenza_t_esterna_min", label: "Non spegnere se fuori fa meno di" }
    ]
  },
  {
    title: "Consumo di pellet (stima)",
    advanced: true,
    fields: [
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_min",
        label: "Consumo a potenza minima (30 %)",
        hint: "Chili all'ora quando la caldaia modula al minimo."
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_max",
        label: "Consumo a potenza 100 %",
        hint: "Chili all'ora quando la caldaia lavora al massimo."
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_mantenimento",
        label: "Consumo in stand-by e spegnimento"
      },
      { kind: "number", entity: "input_number.caldaia_pellet_g_accensione", label: "Consumo per accensione" },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_fattore",
        label: "Fattore di taratura",
        hint: "Pellet realmente consumato diviso la stima: 1,10 = la stima \xE8 bassa del 10 %."
      }
    ]
  },
  {
    title: "Misura delle pompe",
    advanced: true,
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.centralina_pompe_misura_attiva",
        label: "Misura della potenza attiva",
        hint: "Spenta se il misuratore \xE8 scollegato: gli indicatori delle pompe spariscono."
      },
      { kind: "number", entity: "input_number.centralina_pompe_w_ferme", label: "Pompe ferme sotto" },
      { kind: "number", entity: "input_number.centralina_pompe_w_collettore_max", label: "Solo collettore fino a" },
      { kind: "number", entity: "input_number.centralina_pompe_w_entrambe_min", label: "Entrambe le pompe da" },
      { kind: "number", entity: "input_number.centralina_pompa_integrazione_w_min", label: "Integrazione accesa sopra (Shelly 1PM)" }
    ]
  }
];
function num(v2, fallback) {
  const n5 = typeof v2 === "number" ? v2 : Number(v2);
  return Number.isFinite(n5) ? n5 : fallback;
}
function buildSettingsView(states, sections = SETTINGS_SECTIONS) {
  const out = [];
  for (const sec of sections) {
    const rows = [];
    for (const f3 of sec.fields) {
      const st = states[f3.entity];
      if (!st) continue;
      const unavailable = st.state === "unavailable" || st.state === "unknown";
      const isClimate = f3.kind === "climate";
      let value = null;
      if (f3.kind === "number" && !unavailable && Number.isFinite(Number(st.state))) value = Number(st.state);
      if (isClimate && !unavailable && st.attributes.temperature !== null && st.attributes.temperature !== void 0 && Number.isFinite(Number(st.attributes.temperature))) {
        value = Number(st.attributes.temperature);
      }
      rows.push({
        kind: f3.kind,
        entity: f3.entity,
        domain: f3.entity.split(".")[0],
        label: f3.label,
        hint: f3.hint,
        on: st.state === "on",
        value,
        unit: isClimate ? "\xB0C" : String(st.attributes.unit_of_measurement ?? ""),
        min: isClimate ? num(st.attributes.min_temp, 30) : num(st.attributes.min, 0),
        max: isClimate ? num(st.attributes.max_temp, 90) : num(st.attributes.max, 100),
        step: (isClimate ? num(st.attributes.target_temp_step, 1) : num(st.attributes.step, 1)) || 1,
        unavailable
      });
    }
    if (rows.length) out.push({ title: sec.title, advanced: !!sec.advanced, rows });
  }
  return out;
}
function decimals(step) {
  const s4 = String(step);
  const i5 = s4.indexOf(".");
  return i5 < 0 ? 0 : s4.length - i5 - 1;
}
function clampValue(v2, min, max, step) {
  const snapped = min + Math.round((v2 - min) / step) * step;
  const c4 = Math.min(max, Math.max(min, snapped));
  return Number(c4.toFixed(decimals(step)));
}
function stepValue(value, dir, min, max, step) {
  const base = value ?? min;
  return clampValue(base + dir * step, min, max, step);
}
function writeService(row, value) {
  if (row.domain === "climate") return { domain: "climate", service: "set_temperature", data: { entity_id: row.entity, temperature: value } };
  if (row.domain === "number") return { domain: "number", service: "set_value", data: { entity_id: row.entity, value } };
  return { domain: "input_number", service: "set_value", data: { entity_id: row.entity, value } };
}
var PENDING_MS = 3e4;
function applyPending(sections, pending, now) {
  const settled = [];
  const out = sections.map((sec) => ({
    ...sec,
    rows: sec.rows.map((row) => {
      const p3 = pending[row.entity];
      if (!p3 || row.kind === "toggle") return row;
      if (now >= p3.until || row.value === p3.value) {
        settled.push(row.entity);
        return row;
      }
      return { ...row, value: p3.value, saving: true };
    })
  }));
  return { sections: out, settled };
}

// src/settings-dialog.ts
var TAG = "impianto-settings-dialog";
var ImpiantoSettingsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this._open = /* @__PURE__ */ new Set();
    this._error = "";
    this._pending = {};
    this._timers = /* @__PURE__ */ new Map();
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    for (const t3 of this._timers.values()) window.clearTimeout(t3);
    this._timers.clear();
    if (this._expiry) window.clearTimeout(this._expiry);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  async _call(domain, service, data) {
    try {
      this._error = "";
      await this.hass.callService(domain, service, data);
    } catch (err) {
      this._error = `Impossibile salvare: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  _toggle(row) {
    void this._call("input_boolean", row.on ? "turn_off" : "turn_on", { entity_id: row.entity });
  }
  /**
   * Il valore scelto si vede subito; la scrittura parte dopo una breve pausa, così più pressioni di + o − diventano
   * una sola richiesta (la caldaia conferma via cloud dopo parecchi secondi).
   */
  _setNumber(row, value) {
    this._pending[row.entity] = { value, until: Date.now() + PENDING_MS };
    this.requestUpdate();
    if (this._expiry) window.clearTimeout(this._expiry);
    this._expiry = window.setTimeout(() => this.requestUpdate(), PENDING_MS + 100);
    const old = this._timers.get(row.entity);
    if (old) window.clearTimeout(old);
    this._timers.set(
      row.entity,
      window.setTimeout(() => {
        this._timers.delete(row.entity);
        const w2 = writeService(row, this._pending[row.entity]?.value ?? value);
        void this._call(w2.domain, w2.service, w2.data).then(() => {
          if (this._error) delete this._pending[row.entity];
        });
      }, 600)
    );
  }
  _step(row, dir) {
    this._setNumber(row, stepValue(row.value, dir, row.min, row.max, row.step));
  }
  _typed(row, ev) {
    const raw = ev.target.value.replace(",", ".");
    const n5 = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(n5)) {
      ev.target.value = row.value === null ? "" : String(row.value);
      return;
    }
    this._setNumber(row, clampValue(n5, row.min, row.max, row.step));
  }
  _toggleSection(title) {
    const next = new Set(this._open);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    this._open = next;
  }
  _renderRow(row) {
    if (row.kind === "toggle") {
      return b2`
        <div class="row tog">
          <div class="txt">
            <div class="lab">${row.label}</div>
            ${row.hint ? b2`<div class="hint">${row.hint}</div>` : A}
          </div>
          <button
            class=${row.on ? "sw on" : "sw"}
            role="switch"
            aria-checked=${row.on ? "true" : "false"}
            aria-label=${row.label}
            ?disabled=${row.unavailable}
            @click=${() => this._toggle(row)}
          ><span class="knob"></span></button>
        </div>
      `;
    }
    return b2`
      <div class="row">
        <div class="txt">
          <div class="lab">${row.label}</div>
          ${row.hint ? b2`<div class="hint">${row.hint}</div>` : A}
        </div>
        <div class="num">
          <button class="st" aria-label="Diminuisci" ?disabled=${row.unavailable || row.value !== null && row.value <= row.min} @click=${() => this._step(row, -1)}>−</button>
          <input
            type="text"
            inputmode="decimal"
            class=${row.saving ? "saving" : ""}
            .value=${row.value === null ? "" : String(row.value)}
            ?disabled=${row.unavailable}
            aria-label=${row.label}
            @change=${(e5) => this._typed(row, e5)}
          />
          <span class="unit">${row.unit}</span>
          <button class="st" aria-label="Aumenta" ?disabled=${row.unavailable || row.value !== null && row.value >= row.max} @click=${() => this._step(row, 1)}>+</button>
        </div>
      </div>
    `;
  }
  render() {
    if (!this.hass) return A;
    const built = applyPending(buildSettingsView(this.hass.states), this._pending, Date.now());
    for (const e5 of built.settled) delete this._pending[e5];
    const sections = built.sections;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Preferenze impianto">
          <div class="head">
            <div class="title">Preferenze impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${sections.length === 0 ? b2`<div class="empty">Nessuna impostazione trovata: installa i pacchetti Home Assistant del progetto (cartella ha-packages).</div>` : sections.map((sec) => {
      const open = !sec.advanced || this._open.has(sec.title);
      return b2`
                    <section>
                      ${sec.advanced ? b2`<button class="sec adv" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleSection(sec.title)}>
                            <span>${sec.title}</span><span class="chev">${open ? "\u25BE" : "\u25B8"}</span>
                          </button>` : b2`<div class="sec">${sec.title}</div>`}
                      ${open ? sec.rows.map((r6) => this._renderRow(r6)) : A}
                    </section>
                  `;
    })}
            ${this._error ? b2`<div class="err">${this._error}</div>` : A}
          </div>
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 560px;
      max-height: min(86vh, 760px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 4px 18px 18px;
    }
    section {
      margin-top: 14px;
    }
    .sec {
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary-color, #03a9f4);
      margin: 0 0 4px;
    }
    .sec.adv {
      background: none;
      border: none;
      width: 100%;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      padding: 4px 0;
      font-family: inherit;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 9px 0;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .txt {
      min-width: 0;
      flex: 1;
    }
    .lab {
      font-size: 15px;
    }
    .hint {
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .sw {
      flex: none;
      width: 46px;
      height: 26px;
      border-radius: 13px;
      border: none;
      padding: 0;
      background: var(--disabled-text-color, #9e9e9e);
      position: relative;
      cursor: pointer;
      transition: background 0.15s;
    }
    .sw.on {
      background: var(--primary-color, #03a9f4);
    }
    .sw .knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;
    }
    .sw.on .knob {
      transform: translateX(20px);
    }
    .sw:disabled,
    .st:disabled,
    input:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .num {
      flex: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .st {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
    input {
      width: 64px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      padding: 6px 4px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--card-background-color, #fff);
      color: inherit;
      box-sizing: border-box;
    }
    input.saving {
      border-color: var(--primary-color, #03a9f4);
      font-style: italic;
    }
    .unit {
      min-width: 22px;
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
    }
    .empty,
    .err {
      margin-top: 16px;
      font-size: 14px;
    }
    .err {
      color: var(--error-color, #db4437);
    }
    @media (max-width: 480px) {
      .row:not(.tog) {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .num {
        justify-content: flex-end;
      }
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoSettingsDialog.prototype, "hass", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_open", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_error", 2);
if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoSettingsDialog);

// src/plant-logic.ts
var DEFAULT_MODEL = {
  volume: 190,
  topShare: 0.5,
  mainsTemp: 15,
  showerVolume: 40,
  showerTemp: 38
};
function showersEstimate(top, bottom, m2) {
  if (top === null) return null;
  const span = m2.showerTemp - m2.mainsTemp;
  if (span <= 0 || m2.showerVolume <= 0) return null;
  const zones = [
    [m2.volume * m2.topShare, top],
    [m2.volume * (1 - m2.topShare), bottom ?? top]
  ];
  let liters = 0;
  for (const [v2, t3] of zones) {
    if (t3 !== null && t3 >= m2.showerTemp) liters += v2 * (t3 - m2.mainsTemp) / span;
  }
  return Math.floor(liters / m2.showerVolume);
}
function stoveLook(state) {
  const s4 = (state ?? "").trim().toUpperCase();
  if (["WORK", "LAVORO", "WORKING"].includes(s4)) return "work";
  if (["START", "AVVIO", "ACCENSIONE", "IGNITION"].includes(s4)) return "start";
  if (["WAIT", "ATTESA", "PRE-START"].includes(s4)) return "wait";
  if (["STAND BY", "STANDBY", "STAND-BY"].includes(s4)) return "standby";
  if (["STOP", "SPEGNIMENTO", "CLEANING", "PULIZIA"].includes(s4)) return "stopping";
  return "off";
}
var COLOR_STOPS = [
  [15, [59, 130, 246]],
  // blu
  [30, [147, 197, 253]],
  // azzurro chiaro
  [42, [252, 211, 77]],
  // giallo
  [55, [249, 115, 22]],
  // arancione
  [65, [239, 68, 68]]
  // rosso
];
function tempColor(t3) {
  if (t3 === null || Number.isNaN(t3)) return "#94a3b8";
  const first = COLOR_STOPS[0];
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  let rgb = t3 <= first[0] ? first[1] : last[1];
  if (t3 > first[0] && t3 < last[0]) {
    for (let i5 = 1; i5 < COLOR_STOPS.length; i5++) {
      const [t1, c1] = COLOR_STOPS[i5];
      if (t3 <= t1) {
        const [t0, c0] = COLOR_STOPS[i5 - 1];
        const k2 = (t3 - t0) / (t1 - t0);
        rgb = [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k2));
        break;
      }
    }
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
function fmt(n5, decimals2 = 0) {
  if (n5 === null || n5 === void 0 || Number.isNaN(n5)) return "\u2013";
  return n5.toLocaleString("it-IT", { minimumFractionDigits: decimals2, maximumFractionDigits: decimals2 });
}
function toNumber(state) {
  if (state === void 0 || state === null || state === "" || state === "unknown" || state === "unavailable") return null;
  const n5 = Number(state);
  return Number.isFinite(n5) ? n5 : null;
}
var BOOST_LABEL = {
  pronta: ["Avvia caldaia", ""],
  attiva: ["Annulla", "accensione in corso"],
  non_serve: ["Non serve", "acqua gi\xE0 calda"],
  puffer_caldo: ["Puffer caldo", "il calore c'\xE8 gi\xE0"],
  accesa: ["Gi\xE0 accesa", "in accensione o al lavoro"],
  in_attesa: ["In attesa", "ECO STOP: riparte da sola"],
  in_arresto: ["In spegnimento", "riprova tra poco"],
  allarme: ["Allarme", "caldaia bloccata"],
  limite: ["Limite di oggi", "accensioni rapide"],
  non_disponibile: ["Non disponibile", "mancano dati"]
};
function boostButton(state, armed) {
  const key = state && state in BOOST_LABEL ? state : "non_disponibile";
  const [label, sub] = BOOST_LABEL[key];
  if (key === "pronta") return armed ? { label: "Conferma?", sub: "tocca ancora", action: "go" } : { label, sub, action: "go" };
  if (key === "attiva") return armed ? { label: "Conferma?", sub: "annulla e spegni", action: "cancel" } : { label, sub, action: "cancel" };
  return { label, sub, action: "none" };
}
function etaText(minutes) {
  if (minutes === null) return "\u2013";
  return `${Math.round(minutes)} min`;
}
function pelletStatus(reserve, empty, open) {
  if (empty) return { key: "vuoto", label: "Vuoto" };
  if (reserve) return { key: "riserva", label: "In riserva" };
  if (open) return { key: "aperto", label: "Aperto" };
  if (reserve === null && empty === null && open === null) return { key: "nd", label: "\u2013" };
  return { key: "ok", label: "OK" };
}
var MIN_SHOWN_W = 5;
function pumpWatts(w2) {
  return w2 !== null && w2 >= MIN_SHOWN_W ? ` \xB7 ${Math.round(w2)} W` : "";
}
function integrationPumpPill(running, called, blockEnabled, blockWanted, watts) {
  if (blockEnabled === true && blockWanted === true && called === true) return { key: "blocked", label: "integrazione bloccata" };
  if (running === true) return { key: "running", label: `integrazione${pumpWatts(watts)}` };
  return { key: "idle", label: "integrazione" };
}
function collectorPumpPill(running, watts) {
  if (running === true) return { key: "running", label: `collettore${pumpWatts(watts)}` };
  return { key: "idle", label: "collettore" };
}
function panelModel(pumpOn, measured, estimated, maxPredicted, maxToday) {
  let value = null;
  let source = "nd";
  if (pumpOn === true && measured !== null) {
    value = measured;
    source = "misurata";
  } else if (estimated !== null) {
    value = estimated;
    source = "stimata";
  }
  const caption = source === "misurata" ? "misurata (ingresso)" : source === "stimata" ? pumpOn === true ? "stimata" : "stimata \xB7 pompa ferma" : "non disponibile";
  const pred = maxPredicted !== null && maxToday !== null ? Math.max(maxPredicted, maxToday) : maxPredicted;
  return { value, source, caption, maxPredicted: pred, maxToday };
}
function panelColor(t3) {
  if (t3 === null || Number.isNaN(t3)) return "#94a3b8";
  if (t3 <= 65) return tempColor(t3);
  const k2 = Math.min(1, (t3 - 65) / 35);
  const rgb = [239, 68, 68].map((c4, i5) => Math.round(c4 + ([127, 29, 29][i5] - c4) * k2));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

// src/plant-card.ts
var CARD_TAG = "impianto-overview-card";
var DEFAULT_ENTITIES = {
  boiler_top: "sensor.boiler_solare_alto_stimato",
  boiler_bottom: "sensor.boiler_solare_basso_stimato",
  solar_power: "sensor.solare_termico_potenza",
  collector_temp: "sensor.solare_termico_t_collettore_stimata",
  puffer: "sensor.casale_temperatura_boiler",
  stove_state: "sensor.casale_stato",
  stove_water: "sensor.casale_temperatura_acqua",
  smoke: "sensor.casale_temperatura_fumi",
  flame: "sensor.casale_temperatura_fiamma",
  power: "sensor.casale_potenza_reale",
  water_pressure: "sensor.casale_pressione_acqua",
  brazier_pressure: "sensor.casale_pressione_braciere",
  extractor: "sensor.casale_estrattore_fumi",
  pump: "sensor.casale_pompa_acqua",
  alarm: "sensor.casale_allarme",
  set_boiler: "number.casale_setpoint_boiler",
  set_water: "climate.casale_acqua",
  starts_today: "sensor.caldaia_accensioni_oggi",
  starts_yesterday: "sensor.caldaia_accensioni_ieri",
  standby_today: "sensor.caldaia_stand_by_oggi",
  work_hours_today: "sensor.caldaia_ore_in_lavoro_oggi",
  request_acs: "binary_sensor.caldaia_richiesta_acs",
  request_heating: "binary_sensor.caldaia_richiesta_riscaldamento",
  consent: "binary_sensor.caldaia_consenso_suggerito",
  eta: "sensor.caldaia_acqua_pronta_tra",
  boost_state: "sensor.caldaia_accensione_rapida_stato",
  boost_start_script: "script.caldaia_accensione_rapida",
  boost_cancel_script: "script.caldaia_accensione_rapida_annulla",
  guard: "input_boolean.caldaia_salvaguardia_attiva",
  guard_flag: "input_boolean.caldaia_salvaguardia_ha_spento",
  pellet_reserve: "binary_sensor.casale_riserva_legna",
  pellet_empty: "binary_sensor.casale_pellet_empty",
  pellet_open: "binary_sensor.casale_pellet_hopper_open",
  integration_pump: "binary_sensor.caldaia_pompa_integrazione_attiva",
  collector_pump: "binary_sensor.caldaia_pompa_collettore_attiva",
  integration_power: "sensor.garage_bs_pompa_integrazione_potenza",
  integration_call: "binary_sensor.garage_bs_pompa_integrazione_ingresso_0",
  integration_block_enabled: "input_boolean.caldaia_integrazione_blocco_attivo",
  integration_block_wanted: "binary_sensor.caldaia_integrazione_inutile",
  collector_power: "sensor.garage_centralina_solare_pompe_potenza",
  pellet_today: "sensor.caldaia_pellet_oggi",
  pellet_week: "sensor.caldaia_pellet_settimana",
  pellet_month: "sensor.caldaia_pellet_mese",
  coil_solar_in: "sensor.solare_termico_solare_serpentina_ingresso",
  coil_solar_out: "sensor.solare_termico_solare_serpentina_uscita",
  coil_integ_in: "sensor.solare_termico_integrazione_serpentina_ingresso",
  coil_integ_out: "sensor.solare_termico_integrazione_serpentina_uscita",
  panel_max: "sensor.solare_pannello_massima_prevista",
  panel_max_today: "sensor.solare_pannello_massima_oggi",
  puffer_effective: "sensor.puffer_temperatura_effettiva"
};
var DEFAULT_MODEL_ENTITIES = {
  volume: "input_number.boiler_solare_volume",
  top_share: "input_number.boiler_solare_peso_alto",
  mains_temp: "input_number.boiler_solare_t_rete"
};
var FLAME_PATH = "M0,-100 C10,-70 45,-50 45,-15 C45,12 25,25 0,25 C-25,25 -45,12 -45,-15 C-45,-32 -35,-45 -25,-58 C-22,-40 -12,-32 -6,-34 C-14,-60 -8,-82 0,-100 Z";
var COIL_INTEGRATION = "M238 200 H398 M398 200 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238";
var COIL_SOLAR = "M238 560 H398 M398 560 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238 q-14 12 0 24 H398";
var HOPPER_FILL = {
  ok: "#15803d",
  riserva: "#d97706",
  vuoto: "#dc2626",
  aperto: "#2563eb",
  nd: "#475569"
};
var LOOK_LABEL = {
  off: "spenta",
  wait: "in attesa",
  start: "accensione",
  work: "in lavoro",
  standby: "stand-by",
  stopping: "spegnimento"
};
var ImpiantoOverviewCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._narrow = false;
    this._compact = false;
    this._armed = false;
    this._width = 1e3;
    this._onResize = () => this._updateCompact();
  }
  connectedCallback() {
    super.connectedCallback();
    this._ro = new ResizeObserver((entries) => {
      const w2 = entries[0]?.contentRect.width ?? 1e3;
      this._width = w2;
      const narrow = w2 < 560;
      if (narrow !== this._narrow) this._narrow = narrow;
      this._updateCompact();
    });
    this._ro.observe(this);
    window.addEventListener("resize", this._onResize);
  }
  /** Compatta se richiesto, oppure (auto) quando c'è spazio in larghezza ma lo schermo è basso. */
  _updateCompact() {
    const opt = this._config?.compact ?? "auto";
    const compact = opt === true || opt === "auto" && this._width >= 900 && window.innerHeight < 850;
    if (compact !== this._compact) this._compact = compact;
  }
  /** Apre la finestra delle preferenze (si aggiunge alla pagina, non sta dentro la scheda). */
  _openSettings() {
    if (this._dialog) return;
    const d3 = document.createElement("impianto-settings-dialog");
    d3.hass = this.hass;
    d3.addEventListener("closed", () => {
      this._dialog = void 0;
    });
    document.body.appendChild(d3);
    this._dialog = d3;
  }
  updated(changed) {
    if (changed.has("hass") && this._dialog) this._dialog.hass = this.hass;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dialog?.remove();
    this._dialog = void 0;
    this._ro?.disconnect();
    window.removeEventListener("resize", this._onResize);
    if (this._armTimer) window.clearTimeout(this._armTimer);
  }
  /** Primo tocco = conferma richiesta (4 secondi), secondo tocco = esegue. */
  _press() {
    const model = boostButton(this._s(this._e.boost_state), this._armed);
    if (model.action === "none") return;
    if (!this._armed) {
      this._armed = true;
      this._armTimer = window.setTimeout(() => this._armed = false, 4e3);
      return;
    }
    this._armed = false;
    if (this._armTimer) window.clearTimeout(this._armTimer);
    const script = model.action === "go" ? this._e.boost_start_script : this._e.boost_cancel_script;
    void this.hass.callService("script", "turn_on", { entity_id: script });
  }
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("impianto-overview-card: configurazione non valida");
    this._config = config;
    this._updateCompact();
  }
  getCardSize() {
    return 12;
  }
  static getStubConfig() {
    return { type: `custom:${CARD_TAG}` };
  }
  // ---- lettura -------------------------------------------------------------
  get _e() {
    return { ...DEFAULT_ENTITIES, ...this._config.entities ?? {} };
  }
  _s(id) {
    return id ? this.hass.states[id]?.state : void 0;
  }
  _n(id) {
    if (!id) return null;
    const st = this.hass.states[id];
    if (!st) return null;
    if (id.startsWith("climate.")) return toNumber(String(st.attributes.temperature ?? ""));
    return toNumber(st.state);
  }
  _val(v2, fallbackEntity) {
    if (typeof v2 === "number") return v2;
    if (typeof v2 === "string") return this._n(v2);
    return fallbackEntity ? this._n(fallbackEntity) : null;
  }
  _model() {
    const m2 = this._config.model ?? {};
    const vol = this._val(m2.volume, DEFAULT_MODEL_ENTITIES.volume);
    let share = this._val(m2.top_share, DEFAULT_MODEL_ENTITIES.top_share);
    if (share !== null && share > 1) share = share / 100;
    return {
      volume: vol ?? DEFAULT_MODEL.volume,
      topShare: share ?? DEFAULT_MODEL.topShare,
      mainsTemp: this._val(m2.mains_temp, DEFAULT_MODEL_ENTITIES.mains_temp) ?? DEFAULT_MODEL.mainsTemp,
      showerVolume: this._val(m2.shower_volume) ?? DEFAULT_MODEL.showerVolume,
      showerTemp: this._val(m2.shower_temp) ?? DEFAULT_MODEL.showerTemp
    };
  }
  _yes(id) {
    const s4 = this._s(id);
    return s4 === "on" ? true : s4 === "off" ? false : null;
  }
  // ---- boiler solare + puffer (SVG) ---------------------------------------
  _renderBoiler() {
    const e5 = this._e;
    const m2 = this._model();
    const top = this._n(e5.boiler_top);
    const bottom = this._n(e5.boiler_bottom);
    const outlet = this._n(e5.outlet) ?? top;
    const showers = showersEstimate(top, bottom, m2);
    const pufferId = this.hass.states[e5.puffer_effective] ? e5.puffer_effective : e5.puffer;
    const puffer = this._n(pufferId);
    const pufferEstimated = this.hass.states[pufferId]?.attributes?.fonte === "sonda ingresso";
    const solarKw = this._n(e5.solar_power);
    const collector = this._n(e5.collector_temp);
    const cTop = tempColor(top);
    const cBot = tempColor(bottom);
    const cMid = tempColor(top !== null && bottom !== null ? m2.topShare * top + (1 - m2.topShare) * bottom : top ?? bottom);
    const cPuf = tempColor(puffer);
    const midAt = `${Math.round(m2.topShare * 100)}%`;
    const eta = this._n(e5.eta);
    const integrationPill = integrationPumpPill(
      this._yes(e5.integration_pump),
      this._yes(e5.integration_call),
      this._yes(e5.integration_block_enabled),
      this._yes(e5.integration_block_wanted),
      this._n(e5.integration_power)
    );
    const collectorPill = collectorPumpPill(this._yes(e5.collector_pump), this._n(e5.collector_power));
    const pumpOn = integrationPill.key === "running";
    const collectorOn = collectorPill.key === "running";
    const panel = panelModel(
      this._yes(e5.collector_pump),
      this._n(e5.coil_solar_in),
      collector,
      this._n(e5.panel_max),
      this._n(e5.panel_max_today)
    );
    const panelFill = panelColor(panel.value);
    const solarIn = this._n(e5.coil_solar_in);
    const solarOut = this._n(e5.coil_solar_out);
    const integIn = this._n(e5.coil_integ_in);
    const integOut = this._n(e5.coil_integ_out);
    const btn = boostButton(this._s(e5.boost_state), this._armed);
    return b2`
      <svg class=${this._narrow ? "boiler narrow" : "boiler"} viewBox=${this._narrow ? "0 0 640 840" : this._compact ? "0 66 700 762" : "0 0 700 840"} role="img" aria-label="Boiler solare">
        <defs>
          <linearGradient id="acqua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color=${cTop} />
            <stop offset=${midAt} stop-color=${cMid} />
            <stop offset="1" stop-color=${cBot} />
          </linearGradient>
          <linearGradient id="puffer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color=${cPuf} />
            <stop offset="1" stop-color=${tempColor(puffer !== null ? puffer - 12 : null)} />
          </linearGradient>
          <linearGradient id="iso" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style="stop-color:var(--divider-color)" />
            <stop offset="0.5" style="stop-color:var(--secondary-background-color)" />
            <stop offset="1" style="stop-color:var(--divider-color)" />
          </linearGradient>
          <linearGradient id="lucido" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff" stop-opacity="0.28" />
            <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- tubi -->
        <path d="M420 135 H520 V95" class="pipe hot" />
        <path d="M420 745 H520 V775" class="pipe cold" />
        <g class="pufgroup">
          <path d="M440 208 H575" class="pipe hot thin" />
          <path d="M440 268 H520 V315 H575" class="pipe warm thin" />
          <path d="M685 215 H700" class="pipe hot thin" />
          <path d="M685 300 H700" class="pipe warm thin" />
          <text x="452" y="198" class="tv">${integIn !== null ? `${fmt(integIn, 1)} \xB0C` : ""}</text>
          <text x="452" y="260" class="tv">${integOut !== null ? `${fmt(integOut, 1)} \xB0C` : ""}</text>
        </g>

        <!-- boiler -->
        <rect x="200" y="100" width="240" height="660" rx="52" fill="url(#iso)" class="outline" />
        <rect x="222" y="122" width="196" height="616" rx="38" fill="url(#acqua)" />
        <g class="coil">
          <path d=${COIL_INTEGRATION} stroke="#7c3aed" />
          <path d=${COIL_SOLAR} stroke="#15803d" />
        </g>
        ${pumpOn ? w`<path d=${COIL_INTEGRATION} class="coilflow" />` : A}
        ${collectorOn ? w`<path d=${COIL_SOLAR} class="coilflow" />` : A}
        <rect x="246" y="150" width="160" height="26" rx="13" class="pill" />
        <text x="326" y="168" class="s14 b" text-anchor="middle" fill="#a78bfa">Integrazione (caldaia)</text>
        ${integrationPill.key === "idle" ? A : w`<rect x="244" y="284" width="164" height="22" rx="11" class="pill" /><circle cx="260" cy="295" r="4.5" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"} class=${integrationPill.key === "blocked" ? "" : "pulse"} /><text x="336" y="299.5" class="s13 b" text-anchor="middle" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"}>${integrationPill.label}</text>`}
        ${collectorOn ? w`<rect x="250" y="676" width="152" height="22" rx="11" class="pill" /><circle cx="266" cy="687" r="4.5" fill="#22c55e" class="pulse" /><text x="334" y="691.5" class="s13 b" text-anchor="middle" fill="#22c55e">${collectorPill.label}</text>` : A}
        <rect x="266" y="522" width="120" height="26" rx="13" class="pill" />
        <text x="326" y="540" class="s14 b" text-anchor="middle" fill="#4ade80">Solare</text>
        <rect x="222" y="122" width="196" height="616" rx="38" fill="url(#lucido)" />

        <!-- scheda centrale -->
        <rect x="236" y="338" width="168" height="176" rx="22" class="pill big" />
        <text x="320" y="372" class="t2 s14" text-anchor="middle">Uscita acqua calda</text>
        <text x="320" y="434" class="t1 b" font-size="50" text-anchor="middle">${fmt(outlet, 1)}<tspan font-size="24" dy="-16"> °C</tspan></text>
        <line x1="262" y1="456" x2="378" y2="456" class="sep" />
        <text x="320" y="490" class="t1 b" font-size="22" text-anchor="middle">${showers === null ? "(\u2013)" : `(\u2248 ${showers} ${showers === 1 ? "doccia" : "docce"})`}</text>

        <!-- sonde -->
        <circle cx="222" cy="168" r="8" class="probe" />
        <line x1="214" y1="168" x2="150" y2="168" class="lead" />
        <rect x="14" y="132" width="136" height="72" rx="14" class="card hi" />
        <text x="82" y="156" class="t2 s14" text-anchor="middle">Alto (S3)</text>
        <text x="82" y="190" class="b" font-size="27" text-anchor="middle" fill="#ef4444">${fmt(top, 1)} °C</text>

        <circle cx="222" cy="676" r="8" class="probe" />
        <line x1="214" y1="676" x2="150" y2="676" class="lead" />
        <rect x="14" y="640" width="136" height="72" rx="14" class="card lo" />
        <text x="82" y="664" class="t2 s14" text-anchor="middle">Basso (S2)</text>
        <text x="82" y="698" class="b" font-size="27" text-anchor="middle" fill="#3b82f6">${fmt(bottom, 1)} °C</text>

        <!-- stima e pulsante -->
        <rect x="14" y="224" width="136" height="104" rx="14" class="card eta" />
        <text x="82" y="248" class="t2 s14" text-anchor="middle">Acqua pronta in</text>
        <text x="82" y="292" class="t1 b" font-size="34" text-anchor="middle">${etaText(eta)}</text>
        <text x="82" y="314" class="t2 s13" text-anchor="middle">${eta === 0 ? "gi\xE0 a temperatura" : eta === null ? "" : "stima media"}</text>
        <g class=${btn.action === "none" ? "btn off" : this._armed ? "btn armed" : "btn"} role="button" tabindex=${btn.action === "none" ? "-1" : "0"}
          aria-label=${btn.label} @click=${() => this._press()} @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._press()}>
          <rect x="14" y="340" width="136" height="${btn.sub ? 78 : 64}" rx="14" class="btnbg" />
          <text x="82" y=${btn.sub ? 372 : 380} class="b" font-size="18" text-anchor="middle">${btn.label}</text>
          ${btn.sub ? w`<text x="82" y="396" class="s13" text-anchor="middle" opacity="0.85">${btn.sub}</text>` : A}
        </g>

        <!-- solare -->
        <rect x="14" y="728" width="136" height="72" rx="14" class="card sun" />
        <text x="82" y="752" class="t2 s14" text-anchor="middle">Solare</text>
        <text x="82" y="786" class="b" font-size="24" text-anchor="middle" fill="#22c55e">${fmt(solarKw, 1)} kW</text>

        <text x="532" y="80" class="b s14" fill="#ef4444">Acqua calda</text>
        <text x="532" y="98" class="t2 s13">verso utenze</text>
        <text x="532" y="796" class="b s14" fill="#3b82f6">Acqua fredda</text>
        <text x="532" y="814" class="t2 s13">dalla rete</text>

        <g class="pufgroup">${this._pufferShape(puffer, pufferEstimated)}</g>

        <!-- pannello solare e circuito del collettore -->
        <g class="pufgroup pannello">
          <path d="M598 500 H520 V560 H440" class="pipe hot thin" />
          <path d="M440 656 H548 V552 H598" class="pipe cold thin" />
          ${collectorOn ? w`<path d="M598 500 H520 V560 H440" class="coilflow" /><path d="M440 656 H548 V552 H598" class="coilflow" />` : A}
          <text x="448" y="548" class="tv">${solarIn !== null ? `${fmt(solarIn, 1)} \xB0C` : ""}</text>
          <text x="448" y="644" class="tv">${solarOut !== null ? `${fmt(solarOut, 1)} \xB0C` : ""}</text>
          ${this._panelShape(panel, panelFill)}
        </g>
      </svg>
      ${this._narrow ? w`<svg class="boiler mini" viewBox="0 0 640 330" role="img" aria-label="Puffer e pannello solare">
            <g transform="translate(-480 -140)">${this._pufferShape(puffer, pufferEstimated)}</g>
            <text x="150" y="236" class="tv">${integIn !== null ? `\u2192 ${fmt(integIn, 1)} \xB0C` : ""}</text>
            <text x="150" y="266" class="tv">${integOut !== null ? `\u2190 ${fmt(integOut, 1)} \xB0C` : ""}</text>
            <g transform="translate(-160 -420)">${this._panelShape(panel, panelFill)}</g>
            <text x="470" y="318" class="tv" text-anchor="middle">${solarIn !== null ? `\u2192 ${fmt(solarIn, 1)} \xB0C` : ""}   ${solarOut !== null ? `\u2190 ${fmt(solarOut, 1)} \xB0C` : ""}</text>
          </svg>` : A}
    `;
  }
  /** Il puffer da 50 litri, con le coordinate del disegno largo (al centro x = 630). */
  _pufferShape(puffer, estimated = false) {
    return w`
      <text x="630" y="158" class="t1 b s15" text-anchor="middle">Puffer 50 L</text>
      <rect x="575" y="170" width="110" height="170" rx="26" fill="url(#puffer)" class="outline" />
      <rect x="587" y="224" width="86" height="64" rx="14" class="pill big" />
      <text x="630" y="${estimated ? 258 : 264}" class="t1 b val" text-anchor="middle">${fmt(puffer, 0)} °C</text>
      ${estimated ? w`<text x="630" y="279" class="t2 s13" text-anchor="middle">stima sonda</text>` : A}`;
  }
  /** La sagoma del pannello con i suoi testi, con le coordinate del disegno largo (al centro x = 630). */
  _panelShape(panel, fill) {
    return w`
      <text x="630" y="440" class="t1 b s16" text-anchor="middle">Pannello solare</text>
      <polygon points="616,462 692,462 676,568 592,568" fill=${fill} class="outline panelbody" />
      <g class="panelgrid">
        <line x1="641" y1="462" x2="634" y2="568" /><line x1="667" y1="462" x2="655" y2="568" />
        <line x1="604" y1="515" x2="684" y2="515" /><line x1="610" y1="541" x2="680" y2="541" /><line x1="610" y1="489" x2="688" y2="489" />
      </g>
      <polygon points="616,462 640,462 612,568 592,568" fill="#fff" opacity="0.16" />
      <line x1="618" y1="568" x2="612" y2="586" class="panelleg" /><line x1="666" y1="568" x2="672" y2="586" class="panelleg" />
      <text x="630" y="618" class="t1 b val" text-anchor="middle">${panel.value === null ? "\u2013" : `${fmt(panel.value, 0)} \xB0C`}</text>
      <text x="630" y="640" class="t2 s15" text-anchor="middle">${panel.caption}</text>
      ${panel.maxPredicted !== null ? w`<text x="630" y="668" class="b s15" text-anchor="middle" fill="#f59e0b">max prevista ${fmt(panel.maxPredicted, 0)} °C</text>` : A}
      ${panel.maxToday !== null ? w`<text x="630" y="690" class="t2 s15" text-anchor="middle">raggiunta oggi ${fmt(panel.maxToday, 0)} °C</text>` : A}`;
  }
  // ---- caldaia -----------------------------------------------------------
  _flame(cx, cy, k2, opacity = 1) {
    return w`<g transform="translate(${cx},${cy}) scale(${k2})" opacity=${opacity}>
      <path d=${FLAME_PATH} fill="url(#fiamma)" />
      <path d=${FLAME_PATH} fill="#fde047" transform="translate(0,6) scale(0.52)" />
    </g>`;
  }
  _renderStoveImage(look, pellet) {
    const flame = look === "work" ? this._flame(90, 168, 1) : look === "start" ? this._flame(90, 168, 0.4) : look === "stopping" ? this._flame(90, 168, 0.22, 0.55) : A;
    const glow = look === "work" ? 0.55 : look === "start" ? 0.3 : 0;
    return b2`
      <svg class="stoveimg ${look}" viewBox="0 0 180 250" role="img" aria-label="Caldaia a pellet">
        <defs>
          <linearGradient id="fiamma" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#f59e0b" /><stop offset="0.55" stop-color="#f97316" /><stop offset="1" stop-color="#dc2626" />
          </linearGradient>
          <linearGradient id="vetro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05080f" /><stop offset="1" stop-color="#1e293b" /></linearGradient>
          <radialGradient id="bagliore" cx="0.5" cy="0.85" r="0.6">
            <stop offset="0" stop-color="#f97316" stop-opacity=${glow} /><stop offset="1" stop-color="#f97316" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect x="20" y="4" width="140" height="26" rx="6" fill=${HOPPER_FILL[pellet.key]} />
        <text x="90" y="22" font-size="12" font-weight="700" text-anchor="middle" fill="#ffffff">${pellet.key === "nd" ? "pellet" : `pellet ${pellet.label.toLowerCase()}`}</text>
        <rect x="0" y="30" width="180" height="214" rx="16" fill="#1f2937" stroke="#64748b" stroke-width="2" />
        <rect x="20" y="52" width="140" height="130" rx="12" fill="url(#vetro)" stroke="#94a3b8" stroke-width="3" />
        <rect x="20" y="52" width="140" height="130" rx="12" fill="url(#bagliore)" />
        <g class="flicker">${flame}</g>
        <rect x="20" y="190" width="140" height="8" rx="4" fill="#374151" />
        <circle cx="22" cy="222" r="5" fill="#64748b" /><circle cx="42" cy="222" r="5" fill="#64748b" />
      </svg>
    `;
  }
  _legendFlame(k2) {
    return b2`<svg viewBox="-30 -40 60 60" class="lg"><g transform="scale(${k2})"><path d=${FLAME_PATH} fill="url(#fiamma)" /><path d=${FLAME_PATH} fill="#fde047" transform="translate(0,6) scale(0.52)" /></g></svg>`;
  }
  _tile(label, value, color) {
    return b2`<div class="tile"><span class="tl">${label}</span><span class="tv" style=${color ? `color:${color}` : ""}>${value}</span></div>`;
  }
  _chip(label, v2) {
    return b2`<div class="chip ${v2 ? "yes" : ""}"><span>${label}</span><b>${v2 === null ? "\u2013" : v2 ? "S\xCC" : "NO"}</b></div>`;
  }
  _toggleGuard() {
    void this.hass.callService("input_boolean", "toggle", { entity_id: this._e.guard });
  }
  _renderGuard() {
    const e5 = this._e;
    if (!this.hass.states[e5.guard]) return A;
    const on = this._s(e5.guard) === "on";
    const flagged = this._s(e5.guard_flag) === "on";
    return b2`
      <button class="guard ${on ? "on" : "off"}" @click=${() => this._toggleGuard()} aria-pressed=${on}>
        <span class="gtxt">
          <b>Evita partenze inutili</b>
          <small>${on ? flagged ? "ha annullato una partenza, resta in guardia" : "attiva: annulla le partenze con puffer e boiler gi\xE0 caldi" : "disattivata: i programmi partono sempre"}</small>
        </span>
        <span class="gsw"><i></i></span>
      </button>
    `;
  }
  /** Stima del consumo di pellet: oggi, settimana, mese. Non compare se i sensori non esistono. */
  _renderPelletUse() {
    const e5 = this._e;
    const known = [e5.pellet_today, e5.pellet_week, e5.pellet_month].some((id) => this.hass.states[id]);
    if (!known) return A;
    return b2`
      <div class="counters" title="Stima dal modello di consumo: si tara con il fattore nelle preferenze">
        <span class="tl">Pellet (stima)</span>
        <div>
          <b>${fmt(this._n(e5.pellet_today), 1)} kg oggi</b>
          <b>${fmt(this._n(e5.pellet_week), 1)} kg settimana</b>
          <b>${fmt(this._n(e5.pellet_month), 0)} kg mese</b>
        </div>
      </div>
    `;
  }
  _renderStove() {
    const e5 = this._e;
    const stateRaw = this._s(e5.stove_state);
    const look = stoveLook(stateRaw);
    const changed = this.hass.states[e5.stove_state]?.last_changed;
    const since = changed ? new Date(changed).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : null;
    const alarmRaw = (this._s(e5.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown";
    const pump = this._s(e5.pump);
    const pumpOn = pump !== void 0 && pump !== "OFF" && pump !== "unknown" && pump !== "unavailable";
    const work = this._n(e5.work_hours_today);
    const pellet = pelletStatus(this._yes(e5.pellet_reserve), this._yes(e5.pellet_empty), this._yes(e5.pellet_open));
    return b2`
      <section class="stove">
        <h3>Caldaia a pellet (Polygon)</h3>
        <div class="top">
          ${this._renderStoveImage(look, pellet)}
          <div class="statecard">
            <span class="tl">Stato caldaia</span>
            <span class="statepill ${look}">${stateRaw ?? "\u2013"}</span>
            <span class="tl">Acqua caldaia</span>
            <span class="water">${fmt(this._n(e5.stove_water), 1)}<small> °C</small></span>
            <span class="tl">Ultimo cambio stato</span>
            <span class="since">${since ? `alle ${since}` : "\u2013"}</span>
            <span class="tl">Pellet</span>
            <span class="pelletpill ${pellet.key}">${pellet.label}</span>
          </div>
        </div>
        <div class="legendbar">
          <div><span class="dot"></span><b>Senza fiamma</b><small>ECO STOP / OFF</small></div>
          <div>${this._legendFlame(0.38)}<b class="amber">Accensione</b><small>START</small></div>
          <div>${this._legendFlame(0.62)}<b class="red">In lavoro</b><small>WORK</small></div>
        </div>
        <div class="tiles">
          ${this._tile("Puffer 50 L", `${fmt(this._n(this.hass.states[e5.puffer_effective] ? e5.puffer_effective : e5.puffer), 1)} \xB0C${this.hass.states[e5.puffer_effective]?.attributes?.fonte === "sonda ingresso" ? " (stima)" : ""}`, "#f59e0b")}
          ${this._tile("Set boiler", `${fmt(this._n(e5.set_boiler), 0)} \xB0C`)}
          ${this._tile("Set acqua", `${fmt(this._n(e5.set_water), 0)} \xB0C`)}
          ${this._tile("Fumi", `${fmt(this._n(e5.smoke), 0)} \xB0C`)}
          ${this._tile("Fiamma", `${fmt(this._n(e5.flame), 0)} \xB0C`)}
          ${this._tile("Potenza reale", `${fmt(this._n(e5.power), 0)} %`)}
          ${this._tile("Pressione acqua", `${fmt(this._n(e5.water_pressure), 1)} bar`)}
          ${this._tile("Pressione braciere", fmt(this._n(e5.brazier_pressure), 1))}
          ${this._tile("Estrattore fumi", `${fmt(this._n(e5.extractor), 0)} giri`)}
          ${this._tile("Circolatore", pump === void 0 ? "\u2013" : pumpOn ? "ON" : "OFF", pumpOn ? "#22c55e" : void 0)}
          ${this._tile("Accensioni ieri", fmt(this._n(e5.starts_yesterday), 0))}
          ${this._tile("Allarme", noAlarm ? "nessuno" : alarmRaw, noAlarm ? "#22c55e" : "#ef4444")}
        </div>
        <div class="counters">
          <span class="tl">Oggi</span>
          <div>
            <b>${fmt(this._n(e5.starts_today), 0)} accensioni</b>
            <b>${fmt(work, 1)} h in lavoro</b>
            <b>${fmt(this._n(e5.standby_today), 0)} stand-by</b>
          </div>
        </div>
        ${this._renderPelletUse()}
        <div class="chips">
          ${this._chip("Richiesta ACS", this._yes(e5.request_acs))} ${this._chip("Riscaldamento", this._yes(e5.request_heating))}
          ${this._chip("Consenso suggerito", this._yes(e5.consent))}
        </div>
        ${this._renderGuard()}
        <p class="look">${LOOK_LABEL[look]}</p>
      </section>
    `;
  }
  render() {
    if (!this._config || !this.hass) return A;
    return b2`
      <ha-card>
        ${this._config.settings === false ? A : b2`<button class="gear" title="Preferenze impianto" aria-label="Preferenze impianto" @click=${() => this._openSettings()}>
              <ha-icon icon="mdi:cog-outline"></ha-icon>
            </button>`}
        ${this._config.title ? b2`<div class="ctitle">${this._config.title}</div>` : A}
        <div class=${this._compact ? "layout compact" : "layout"}>${this._renderBoiler()} ${this._renderStove()}</div>
      </ha-card>
    `;
  }
  static {
    this.styles = i`
    :host {
      display: block;
      container-type: inline-size;
    }
    ha-card {
      padding: 12px;
      color: var(--primary-text-color);
      position: relative;
    }
    .gear {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .gear:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    .ctitle {
      font-size: 20px;
      font-weight: 700;
      margin: 4px 4px 8px;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      align-items: start;
    }
    @container (min-width: 900px) {
      .layout {
        grid-template-columns: 7fr 6fr;
      }
    }
    svg.boiler {
      width: 100%;
      height: auto;
      display: block;
      max-width: 700px;
      margin: 0 auto;
    }
    svg.narrow .pufgroup {
      display: none;
    }
    svg.narrow .s13 {
      font-size: 15px;
    }
    svg.narrow .s14 {
      font-size: 16px;
    }
    /* testi e forme dell'SVG, colori dal tema di Home Assistant */
    .t1 {
      fill: var(--primary-text-color);
    }
    .t2 {
      fill: var(--secondary-text-color);
    }
    .b {
      font-weight: 700;
    }
    .s13 {
      font-size: 13px;
    }
    .s14 {
      font-size: 14px;
    }
    .s15 {
      font-size: 15px;
    }
    .s16 {
      font-size: 17px;
    }
    .val {
      font-size: 26px;
    }
    .tv {
      font-size: 17px;
      font-weight: 600;
      fill: var(--secondary-text-color);
    }
    /* fascia sotto il boiler su telefono: puffer e pannello con scritte piu' grandi */
    svg.mini {
      margin-top: 4px;
    }
    svg.mini .s15 {
      font-size: 21px;
    }
    svg.mini .s16 {
      font-size: 23px;
    }
    svg.mini .val {
      font-size: 36px;
    }
    svg.mini .tv {
      font-size: 22px;
    }
    .sep {
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .outline {
      stroke: var(--divider-color);
      stroke-width: 3;
    }
    .pill {
      fill: var(--card-background-color);
      fill-opacity: 0.9;
    }
    .pill.big {
      fill-opacity: 0.94;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
    }
    .card {
      fill: var(--secondary-background-color);
      stroke-width: 2;
    }
    .card.hi {
      stroke: #ef4444;
    }
    .card.lo {
      stroke: #3b82f6;
    }
    .card.sun {
      stroke: #22c55e;
    }
    .card.eta {
      stroke: var(--divider-color);
    }
    .btn {
      cursor: pointer;
      outline: none;
    }
    .btn text {
      fill: var(--text-primary-color, #fff);
    }
    .btn .btnbg {
      fill: var(--primary-color, #03a9f4);
    }
    .btn.armed .btnbg {
      fill: #f59e0b;
    }
    .btn:focus-visible .btnbg {
      stroke: var(--primary-text-color);
      stroke-width: 3;
    }
    .btn.off {
      cursor: default;
    }
    .btn.off .btnbg {
      fill: var(--secondary-background-color);
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .btn.off text {
      fill: var(--secondary-text-color);
    }
    .probe {
      fill: var(--card-background-color);
      stroke: var(--primary-text-color);
      stroke-width: 3;
    }
    .lead {
      stroke: var(--secondary-text-color);
      stroke-width: 2;
    }
    .pipe {
      fill: none;
      stroke-width: 10;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .pipe.thin {
      stroke-width: 8;
    }
    /* acqua che scorre dentro la serpentina: tratteggio chiaro che si muove */
    .panelbody {
      stroke-width: 3;
    }
    .panelgrid line {
      stroke: #ffffff;
      stroke-opacity: 0.5;
      stroke-width: 1.5;
    }
    .panelleg {
      stroke: #64748b;
      stroke-width: 4;
      stroke-linecap: round;
    }
    .coilflow {
      fill: none;
      stroke: #ffffff;
      stroke-opacity: 0.9;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: 5 11;
      animation: coilflow 0.8s linear infinite;
    }
    @keyframes coilflow {
      to {
        stroke-dashoffset: -16;
      }
    }
    .pulse {
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.35;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .coilflow,
      .pulse {
        animation: none;
      }
    }
    .pipe.hot {
      stroke: #dc2626;
    }
    .pipe.warm {
      stroke: #f97316;
    }
    .pipe.cold {
      stroke: #2563eb;
    }
    .coil {
      fill: none;
      stroke-width: 5;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-opacity: 0.9;
    }
    /* pannello caldaia */
    .stove {
      background: var(--secondary-background-color);
      border-radius: 20px;
      padding: 14px;
      border: 1px solid var(--divider-color);
    }
    .stove h3 {
      margin: 0 0 12px;
      text-align: center;
      font-size: 17px;
    }
    .top {
      display: grid;
      grid-template-columns: minmax(120px, 1fr) minmax(150px, 1fr);
      gap: 12px;
    }
    .stoveimg {
      width: 100%;
      max-width: 200px;
      height: auto;
      justify-self: center;
    }
    .flicker {
      transform-origin: 90px 168px;
    }
    .stoveimg.work .flicker,
    .stoveimg.start .flicker {
      animation: flicker 1.6s ease-in-out infinite;
    }
    @keyframes flicker {
      0%,
      100% {
        transform: scale(1, 1);
      }
      50% {
        transform: scale(1.03, 1.06);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .stoveimg .flicker {
        animation: none !important;
      }
    }
    .statecard {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      justify-content: center;
      background: var(--card-background-color);
      border-radius: 16px;
      padding: 12px;
      text-align: center;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .statepill {
      font-weight: 700;
      font-size: 20px;
      border-radius: 20px;
      padding: 4px 18px;
      margin-bottom: 8px;
      background: var(--divider-color);
    }
    .statepill.work {
      background: color-mix(in srgb, #22c55e 28%, transparent);
      color: #22c55e;
    }
    .statepill.start {
      background: color-mix(in srgb, #f59e0b 28%, transparent);
      color: #f59e0b;
    }
    .statepill.standby {
      background: color-mix(in srgb, #ef4444 28%, transparent);
      color: #ef4444;
    }
    .pelletpill {
      font-weight: 700;
      font-size: 15px;
      border-radius: 14px;
      padding: 2px 14px;
      background: var(--divider-color);
    }
    .pelletpill.ok {
      background: color-mix(in srgb, #22c55e 25%, transparent);
      color: #22c55e;
    }
    .pelletpill.riserva {
      background: color-mix(in srgb, #f59e0b 28%, transparent);
      color: #f59e0b;
    }
    .pelletpill.vuoto {
      background: color-mix(in srgb, #ef4444 28%, transparent);
      color: #ef4444;
    }
    .pelletpill.aperto {
      background: color-mix(in srgb, #3b82f6 28%, transparent);
      color: #3b82f6;
    }
    .water {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .water small {
      font-size: 16px;
    }
    .since {
      font-weight: 600;
    }
    .legendbar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-top: 12px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 12px;
      font-size: 12px;
    }
    .legendbar > div {
      display: grid;
      grid-template-columns: 30px 1fr;
      grid-template-rows: auto auto;
      column-gap: 6px;
      align-items: center;
    }
    .legendbar .lg,
    .legendbar .dot {
      grid-row: 1 / span 2;
      width: 28px;
      height: 28px;
    }
    .legendbar .dot {
      border-radius: 50%;
      background: var(--divider-color);
      border: 2px solid var(--secondary-text-color);
      box-sizing: border-box;
    }
    .legendbar small {
      color: var(--secondary-text-color);
      font-size: 11px;
    }
    .legendbar .amber {
      color: #f59e0b;
    }
    .legendbar .red {
      color: #ef4444;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    @container (max-width: 520px) {
      .tiles {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .tile {
      background: var(--card-background-color);
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tv {
      font-size: 18px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .counters {
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, #f59e0b 14%, transparent);
    }
    .counters > div {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
      font-size: 15px;
    }
    .chips {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    .chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 4px;
      border-radius: 18px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      font-size: 11px;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .chip b {
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .chip.yes {
      border-color: #22c55e;
    }
    .chip.yes b {
      color: #22c55e;
    }
    .look {
      display: none;
    }
    /* modalità compatta: tutto in una schermata di tablet, senza togliere dati */
    .compact svg.boiler {
      max-height: calc(100vh - 150px);
    }
    .compact .stove {
      padding: 8px 10px;
      border-radius: 16px;
    }
    .compact .stove h3 {
      margin: 0 0 4px;
      font-size: 14px;
    }
    .compact .top {
      grid-template-columns: 92px 1fr;
      gap: 8px;
      align-items: center;
    }
    .compact .stoveimg {
      max-width: 92px;
    }
    /* stato, acqua e ultimo cambio su una riga: tre colonne, etichetta sopra e valore sotto */
    .compact .statecard {
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: auto auto;
      justify-content: space-around;
      align-items: center;
      column-gap: 12px;
      row-gap: 2px;
      padding: 6px 8px;
    }
    .compact .pelletpill {
      font-size: 13px;
      padding: 1px 10px;
    }
    .compact .statecard .tl {
      font-size: 11px;
      text-align: center;
    }
    .compact .statecard > * {
      margin: 0;
      text-align: center;
      justify-self: center;
    }
    .compact .statepill {
      font-size: 15px;
      padding: 2px 12px;
    }
    .compact .water {
      font-size: 22px;
    }
    .compact .since {
      font-size: 13px;
    }
    .compact .legendbar {
      display: none;
    }
    .compact .tiles {
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      margin-top: 6px;
    }
    .compact .tile {
      padding: 2px 7px;
      border-radius: 8px;
    }
    .compact .tile .tl {
      font-size: 10.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .compact .tv {
      font-size: 14px;
    }
    .compact .counters {
      margin-top: 6px;
      padding: 3px 10px;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .compact .counters > div {
      font-size: 13px;
      gap: 2px 14px;
    }
    .compact .chips {
      margin-top: 6px;
      gap: 6px;
    }
    .compact .chip {
      flex-direction: row;
      justify-content: center;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 14px;
    }
    .compact .chip b {
      font-size: 13px;
    }
    .compact .guard {
      margin-top: 6px;
      padding: 4px 12px;
      border-radius: 12px;
    }
    .compact .guard small {
      display: none;
    }
    .guard {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 14px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .guard .gtxt {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .guard small {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .guard .gsw {
      flex: none;
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: var(--disabled-text-color, #9e9e9e);
      position: relative;
      transition: background 0.2s;
    }
    .guard .gsw i {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      transition: left 0.2s;
    }
    .guard.on .gsw {
      background: #22c55e;
    }
    .guard.on .gsw i {
      left: 23px;
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoOverviewCard.prototype, "hass", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_config", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_narrow", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_compact", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_armed", 2);
customElements.define(CARD_TAG, ImpiantoOverviewCard);

// src/schedule-logic.ts
var STEP_MIN = 10;
var DAY_SLUGS = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
var DAY_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
var DAY_LONG = ["Luned\xEC", "Marted\xEC", "Mercoled\xEC", "Gioved\xEC", "Venerd\xEC", "Sabato", "Domenica"];
var PROGRAMS = [1, 2, 3, 4];
var DAY_ALIASES = {};
[
  ["lun", "mon", "lunedi", "monday"],
  ["mar", "tue", "martedi", "tuesday"],
  ["mer", "wed", "mercoledi", "wednesday"],
  ["gio", "thu", "giovedi", "thursday"],
  ["ven", "fri", "venerdi", "friday"],
  ["sab", "sat", "sabato", "saturday"],
  ["dom", "sun", "domenica", "sunday"]
].forEach((names, i5) => names.forEach((n5) => DAY_ALIASES[n5] = i5));
function dayIndex(name) {
  if (typeof name === "number") return name >= 0 && name <= 6 ? name : null;
  const k2 = name.trim().toLowerCase().replace("\xEC", "i");
  return k2 in DAY_ALIASES ? DAY_ALIASES[k2] : null;
}
function parseTimeState(state) {
  if (!state) return null;
  const m2 = /^(\d{1,2}):(\d{2})/.exec(state);
  if (!m2) return null;
  const h3 = Number(m2[1]);
  const min = Number(m2[2]);
  if (h3 > 24 || min > 59) return null;
  return h3 * 60 + min;
}
function formatHM(minutes) {
  if (minutes === null || minutes === void 0 || Number.isNaN(minutes)) return "--:--";
  const m2 = (minutes % 1440 + 1440) % 1440;
  return `${String(Math.floor(m2 / 60)).padStart(2, "0")}:${String(m2 % 60).padStart(2, "0")}`;
}
function hmToMinutes(hm) {
  const m2 = parseTimeState(hm);
  if (m2 === null) return null;
  return Math.min(1440, Math.round(m2 / STEP_MIN) * STEP_MIN);
}
function toTimeValue(minutes) {
  return `${formatHM(minutes)}:00`;
}
function programEntityIds(prefix, n5) {
  return {
    on: `time.${prefix}_crono_p${n5}_accensione`,
    off: `time.${prefix}_crono_p${n5}_spegnimento`,
    setBoiler: `number.${prefix}_crono_p${n5}_setpoint_boiler`,
    setWater: `number.${prefix}_crono_p${n5}_setpoint_acqua`,
    day: DAY_SLUGS.map((d3) => `switch.${prefix}_crono_p${n5}_${d3}`)
  };
}
function hasWindow(p3) {
  return p3.on !== null && p3.off !== null && p3.on !== p3.off;
}
function segmentsOnDay(p3, d3) {
  const out = [];
  if (!hasWindow(p3)) return out;
  const on = p3.on;
  const off = p3.off;
  if (p3.days[d3]) {
    if (off === 0 || off > on) out.push({ start: on, end: off === 0 ? 1440 : off });
    else out.push({ start: on, end: 1440 });
  }
  const prev = (d3 + 6) % 7;
  if (p3.days[prev] && off > 0 && off < on) out.push({ start: 0, end: off });
  return out;
}
function findOverlaps(programs) {
  const found = [];
  for (let d3 = 0; d3 < 7; d3++) {
    for (let i5 = 0; i5 < programs.length; i5++) {
      for (let j = i5 + 1; j < programs.length; j++) {
        for (const sa of segmentsOnDay(programs[i5], d3)) {
          for (const sb of segmentsOnDay(programs[j], d3)) {
            const start = Math.max(sa.start, sb.start);
            const end = Math.min(sa.end, sb.end);
            if (start < end) found.push({ day: d3, a: programs[i5].n, b: programs[j].n, start, end });
          }
        }
      }
    }
  }
  return found;
}
function describeOverlaps(overlaps) {
  const byPair = /* @__PURE__ */ new Map();
  for (const o6 of overlaps) {
    const key = `${o6.a}-${o6.b}`;
    byPair.set(key, [...byPair.get(key) ?? [], o6]);
  }
  const lines = [];
  for (const [key, list] of byPair) {
    const [a3, b3] = key.split("-");
    const days = [...new Set(list.map((o6) => DAY_SHORT[o6.day]))].join(", ");
    const first = list[0];
    lines.push(`P${a3} e P${b3} si sovrappongono (${days}) dalle ${formatHM(first.start)} alle ${formatHM(first.end)}`);
  }
  return lines;
}
var DEFAULT_PRESETS = [
  {
    name: "Settimana tipo",
    icon: "mdi:calendar-week",
    description: "Feriale mattina e sera, weekend tutto il giorno",
    crono: true,
    programs: {
      "1": { on: "05:30", off: "08:00", days: ["lun", "mar", "mer", "gio", "ven"] },
      "2": { on: "17:00", off: "22:30", days: ["lun", "mar", "mer", "gio", "ven"] },
      "3": { on: "07:30", off: "23:00", days: ["sab", "dom"] },
      "4": null
    }
  },
  {
    name: "Feriale",
    icon: "mdi:briefcase-outline",
    description: "Mattina e sera, tutti i giorni",
    crono: true,
    programs: {
      "1": { on: "05:30", off: "08:00", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "2": { on: "17:00", off: "22:30", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "3": null,
      "4": null
    }
  },
  {
    name: "Weekend",
    icon: "mdi:home-heart",
    description: "Sempre acceso dalle 7 alle 23, tutti i giorni",
    crono: true,
    programs: {
      "1": { on: "07:00", off: "23:00", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "2": null,
      "3": null,
      "4": null
    }
  },
  {
    name: "Vacanza",
    icon: "mdi:palm-tree",
    description: "Cronotermostato disattivato, i programmi restano salvati",
    crono: false
  }
];
function planPreset(input, preset) {
  const actions = [];
  for (const n5 of PROGRAMS) {
    const raw = preset.programs?.[String(n5)];
    if (raw === void 0) continue;
    const pp = raw === null ? { days: [] } : raw;
    const cur = input.programs.find((p3) => p3.n === n5);
    if (!cur) continue;
    const ids = programEntityIds(input.prefix, n5);
    const tag = `P${n5}`;
    if (pp.on !== void 0) {
      const m2 = hmToMinutes(pp.on);
      if (m2 !== null && m2 !== cur.on)
        actions.push({ domain: "time", service: "set_value", entity_id: ids.on, data: { time: toTimeValue(m2) }, label: `${tag} accensione ${formatHM(m2)}` });
    }
    if (pp.off !== void 0) {
      const m2 = hmToMinutes(pp.off);
      if (m2 !== null && m2 !== cur.off)
        actions.push({ domain: "time", service: "set_value", entity_id: ids.off, data: { time: toTimeValue(m2) }, label: `${tag} spegnimento ${formatHM(m2)}` });
    }
    if (pp.set_boiler !== void 0 && pp.set_boiler !== cur.setBoiler)
      actions.push({ domain: "number", service: "set_value", entity_id: ids.setBoiler, data: { value: pp.set_boiler }, label: `${tag} set boiler ${pp.set_boiler} \xB0C` });
    if (pp.set_water !== void 0 && pp.set_water !== cur.setWater)
      actions.push({ domain: "number", service: "set_value", entity_id: ids.setWater, data: { value: pp.set_water }, label: `${tag} set acqua ${pp.set_water} \xB0C` });
    if (pp.days !== void 0) {
      const wanted = new Set(pp.days.map((d3) => dayIndex(d3)).filter((d3) => d3 !== null));
      for (let d3 = 0; d3 < 7; d3++) {
        const want = wanted.has(d3);
        if (cur.days[d3] !== want)
          actions.push({
            domain: "switch",
            service: want ? "turn_on" : "turn_off",
            entity_id: ids.day[d3],
            data: {},
            label: `${tag} ${DAY_SHORT[d3]} ${want ? "attivo" : "spento"}`
          });
      }
    }
  }
  if (preset.crono !== void 0 && input.cronoOn !== preset.crono)
    actions.push({
      domain: "switch",
      service: preset.crono ? "turn_on" : "turn_off",
      entity_id: input.master,
      data: {},
      label: `Cronotermostato ${preset.crono ? "attivo" : "disattivato"}`
    });
  return actions;
}

// src/schedule-card.ts
var CARD_TAG2 = "caldaia-schedule-card";
var COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
var CaldaiaScheduleCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._pending = {};
    this._confirm = null;
    this._busy = null;
    this._message = null;
  }
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("caldaia-schedule-card: configurazione non valida");
    this._config = { prefix: "casale", ...config };
  }
  getCardSize() {
    return 12;
  }
  static getStubConfig() {
    return { type: `custom:${CARD_TAG2}` };
  }
  connectedCallback() {
    super.connectedCallback();
    this._tick = window.setInterval(() => this.requestUpdate(), 6e4);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._tick) window.clearInterval(this._tick);
  }
  // ---- lettura dello stato -------------------------------------------------
  get _prefix() {
    return this._config.prefix ?? "casale";
  }
  get _master() {
    return this._config.master ?? `switch.${this._prefix}_cronotermostato_settimanale`;
  }
  get _status() {
    return this._config.status ?? `sensor.${this._prefix}_stato`;
  }
  _programs() {
    return PROGRAMS.map((n5) => {
      const ids = programEntityIds(this._prefix, n5);
      const st = (id) => this.hass.states[id]?.state;
      return {
        n: n5,
        on: parseTimeState(st(ids.on)),
        off: parseTimeState(st(ids.off)),
        days: ids.day.map((d3) => st(d3) === "on"),
        setBoiler: toNumber(st(ids.setBoiler)),
        setWater: toNumber(st(ids.setWater))
      };
    });
  }
  _cronoOn() {
    const s4 = this.hass.states[this._master]?.state;
    return s4 === "on" ? true : s4 === "off" ? false : null;
  }
  // ---- scritture ------------------------------------------------------------
  async _call(a3) {
    await this.hass.callService(a3.domain, a3.service, { entity_id: a3.entity_id, ...a3.data });
  }
  _markPending(entityId) {
    this._pending = { ...this._pending, [entityId]: Date.now() + 2e4 };
    window.setTimeout(() => {
      const { [entityId]: _drop, ...rest } = this._pending;
      this._pending = rest;
    }, 2e4);
  }
  async _run(action) {
    this._message = null;
    this._markPending(action.entity_id);
    try {
      await this._call(action);
    } catch (err) {
      this._message = { kind: "err", text: `Non riuscito: ${action.label} (${err.message ?? err})` };
    }
  }
  _setTime(n5, which, value) {
    const m2 = hmToMinutes(value);
    if (m2 === null) return;
    const ids = programEntityIds(this._prefix, n5);
    void this._run({
      domain: "time",
      service: "set_value",
      entity_id: which === "on" ? ids.on : ids.off,
      data: { time: toTimeValue(m2) },
      label: `P${n5} ${which === "on" ? "accensione" : "spegnimento"} ${formatHM(m2)}`
    });
  }
  _setNumber(n5, which, raw) {
    const v2 = Number(raw);
    if (!Number.isFinite(v2)) return;
    const ids = programEntityIds(this._prefix, n5);
    void this._run({
      domain: "number",
      service: "set_value",
      entity_id: which === "setBoiler" ? ids.setBoiler : ids.setWater,
      data: { value: v2 },
      label: `P${n5} ${which === "setBoiler" ? "set boiler" : "set acqua"} ${v2} \xB0C`
    });
  }
  _toggleDay(n5, d3, isOn) {
    const ids = programEntityIds(this._prefix, n5);
    void this._run({
      domain: "switch",
      service: isOn ? "turn_off" : "turn_on",
      entity_id: ids.day[d3],
      data: {},
      label: `P${n5} ${DAY_SHORT[d3]} ${isOn ? "spento" : "attivo"}`
    });
  }
  _toggleMaster() {
    const on = this._cronoOn();
    void this._run({
      domain: "switch",
      service: on ? "turn_off" : "turn_on",
      entity_id: this._master,
      data: {},
      label: `Cronotermostato ${on ? "disattivato" : "attivo"}`
    });
  }
  get _presets() {
    return this._config.presets && this._config.presets.length ? this._config.presets : DEFAULT_PRESETS;
  }
  _plan(preset) {
    return planPreset(
      { prefix: this._prefix, master: this._master, programs: this._programs(), cronoOn: this._cronoOn() },
      preset
    );
  }
  async _applyPreset(preset) {
    const plan = this._plan(preset);
    this._confirm = null;
    this._message = null;
    if (!plan.length) {
      this._message = { kind: "ok", text: `"${preset.name}" \xE8 gi\xE0 impostato.` };
      return;
    }
    for (let i5 = 0; i5 < plan.length; i5++) {
      this._busy = { done: i5, total: plan.length, label: plan[i5].label };
      try {
        await this._call(plan[i5]);
        this._markPending(plan[i5].entity_id);
      } catch (err) {
        this._busy = null;
        this._message = { kind: "err", text: `Fermato a "${plan[i5].label}": ${err.message ?? err}. Eseguite ${i5} operazioni su ${plan.length}.` };
        return;
      }
    }
    this._busy = null;
    this._message = { kind: "ok", text: `"${preset.name}" applicato (${plan.length} modifiche). La caldaia aggiorna i dati tramite il cloud: pu\xF2 servire qualche minuto.` };
  }
  // ---- disegno --------------------------------------------------------------
  _renderHeader(crono) {
    const status = this.hass.states[this._status]?.state;
    return b2`
      <div class="head">
        <div>
          <div class="title">${this._config.title ?? "Programmazione caldaia"}</div>
          <div class="sub">
            Cronotermostato settimanale · stato caldaia: <b>${status ?? "\u2013"}</b>
          </div>
        </div>
        <button
          class="master ${crono ? "on" : crono === false ? "off" : "na"}"
          @click=${() => this._toggleMaster()}
          ?disabled=${crono === null}
          title="Attiva o disattiva tutti i programmi"
        >
          <span class="knob"></span>
          <span>${crono ? "Crono attivo" : crono === false ? "Crono spento" : "n.d."}</span>
        </button>
      </div>
      ${crono === false ? b2`<div class="note">Il cronotermostato è disattivato: nessun programma parte, anche se i giorni sono attivi.</div>` : A}
    `;
  }
  _renderWarnings(programs) {
    const lines = describeOverlaps(findOverlaps(programs));
    if (!lines.length) return A;
    return b2`<div class="warn">
      <b>Attenzione, programmi sovrapposti</b>
      <ul>${lines.map((l3) => b2`<li>${l3}</li>`)}</ul>
    </div>`;
  }
  _renderPresets() {
    if (this._config.hide?.includes("presets")) return A;
    const confirm = this._confirm;
    const plan = confirm ? this._plan(confirm) : [];
    return b2`
      <div class="section">Preset</div>
      <div class="presets">
        ${this._presets.map(
      (p3) => b2`<button class="preset" ?disabled=${!!this._busy} @click=${() => this._confirm = p3} title=${p3.description ?? ""}>
            ${p3.icon ? b2`<ha-icon .icon=${p3.icon}></ha-icon>` : A}<span>${p3.name}</span>
          </button>`
    )}
      </div>
      ${confirm ? b2`<div class="confirm">
            <div><b>${confirm.name}</b>${confirm.description ? b2` · ${confirm.description}` : A}</div>
            ${plan.length ? b2`<div class="small">${plan.length} modifiche:</div>
                  <ul>${plan.slice(0, 12).map((a3) => b2`<li>${a3.label}</li>`)}${plan.length > 12 ? b2`<li>… e altre ${plan.length - 12}</li>` : A}</ul>` : b2`<div class="small">Già impostato, non c'è niente da cambiare.</div>`}
            <div class="row">
              <button class="primary" @click=${() => this._applyPreset(confirm)}>Applica</button>
              <button @click=${() => this._confirm = null}>Annulla</button>
            </div>
          </div>` : A}
      ${this._busy ? b2`<div class="busy">
            <div class="bar"><div style="width:${this._busy.done / this._busy.total * 100}%"></div></div>
            ${this._busy.done + 1}/${this._busy.total} · ${this._busy.label}
          </div>` : A}
      ${this._message ? b2`<div class="msg ${this._message.kind}">${this._message.text}</div>` : A}
    `;
  }
  _renderProgram(p3) {
    const ids = programEntityIds(this._prefix, p3.n);
    const color = COLORS[p3.n - 1];
    const active = p3.days.some(Boolean);
    const pend = (id) => this._pending[id] ? "pending" : "";
    const numAttr = (id, key, dflt) => {
      const v2 = this.hass.states[id]?.attributes?.[key];
      return typeof v2 === "number" ? v2 : dflt;
    };
    const timeVal = (m2) => m2 === null ? "" : formatHM(m2);
    return b2`
      <div class="prog" style="--c:${color}">
        <div class="prog-head">
          <b>Programma ${p3.n}</b>
          <span class="badge ${active ? "yes" : "no"}">${active ? "attivo" : "nessun giorno"}</span>
        </div>
        <div class="times">
          <label class=${pend(ids.on)}>
            <span>Accensione</span>
            <input type="time" step="600" .value=${timeVal(p3.on)} @change=${(e5) => this._setTime(p3.n, "on", e5.target.value)} />
          </label>
          <label class=${pend(ids.off)}>
            <span>Spegnimento</span>
            <input type="time" step="600" .value=${timeVal(p3.off === 1440 ? 0 : p3.off)} @change=${(e5) => this._setTime(p3.n, "off", e5.target.value)} />
          </label>
        </div>
        <div class="days">
          ${DAY_SHORT.map(
      (name, d3) => b2`<button
              class="day ${p3.days[d3] ? "on" : ""} ${pend(ids.day[d3])}"
              title=${DAY_LONG[d3]}
              aria-pressed=${p3.days[d3]}
              @click=${() => this._toggleDay(p3.n, d3, p3.days[d3])}
            >${name}</button>`
    )}
        </div>
        <div class="temps">
          <label class=${pend(ids.setBoiler)}>
            <span>Set boiler</span>
            <span class="num"><input type="number" min=${numAttr(ids.setBoiler, "min", 45)} max=${numAttr(ids.setBoiler, "max", 70)} step=${numAttr(ids.setBoiler, "step", 1)} .value=${p3.setBoiler === null ? "" : String(p3.setBoiler)} @change=${(e5) => this._setNumber(p3.n, "setBoiler", e5.target.value)} /> °C</span>
          </label>
          <label class=${pend(ids.setWater)}>
            <span>Set acqua</span>
            <span class="num"><input type="number" min=${numAttr(ids.setWater, "min", 50)} max=${numAttr(ids.setWater, "max", 75)} step=${numAttr(ids.setWater, "step", 1)} .value=${p3.setWater === null ? "" : String(p3.setWater)} @change=${(e5) => this._setNumber(p3.n, "setWater", e5.target.value)} /> °C</span>
          </label>
        </div>
      </div>
    `;
  }
  _renderWeekly(programs) {
    if (this._config.hide?.includes("weekly")) return A;
    const overlaps = findOverlaps(programs);
    const now = /* @__PURE__ */ new Date();
    const today = (now.getDay() + 6) % 7;
    const nowPct = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
    const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
    return b2`
      <div class="section">Vista settimanale</div>
      <div class="weekly">
        <div class="axis">${ticks.map((h3) => b2`<span style="left:${h3 / 24 * 100}%">${h3}</span>`)}</div>
        ${DAY_SHORT.map((name, d3) => {
      const bars = programs.flatMap((p3) => segmentsOnDay(p3, d3).map((s4) => ({ p: p3.n, ...s4 })));
      const ov = overlaps.filter((o6) => o6.day === d3);
      return b2`<div class="wrow ${d3 === today ? "today" : ""}">
            <span class="wlabel">${name}</span>
            <div class="track">
              ${ticks.slice(1, -1).map((h3) => b2`<i class="grid" style="left:${h3 / 24 * 100}%"></i>`)}
              ${bars.map(
        (b3) => b2`<div class="bar" style="left:${b3.start / 1440 * 100}%;width:${(b3.end - b3.start) / 1440 * 100}%;background:${COLORS[b3.p - 1]}" title="P${b3.p} ${formatHM(b3.start)}–${formatHM(b3.end)}"></div>`
      )}
              ${ov.map((o6) => b2`<div class="bar clash" style="left:${o6.start / 1440 * 100}%;width:${(o6.end - o6.start) / 1440 * 100}%"></div>`)}
              ${d3 === today ? b2`<div class="now" style="left:${nowPct}%"></div>` : A}
            </div>
          </div>`;
    })}
        <div class="legend">
          ${PROGRAMS.map((n5) => b2`<span><i style="background:${COLORS[n5 - 1]}"></i>P${n5}</span>`)}
          <span><i class="clashkey"></i>sovrapposizione</span>
        </div>
      </div>
    `;
  }
  render() {
    if (!this._config || !this.hass) return A;
    const programs = this._programs();
    const crono = this._cronoOn();
    return b2`
      <ha-card>
        <div class="wrap">
          ${this._renderHeader(crono)} ${this._renderWarnings(programs)} ${this._renderPresets()}
          <div class="section">Programmi</div>
          <div class="grid">${programs.map((p3) => this._renderProgram(p3))}</div>
          ${this._renderWeekly(programs)}
        </div>
      </ha-card>
    `;
  }
  static {
    this.styles = i`
    :host {
      display: block;
    }
    .wrap {
      padding: 16px;
      color: var(--primary-text-color);
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
    }
    .sub {
      color: var(--secondary-text-color);
      font-size: 13px;
      margin-top: 2px;
    }
    .section {
      margin: 18px 0 8px;
      font-weight: 700;
      font-size: 14px;
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .master {
      display: flex;
      align-items: center;
      gap: 10px;
      border: none;
      border-radius: 22px;
      padding: 8px 16px 8px 10px;
      font-weight: 700;
      font-size: 14px;
      background: var(--secondary-background-color);
    }
    .master .knob {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--disabled-text-color, #94a3b8);
    }
    .master.on {
      background: color-mix(in srgb, var(--success-color, #22c55e) 25%, transparent);
      color: var(--success-color, #16a34a);
    }
    .master.on .knob {
      background: var(--success-color, #22c55e);
    }
    .master.off {
      color: var(--secondary-text-color);
    }
    .note {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
      background: color-mix(in srgb, var(--warning-color, #f59e0b) 18%, transparent);
    }
    .warn {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--error-color, #ef4444);
      background: color-mix(in srgb, var(--error-color, #ef4444) 12%, transparent);
      font-size: 13px;
    }
    .warn ul,
    .confirm ul {
      margin: 6px 0 0;
      padding-left: 18px;
    }
    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .preset {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 14px;
    }
    .preset:hover:not(:disabled) {
      border-color: var(--primary-color);
    }
    .preset:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .confirm {
      margin-top: 10px;
      padding: 12px;
      border-radius: 12px;
      background: var(--secondary-background-color);
      font-size: 14px;
    }
    .small {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-top: 4px;
    }
    .row {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .row button {
      border: 1px solid var(--divider-color);
      background: transparent;
      border-radius: 8px;
      padding: 6px 14px;
    }
    .row button.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .busy {
      margin-top: 10px;
      font-size: 13px;
    }
    .busy .bar {
      height: 6px;
      border-radius: 3px;
      background: var(--divider-color);
      margin-bottom: 4px;
      overflow: hidden;
    }
    .busy .bar div {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s;
    }
    .msg {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
    }
    .msg.ok {
      background: color-mix(in srgb, var(--success-color, #22c55e) 18%, transparent);
    }
    .msg.err {
      background: color-mix(in srgb, var(--error-color, #ef4444) 18%, transparent);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 12px;
    }
    .prog {
      border: 1px solid var(--divider-color);
      border-left: 6px solid var(--c);
      border-radius: 14px;
      padding: 12px 14px;
      background: var(--secondary-background-color);
    }
    .prog-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .badge {
      font-size: 12px;
      border-radius: 12px;
      padding: 2px 10px;
      font-weight: 700;
    }
    .badge.yes {
      background: color-mix(in srgb, var(--success-color, #22c55e) 25%, transparent);
      color: var(--success-color, #16a34a);
    }
    .badge.no {
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .times,
    .temps {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 11px;
      color: var(--secondary-text-color);
      gap: 3px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .temps label {
      margin-top: 10px;
      text-transform: none;
      font-size: 12px;
    }
    input {
      font: inherit;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 4px 8px;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
    }
    input[type="number"] {
      font-size: 17px;
      width: 4.2em;
    }
    .num {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-text-color);
      font-weight: 700;
    }
    input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    label.pending input,
    label.pending {
      opacity: 0.55;
    }
    .days {
      display: flex;
      gap: 6px;
      margin: 12px 0 2px;
    }
    .day {
      flex: 1;
      min-width: 0;
      aspect-ratio: 1;
      max-height: 40px;
      border-radius: 50%;
      border: none;
      font-size: 12px;
      font-weight: 600;
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .day.on {
      background: var(--c);
      color: #fff;
    }
    .day.pending {
      opacity: 0.5;
    }
    .weekly {
      position: relative;
    }
    .axis {
      position: relative;
      height: 14px;
      margin-left: 38px;
      font-size: 10px;
      color: var(--secondary-text-color);
    }
    .axis span {
      position: absolute;
      transform: translateX(-50%);
    }
    .wrow {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .wlabel {
      width: 32px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .wrow.today .wlabel {
      color: var(--primary-text-color);
      font-weight: 700;
    }
    .track {
      position: relative;
      flex: 1;
      height: 20px;
      border-radius: 6px;
      background: var(--secondary-background-color);
      overflow: hidden;
    }
    .track .grid {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--divider-color);
      display: block;
      padding: 0;
    }
    .track .bar {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 4px;
      opacity: 0.92;
    }
    .track .bar.clash {
      background: repeating-linear-gradient(45deg, var(--error-color, #ef4444) 0 4px, transparent 4px 8px);
      border: 1px solid var(--error-color, #ef4444);
      opacity: 1;
    }
    .now {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--primary-text-color);
      opacity: 0.8;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin: 10px 0 0 38px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .legend i {
      display: inline-block;
      width: 11px;
      height: 11px;
      border-radius: 3px;
      margin-right: 5px;
      vertical-align: -1px;
    }
    .legend i.clashkey {
      background: repeating-linear-gradient(45deg, var(--error-color, #ef4444) 0 3px, transparent 3px 6px);
      border: 1px solid var(--error-color, #ef4444);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], CaldaiaScheduleCard.prototype, "hass", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_config", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_pending", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_confirm", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_busy", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_message", 2);
customElements.define(CARD_TAG2, CaldaiaScheduleCard);

// src/impianto-riscaldamento-dashboard.ts
var VERSION = "0.3.12";
window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: "impianto-overview-card",
    name: "Impianto: boiler solare e caldaia",
    description: "Boiler solare con temperature alta e bassa, docce stimate, puffer e caldaia a pellet con i dati principali."
  },
  {
    type: "caldaia-schedule-card",
    name: "Caldaia: programmazione settimanale",
    description: "4 programmi, giorni, orari e temperature, vista settimanale, avviso di sovrapposizione e preset."
  }
);
console.info(
  `%c IMPIANTO-RISCALDAMENTO-DASHBOARD %c v${VERSION} `,
  "color: white; background: #b45309; font-weight: 700;",
  "color: #b45309; background: white; font-weight: 700;"
);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
