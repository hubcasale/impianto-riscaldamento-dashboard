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
var SETTINGS_GROUPS = [
  { id: "riscaldamento", title: "Caldaia e acqua calda" },
  { id: "pompe", title: "Pompe" },
  { id: "casa", title: "Quando esci di casa" },
  { id: "taratura", title: "Taratura", note: "Valori che si cambiano di rado: con quelli giusti non serve toccarli." }
];
var H2 = (what, when, suggested) => ({ what, when, ...suggested ? { suggested } : {} });
var SETTINGS_SECTIONS = [
  {
    id: "caldaia",
    group: "riscaldamento",
    icon: "mdi:fire",
    title: "Caldaia a pellet (Polygon)",
    help: H2(
      "Le temperature che la Polygon deve raggiungere: l'acqua di riscaldamento e il puffer da 50 litri che serve l'acqua calda.",
      "Cambiale solo se vuoi una casa pi\xF9 calda o pi\xF9 acqua calda; i programmi della scheda di programmazione hanno i loro valori."
    ),
    fields: [
      {
        kind: "climate",
        entity: "climate.casale_acqua",
        label: "Temperatura dell'acqua della caldaia",
        hint: "Setpoint dell'acqua di riscaldamento. I programmi della scheda di programmazione hanno i loro valori.",
        help: H2("Il setpoint dell'acqua di riscaldamento della Polygon.", "Quando la casa \xE8 troppo fredda o troppo calda con i termosifoni.", "Quello che usi di solito nei programmi.")
      },
      {
        kind: "number",
        entity: "number.casale_setpoint_boiler",
        label: "Setpoint del puffer da 50 litri",
        hint: "Setpoint boiler della Polygon (consenso per l'acqua calda sanitaria).",
        help: H2("Il setpoint boiler della Polygon: sotto questa temperatura il puffer chiede calore per l'acqua calda sanitaria.", "Alzalo se l'acqua calda finisce presto, abbassalo per consumare meno pellet.")
      }
    ]
  },
  {
    id: "partenze",
    group: "riscaldamento",
    master: "input_boolean.caldaia_salvaguardia_attiva",
    icon: "mdi:shield-check",
    title: "Salvaguardia accensioni",
    help: H2(
      "Evita che la caldaia parta quando non serve: il boiler ha gi\xE0 abbastanza acqua calda e il termostato non chiede riscaldamento.",
      "Per non sprecare pellet nelle accensioni dei programmi quando l'acqua \xE8 gi\xE0 calda."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_salvaguardia_attiva",
        label: "Evita partenze inutili",
        hint: "Annulla l'avvio della caldaia quando il boiler ha gi\xE0 abbastanza docce e il termostato non chiede calore.",
        help: H2("Annulla la partenza di un programma se il boiler ha gi\xE0 le docce che vuoi garantire e il termostato non chiede calore. Il puffer non conta: serve solo ai termosifoni e a integrare l'acqua sanitaria.", "Lascialo acceso: se serve, la caldaia riparte da sola quando il termostato chiede calore o l'acqua sanitaria si raffredda.", "Acceso.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_salvaguardia_docce_min",
        label: "Docce da garantire prima di annullare",
        hint: "Quante docce deve avere gi\xE0 il boiler (come le conta la scheda, 40 L a 38 \xB0C) perch\xE9 la partenza di un programma venga annullata.",
        help: H2("Il numero minimo di docce disponibili nel boiler per annullare la partenza di un programma. Conta sia la sonda alta sia la bassa: con la testa calda ma il fondo freddo le docce sono poche.", "Alzalo se la sera ti serve pi\xF9 acqua calda; abbassalo per far partire la caldaia meno spesso.", "3 docce.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_salvaguardia_t_puffer",
        label: "Riparti per l'acqua calda se il puffer \xE8 sotto",
        hint: "Dopo un'annullamento, se l'acqua sanitaria chiede calore e il puffer \xE8 sotto questa temperatura la caldaia riparte; sopra, ci pensa la pompa di integrazione.",
        help: H2("La temperatura del puffer sotto la quale, dopo una partenza annullata, la caldaia riparte quando l'acqua sanitaria chiede calore.", "Alzala se vuoi che riparta prima; abbassala per lasciare lavorare pi\xF9 a lungo la pompa di integrazione.")
      }
    ]
  },
  {
    id: "acs",
    group: "riscaldamento",
    icon: "mdi:water-boiler",
    title: "Richiesta di acqua calda",
    help: H2(
      "Le temperature alte del boiler con cui Home Assistant decide che l'acqua calda sta finendo e chiede la caldaia. La richiesta riaccende il Polygon quando un programma \xE8 attivo.",
      "Per far partire la caldaia prima (soglia pi\xF9 alta) o pi\xF9 tardi (soglia pi\xF9 bassa) quando il boiler si raffredda."
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.caldaia_acs_t_accendi",
        label: "Chiedi la caldaia sotto",
        hint: "Temperatura alta del boiler (la stessa di \xABAlto S3\xBB) sotto la quale parte la richiesta di acqua calda.",
        help: H2("Quando la temperatura alta del boiler scende sotto questo valore parte la richiesta di acqua calda, a meno che il sole stia scaldando il boiler.", "Alzala se vuoi che la caldaia parta prima e l'acqua non scenda; abbassala per consumare meno pellet e lasciare pi\xF9 spazio al solare.", "40 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_acs_t_spegni",
        label: "La richiesta finisce sopra",
        hint: "Una volta partita, la richiesta resta finch\xE9 la temperatura alta del boiler arriva a questo valore.",
        help: H2("La temperatura alta alla quale la richiesta di acqua calda finisce. Pi\xF9 \xE8 alta, pi\xF9 a lungo lavora la caldaia a ogni accensione.", "Abbassala se la caldaia scalda pi\xF9 di quanto serve; alzala se preferisci accensioni pi\xF9 rare e pi\xF9 lunghe.", "55 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_acs_t_emergenza",
        label: "Chiedi anche col sole sotto",
        hint: "Se il sole sta scaldando il boiler la richiesta aspetta, ma sotto questa temperatura parte comunque.",
        help: H2("Con il sole che d\xE0 abbastanza potenza la richiesta di acqua calda aspetta. Sotto questa temperatura alta parte comunque.", "Alzala se non vuoi restare con l'acqua tiepida nelle giornate di sole incerto.", "36 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_acs_potenza_solare_min",
        label: "Potenza solare che fa attendere",
        hint: "Con almeno questa potenza dal collettore la richiesta aspetta il sole.",
        help: H2("La potenza del solare termico (in kW) sopra la quale la richiesta di acqua calda aspetta, perch\xE9 il sole sta gi\xE0 scaldando il boiler.", "Abbassala se vuoi che la caldaia aspetti il sole anche con poca potenza.", "1 kW.")
      }
    ]
  },
  {
    id: "integrazione",
    group: "pompe",
    icon: "mdi:pump",
    title: "Pompa di integrazione",
    help: H2(
      "La pompa che porta il calore del puffer alla serpentina del boiler. Qui si decide quando fermarla e quando forzarla.",
      "Per far lavorare bene insieme solare e caldaia, senza raffreddare il boiler con acqua meno calda."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_blocco_attivo",
        label: "Blocco automatico",
        hint: "Tiene ferma la pompa quando il puffer non \xE8 abbastanza pi\xF9 caldo del boiler.",
        help: H2("Tiene ferma la pompa quando il puffer non \xE8 abbastanza pi\xF9 caldo del boiler.", "Evita di portare al boiler acqua meno calda di quella che ha gi\xE0.", "Acceso.")
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_forzatura_attiva",
        label: "Accensione forzata",
        hint: "Accende la pompa anche quando l'Elios non la chiama, finch\xE9 il puffer ha calore da cedere.",
        help: H2("Accende la pompa anche quando l'Elios non la chiama, finch\xE9 il puffer ha calore da cedere.", "Per sfruttare il puffer caldo e fare meno ore di caldaia.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_blocco",
        label: "Blocca se il puffer supera il boiler di meno di",
        help: H2("Se il puffer supera il boiler di meno di questi gradi la pompa si ferma.", "Alzalo se la pompa parte per differenze troppo piccole.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_sblocco",
        label: "Sblocca quando il puffer supera il boiler di",
        help: H2("La differenza di temperatura oltre la quale la pompa pu\xF2 ripartire.", "Deve essere pi\xF9 alta della soglia di blocco, cos\xEC la pompa non parte e si ferma di continuo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_temp_max",
        label: "Non scaldare la testa del boiler oltre",
        help: H2("La temperatura massima della sonda alta del boiler: oltre questo valore la pompa non lo scalda pi\xF9.", "Protegge dalle scottature e lascia spazio al solare.", "60 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_isteresi_max",
        label: "Isteresi su questa temperatura",
        help: H2("Di quanti gradi deve scendere la testa del boiler sotto il massimo prima che la pompa possa ripartire.", "Evita accensioni e spegnimenti ravvicinati intorno al limite.")
      }
    ]
  },
  {
    id: "assenza",
    group: "casa",
    master: "input_boolean.caldaia_assenza_attiva",
    icon: "mdi:home-off",
    title: "Spegnimento se nessuno \xE8 in casa",
    help: H2(
      "Spegne la caldaia quando tutti sono fuori casa (iPhone e Wi-Fi) e la riaccende al rientro solo se un programma \xE8 attivo.",
      "Per non scaldare una casa vuota quando ti dimentichi di spegnere."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_attiva",
        label: "Spegni la caldaia con la casa vuota",
        hint: "Usa gli iPhone (iCloud3) e il Wi-Fi CASALE2G. Al rientro riaccende solo se un programma \xE8 attivo.",
        help: H2("Spegne la caldaia dopo il tempo indicato di casa vuota, controllando gli iPhone (iCloud3) e il Wi-Fi CASALE2G.", "Se parti e ti dimentichi di spegnere o di premere Vacanza.")
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_ospiti",
        label: "Ospiti in casa (non spegnere)",
        hint: "Per chi non ha un telefono tracciato.",
        help: H2("Con gli ospiti la casa non \xE8 considerata vuota e la caldaia non si spegne.", "Quando ci sono persone che non hanno un telefono tracciato.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_assenza_minuti",
        label: "Spegni dopo questi minuti di assenza",
        help: H2("Quanto deve restare vuota la casa prima di spegnere.", "Allungalo se esci spesso per brevi commissioni.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_assenza_t_esterna_min",
        label: "Non spegnere se fuori fa meno di",
        help: H2("Con pi\xF9 freddo di questa temperatura esterna la caldaia non viene spenta.", "Per non far raffreddare troppo la casa nelle giornate pi\xF9 fredde.")
      }
    ]
  },
  {
    id: "pellet",
    group: "taratura",
    icon: "mdi:grain",
    title: "Consumo di pellet (stima)",
    advanced: true,
    help: H2(
      "I valori con cui la scheda stima quanto pellet consuma la caldaia (non c'\xE8 un sensore del pellet).",
      "Si ritarano una volta, confrontando la stima con i sacchi realmente usati."
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_min",
        label: "Consumo a potenza minima (30 %)",
        hint: "Chili all'ora quando la caldaia modula al minimo.",
        help: H2("I chili di pellet all'ora quando la caldaia modula al minimo.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_max",
        label: "Consumo a potenza 100 %",
        hint: "Chili all'ora quando la caldaia lavora al massimo.",
        help: H2("I chili di pellet all'ora quando la caldaia lavora al massimo.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_mantenimento",
        label: "Consumo in stand-by e spegnimento",
        help: H2("I chili all'ora consumati durante lo stand-by e lo spegnimento.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_g_accensione",
        label: "Consumo per accensione",
        help: H2("I grammi di pellet usati a ogni accensione.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_fattore",
        label: "Fattore di taratura",
        hint: "Pellet realmente consumato diviso la stima: 1,10 = la stima \xE8 bassa del 10 %.",
        help: H2("Pellet realmente consumato diviso la stima: 1,10 significa che la stima \xE8 bassa del 10 %.", "Dopo aver finito un sacco o una scorta, per allineare la stima alla realt\xE0.", "1,00 finch\xE9 non hai un confronto.")
      }
    ]
  },
  {
    id: "pompe",
    group: "taratura",
    master: "input_boolean.centralina_pompe_misura_attiva",
    icon: "mdi:flash-outline",
    title: "Misura delle pompe",
    advanced: true,
    help: H2(
      "Le soglie in watt con cui la scheda capisce se le pompe del collettore e dell'integrazione sono ferme o accese.",
      "Servono solo se cambi le pompe o il misuratore: altrimenti lasciale come sono."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.centralina_pompe_misura_attiva",
        label: "Misura della potenza attiva",
        hint: "Spenta se il misuratore \xE8 scollegato: gli indicatori delle pompe spariscono.",
        help: H2("Attiva la lettura della potenza delle pompe. Spenta, gli indicatori delle pompe spariscono.", "Spegnila se il misuratore \xE8 scollegato.")
      },
      { kind: "number", entity: "input_number.centralina_pompe_w_ferme", label: "Pompe ferme sotto", help: H2("Sotto questa potenza le pompe sono considerate ferme.", "Alzala se il misuratore legge un po' anche a pompe ferme.") },
      { kind: "number", entity: "input_number.centralina_pompe_w_collettore_max", label: "Solo collettore fino a", help: H2("Fino a questa potenza \xE8 accesa solo la pompa del collettore.", "Si ritara con le misure reali delle due pompe.") },
      { kind: "number", entity: "input_number.centralina_pompe_w_entrambe_min", label: "Entrambe le pompe da", help: H2("Da questa potenza risultano accese entrambe le pompe.", "Si ritara con le misure reali delle due pompe.") },
      { kind: "number", entity: "input_number.centralina_pompa_integrazione_w_min", label: "Integrazione accesa sopra (Shelly 1PM)", help: H2("Sopra questa potenza, misurata dallo Shelly 1PM, la pompa di integrazione \xE8 considerata accesa.", "Si ritara se cambi pompa.") }
    ]
  },
  {
    id: "solare",
    group: "taratura",
    icon: "mdi:solar-power-variant",
    title: "Modello del collettore solare",
    advanced: true,
    help: H2(
      "I valori con cui la scheda stima la temperatura del collettore e la resa del sole: posizione dei pannelli, quanto si scaldano e quanto ci mettono.",
      "Si ritarano confrontando la stima con il display del regolatore, a pompa ferma e con il sole pieno; altrimenti lasciali come sono."
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.solare_termico_k",
        label: "Riscaldamento al sole",
        hint: "Di quanti gradi il collettore ferma supera l'aria per ogni W/m\xB2 di sole sul piano.",
        help: H2("Quanto si scalda il collettore a pompa ferma per ogni W/m\xB2 di sole: pi\xF9 \xE8 alto, pi\xF9 la stima \xE8 calda.", "Alzalo se la stima \xE8 pi\xF9 fredda del display del regolatore a sole pieno, abbassalo nel caso opposto.", "0,078 (ritarato il 15/10/2026).")
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_tau",
        label: "Inerzia del collettore",
        hint: "Quanto tempo ci mette a scaldarsi e a raffreddarsi.",
        help: H2("La costante di tempo con cui la stima segue la temperatura che il sole richiederebbe.", "Alzala se la stima sale e scende troppo in fretta rispetto al display, abbassala nel caso opposto.", "120 minuti (ritarato il 15/10/2026).")
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_inclinazione",
        label: "Inclinazione dei collettori",
        hint: "Rispetto all'orizzontale: 0\xB0 piatti, 90\xB0 verticali.",
        help: H2("L'inclinazione reale dei pannelli, per calcolare quanto sole ricevono.", "Si cambia solo se si spostano i pannelli.", "22\xB0.")
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_orientamento",
        label: "Orientamento dei collettori",
        hint: "180\xB0 \xE8 sud, 270\xB0 \xE8 ovest.",
        help: H2("La direzione verso cui guardano i pannelli.", "Si cambia solo se si spostano i pannelli.", "270\xB0 (ovest).")
      },
      {
        kind: "number",
        entity: "input_number.solare_fattore_stazione",
        label: "Correzione del sensore di sole",
        hint: "Il sensore della stazione legge circa il 54 % del satellite: 1,6 lo porta a valori reali.",
        help: H2("Moltiplica il sole misurato dalla stazione per ottenere i W/m\xB2 reali nei grafici di confronto con il satellite e l'allsky. Non cambia il sensore originale.", "Si ritara se il sensore viene spostato o sostituito.", "1,6.")
      },
      {
        kind: "number",
        entity: "input_number.solare_pannello_fattore_sereno",
        label: "Correzione del cielo sereno",
        hint: "Aggiusta la previsione della massima del pannello nelle giornate limpide.",
        help: H2("Moltiplica il sole a cielo sereno usato per prevedere la massima del pannello.", "Si ritara dopo qualche giornata limpida, confrontando la massima prevista con quella raggiunta.", "1,00.")
      },
      {
        kind: "toggle",
        entity: "input_boolean.solare_orizzonte_attivo",
        label: "Considera colline e alberi",
        hint: "Toglie il sole diretto quando il terreno lo nasconde (profilo misurato con l'allsky).",
        help: H2("Quando il sole \xE8 sotto il profilo del terreno, nelle previsioni conta solo la luce diffusa.", "Spegnilo solo per confrontare le previsioni senza il terreno.", "Acceso.")
      }
    ]
  }
];
function num(v2, fallback) {
  const n5 = typeof v2 === "number" ? v2 : Number(v2);
  return Number.isFinite(n5) ? n5 : fallback;
}
var LIVE_PUFFER = ["sensor.puffer_temperatura_effettiva", "sensor.casale_temperatura_boiler"];
var LIVE_BOILER = ["sensor.boiler_solare_alto_stimato"];
function firstNumber(states, ids) {
  for (const id of ids) {
    const st = states[id];
    if (st && st.state !== "unavailable" && st.state !== "unknown" && Number.isFinite(Number(st.state))) return Number(st.state);
  }
  return null;
}
function buildSettingsView(states, sections = SETTINGS_SECTIONS) {
  const out = [];
  for (const sec of sections) {
    const all = [];
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
      all.push({
        kind: f3.kind,
        entity: f3.entity,
        domain: f3.entity.split(".")[0],
        label: f3.label,
        hint: f3.hint,
        help: f3.help,
        on: st.state === "on",
        value,
        unit: isClimate ? "\xB0C" : String(st.attributes.unit_of_measurement ?? ""),
        min: isClimate ? num(st.attributes.min_temp, 30) : num(st.attributes.min, 0),
        max: isClimate ? num(st.attributes.max_temp, 90) : num(st.attributes.max, 100),
        step: (isClimate ? num(st.attributes.target_temp_step, 1) : num(st.attributes.step, 1)) || 1,
        unavailable
      });
    }
    if (!all.length) continue;
    const master = sec.master ? all.find((r6) => r6.entity === sec.master) : void 0;
    const rows = master ? all.filter((r6) => r6 !== master) : all;
    const view = {
      id: sec.id,
      group: sec.group,
      icon: sec.icon,
      title: sec.title,
      advanced: !!sec.advanced,
      help: sec.help,
      master,
      rows,
      summary: "",
      notes: []
    };
    if (sec.id === "integrazione") view.live = { puffer: firstNumber(states, LIVE_PUFFER), boiler: firstNumber(states, LIVE_BOILER) };
    out.push(describeSection(view));
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
function valueText(row) {
  if (row.value === null) return "\u2013";
  const d3 = decimals(row.step);
  return `${row.value.toFixed(d3)}${row.unit ? ` ${row.unit}` : ""}`;
}
function writeService(row, value) {
  if (row.domain === "climate") return { domain: "climate", service: "set_temperature", data: { entity_id: row.entity, temperature: value } };
  if (row.domain === "number") return { domain: "number", service: "set_value", data: { entity_id: row.entity, value } };
  return { domain: "input_number", service: "set_value", data: { entity_id: row.entity, value } };
}
var PENDING_MS = 3e4;
function applyPending(sections, pending, now) {
  const settled = [];
  const out = sections.map((sec) => {
    let touched = false;
    const rows = sec.rows.map((row) => {
      const p3 = pending[row.entity];
      if (!p3 || row.kind === "toggle") return row;
      if (now >= p3.until || row.value === p3.value) {
        settled.push(row.entity);
        return row;
      }
      touched = true;
      return { ...row, value: p3.value, saving: true };
    });
    return touched ? describeSection({ ...sec, rows }) : { ...sec, rows };
  });
  return { sections: out, settled };
}
var byEntity = (rows, entity) => rows.find((r6) => r6.entity === entity);
function italianValue(row) {
  if (!row || row.value === null) return "\u2013";
  return valueText(row).replace(".", ",");
}
function bare(row) {
  return row && row.value !== null ? valueText({ value: row.value, unit: "", step: row.step }).replace(".", ",") : "\u2013";
}
function sectionSummaryText(sec, rows) {
  const g2 = (e5) => byEntity(rows, e5);
  if (sec.master?.unavailable) return "Non disponibile";
  switch (sec.id) {
    case "caldaia":
      return `Acqua ${italianValue(g2("climate.casale_acqua"))} \xB7 puffer ${italianValue(g2("number.casale_setpoint_boiler"))}`;
    case "partenze":
      return sec.master?.on ? `Attiva: annulla la partenza se il boiler ha gi\xE0 ${bare(g2("input_number.caldaia_salvaguardia_docce_min"))} docce` : "Disattivata: la caldaia parte sempre con il programma";
    case "acs":
      return `Richiesta sotto ${italianValue(g2("input_number.caldaia_acs_t_accendi"))} \xB7 fine sopra ${italianValue(g2("input_number.caldaia_acs_t_spegni"))}`;
    case "integrazione": {
      const blocco = g2("input_boolean.caldaia_integrazione_blocco_attivo");
      const forza = g2("input_boolean.caldaia_integrazione_forzatura_attiva");
      const parts = [blocco ? blocco.on ? "Blocco attivo" : "Blocco spento" : null, forza?.on ? "forzatura attiva" : null, `testa boiler max ${italianValue(g2("input_number.caldaia_integrazione_temp_max"))}`];
      return parts.filter(Boolean).join(" \xB7 ");
    }
    case "assenza": {
      if (!sec.master?.on) return "Disattivato: la caldaia non si spegne da sola";
      const ospiti = g2("input_boolean.caldaia_assenza_ospiti");
      return `Spegne dopo ${italianValue(g2("input_number.caldaia_assenza_minuti"))} di casa vuota${ospiti?.on ? " \xB7 ospiti in casa" : ""}`;
    }
    case "pellet":
      return `${bare(g2("input_number.caldaia_pellet_kg_h_min"))}\u2013${italianValue(g2("input_number.caldaia_pellet_kg_h_max"))} \xB7 fattore ${bare(g2("input_number.caldaia_pellet_fattore"))}`;
    case "pompe":
      return sec.master?.on ? `Pompe ferme sotto ${italianValue(g2("input_number.centralina_pompe_w_ferme"))}` : "Misura spenta: gli indicatori delle pompe non compaiono";
    case "solare":
      return `k ${bare(g2("input_number.solare_termico_k"))} \xB7 inerzia ${italianValue(g2("input_number.solare_termico_tau"))} \xB7 ${bare(g2("input_number.solare_termico_inclinazione"))}\xB0 verso ${bare(g2("input_number.solare_termico_orientamento"))}\xB0`;
    default: {
      const n5 = rows.length;
      return `${n5} ${n5 === 1 ? "impostazione" : "impostazioni"}`;
    }
  }
}
function sectionNotes(sec, rows) {
  const g2 = (e5) => byEntity(rows, e5);
  if (sec.id === "integrazione") {
    const max = g2("input_number.caldaia_integrazione_temp_max");
    const ist = g2("input_number.caldaia_integrazione_isteresi_max");
    if (max?.value == null) return [];
    const riparte = ist?.value != null ? ` e riparte sotto ${bare({ ...max, value: max.value - ist.value })} \xB0C` : "";
    return [`La pompa smette di scaldare quando la testa del boiler arriva a ${bare(max)} \xB0C${riparte}.`];
  }
  if (sec.id === "assenza") {
    const min = g2("input_number.caldaia_assenza_minuti");
    const t3 = g2("input_number.caldaia_assenza_t_esterna_min");
    if (!sec.master?.on || min?.value == null) return [];
    const freddo = t3?.value != null ? ` Con meno di ${bare(t3)} \xB0C fuori non la spegne, per non far raffreddare la casa.` : "";
    return [`Se nessuno \xE8 in casa da ${bare(min)} minuti (iPhone e Wi-Fi) la caldaia si spegne; al rientro riparte solo se c'\xE8 un programma attivo.${freddo}`];
  }
  if (sec.id === "acs") {
    const on2 = g2("input_number.caldaia_acs_t_accendi");
    const off2 = g2("input_number.caldaia_acs_t_spegni");
    const em = g2("input_number.caldaia_acs_t_emergenza");
    const sole = g2("input_number.caldaia_acs_potenza_solare_min");
    if (on2?.value == null) return [];
    const fine = off2?.value != null ? ` e resta finch\xE9 arriva a ${bare(off2)} \xB0C` : "";
    const sunNote = sole?.value != null ? ` Se il solare d\xE0 almeno ${bare(sole)} kW la richiesta aspetta${em?.value != null ? `, ma sotto ${bare(em)} \xB0C parte lo stesso` : ""}.` : "";
    return [`Quando la temperatura alta del boiler scende sotto ${bare(on2)} \xB0C parte la richiesta di acqua calda${fine}. Con un programma attivo e il puffer sotto la soglia della salvaguardia, la richiesta riaccende il Polygon.${sunNote}`];
  }
  if (sec.id === "partenze") {
    const docce = g2("input_number.caldaia_salvaguardia_docce_min");
    const t3 = g2("input_number.caldaia_salvaguardia_t_puffer");
    if (!sec.master?.on || docce?.value == null) return [];
    const riparte = t3?.value != null ? ` Riparte quando il termostato chiede calore, o quando l'acqua sanitaria chiede calore con il puffer sotto ${bare(t3)} \xB0C.` : " Riparte quando il termostato chiede calore o l'acqua sanitaria si raffredda.";
    return [`All'ora di un programma, se il boiler ha gi\xE0 almeno ${bare(docce)} docce (conta anche la sonda bassa) e il termostato non chiede calore, la partenza viene annullata: si risparmia pellet.${riparte}`];
  }
  return [];
}
function integrazioneBar(rows, live) {
  const block = byEntity(rows, "input_number.caldaia_integrazione_delta_blocco")?.value;
  const unblock = byEntity(rows, "input_number.caldaia_integrazione_delta_sblocco")?.value;
  if (block == null || unblock == null) return void 0;
  const max = Math.max(Math.ceil(Math.max(block, unblock) * 1.6 / 2) * 2, 10);
  const delta = live && live.puffer !== null && live.boiler !== null ? Number((live.puffer - live.boiler).toFixed(1)) : null;
  const zone = delta === null ? null : delta < block ? "ferma" : delta > unblock ? "gira" : "attesa";
  const pct = (v2) => Math.min(100, Math.max(0, v2 / max * 100));
  const fmtD = (v2) => String(v2).replace(".", ",");
  let text = "";
  if (delta !== null && zone) {
    const quanto = delta >= 0 ? `${fmtD(delta)} \xB0C pi\xF9 caldo del boiler` : `${fmtD(-delta)} \xB0C pi\xF9 freddo del boiler`;
    const effetto = zone === "ferma" ? "la pompa resta ferma: il puffer non scalderebbe il boiler abbastanza." : zone === "gira" ? "la pompa pu\xF2 girare." : "zona di attesa: la pompa resta com'\xE8 (se gira continua, se \xE8 ferma resta ferma).";
    text = `Adesso il puffer \xE8 ${quanto}: ${effetto}`;
  }
  return { max, block, unblock, delta, zone, markerPct: delta === null ? null : pct(delta), blockPct: pct(block), unblockPct: pct(unblock), text };
}
function describeSection(view) {
  const all = view.master ? [view.master, ...view.rows] : view.rows;
  return {
    ...view,
    summary: sectionSummaryText(view, all),
    notes: sectionNotes(view, all),
    bar: view.id === "integrazione" ? integrazioneBar(all, view.live) : void 0
  };
}

// src/settings-dialog.ts
var TAG = "impianto-settings-dialog";
var ImpiantoSettingsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this._open = null;
    this._help = null;
    this._thermoBusy = false;
    this._error = "";
    this._pending = {};
    this._timers = /* @__PURE__ */ new Map();
    this._onKey = (e5) => {
      if (e5.key !== "Escape") return;
      if (this._help) this._help = null;
      else this._close();
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
  _toggleBlock(id) {
    this._open = this._open === id ? null : id;
    if (this._open) void this.updateComplete.then(() => this.renderRoot.querySelector(".block.open")?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }
  /** Link "Quando serve": apre la spiegazione completa (cosa fa, quando serve, valore consigliato). */
  _helpBtn(title, help) {
    if (!help) return A;
    return b2`<button class="why" aria-label="Quando serve: ${title}" @click=${(e5) => {
      e5.stopPropagation();
      this._help = { title, help };
    }}>Quando serve?</button>`;
  }
  _renderRow(row) {
    const text = b2`
      <div class="txt">
        <div class="lab">${row.label}</div>
        <div class="hint">${row.hint ?? row.help?.what ?? ""} ${this._helpBtn(row.label, row.help)}</div>
      </div>
    `;
    if (row.kind === "toggle") {
      return b2`
        <div class="row tog">
          ${text}
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
        ${text}
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
  /** Le due soglie della pompa su una barra: ferma, attesa, può girare; il segno è la differenza di adesso. */
  _renderBar(b3) {
    const f3 = (v2) => `+${String(v2).replace(".", ",")} \xB0C`;
    return b2`
      <div class="gauge" aria-label="Soglie della pompa di integrazione">
        <div class="gcap">Quanto il puffer è più caldo del boiler</div>
        <div class="mk">${b3.markerPct !== null ? b2`<span style="left:${b3.markerPct}%">adesso ▼</span>` : A}</div>
        <div class="track">
          <div class="seg stop" style="width:${b3.blockPct}%"><span>ferma</span></div>
          <div class="seg wait" style="width:${b3.unblockPct - b3.blockPct}%"><span>attesa</span></div>
          <div class="seg go" style="width:${100 - b3.unblockPct}%"><span>gira</span></div>
        </div>
        <div class="ticks">
          <span style="left:0%">0</span>
          <span style="left:${b3.blockPct}%">${f3(b3.block)}</span>
          <span style="left:${b3.unblockPct}%">${f3(b3.unblock)}</span>
        </div>
        ${b3.text ? b2`<div class="now ${b3.zone ?? ""}">${b3.text}</div>` : A}
      </div>
    `;
  }
  _renderBlock(sec) {
    const open = this._open === sec.id;
    const m2 = sec.master;
    return b2`
      <section class="block ${open ? "open" : ""}">
        <div class="bh" role="button" tabindex="0" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleBlock(sec.id)} @keydown=${(e5) => {
      if (e5.target === e5.currentTarget && (e5.key === "Enter" || e5.key === " ")) {
        e5.preventDefault();
        this._toggleBlock(sec.id);
      }
    }}>
          <ha-icon icon=${sec.icon}></ha-icon>
          <div class="bt"><div class="bn">${sec.title}</div><div class="bs">${sec.summary}</div></div>
          ${m2 ? b2`<button
                class=${m2.on ? "sw on" : "sw"}
                role="switch"
                aria-checked=${m2.on ? "true" : "false"}
                aria-label=${m2.label}
                title=${m2.label}
                ?disabled=${m2.unavailable}
                @click=${(e5) => {
      e5.stopPropagation();
      this._toggle(m2);
    }}
              ><span class="knob"></span></button>` : A}
          <span class="chev">${open ? "\u25BE" : "\u25B8"}</span>
        </div>
        ${open ? b2`<div class="bb">
              <p class="intro">${m2?.hint ?? sec.help.what} ${this._helpBtn(sec.title, sec.help)}</p>
              ${sec.bar ? this._renderBar(sec.bar) : A}
              ${sec.notes.map((n5) => b2`<p class="note">${n5}</p>`)}
              ${sec.rows.map((r6) => this._renderRow(r6))}
            </div>` : A}
      </section>
    `;
  }
  /** Le preferenze del termostato stanno nell'altra integrazione: si apre la sua finestra. */
  async _openThermostat() {
    this._thermoBusy = true;
    this._error = "";
    try {
      const cw = this.hass.callWS;
      if (!cw) throw new Error("callWS non disponibile");
      const info = await cw.call(this.hass, { type: "termostato_riscaldamento/info" });
      const d3 = document.createElement("termostato-settings-dialog");
      d3.hass = this.hass;
      d3.info = info;
      document.body.appendChild(d3);
    } catch (err) {
      this._error = `Termostato non raggiungibile: ${err instanceof Error ? err.message : err?.message ?? String(err)}`;
    } finally {
      this._thermoBusy = false;
    }
  }
  _renderThermostatBlock() {
    if (!customElements.get("termostato-settings-dialog")) return A;
    const id = "termostato";
    const open = this._open === id;
    const help = {
      what: "Antigelo, limiti dell'obiettivo, durata del timer, comportamento a casa vuota, annunci vocali e collegamenti del termostato ambiente.",
      when: "Per cambiare come il termostato scalda quando non c'\xE8 il programma o quando la casa \xE8 vuota."
    };
    return b2`
      <section class="block ${open ? "open" : ""}">
        <div class="bh" role="button" tabindex="0" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleBlock(id)} @keydown=${(e5) => {
      if (e5.key === "Enter" || e5.key === " ") this._toggleBlock(id);
    }}>
          <ha-icon icon="mdi:thermostat"></ha-icon>
          <div class="bt"><div class="bn">Termostato ambiente</div><div class="bs">Antigelo, timer, casa vuota, annunci</div></div>
          <span class="chev">${open ? "\u25BE" : "\u25B8"}</span>
        </div>
        ${open ? b2`<div class="bb">
              <p class="intro">${help.what} ${this._helpBtn("Termostato ambiente", help)}</p>
              <div class="row"><div class="txt"><div class="lab">Preferenze del termostato</div><div class="hint">Si apre la sua finestra.</div></div><button class="btn" ?disabled=${this._thermoBusy} @click=${() => void this._openThermostat()}>Apri</button></div>
            </div>` : A}
      </section>
    `;
  }
  _renderHelp() {
    if (!this._help) return A;
    const { title, help } = this._help;
    return b2`
      <div class="hback" @click=${(e5) => e5.target === e5.currentTarget && (this._help = null)}>
        <div class="hbox" role="dialog" aria-modal="true" aria-label=${title}>
          <div class="ht">${title}</div>
          <div class="hs">Cosa fa</div><p>${help.what}</p>
          <div class="hs">Quando serve</div><p>${help.when}</p>
          ${help.suggested ? b2`<div class="hs">Valore consigliato</div><p>${help.suggested}</p>` : A}
          <button class="btn primary" @click=${() => this._help = null}>Ho capito</button>
        </div>
      </div>
    `;
  }
  render() {
    if (!this.hass) return A;
    const built = applyPending(buildSettingsView(this.hass.states), this._pending, Date.now());
    for (const e5 of built.settled) delete this._pending[e5];
    const thermo = this._renderThermostatBlock();
    const groups = SETTINGS_GROUPS.map((g2) => ({ g: g2, secs: built.sections.filter((x2) => x2.group === g2.id), extra: g2.id === "casa" ? thermo : A })).filter(
      (x2) => x2.secs.length || x2.extra !== A
    );
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Preferenze impianto">
          <div class="head">
            <div class="title">Preferenze impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${groups.length === 0 ? b2`<div class="empty">Nessuna impostazione trovata: installa i pacchetti Home Assistant del progetto (cartella ha-packages).</div>` : b2`
                  <p class="lead">Tocca un blocco per aprirlo e cambiare i valori: ogni modifica vale subito. Gli interruttori accendono e spengono la funzione senza aprire il blocco.</p>
                  ${groups.map(
      ({ g: g2, secs, extra }) => b2`
                      <h3 class="grp">${g2.title}</h3>
                      ${g2.note ? b2`<div class="gnote">${g2.note}</div>` : A}
                      ${secs.map((sec) => this._renderBlock(sec))}
                      ${extra}
                    `
    )}
                `}
            ${this._error ? b2`<div class="err">${this._error}</div>` : A}
          </div>
          ${this._renderHelp()}
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
      position: relative;
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
      font-weight: 500;
    }
    .hint {
      font-size: 12.5px;
      line-height: 1.35;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .why {
      background: none;
      border: none;
      padding: 4px 2px;
      font: inherit;
      font-size: 12.5px;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      white-space: nowrap;
    }
    .lead {
      margin: 14px 0 0;
      font-size: 13.5px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
    .grp {
      margin: 20px 2px 0;
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary-color, #03a9f4);
    }
    .gnote {
      margin: 2px 2px 0;
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
    }
    .intro {
      margin: 10px 0 2px;
      font-size: 14px;
      line-height: 1.4;
    }
    .note {
      margin: 10px 0 2px;
      padding: 8px 10px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      font-size: 13px;
      line-height: 1.4;
    }
    .gauge {
      margin: 12px 0 6px;
      padding: 0 14px;
    }
    .gcap {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      margin-bottom: 6px;
    }
    .track {
      position: relative;
      display: flex;
      height: 26px;
      border-radius: 13px;
      overflow: hidden;
    }
    .seg {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      font-size: 11.5px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
    }
    .seg.stop {
      background: var(--error-color, #db4437);
    }
    .seg.wait {
      background: var(--warning-color, #ffa600);
    }
    .seg.go {
      background: var(--success-color, #43a047);
    }
    .mk {
      position: relative;
      height: 16px;
      font-size: 11.5px;
      font-weight: 600;
    }
    .mk span {
      position: absolute;
      bottom: 0;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .ticks {
      position: relative;
      height: 18px;
      margin-top: 3px;
      font-size: 11.5px;
      color: var(--secondary-text-color, #727272);
    }
    .ticks span {
      position: absolute;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .ticks span:first-child {
      transform: none;
    }
    .now {
      margin-top: 6px;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 500;
    }
    .sw {
      flex: none;
      width: 54px;
      height: 30px;
      border-radius: 15px;
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
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;
    }
    .sw.on .knob {
      transform: translateX(24px);
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
      width: 44px;
      height: 44px;
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
      width: 66px;
      min-height: 44px;
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
    .block {
      margin-top: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 14px;
      overflow: hidden;
    }
    .block.open {
      border-color: var(--primary-color, #03a9f4);
    }
    .bh {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 58px;
      padding: 6px 12px;
      cursor: pointer;
    }
    .bh ha-icon {
      --mdc-icon-size: 26px;
      flex: none;
      color: var(--secondary-text-color, #727272);
    }
    .bt {
      flex: 1;
      min-width: 0;
    }
    .bn {
      font-size: 16px;
      font-weight: 600;
    }
    .bs {
      font-size: 12.5px;
      line-height: 1.35;
      color: var(--secondary-text-color, #727272);
    }
    .chev {
      width: 18px;
      text-align: center;
      color: var(--secondary-text-color, #727272);
    }
    .bb {
      padding: 0 12px 8px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .bb .row:last-child {
      border-bottom: none;
    }
    .btn {
      min-height: 44px;
      padding: 8px 18px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 15px;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border-color: transparent;
    }
    .hback {
      position: absolute;
      inset: 0;
      z-index: 2;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
    }
    .hbox {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      padding: 16px 18px;
      max-width: 420px;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }
    .ht {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .hs {
      margin-top: 8px;
      font-size: 11.5px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    .hbox p {
      margin: 2px 0 0;
      font-size: 15px;
      line-height: 1.4;
    }
    .hbox .btn {
      margin-top: 14px;
      width: 100%;
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
], ImpiantoSettingsDialog.prototype, "_help", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_thermoBusy", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_error", 2);
if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoSettingsDialog);

// src/info-dialog.ts
var TAG2 = "impianto-info-dialog";
var ImpiantoInfoDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.lines = [];
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
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  render() {
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Stato dell'impianto">
          <div class="head">
            <div class="title">Stato dell'impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${this.lines.length === 0 ? b2`<div class="empty">Nessuna informazione disponibile.</div>` : this.lines.map(
      (l3) => b2`<div class="line ${l3.tone}"><ha-icon icon=${l3.icon}></ha-icon><span>${l3.text}</span></div>`
    )}
          </div>
        </div>
      </div>
      ${A}
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
      max-width: 520px;
      max-height: min(86vh, 700px);
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
      padding: 8px 18px 18px;
    }
    .line {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 10px 0;
      font-size: 15px;
      line-height: 1.4;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .line:last-child {
      border-bottom: none;
    }
    .line ha-icon {
      --mdc-icon-size: 22px;
      flex: none;
      color: var(--secondary-text-color, #727272);
    }
    .line.ok ha-icon {
      color: #22c55e;
    }
    .line.warn ha-icon {
      color: #f59e0b;
    }
    .line.bad {
      color: #ef4444;
      font-weight: 600;
    }
    .line.bad ha-icon {
      color: #ef4444;
    }
    .empty {
      padding: 16px 0;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoInfoDialog.prototype, "lines", 2);
if (!customElements.get(TAG2)) customElements.define(TAG2, ImpiantoInfoDialog);

// src/details-dialog.ts
var TAG3 = "impianto-details-dialog";
var ImpiantoDetailsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.groups = [];
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
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  render() {
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Altri dati della caldaia">
          <div class="head">
            <div class="title">Altri dati della caldaia</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${this.groups.length === 0 ? b2`<div class="empty">Nessun dato disponibile.</div>` : A}
            ${this.groups.map(
      (g2) => b2`
                <div class="gt">${g2.title}</div>
                <div class="grid">
                  ${g2.tiles.map(
        (t3) => b2`<div class="tile"><span class="tl">${t3.label}</span><span class="tv" style=${t3.color ? `color:${t3.color}` : ""}>${t3.value}</span></div>`
      )}
                </div>`
    )}
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
      max-height: min(86vh, 700px);
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
      padding: 10px 14px;
      border-radius: 10px;
    }
    .body {
      overflow-y: auto;
      padding: 4px 18px 18px;
    }
    .gt {
      margin: 14px 0 6px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }
    .tile {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border-radius: 10px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .tv {
      font-size: 18px;
      font-weight: 700;
    }
    .empty {
      padding: 16px 0;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoDetailsDialog.prototype, "groups", 2);
if (!customElements.get(TAG3)) customElements.define(TAG3, ImpiantoDetailsDialog);

// src/charts-logic.ts
function toMs(v2) {
  if (v2 === void 0 || v2 === null) return null;
  if (typeof v2 === "number") return v2 < 1e11 ? v2 * 1e3 : v2;
  const d3 = Date.parse(v2);
  return Number.isNaN(d3) ? null : d3;
}
function rawTime(r6) {
  return toMs(r6.lu ?? r6.last_updated ?? r6.lc ?? r6.last_changed);
}
function rawState(r6) {
  return r6.s ?? r6.state;
}
function parseNumeric(raw) {
  const out = [];
  for (const r6 of raw ?? []) {
    const t3 = rawTime(r6);
    const s4 = rawState(r6);
    if (t3 === null || s4 === void 0 || s4 === "" || s4 === "unavailable" || s4 === "unknown") continue;
    const v2 = Number(s4);
    if (Number.isFinite(v2)) out.push({ t: t3, v: v2 });
  }
  return out.sort((a3, b3) => a3.t - b3.t);
}
function parseStates(raw) {
  const out = [];
  for (const r6 of raw ?? []) {
    const t3 = rawTime(r6);
    const s4 = rawState(r6);
    if (t3 !== null && s4 !== void 0) out.push({ t: t3, s: s4 });
  }
  return out.sort((a3, b3) => a3.t - b3.t);
}
var MAX_GAP_MS = 3 * 3600 * 1e3;
function resample(pts, t0, t1, n5, maxGap = MAX_GAP_MS) {
  const out = new Array(n5).fill(null);
  if (n5 <= 0 || t1 <= t0) return out;
  const dt = (t1 - t0) / n5;
  let idx = 0;
  let curV = null;
  let curT = 0;
  for (let i5 = 0; i5 < n5; i5++) {
    const a3 = t0 + i5 * dt;
    const b3 = a3 + dt;
    while (idx < pts.length && pts[idx].t <= a3) {
      curV = pts[idx].v;
      curT = pts[idx].t;
      idx++;
    }
    let sum = 0;
    let cov = 0;
    let segStart = a3;
    let v2 = curV;
    let vT = curT;
    const addSeg = (end) => {
      if (v2 === null) return;
      const validEnd = Math.min(end, vT + maxGap);
      const len = validEnd - segStart;
      if (len > 0) {
        sum += v2 * len;
        cov += len;
      }
    };
    let k2 = idx;
    while (k2 < pts.length && pts[k2].t < b3) {
      addSeg(pts[k2].t);
      segStart = pts[k2].t;
      v2 = pts[k2].v;
      vT = pts[k2].t;
      k2++;
    }
    addSeg(b3);
    out[i5] = cov > 0 ? sum / cov : null;
  }
  return out;
}
function seriesStats(values) {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let cnt = 0;
  let last = null;
  for (const v2 of values) {
    if (v2 === null) continue;
    if (v2 < min) min = v2;
    if (v2 > max) max = v2;
    sum += v2;
    cnt++;
    last = v2;
  }
  return cnt === 0 || last === null ? null : { min, max, avg: sum / cnt, last };
}
function niceStep(raw) {
  const p3 = Math.pow(10, Math.floor(Math.log10(raw)));
  const f3 = raw / p3;
  const m2 = f3 <= 1 ? 1 : f3 <= 2 ? 2 : f3 <= 2.5 ? 2.5 : f3 <= 5 ? 5 : 10;
  return m2 * p3;
}
function niceAxis(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
  if (max - min < 1e-9) {
    const c4 = min;
    min = c4 - 1;
    max = c4 + 1;
  }
  const step = niceStep((max - min) / Math.max(1, count - 1));
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let v2 = lo; v2 <= hi + step * 1e-6; v2 += step) ticks.push(Math.round(v2 / step) * step);
  return { min: lo, max: hi, ticks };
}
var DAYS = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
function hhmm(d3) {
  return `${String(d3.getHours()).padStart(2, "0")}:${String(d3.getMinutes()).padStart(2, "0")}`;
}
var STEPS_H = [1, 2, 3, 6, 12, 24, 48];
function timeTicks(t0, t1, maxTicks = 6) {
  const hours = (t1 - t0) / 36e5;
  const stepH = STEPS_H.find((s4) => hours / s4 <= maxTicks) ?? 48;
  const stepMs = stepH * 36e5;
  const first = new Date(t0);
  first.setMinutes(0, 0, 0);
  if (stepH >= 24) first.setHours(0);
  else first.setHours(Math.ceil(first.getHours() / stepH) * stepH);
  const out = [];
  for (let t3 = first.getTime(); t3 <= t1; t3 += stepMs) {
    if (t3 < t0) continue;
    const d3 = new Date(t3);
    const major = d3.getHours() === 0;
    out.push({ t: t3, major, label: hours > 30 ? major ? `${DAYS[d3.getDay()]} ${d3.getDate()}` : hhmm(d3) : hhmm(d3) });
  }
  return out;
}
function formatMoment(t3) {
  const d3 = new Date(t3);
  const mesi = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  return `${DAYS[d3.getDay()]} ${d3.getDate()} ${mesi[d3.getMonth()]}, ${hhmm(d3)}`;
}
function linePath(values, xOf, yOf) {
  let d3 = "";
  let pen = false;
  for (let i5 = 0; i5 < values.length; i5++) {
    const v2 = values[i5];
    if (v2 === null) {
      pen = false;
      continue;
    }
    d3 += `${pen ? "L" : "M"}${xOf(i5).toFixed(1)} ${yOf(v2).toFixed(1)}`;
    pen = true;
  }
  return d3;
}
function statusSegments(states, t0, t1) {
  const out = [];
  let cur = null;
  for (const p3 of states) {
    if (p3.t <= t0) cur = p3;
    else break;
  }
  let from = t0;
  let state = cur?.s ?? "";
  for (const p3 of states) {
    if (p3.t <= t0 || p3.t >= t1) continue;
    if (state !== "") out.push({ from, to: p3.t, state });
    from = p3.t;
    state = p3.s;
  }
  if (state !== "" && from < t1) out.push({ from, to: t1, state });
  const merged = [];
  for (const s4 of out) {
    const last = merged[merged.length - 1];
    if (last && last.state === s4.state && last.to === s4.from) last.to = s4.to;
    else merged.push({ ...s4 });
  }
  return merged;
}
function stateAt(states, t3) {
  let cur = null;
  for (const p3 of states) {
    if (p3.t <= t3) cur = p3.s;
    else break;
  }
  return cur;
}
function stoveStateColor(state) {
  const s4 = state.trim().toUpperCase();
  if (["WORK", "LAVORO", "WORKING"].includes(s4)) return "#ef4444";
  if (["START", "WAIT", "AVVIO", "ATTESA", "ACCENSIONE"].includes(s4)) return "#f59e0b";
  if (s4 === "ECO STOP") return "#60a5fa";
  if (["STAND BY", "STANDBY"].includes(s4)) return "#a78bfa";
  if (s4.startsWith("ALARM") || s4 === "ALLARME") return "#b91c1c";
  if (["UNAVAILABLE", "UNKNOWN"].includes(s4)) return "transparent";
  return "#475569";
}
var S3 = {
  puffer: { id: "puffer", entityKey: "puffer_effective", label: "Puffer 50 L", unit: "\xB0C", color: "#f97316", axis: "l", decimals: 1 },
  boilerTop: { id: "boilerTop", entityKey: "boiler_top", label: "Boiler alto (S3)", unit: "\xB0C", color: "#ef4444", axis: "l", decimals: 1 },
  boilerBottom: { id: "boilerBottom", entityKey: "boiler_bottom", label: "Boiler basso (S2)", unit: "\xB0C", color: "#3b82f6", axis: "l", decimals: 1 },
  stoveWater: { id: "stoveWater", entityKey: "stove_water", label: "Acqua caldaia", unit: "\xB0C", color: "#a855f7", axis: "l", decimals: 1 },
  collector: { id: "collector", entityKey: "collector_temp", label: "Collettore solare", unit: "\xB0C", color: "#eab308", axis: "l", decimals: 1 },
  smoke: { id: "smoke", entityKey: "smoke", label: "Fumi", unit: "\xB0C", color: "#94a3b8", axis: "l", decimals: 0 },
  power: { id: "power", entityKey: "power", label: "Potenza caldaia", unit: "%", color: "#22c55e", axis: "r", decimals: 0 },
  integIn: { id: "integIn", entityKey: "coil_integ_in", label: "Serpentina integrazione, ingresso", unit: "\xB0C", color: "#ec4899", axis: "l", decimals: 1 },
  integOut: { id: "integOut", entityKey: "coil_integ_out", label: "Serpentina integrazione, uscita", unit: "\xB0C", color: "#0ea5e9", axis: "l", decimals: 1 },
  integW: { id: "integW", entityKey: "integration_power", label: "Pompa integrazione", unit: "W", color: "#22c55e", axis: "r", decimals: 0 },
  solarIn: { id: "solarIn", entityKey: "coil_solar_in", label: "Serpentina solare, ingresso", unit: "\xB0C", color: "#f59e0b", axis: "l", decimals: 1 },
  solarOut: { id: "solarOut", entityKey: "coil_solar_out", label: "Serpentina solare, uscita", unit: "\xB0C", color: "#06b6d4", axis: "l", decimals: 1 },
  solarKw: { id: "solarKw", entityKey: "solar_power", label: "Potenza solare", unit: "kW", color: "#22c55e", axis: "r", decimals: 2 },
  gtiStation: { id: "gtiStation", entityKey: "gti_station", label: "Irraggiamento sul piano (stazione)", unit: "W/m\xB2", color: "#f59e0b", axis: "l", decimals: 0 },
  gtiForecast: { id: "gtiForecast", entityKey: "gti_forecast", label: "Irraggiamento previsto (Open-Meteo)", unit: "W/m\xB2", color: "#3b82f6", axis: "l", decimals: 0 },
  gtiSatellite: { id: "gtiSatellite", entityKey: "gti_satellite", label: "Irraggiamento osservato (satellite)", unit: "W/m\xB2", color: "#22c55e", axis: "l", decimals: 0, timeShiftMs: -2 * 36e5 },
  cloudForecast: { id: "cloudForecast", entityKey: "cloud_forecast", label: "Nuvolosit\xE0 prevista", unit: "%", color: "#94a3b8", axis: "r", decimals: 0 },
  stationRaw: { id: "stationRaw", entityKey: "irr_station_raw", label: "Irraggiamento orizzontale (stazione, originale)", unit: "W/m\xB2", color: "#9ca3af", axis: "l", decimals: 0 },
  stationCorr: { id: "stationCorr", entityKey: "irr_station_corrected", label: "Irraggiamento orizzontale (stazione, corretto)", unit: "W/m\xB2", color: "#f59e0b", axis: "l", decimals: 0 },
  allskyIrr: { id: "allskyIrr", entityKey: "allsky_irradiance", label: "Irraggiamento orizzontale (stimato dall'allsky)", unit: "W/m\xB2", color: "#8b5cf6", axis: "l", decimals: 0 },
  allskyCloud: { id: "allskyCloud", entityKey: "allsky_cloud", label: "Copertura nuvolosa (allsky)", unit: "%", color: "#64748b", axis: "r", decimals: 0 },
  collectorW: { id: "collectorW", entityKey: "collector_power", label: "Alimentazione Elios (pompa collettore)", unit: "W", color: "#84cc16", axis: "r", decimals: 0 }
};
var on = (s4) => ({ ...s4, on: true });
var off = (s4) => ({ ...s4, on: false });
var CHART_GROUPS = [
  {
    id: "temperature",
    title: "Temperature",
    series: [on(S3.puffer), on(S3.boilerTop), on(S3.boilerBottom), on(S3.stoveWater), off(S3.collector)]
  },
  {
    id: "caldaia",
    title: "Caldaia",
    series: [on(S3.stoveWater), on(S3.puffer), off(S3.smoke), on(S3.power)]
  },
  {
    id: "integrazione",
    title: "Pompa di integrazione",
    series: [on(S3.puffer), on(S3.boilerTop), off(S3.integIn), off(S3.integOut), on(S3.integW)]
  },
  {
    id: "irraggiamento",
    title: "Irraggiamento",
    series: [on(S3.gtiStation), on(S3.gtiForecast), on(S3.gtiSatellite), on(S3.cloudForecast)]
  },
  {
    id: "allsky",
    title: "AllSky",
    series: [off(S3.stationRaw), on(S3.stationCorr), on(S3.allskyIrr), on(S3.allskyCloud), off(S3.cloudForecast)]
  },
  {
    id: "solare",
    title: "Solare",
    series: [on(S3.collector), on(S3.solarIn), on(S3.solarOut), on(S3.boilerBottom), off(S3.solarKw)]
  }
];
function allSeries() {
  return Object.values(S3).map((s4) => ({ ...s4, on: ["puffer", "boilerTop", "stoveWater"].includes(s4.id) }));
}
var RANGES = [
  { id: "6h", label: "6 h", hours: 6 },
  { id: "24h", label: "24 h", hours: 24 },
  { id: "3d", label: "3 gg", hours: 72 },
  { id: "7d", label: "7 gg", hours: 168 }
];
function formatValue(v2, def) {
  if (v2 === null || v2 === void 0 || !Number.isFinite(v2)) return "\u2013";
  return `${v2.toFixed(def.decimals).replace(".", ",")} ${def.unit}`;
}
function normalizeValue(v2, st) {
  if (st.max - st.min < 1e-9) return 0.5;
  return (v2 - st.min) / (st.max - st.min);
}

// src/charts-dialog.ts
var TAG4 = "impianto-charts-dialog";
var H_MS = 36e5;
var PLOT_H = 210;
var MT = 10;
var LABELS_H = 22;
var STRIP_H = 12;
var LIBERO = { id: "libero", title: "Confronto libero", normalized: true, series: allSeries() };
var ImpiantoChartsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this._group = CHART_GROUPS[0].id;
    this._range = "24h";
    this._compare = false;
    this._normalized = false;
    this._loading = false;
    this._error = "";
    this._w = 600;
    this._hover = null;
    this._hidden = /* @__PURE__ */ new Set();
    this._shown = /* @__PURE__ */ new Set();
    this._computed = [];
    this._t0 = 0;
    this._t1 = 0;
    this._n = 240;
    this._rawCur = /* @__PURE__ */ new Map();
    this._rawPrev = /* @__PURE__ */ new Map();
    this._states = [];
    this._seq = 0;
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
    this._timer = window.setInterval(() => void this._load(), 6e4);
    void this._load();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    this._ro?.disconnect();
    if (this._timer) window.clearInterval(this._timer);
  }
  firstUpdated() {
    const wrap = this.renderRoot.querySelector(".chartwrap");
    if (!wrap) return;
    this._ro = new ResizeObserver((entries) => {
      const w2 = Math.floor(entries[0]?.contentRect.width ?? 600);
      if (w2 > 100 && Math.abs(w2 - this._w) > 2) {
        this._w = w2;
        this._recompute();
      }
    });
    this._ro.observe(wrap);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  // ---- dati ----------------------------------------------------------------
  get _def() {
    return this._group === LIBERO.id ? LIBERO : CHART_GROUPS.find((g2) => g2.id === this._group) ?? CHART_GROUPS[0];
  }
  _entityOf(def) {
    return this.entities[def.entityKey];
  }
  /** Serie del grafico attuale che esistono in Home Assistant. */
  _available() {
    return this._def.series.filter((s4) => {
      const id = this._entityOf(s4);
      return id !== void 0 && this.hass.states[id] !== void 0;
    });
  }
  _isOn(def) {
    const key = `${this._def.id}:${def.id}`;
    if (this._shown.has(key)) return true;
    if (this._hidden.has(key)) return false;
    return !!def.on;
  }
  async _history(ids, start, end) {
    const cw = this.hass.callWS;
    return cw.call(this.hass, {
      type: "history/history_during_period",
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      entity_ids: ids,
      include_start_time_state: true,
      significant_changes_only: false,
      minimal_response: true,
      no_attributes: true
    });
  }
  async _load() {
    if (!this.hass) return;
    const seq = ++this._seq;
    const range = RANGES.find((r6) => r6.id === this._range) ?? RANGES[1];
    const span = range.hours * H_MS;
    const now = Date.now();
    const defs = this._available();
    const ids = Array.from(new Set(defs.map((d3) => this._entityOf(d3)).concat(this.entities.stove_state)));
    this._loading = this._computed.length === 0;
    try {
      const cur = await this._history(ids, now - span, now);
      const prev = this._compare ? await this._history(ids, now - 2 * span, now - span) : null;
      if (seq !== this._seq) return;
      this._t0 = now - span;
      this._t1 = now;
      this._rawCur = new Map(Object.entries(cur).map(([k2, v2]) => [k2, parseNumeric(v2)]));
      this._rawPrev = new Map(prev ? Object.entries(prev).map(([k2, v2]) => [k2, parseNumeric(v2)]) : []);
      this._states = parseStates(cur[this.entities.stove_state]);
      this._error = "";
      this._recompute();
    } catch (err) {
      if (seq === this._seq) this._error = `Impossibile leggere lo storico: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      if (seq === this._seq) this._loading = false;
    }
  }
  _recompute() {
    const n5 = Math.max(120, Math.min(360, Math.round(this._w / 2)));
    this._n = n5;
    const span = this._t1 - this._t0;
    this._computed = this._available().map((def) => {
      const id = this._entityOf(def);
      const shift = def.timeShiftMs ?? 0;
      const moved = (pts) => shift === 0 ? pts : pts.map((p3) => ({ t: p3.t + shift, v: p3.v }));
      const cur = resample(moved(this._rawCur.get(id) ?? []), this._t0, this._t1, n5);
      const prev = this._compare ? resample(moved(this._rawPrev.get(id) ?? []), this._t0 - span, this._t0, n5) : null;
      return { def, cur, prev, stats: seriesStats(cur) };
    });
  }
  // ---- interazione -----------------------------------------------------------
  _setGroup(id) {
    this._group = id;
    this._hover = null;
    this._computed = [];
    void this._load();
  }
  _setRange(id) {
    this._range = id;
    this._hover = null;
    void this._load();
  }
  _toggleCompare() {
    this._compare = !this._compare;
    void this._load();
  }
  _toggleSeries(def) {
    const key = `${this._def.id}:${def.id}`;
    const turnOn = !this._isOn(def);
    const shown = new Set(this._shown);
    const hidden = new Set(this._hidden);
    if (turnOn) {
      shown.add(key);
      hidden.delete(key);
    } else {
      hidden.add(key);
      shown.delete(key);
    }
    this._shown = shown;
    this._hidden = hidden;
  }
  _geometry() {
    const visible = this._computed.filter((c4) => this._isOn(c4.def));
    const norm = this._normalized || !!this._def.normalized;
    const hasRight = !norm && visible.some((c4) => c4.def.axis === "r");
    const ml = norm ? 38 : 46;
    const mr = hasRight ? 46 : 12;
    const plotW = Math.max(60, this._w - ml - mr);
    return { visible, norm, hasRight, ml, mr, plotW };
  }
  _onMove(ev) {
    const g2 = this._geometry();
    const svgEl = ev.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const x2 = ev.clientX - rect.left - g2.ml;
    const i5 = Math.round(x2 / g2.plotW * (this._n - 1));
    this._hover = Math.max(0, Math.min(this._n - 1, i5));
  }
  _onLeave(ev) {
    if (ev.pointerType === "mouse") this._hover = null;
  }
  // ---- disegno ---------------------------------------------------------------
  _axisFor(visible, side) {
    let min = Infinity;
    let max = -Infinity;
    for (const c4 of visible) {
      if (c4.def.axis !== side) continue;
      for (const arr of [c4.cur, c4.prev ?? []]) {
        for (const v2 of arr) {
          if (v2 === null) continue;
          if (v2 < min) min = v2;
          if (v2 > max) max = v2;
        }
      }
    }
    return Number.isFinite(min) ? niceAxis(min, max, 5) : null;
  }
  _renderChart() {
    const g2 = this._geometry();
    const { visible, norm, hasRight, ml, plotW } = g2;
    const axL = norm ? null : this._axisFor(visible, "l");
    const axR = norm ? null : this._axisFor(visible, "r");
    const svgH = MT + PLOT_H + LABELS_H + STRIP_H + 6;
    const xOf = (i5) => ml + i5 / (this._n - 1) * plotW;
    const yBase = MT + PLOT_H;
    const yFor = (c4) => {
      if (norm) {
        const st = c4.stats;
        return (v2) => yBase - (st ? normalizeValue(v2, st) : 0.5) * PLOT_H;
      }
      const ax = c4.def.axis === "r" ? axR : axL;
      return (v2) => ax ? yBase - (v2 - ax.min) / (ax.max - ax.min) * PLOT_H : yBase;
    };
    const ticks = timeTicks(this._t0, this._t1, Math.max(3, Math.floor(plotW / 80)));
    const xOfT = (t3) => ml + (t3 - this._t0) / (this._t1 - this._t0) * plotW;
    const segs = statusSegments(this._states, this._t0, this._t1);
    const hov = this._hover;
    const hx = hov !== null ? xOf(hov) : null;
    const gridAxis = axL ?? axR;
    return b2`
      <div class="chartwrap">
        <svg width=${this._w} height=${svgH} viewBox="0 0 ${this._w} ${svgH}" role="img" aria-label="Grafico ${this._def.title}"
          @pointermove=${(e5) => this._onMove(e5)} @pointerdown=${(e5) => this._onMove(e5)} @pointerleave=${(e5) => this._onLeave(e5)}>
          ${norm ? [0, 0.25, 0.5, 0.75, 1].map((f3) => w`<line class="grid" x1=${ml} x2=${ml + plotW} y1=${yBase - f3 * PLOT_H} y2=${yBase - f3 * PLOT_H} />`) : gridAxis?.ticks.map((tv) => {
      const y3 = yBase - (tv - gridAxis.min) / (gridAxis.max - gridAxis.min) * PLOT_H;
      return w`<line class="grid" x1=${ml} x2=${ml + plotW} y1=${y3} y2=${y3} />`;
    })}
          ${norm ? w`<text class="ax" x=${ml - 6} y=${MT + 4} text-anchor="end">max</text><text class="ax" x=${ml - 6} y=${yBase + 4} text-anchor="end">min</text>` : axL?.ticks.map((tv) => {
      const y3 = yBase - (tv - axL.min) / (axL.max - axL.min) * PLOT_H;
      return w`<text class="ax" x=${ml - 6} y=${y3 + 4} text-anchor="end">${Number.isInteger(tv) ? tv : tv.toFixed(1).replace(".", ",")}</text>`;
    })}
          ${hasRight && axR ? axR.ticks.map((tv) => {
      const y3 = yBase - (tv - axR.min) / (axR.max - axR.min) * PLOT_H;
      return w`<text class="ax" x=${ml + plotW + 6} y=${y3 + 4}>${Number.isInteger(tv) ? tv : tv.toFixed(1).replace(".", ",")}</text>`;
    }) : A}
          ${ticks.map(
      (t3) => w`<line class=${t3.major ? "vgrid major" : "vgrid"} x1=${xOfT(t3.t)} x2=${xOfT(t3.t)} y1=${MT} y2=${yBase} />
              <text class="ax" x=${xOfT(t3.t)} y=${yBase + 15} text-anchor="middle">${t3.label}</text>`
    )}
          ${visible.map(
      (c4) => c4.prev ? w`<path class="line prev" d=${linePath(c4.prev, xOf, yFor(c4))} stroke=${c4.def.color} />` : A
    )}
          ${visible.map((c4) => w`<path class="line" d=${linePath(c4.cur, xOf, yFor(c4))} stroke=${c4.def.color} />`)}
          <!-- stato della caldaia -->
          ${segs.map(
      (s4) => w`<rect x=${xOfT(s4.from)} y=${yBase + LABELS_H + 2} width=${Math.max(1, xOfT(s4.to) - xOfT(s4.from))} height=${STRIP_H} fill=${stoveStateColor(s4.state)}><title>${s4.state}</title></rect>`
    )}
          ${hx !== null ? w`<line class="cursor" x1=${hx} x2=${hx} y1=${MT} y2=${yBase} />
                ${visible.map((c4) => {
      const v2 = c4.cur[hov];
      return v2 === null ? A : w`<circle cx=${hx} cy=${yFor(c4)(v2)} r="4" fill=${c4.def.color} class="dot" />`;
    })}` : A}
        </svg>
        ${hov !== null ? this._renderTip(visible, hov, hx) : A}
      </div>
      <div class="strip-legend">
        <span class="swatch" style="background:#ef4444"></span>in lavoro
        <span class="swatch" style="background:#f59e0b"></span>accensione
        <span class="swatch" style="background:#60a5fa"></span>ECO STOP
        <span class="swatch" style="background:#475569"></span>spenta
        <small>(fascia sotto il grafico: stato della caldaia)</small>
      </div>
    `;
  }
  _renderTip(visible, i5, x2) {
    const t3 = this._t0 + i5 / (this._n - 1) * (this._t1 - this._t0);
    const st = stateAt(this._states, t3);
    const left = x2 > this._w / 2;
    return b2`
      <div class="tip ${left ? "l" : "r"}" style=${left ? `right:${this._w - x2 + 10}px` : `left:${x2 + 10}px`}>
        <div class="tt">${formatMoment(t3)}</div>
        ${visible.map(
      (c4) => b2`<div class="tr">
            <i style="background:${c4.def.color}"></i><span class="tn">${c4.def.label}</span>
            <b>${formatValue(c4.cur[i5], c4.def)}</b>
            ${c4.prev ? b2`<span class="pv">${formatValue(c4.prev[i5], c4.def)}</span>` : A}
          </div>`
    )}
        ${st ? b2`<div class="tr"><i style="background:${stoveStateColor(st)}"></i><span class="tn">Caldaia</span><b>${st}</b></div>` : A}
        ${visible.some((c4) => c4.prev) ? b2`<div class="note">grigio: stesso momento del periodo prima</div>` : A}
      </div>
    `;
  }
  _renderTable(visible) {
    const hov = this._hover;
    if (visible.length === 0) return b2`<div class="empty">Scegli almeno una serie qui sopra.</div>`;
    return b2`
      <table>
        <thead>
          <tr><th></th><th>${hov !== null ? "Cursore" : "Ora"}</th><th>Min</th><th>Media</th><th>Max</th></tr>
        </thead>
        <tbody>
          ${visible.map((c4) => {
      const v2 = hov !== null ? c4.cur[hov] : c4.stats?.last ?? null;
      return b2`<tr>
              <td><i style="background:${c4.def.color}"></i>${c4.def.label}</td>
              <td><b>${formatValue(v2, c4.def)}</b></td>
              <td>${formatValue(c4.stats?.min, c4.def)}</td>
              <td>${formatValue(c4.stats?.avg, c4.def)}</td>
              <td>${formatValue(c4.stats?.max, c4.def)}</td>
            </tr>`;
    })}
        </tbody>
      </table>
    `;
  }
  render() {
    if (!this.hass || !this.entities) return A;
    const groups = [...CHART_GROUPS, LIBERO];
    const available = this._available();
    const visible = this._computed.filter((c4) => this._isOn(c4.def));
    const forced = !!this._def.normalized;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Grafici dell'impianto">
          <div class="head">
            <div class="title">Grafici</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="tabs" role="tablist">
              ${groups.map(
      (gr) => b2`<button role="tab" aria-selected=${gr.id === this._group} class=${gr.id === this._group ? "tab on" : "tab"} @click=${() => this._setGroup(gr.id)}>${gr.title}</button>`
    )}
            </div>
            <div class="bar">
              <div class="seg">
                ${RANGES.map(
      (r6) => b2`<button class=${r6.id === this._range ? "on" : ""} @click=${() => this._setRange(r6.id)}>${r6.label}</button>`
    )}
              </div>
              <label class="chk"><input type="checkbox" .checked=${this._compare} @change=${() => this._toggleCompare()} />Confronta con il periodo prima</label>
              <label class="chk" title="Ogni serie è riportata da 0 a 100 % del proprio intervallo: serve a confrontare le forme di grandezze diverse">
                <input type="checkbox" .checked=${forced || this._normalized} ?disabled=${forced} @change=${() => this._normalized = !this._normalized} />Confronta le forme (0–100 %)
              </label>
            </div>
            <div class="chips">
              ${available.map(
      (d3) => b2`<button class=${this._isOn(d3) ? "chip on" : "chip"} aria-pressed=${this._isOn(d3)} @click=${() => this._toggleSeries(d3)}>
                  <i style="background:${this._isOn(d3) ? d3.color : "transparent"};border-color:${d3.color}"></i>${d3.label}
                </button>`
    )}
            </div>
            ${this._error ? b2`<div class="err">${this._error}</div>` : A}
            <div class="chartarea ${this._loading ? "loading" : ""}">${this._renderChart()} ${this._loading ? b2`<div class="spin">Carico lo storico…</div>` : A}</div>
            ${this._renderTable(visible)}
            <p class="hint">Passa il dito o il mouse sul grafico per leggere i valori in ogni momento.</p>
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
      max-width: 940px;
      max-height: min(94vh, 900px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
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
      padding: 10px 18px 18px;
    }
    .tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 6px;
    }
    .tab {
      flex: none;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: inherit;
      border-radius: 999px;
      padding: 7px 14px;
      font-size: 14px;
      cursor: pointer;
      font-family: inherit;
    }
    .tab.on {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      font-weight: 600;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      align-items: center;
      margin: 8px 0;
    }
    .seg {
      display: inline-flex;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      border-radius: 10px;
      overflow: hidden;
    }
    .seg button {
      background: none;
      border: none;
      color: inherit;
      padding: 7px 14px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
    }
    .seg button.on {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.2));
      font-weight: 700;
    }
    .chk {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13.5px;
      cursor: pointer;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 6px 0 10px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: var(--secondary-text-color, #727272);
      border-radius: 999px;
      padding: 5px 11px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .chip.on {
      color: var(--primary-text-color, #212121);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .chip i {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2px solid;
      box-sizing: border-box;
    }
    .chartarea {
      position: relative;
    }
    .chartarea.loading svg {
      opacity: 0.35;
    }
    .spin {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color, #727272);
    }
    .chartwrap {
      position: relative;
      width: 100%;
    }
    svg {
      display: block;
      touch-action: pan-y;
      user-select: none;
    }
    .grid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
      stroke-width: 1;
    }
    .vgrid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.2));
      stroke-width: 1;
      stroke-dasharray: 2 4;
    }
    .vgrid.major {
      stroke-dasharray: none;
      stroke: var(--secondary-text-color, rgba(127, 127, 127, 0.5));
    }
    .ax {
      font-size: 11.5px;
      fill: var(--secondary-text-color, #727272);
    }
    .line {
      fill: none;
      stroke-width: 2.2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .line.prev {
      stroke-width: 1.6;
      stroke-dasharray: 5 4;
      opacity: 0.45;
    }
    .cursor {
      stroke: var(--primary-text-color, #212121);
      stroke-width: 1;
      opacity: 0.6;
    }
    .dot {
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .tip {
      position: absolute;
      top: 6px;
      z-index: 2;
      pointer-events: none;
      min-width: 190px;
      max-width: 300px;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12.5px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .tt {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tr {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.55;
    }
    .tr i,
    td i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex: none;
      display: inline-block;
      margin-right: 6px;
    }
    .tr .tn {
      flex: 1;
      color: var(--secondary-text-color, #727272);
    }
    .tr .pv {
      color: var(--secondary-text-color, #727272);
      font-size: 11.5px;
    }
    .note {
      font-size: 11px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .strip-legend {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      align-items: center;
      margin: 2px 0 10px;
    }
    .swatch {
      display: inline-block;
      width: 12px;
      height: 8px;
      border-radius: 2px;
      margin-right: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th {
      text-align: right;
      font-weight: 600;
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      padding: 4px 6px;
    }
    th:first-child,
    td:first-child {
      text-align: left;
    }
    td {
      text-align: right;
      padding: 6px 6px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      white-space: nowrap;
    }
    td:first-child {
      white-space: normal;
    }
    .empty,
    .hint {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
      margin: 10px 0 0;
    }
    .err {
      color: #ef4444;
      font-size: 13.5px;
      margin: 6px 0;
    }
    @media (max-width: 520px) {
      .body {
        padding: 8px 10px 14px;
      }
      td:nth-child(4) {
        display: none;
      }
      th:nth-child(4) {
        display: none;
      }
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoChartsDialog.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoChartsDialog.prototype, "entities", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_group", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_range", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_compare", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_normalized", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_loading", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_error", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_w", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_hover", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_hidden", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_shown", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_computed", 2);
if (!customElements.get(TAG4)) customElements.define(TAG4, ImpiantoChartsDialog);

// src/hopper-logic.ts
var HOPPER = {
  depthCm: 56.5,
  topH: 28,
  topW: 54,
  midH: 50,
  midBottomW: 19,
  lowH: 16,
  lowBottomW: 7,
  lowBottomD: 12,
  rho: 0.655,
  capacityKg: 120,
  bagKg: 15
};
var HOPPER_HEIGHT = HOPPER.topH + HOPPER.midH + HOPPER.lowH;
var TOP_CM2 = HOPPER.topW * HOPPER.depthCm;
function lowArea(t3) {
  const f3 = t3 / HOPPER.lowH;
  const w2 = HOPPER.midBottomW + (HOPPER.lowBottomW - HOPPER.midBottomW) * f3;
  const d3 = HOPPER.depthCm + (HOPPER.lowBottomD - HOPPER.depthCm) * f3;
  return w2 * d3;
}
var LOW_TOTAL_CM3 = (() => {
  const n5 = 400;
  let s4 = 0;
  for (let i5 = 0; i5 < n5; i5++) s4 += lowArea((i5 + 0.5) / n5 * HOPPER.lowH) * (HOPPER.lowH / n5);
  return s4;
})();
var MID_TOTAL_CM3 = (HOPPER.topW + HOPPER.midBottomW) / 2 * HOPPER.depthCm * HOPPER.midH;
var TOP_TOTAL_CM3 = TOP_CM2 * HOPPER.topH;
function volumeBelow(depth) {
  const d3 = Math.max(0, depth);
  if (d3 <= HOPPER.topH) return MID_TOTAL_CM3 + LOW_TOTAL_CM3 + TOP_CM2 * (HOPPER.topH - d3);
  const y3 = d3 - HOPPER.topH;
  if (y3 <= HOPPER.midH) {
    const dw = HOPPER.topW - HOPPER.midBottomW;
    const k2 = dw / HOPPER.midH;
    return HOPPER.depthCm * (HOPPER.topW * (HOPPER.midH - y3) - k2 / 2 * (HOPPER.midH * HOPPER.midH - y3 * y3)) + LOW_TOTAL_CM3;
  }
  const z2 = y3 - HOPPER.midH;
  if (z2 >= HOPPER.lowH) return 0;
  const n5 = 300;
  let s4 = 0;
  for (let i5 = 0; i5 < n5; i5++) s4 += lowArea(z2 + (i5 + 0.5) / n5 * (HOPPER.lowH - z2)) * ((HOPPER.lowH - z2) / n5);
  return s4;
}
var DEAD_KG = (TOP_TOTAL_CM3 + MID_TOTAL_CM3 + LOW_TOTAL_CM3) / 1e3 * HOPPER.rho - HOPPER.capacityKg;
function kgAtDepth(depthCm) {
  return Math.min(HOPPER.capacityKg, Math.max(0, volumeBelow(depthCm) / 1e3 * HOPPER.rho - DEAD_KG));
}
function depthAtKg(kg) {
  const k2 = Math.min(HOPPER.capacityKg, Math.max(0, kg));
  let lo = 0;
  let hi = HOPPER_HEIGHT;
  for (let i5 = 0; i5 < 40; i5++) {
    const mid = (lo + hi) / 2;
    if (kgAtDepth(mid) > k2) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
function remainingKg(refKg, total, totalRef) {
  if (refKg === null || total === null || totalRef === null || totalRef <= 0) return null;
  const used = Math.max(0, total - totalRef);
  return Math.min(HOPPER.capacityKg, Math.max(0, refKg - used));
}
function daysLeft(kg, kgPerDay) {
  if (kg === null || kgPerDay === null || kgPerDay <= 0) return null;
  return kg / kgPerDay;
}
function afterBags(currentKg, bags, bagKg = HOPPER.bagKg) {
  return Math.min(HOPPER.capacityKg, Math.max(0, currentKg + bags * bagKg));
}
function hopperOutline() {
  return [
    [0, 0],
    [HOPPER.topW, 0],
    [HOPPER.topW, HOPPER.topH],
    [HOPPER.midBottomW, HOPPER.topH + HOPPER.midH],
    [HOPPER.lowBottomW, HOPPER_HEIGHT],
    [0, HOPPER_HEIGHT]
  ];
}
function levelColor(kg) {
  if (kg === null) return "#64748b";
  if (kg < 20) return "#ef4444";
  if (kg < 40) return "#f59e0b";
  return "#b7791f";
}

// src/hopper-svg.ts
function widthAt(depth) {
  const top = HOPPER.topH;
  const mid = HOPPER.topH + HOPPER.midH;
  if (depth <= top) return HOPPER.topW;
  if (depth <= mid) return HOPPER.topW + (HOPPER.midBottomW - HOPPER.topW) * (depth - top) / HOPPER.midH;
  return HOPPER.midBottomW + (HOPPER.lowBottomW - HOPPER.midBottomW) * (Math.min(depth, HOPPER_HEIGHT) - mid) / HOPPER.lowH;
}
function hopperShape(kg, clipId) {
  const pts = hopperOutline().map(([x2, y3]) => `${x2},${y3}`).join(" ");
  const depth = kg === null ? HOPPER_HEIGHT : depthAtKg(kg);
  const color = levelColor(kg);
  return w`
    <defs><clipPath id=${clipId}><rect x="-3" y=${depth} width=${HOPPER.topW + 6} height=${HOPPER_HEIGHT + 6 - depth} /></clipPath></defs>
    <polygon points=${pts} fill="rgba(8,10,14,0.55)" stroke="none" />
    ${kg === null ? w`` : w`<g clip-path=${`url(#${clipId})`}><polygon points=${pts} fill=${color} opacity="0.92" /></g>`}
    ${kg === null ? w`` : w`<line x1="0" x2=${widthAt(depth)} y1=${depth} y2=${depth} stroke="rgba(255,255,255,0.6)" stroke-width="1" />`}
    <polygon points=${pts} fill="none" stroke="rgba(226,232,240,0.9)" stroke-width="1.6" stroke-linejoin="round" />
  `;
}
function hopperSvg(kg, label) {
  const pts = hopperOutline().map(([x2, y3]) => `${x2},${y3}`).join(" ");
  const depth = kg === null ? HOPPER_HEIGHT : depthAtKg(kg);
  const color = levelColor(kg);
  return w`
    <svg class="hopper-svg" viewBox="-3 -3 ${HOPPER.topW + 6} ${HOPPER_HEIGHT + 6}" role="img" aria-label=${label}>
      <defs>
        <clipPath id="hp-clip"><rect x="-3" y=${depth} width=${HOPPER.topW + 6} height=${HOPPER_HEIGHT + 6 - depth} /></clipPath>
      </defs>
      <polygon points=${pts} fill="var(--card-background-color, #1f2937)" stroke="none" />
      ${kg === null ? w`` : w`<g clip-path="url(#hp-clip)"><polygon points=${pts} fill=${color} opacity="0.9" /></g>`}
      ${kg === null ? w`` : w`<line x1="0" x2=${widthAt(depth)} y1=${depth} y2=${depth} stroke="rgba(255,255,255,0.6)" stroke-width="1" />`}
      <polygon points=${pts} fill="none" stroke="var(--secondary-text-color, #94a3b8)" stroke-width="1.6" stroke-linejoin="round" />
    </svg>
  `;
}

// src/pellet-dialog.ts
var TAG5 = "impianto-pellet-dialog";
var fmt = (n5, d3 = 0) => n5.toFixed(d3).replace(".", ",");
var ImpiantoPelletDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.info = { kg: null, perDay: null, bagKg: HOPPER.bagKg };
    this._bags = 1;
    this._depth = "";
    this._done = "";
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
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  _step(dir) {
    this._bags = Math.max(0.5, Math.min(8, this._bags + dir * 0.5));
  }
  _addBags() {
    this.dispatchEvent(new CustomEvent("bags", { detail: this._bags }));
    this._done = `Aggiunti ${fmt(this._bags, this._bags % 1 ? 1 : 0)} ${this._bags === 1 ? "sacco" : "sacchi"}.`;
  }
  _setLevel() {
    const d3 = Number(this._depth.replace(",", "."));
    if (!Number.isFinite(d3) || d3 < 0 || d3 > 94) return;
    this.dispatchEvent(new CustomEvent("level", { detail: d3 }));
    this._done = `Livello impostato a ${fmt(d3, 1)} cm: ${fmt(kgAtDepth(d3))} kg.`;
    this._depth = "";
  }
  render() {
    const { kg, perDay, bagKg } = this.info;
    const days = kg !== null && perDay ? kg / perDay : null;
    const after = kg !== null ? afterBags(kg, this._bags, bagKg) : null;
    const d3 = Number(this._depth.replace(",", "."));
    const levelOk = this._depth.trim() !== "" && Number.isFinite(d3) && d3 >= 0 && d3 <= 94;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Pellet nel serbatoio">
          <div class="head">
            <div class="title">Pellet nel serbatoio</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="top">
              <div class="fig">${hopperSvg(kg, "Serbatoio del pellet")}</div>
              <div class="num">
                <div class="big">${kg === null ? "\u2013" : fmt(kg)}<span> kg</span></div>
                <div class="sub">${kg === null ? "quantit\xE0 non nota" : `${fmt(kg / HOPPER.capacityKg * 100)} % di ${HOPPER.capacityKg} kg (${HOPPER.capacityKg / bagKg} sacchi)`}</div>
                <div class="sub">${days === null ? "" : `circa ${fmt(days, days < 10 ? 1 : 0)} giorni al consumo di ${fmt(perDay ?? 0, 1)} kg al giorno`}</div>
              </div>
            </div>

            ${kg === null ? b2`<div class="hint warn">Il conteggio non è ancora impostato: parti dal livello misurato (qui sotto), poi potrai aggiungere i sacchi.</div>` : A}
            <div class="sec">Ho versato dei sacchi</div>
            <div class="row">
              <div class="stepper">
                <button class="st" aria-label="Meno" @click=${() => this._step(-1)}>−</button>
                <div class="sv">${fmt(this._bags, this._bags % 1 ? 1 : 0)}<span> ${this._bags === 1 ? "sacco" : "sacchi"} da ${bagKg} kg</span></div>
                <button class="st" aria-label="Più" @click=${() => this._step(1)}>+</button>
              </div>
              <button class="btn primary" ?disabled=${kg === null} @click=${() => this._addBags()}>Aggiungi</button>
            </div>
            <div class="hint">${after === null ? "" : `Dopo il carico: ${fmt(after)} kg${kg !== null && kg + this._bags * bagKg > HOPPER.capacityKg ? " (il serbatoio \xE8 pieno)" : ""}.`}</div>

            <div class="sec">Oppure ho misurato il livello</div>
            <div class="row">
              <label class="field">
                <span>Quota del pellet dalla sommità (cm)</span>
                <input type="text" inputmode="decimal" .value=${this._depth} placeholder="es. 7,5" @input=${(e5) => this._depth = e5.target.value} />
              </label>
              <button class="btn primary" ?disabled=${!levelOk} @click=${() => this._setLevel()}>Imposta</button>
            </div>
            <div class="hint">${levelOk ? `${fmt(d3, 1)} cm sono circa ${fmt(kgAtDepth(d3))} kg.` : "Misura dal bordo alto del serbatoio fino alla superficie del pellet, dopo averla livellata."}</div>

            ${this._done ? b2`<div class="done">${this._done}</div>` : A}
            <div class="note">Da qui in poi i chili rimasti diminuiscono con il consumo stimato dalla scheda. Aggiorna il conteggio ogni volta che riempi il serbatoio o misuri il livello.</div>
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
      max-width: 520px;
      max-height: min(92vh, 720px);
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
    .body {
      overflow-y: auto;
      padding: 12px 18px 18px;
    }
    .top {
      display: flex;
      gap: 18px;
      align-items: center;
    }
    .fig {
      flex: none;
      width: 84px;
    }
    .hopper-svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .big {
      font-size: 40px;
      font-weight: 700;
      line-height: 1.1;
    }
    .big span {
      font-size: 18px;
      font-weight: 500;
      color: var(--secondary-text-color, #727272);
    }
    .sub {
      font-size: 13.5px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .sec {
      margin: 18px 0 6px;
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary-color, #03a9f4);
    }
    .row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .stepper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .st {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 22px;
      cursor: pointer;
      padding: 0;
    }
    .sv {
      min-width: 130px;
      text-align: center;
      font-size: 22px;
      font-weight: 600;
    }
    .sv span {
      display: block;
      font-size: 12.5px;
      font-weight: 400;
      color: var(--secondary-text-color, #727272);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 160px;
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
    }
    input {
      min-height: 48px;
      font-size: 18px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      box-sizing: border-box;
    }
    .btn {
      min-height: 48px;
      padding: 8px 20px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border-color: transparent;
    }
    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .hint.warn {
      color: #f59e0b;
      font-weight: 600;
    }
    .hint {
      margin-top: 6px;
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
      min-height: 18px;
    }
    .done {
      margin-top: 14px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(34, 197, 94, 0.16);
      color: #22c55e;
      font-size: 14px;
      font-weight: 600;
    }
    .note {
      margin-top: 14px;
      font-size: 12.5px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoPelletDialog.prototype, "info", 2);
__decorateClass([
  r5()
], ImpiantoPelletDialog.prototype, "_bags", 2);
__decorateClass([
  r5()
], ImpiantoPelletDialog.prototype, "_depth", 2);
__decorateClass([
  r5()
], ImpiantoPelletDialog.prototype, "_done", 2);
if (!customElements.get(TAG5)) customElements.define(TAG5, ImpiantoPelletDialog);

// src/card-dialog.ts
var TAG6 = "impianto-card-dialog";
var ImpiantoCardDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.tag = "";
    this.config = {};
    this.label = "";
    this.wide = false;
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
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  _ensureCard() {
    if (!this._card) {
      const el = document.createElement(this.tag);
      el.setConfig({ type: `custom:${this.tag}`, ...this.config });
      this._card = el;
    }
    return this._card;
  }
  render() {
    const card = this._ensureCard();
    if (this.hass) card.hass = this.hass;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class=${this.wide ? "panel wide" : "panel"} role="dialog" aria-modal="true" aria-label=${this.label || this.tag}>
          <div class="bar"><button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button></div>
          <div class="body">${card}</div>
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
      position: relative;
      width: 100%;
      max-width: 620px;
      max-height: 94vh;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      background: var(--card-background-color, #fff);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    }
    .panel.wide {
      max-width: 940px;
    }
    .bar {
      display: flex;
      justify-content: flex-end;
      padding: 4px 8px 0;
    }
    .x {
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      border-radius: 50%;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoCardDialog.prototype, "hass", 2);
__decorateClass([
  n4()
], ImpiantoCardDialog.prototype, "tag", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoCardDialog.prototype, "config", 2);
__decorateClass([
  n4()
], ImpiantoCardDialog.prototype, "label", 2);
__decorateClass([
  n4({ type: Boolean })
], ImpiantoCardDialog.prototype, "wide", 2);
if (!customElements.get(TAG6)) customElements.define(TAG6, ImpiantoCardDialog);

// src/confirm-dialog.ts
var TAG7 = "impianto-confirm-dialog";
var ImpiantoConfirmDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.heading = "";
    this.lines = [];
    this.confirmLabel = "Conferma";
    this.cancelLabel = "Annulla";
    this.danger = false;
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
  }
  firstUpdated() {
    this.renderRoot.querySelector("button.cancel")?.focus();
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  _confirm() {
    this.dispatchEvent(new CustomEvent("confirmed"));
    this._close();
  }
  render() {
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="alertdialog" aria-modal="true" aria-label=${this.heading}>
          <div class="title">${this.heading}</div>
          ${this.lines.map((l3) => b2`<p>${l3}</p>`)}
          <div class="row">
            <button class="cancel" @click=${() => this._close()}>${this.cancelLabel}</button>
            <button class=${this.danger ? "ok danger" : "ok"} @click=${() => this._confirm()}>${this.confirmLabel}</button>
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
      z-index: 10001;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      width: 100%;
      max-width: 420px;
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      padding: 20px 20px 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    p {
      margin: 8px 0 0;
      font-size: 15px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
    .row {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    button {
      flex: 1;
      min-height: 52px;
      border-radius: 14px;
      font: inherit;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
    }
    .cancel {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
      color: inherit;
    }
    .ok {
      background: var(--primary-color, #03a9f4);
      border-color: transparent;
      color: var(--text-primary-color, #fff);
    }
    .ok.danger {
      background: #ef4444;
    }
    button:focus-visible {
      outline: 3px solid var(--primary-text-color, #212121);
      outline-offset: 2px;
    }
  `;
  }
};
__decorateClass([
  n4()
], ImpiantoConfirmDialog.prototype, "heading", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoConfirmDialog.prototype, "lines", 2);
__decorateClass([
  n4()
], ImpiantoConfirmDialog.prototype, "confirmLabel", 2);
__decorateClass([
  n4()
], ImpiantoConfirmDialog.prototype, "cancelLabel", 2);
__decorateClass([
  n4({ type: Boolean })
], ImpiantoConfirmDialog.prototype, "danger", 2);
if (!customElements.get(TAG7)) customElements.define(TAG7, ImpiantoConfirmDialog);

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
function fmt2(n5, decimals2 = 0) {
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
  if (estimated !== null) {
    value = estimated;
    source = "stimata";
  } else if (pumpOn === true && measured !== null) {
    value = measured;
    source = "misurata";
  }
  const caption = source === "misurata" ? "misurata (ingresso)" : source === "stimata" ? pumpOn === true ? "stimata \xB7 in marcia" : pumpOn === false ? "stimata \xB7 pompa ferma" : "stimata" : "non disponibile";
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
var STUFA_LABEL = {
  spenta: "Spenta",
  accensione: "Accensione",
  accesa: "In funzione",
  spegnimento: "Spegnimento",
  non_disponibile: "Non disponibile"
};
var STUFA_MODE_LABEL = {
  programma: "Programma attivo",
  manuale: "Manuale",
  fuori_programma: "Fuori programma",
  timer: "Timer"
};
function stufaKey(raw) {
  return raw === "spenta" || raw === "accensione" || raw === "accesa" || raw === "spegnimento" ? raw : "non_disponibile";
}
function stufaButton(switchOn, armed) {
  if (switchOn === null) return { label: "Interruttore non disponibile", sub: "", action: "none" };
  if (switchOn) return armed ? { label: "Conferma?", sub: "tocca ancora per spegnere", action: "off" } : { label: "Spegni la stufa", sub: "interruttore acceso", action: "off" };
  return armed ? { label: "Conferma?", sub: "tocca ancora per accendere", action: "on" } : { label: "Accendi la stufa", sub: "interruttore spento", action: "on" };
}
function sinceText(ms) {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return "";
  const min = Math.floor(ms / 6e4);
  if (min < 1) return "da meno di 1 min";
  if (min < 60) return `da ${min} min`;
  const h3 = Math.floor(min / 60);
  if (h3 < 24) return `da ${h3} h ${String(min % 60).padStart(2, "0")} min`;
  const d3 = Math.floor(h3 / 24);
  return `da ${d3} ${d3 === 1 ? "giorno" : "giorni"}`;
}

// src/summary-logic.ts
var RESTART_BELOW_SETPOINT = 4;
var OFF_STATES = ["OFF", "SPENTO", "STOP", "ARRESTO", "UNKNOWN", "UNAVAILABLE", ""];
function stoveLine(i5) {
  const raw = (i5.stoveState ?? "").trim().toUpperCase();
  const look = stoveLook(i5.stoveState);
  if (raw === "UNAVAILABLE" || raw === "UNKNOWN" || raw === "") {
    return {
      icon: "mdi:lan-disconnect",
      text: i5.pufferEstimated ? "Caldaia non raggiungibile: per il puffer uso la stima dalla sonda." : "Caldaia non raggiungibile.",
      tone: "warn"
    };
  }
  if (raw === "ECO STOP") {
    const dove = i5.setBoiler !== null ? ` Riparte quando il puffer scende a circa ${fmt2(i5.setBoiler - RESTART_BELOW_SETPOINT)} \xB0C${i5.puffer !== null ? ` (ora ${fmt2(i5.puffer)} \xB0C)` : ""}.` : "";
    return { icon: "mdi:pause-circle-outline", text: `Caldaia ferma in ECO STOP: l'acqua ha raggiunto la temperatura.${dove}`, tone: "info" };
  }
  if (look === "work")
    return {
      icon: "mdi:fire",
      text: `Caldaia in lavoro${i5.power !== null ? ` al ${fmt2(i5.power)} %` : ""}${i5.setWater !== null ? `: scalda l'acqua fino a ${fmt2(i5.setWater)} \xB0C, poi va in ECO STOP` : ""}.`,
      tone: "ok"
    };
  if (look === "start" || look === "wait")
    return { icon: "mdi:fire-circle", text: "Caldaia in accensione: servono circa 15 minuti prima che scaldi.", tone: "info" };
  if (look === "standby") return { icon: "mdi:sleep", text: "Caldaia in stand-by: aspetta una richiesta di calore.", tone: "info" };
  if (raw === "STOP" || look === "stopping")
    return { icon: "mdi:fire-off", text: "Caldaia in spegnimento.", tone: "info" };
  return { icon: "mdi:fire-off", text: "Caldaia spenta.", tone: "info" };
}
function whyOffLine(i5) {
  const raw = (i5.stoveState ?? "").trim().toUpperCase();
  if (!OFF_STATES.includes(raw) || raw === "UNAVAILABLE" || raw === "UNKNOWN" || raw === "") return null;
  if (i5.awayFlag) return { icon: "mdi:home-off", text: "\xC8 spenta perch\xE9 nessuno era in casa: riparte al rientro se c'\xE8 un programma attivo.", tone: "info" };
  if (i5.guardFlag)
    return { icon: "mdi:shield-check", text: "Ho annullato una partenza inutile: il boiler aveva gi\xE0 abbastanza docce e il termostato non chiedeva calore.", tone: "info" };
  if (i5.boostActive) return null;
  if (i5.cronoOn === false)
    return { icon: "mdi:palm-tree", text: "Cronotermostato disattivato (vacanza): non parte da sola.", tone: "info" };
  if (i5.cronoOn && i5.programActive === false)
    return { icon: "mdi:calendar-clock", text: "Fuori dalle fasce del cronotermostato: riparte al prossimo programma.", tone: "info" };
  if (i5.cronoOn && i5.programActive)
    return { icon: "mdi:calendar-check", text: "C'\xE8 un programma attivo: la caldaia dovrebbe partire da sola.", tone: "info" };
  return null;
}
function pumpLine(i5) {
  const p3 = i5.puffer !== null ? `${fmt2(i5.puffer)} \xB0C` : "\u2013";
  const b3 = i5.boilerTop !== null ? `${fmt2(i5.boilerTop)} \xB0C` : "\u2013";
  if (i5.integrationPump === "running")
    return { icon: "mdi:pump", text: `Pompa di integrazione accesa: porta il calore del puffer (${p3}) al boiler (${b3}).`, tone: "ok" };
  if (i5.integrationPump === "blocked")
    return { icon: "mdi:pump-off", text: `Pompa di integrazione ferma: il puffer (${p3}) non \xE8 abbastanza pi\xF9 caldo del boiler (${b3}).`, tone: "info" };
  return null;
}
function solarLine(i5) {
  if (i5.collectorPumpOn === true)
    return {
      icon: "mdi:solar-power",
      text: `Il solare sta scaldando il boiler${i5.collector !== null ? ` (collettore a ${fmt2(i5.collector)} \xB0C)` : ""}.`,
      tone: "ok"
    };
  if (i5.collectorPumpOn === false && i5.collector !== null)
    return { icon: "mdi:weather-sunny-off", text: `Il solare \xE8 fermo (collettore a ${fmt2(i5.collector)} \xB0C).`, tone: "info" };
  return null;
}
function sunLine(i5) {
  if (i5.sunElevation !== null && i5.sunElevation > 0 && i5.sunAboveHorizon === false) {
    const h3 = i5.horizonElev !== null ? ` (da quella parte il terreno arriva a ${fmt2(i5.horizonElev)}\xB0)` : "";
    return { icon: "mdi:image-filter-hdr", text: `Il sole \xE8 dietro le colline${h3}: niente luce diretta sul collettore.`, tone: "info" };
  }
  if (i5.allskyOk !== true || i5.sunFree === null || i5.allskyCloud === null) return null;
  const c4 = `${fmt2(i5.allskyCloud)} %`;
  if (i5.sunFree && i5.allskyCloud >= 50)
    return {
      icon: "mdi:weather-partly-cloudy",
      text: `Cielo molto nuvoloso (${c4}) ma il sole \xE8 libero: il collettore lavora con luce diretta. La temperatura esterna pu\xF2 calare lo stesso.`,
      tone: "ok"
    };
  if (i5.sunFree) return { icon: "mdi:white-balance-sunny", text: `Il sole \xE8 libero (nuvolosit\xE0 ${c4}).`, tone: "ok" };
  if (i5.allskyCloud < 30)
    return { icon: "mdi:weather-sunny-off", text: `Poche nuvole (${c4}), ma una copre il sole: il collettore rende meno.`, tone: "warn" };
  return { icon: "mdi:weather-cloudy", text: `Il sole \xE8 coperto (nuvolosit\xE0 ${c4}): il collettore riceve solo luce diffusa.`, tone: "info" };
}
function awayLine(i5) {
  if (i5.guests) return { icon: "mdi:account-multiple", text: "Modalit\xE0 ospiti: la caldaia non si spegne per assenza.", tone: "info" };
  if (i5.nobodyHome !== true) return null;
  const min = i5.nobodyHomeMinutes !== null ? Math.round(i5.nobodyHomeMinutes) : null;
  const da = min !== null ? ` da ${min} min` : "";
  if (i5.awayEnabled === false) return { icon: "mdi:home-off", text: `Nessuno in casa${da} (lo spegnimento per assenza \xE8 disattivato).`, tone: "info" };
  const raw = (i5.stoveState ?? "").trim().toUpperCase();
  const accesa = !OFF_STATES.includes(raw);
  if (accesa && min !== null && i5.awayMinutes !== null) {
    const left = Math.max(0, Math.round(i5.awayMinutes - min));
    return {
      icon: "mdi:home-off",
      text: left > 0 ? `Nessuno in casa${da}: la caldaia si spegne tra circa ${left} min.` : `Nessuno in casa${da}: sto per spegnere la caldaia.`,
      tone: "warn"
    };
  }
  return { icon: "mdi:home-off", text: `Nessuno in casa${da}.`, tone: "info" };
}
function summarize(i5) {
  const lines = [];
  const alarm = (i5.alarm ?? "").trim();
  if (alarm) lines.push({ icon: "mdi:alert-octagon", text: `Allarme della caldaia: ${alarm}.`, tone: "bad" });
  if (i5.pelletEmpty) lines.push({ icon: "mdi:grain", text: "Pellet esaurito: ricarica il serbatoio.", tone: "bad" });
  else if (i5.pelletReserve) lines.push({ icon: "mdi:grain", text: "Il pellet sta per finire.", tone: "warn" });
  lines.push(stoveLine(i5));
  for (const l3 of [whyOffLine(i5), pumpLine(i5), solarLine(i5), sunLine(i5), awayLine(i5)]) if (l3) lines.push(l3);
  if (i5.etaMinutes !== null) {
    lines.push(
      i5.etaMinutes > 0 ? { icon: "mdi:water-boiler", text: `L'acqua calda sar\xE0 pronta tra circa ${fmt2(i5.etaMinutes)} min.`, tone: "info" } : { icon: "mdi:water-boiler", text: "L'acqua calda \xE8 gi\xE0 a temperatura d'uso.", tone: "ok" }
    );
  }
  return lines;
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
  pellet_total: "sensor.caldaia_pellet_stimato_totale",
  pellet_ref_kg: "input_number.caldaia_pellet_kg_riferimento",
  pellet_ref_total: "input_number.caldaia_pellet_totale_riferimento",
  pellet_bag: "input_number.caldaia_pellet_sacco_kg",
  coil_solar_in: "sensor.solare_termico_solare_serpentina_ingresso",
  coil_solar_out: "sensor.solare_termico_solare_serpentina_uscita",
  coil_integ_in: "sensor.solare_termico_integrazione_serpentina_ingresso",
  coil_integ_out: "sensor.solare_termico_integrazione_serpentina_uscita",
  panel_max: "sensor.solare_pannello_massima_prevista",
  panel_max_today: "sensor.solare_pannello_massima_oggi",
  puffer_effective: "sensor.puffer_temperatura_effettiva",
  gti_station: "sensor.solare_termico_irraggiamento_sul_piano",
  gti_forecast: "sensor.open_meteo_irraggiamento_previsto_sul_piano",
  gti_satellite: "sensor.open_meteo_irraggiamento_osservato_dal_satellite",
  cloud_forecast: "sensor.open_meteo_nuvolosita",
  irr_station_raw: "sensor.esterno_e_garage_stazione_meteo_sqm_irraggiamento_solare_stimato",
  irr_station_corrected: "sensor.irraggiamento_stazione_corretto",
  allsky_irradiance: "sensor.allsky_irraggiamento_stimato",
  allsky_cloud: "sensor.allsky_copertura_equivalente",
  allsky_sun_free: "binary_sensor.allsky_sole_libero",
  allsky_analysis: "sensor.allsky_analisi",
  sun_above_horizon: "binary_sensor.sole_sopra_l_orizzonte",
  horizon_elevation: "sensor.sole_elevazione_orizzonte",
  sun: "sun.sun",
  crono_master: "switch.casale_cronotermostato_settimanale",
  program_active: "binary_sensor.caldaia_programma_attivo_ora",
  away: "binary_sensor.caldaia_nessuno_in_casa",
  away_enabled: "input_boolean.caldaia_assenza_attiva",
  away_flag: "input_boolean.caldaia_assenza_ha_spento",
  away_guests: "input_boolean.caldaia_assenza_ospiti",
  away_minutes: "input_number.caldaia_assenza_minuti"
};
var DEFAULT_MODEL_ENTITIES = {
  volume: "input_number.boiler_solare_volume",
  top_share: "input_number.boiler_solare_peso_alto",
  mains_temp: "input_number.boiler_solare_t_rete"
};
var FLAME_PATH = "M0,-100 C10,-70 45,-50 45,-15 C45,12 25,25 0,25 C-25,25 -45,12 -45,-15 C-45,-32 -35,-45 -25,-58 C-22,-40 -12,-32 -6,-34 C-14,-60 -8,-82 0,-100 Z";
var COIL_INTEGRATION = "M238 200 H398 M398 200 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238";
var COIL_SOLAR = "M238 560 H398 M398 560 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238 q-14 12 0 24 H398";
var COIL_INTEGRATION_SHORT = "M238 200 H398 M398 200 q14 12 0 24 H238";
var COIL_SOLAR_SHORT = "M238 512 H398 M398 512 q14 12 0 24 H238";
var SHORT_D1 = 48;
var SHORT_D2 = 72;
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
    this._wide = false;
    this._stufaCardKey = "";
    this._stufa = null;
    this._stufaLoadedAt = 0;
    this._stufaLoading = false;
    this._thermoKey = "";
  }
  connectedCallback() {
    super.connectedCallback();
    this._ro = new ResizeObserver((entries) => {
      const w2 = entries[0]?.contentRect.width ?? 1e3;
      const narrow = w2 < 560;
      if (narrow !== this._narrow) this._narrow = narrow;
      const wide = w2 >= 1150;
      if (wide !== this._wide) this._wide = wide;
    });
    this._ro.observe(this);
    void customElements.whenDefined("termostato-card").then(() => this.requestUpdate());
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
    if (changed.has("hass") && this._info) this._info.lines = this._summaryLines();
    if (changed.has("hass") && this._charts) this._charts.hass = this.hass;
    if (changed.has("hass") && this._details) this._details.groups = this._detailGroups();
    if (changed.has("hass") && this._thermo) this._thermo.hass = this.hass;
    if (changed.has("hass") && this._stufaDlg) this._stufaDlg.hass = this.hass;
    if (changed.has("hass") && this._scheduleDlg) this._scheduleDlg.hass = this.hass;
    if (changed.has("hass") && this._pelletDlg) this._pelletDlg.info = this._pelletInfo();
    if (this._config?.stufa && this.hass && !this._stufaLoading && Date.now() - this._stufaLoadedAt > 5 * 6e4) void this._loadStufa();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dialog?.remove();
    this._dialog = void 0;
    this._info?.remove();
    this._info = void 0;
    this._charts?.remove();
    this._charts = void 0;
    this._details?.remove();
    this._details = void 0;
    this._stufaDlg?.remove();
    this._stufaDlg = void 0;
    this._scheduleDlg?.remove();
    this._scheduleDlg = void 0;
    this._pelletDlg?.remove();
    this._pelletDlg = void 0;
    this._confirm?.remove();
    this._confirm = void 0;
    this._ro?.disconnect();
  }
  /** Finestra di conferma: il comando parte solo se la si conferma (un tocco inavvertito non accende niente). */
  _ask(heading, lines, confirmLabel, danger, onYes) {
    if (this._confirm) return;
    const d3 = document.createElement("impianto-confirm-dialog");
    d3.heading = heading;
    d3.lines = lines;
    d3.confirmLabel = confirmLabel;
    d3.danger = danger;
    d3.addEventListener("confirmed", onYes);
    d3.addEventListener("closed", () => {
      this._confirm = void 0;
    });
    document.body.appendChild(d3);
    this._confirm = d3;
  }
  /** Accensione rapida (o suo annullamento): chiede conferma in una finestra. */
  _press() {
    const model = boostButton(this._s(this._e.boost_state), false);
    if (model.action === "none") return;
    const script = model.action === "go" ? this._e.boost_start_script : this._e.boost_cancel_script;
    const run = () => void this.hass.callService("script", "turn_on", { entity_id: script });
    if (model.action === "go") {
      const eta = this.hass.states[this._e.eta] ? this._n(this._e.eta) : null;
      const lines = ["La caldaia si accende subito, anche fuori programma, e si spegne da sola quando l'acqua \xE8 calda."];
      if (eta !== null && eta > 0) lines.push(`Acqua calda stimata tra circa ${etaText(eta)}.`);
      this._ask("Avviare la caldaia?", lines, "Avvia", false, run);
    } else {
      this._ask("Spegnere la caldaia?", ["Annulla l'accensione rapida e spegne la caldaia."], "Spegni", true, run);
    }
  }
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("impianto-overview-card: configurazione non valida");
    this._config = config;
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
    const btn = boostButton(this._s(e5.boost_state), false);
    const short = this._config.layout === "split" && this._wide && !this._narrow;
    const d1 = short ? SHORT_D1 : 0;
    const d12 = short ? SHORT_D1 + SHORT_D2 : 0;
    const coilI = short ? COIL_INTEGRATION_SHORT : COIL_INTEGRATION;
    const coilS = short ? COIL_SOLAR_SHORT : COIL_SOLAR;
    const viewBox = this._narrow ? "0 0 640 840" : `0 0 700 ${840 - d12}`;
    const s2y = short ? 536 : 640;
    const kwy = short ? 616 : 728;
    const panIn = short ? "M598 440 H520 V512 H440" : "M598 500 H520 V560 H440";
    const panOut = short ? "M440 536 H548 V492 H598" : "M440 656 H548 V552 H598";
    return b2`
      <svg class=${this._narrow ? "boiler narrow" : "boiler"} viewBox=${viewBox} role="img" aria-label="Boiler solare">
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
        <path d="M420 ${745 - d12} H520 V${775 - d12}" class="pipe cold" />
        <g class="pufgroup">
          <path d="M440 208 H575" class="pipe hot thin" />
          <path d="M440 ${short ? 236 : 268} H520 V315 H575" class="pipe warm thin" />
          <path d="M685 215 H700" class="pipe hot thin" />
          <path d="M685 300 H700" class="pipe warm thin" />
          <text x="452" y="198" class="tv">${integIn !== null ? `${fmt2(integIn, 1)} \xB0C` : ""}</text>
          <text x="452" y=${short ? 228 : 260} class="tv">${integOut !== null ? `${fmt2(integOut, 1)} \xB0C` : ""}</text>
        </g>

        <!-- boiler -->
        <rect x="200" y="100" width="240" height=${660 - d12} rx="52" fill="url(#iso)" class="outline" />
        <rect x="222" y="122" width="196" height=${616 - d12} rx="38" fill="url(#acqua)" />
        <g class="coil">
          <path d=${coilI} stroke="#7c3aed" />
          <path d=${coilS} stroke="#15803d" />
        </g>
        ${pumpOn ? w`<path d=${coilI} class="coilflow" />` : A}
        ${collectorOn ? w`<path d=${coilS} class="coilflow" />` : A}
        <rect x="246" y="150" width="160" height="26" rx="13" class="pill" />
        <text x="326" y="168" class="s14 b" text-anchor="middle" fill="#a78bfa">Integrazione (caldaia)</text>
        ${integrationPill.key === "idle" ? A : w`<rect x="244" y=${284 - d1} width="164" height="22" rx="11" class="pill" /><circle cx="260" cy=${295 - d1} r="4.5" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"} class=${integrationPill.key === "blocked" ? "" : "pulse"} /><text x="336" y=${299.5 - d1} class="s13 b" text-anchor="middle" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"}>${integrationPill.label}</text>`}
        ${collectorOn ? w`<rect x="250" y=${676 - d12} width="152" height="22" rx="11" class="pill" /><circle cx="266" cy=${687 - d12} r="4.5" fill="#22c55e" class="pulse" /><text x="334" y=${691.5 - d12} class="s13 b" text-anchor="middle" fill="#22c55e">${collectorPill.label}</text>` : A}
        <rect x="266" y=${522 - d1} width="120" height="26" rx="13" class="pill" />
        <text x="326" y=${540 - d1} class="s14 b" text-anchor="middle" fill="#4ade80">Solare</text>
        <rect x="222" y="122" width="196" height=${616 - d12} rx="38" fill="url(#lucido)" />

        <!-- scheda centrale -->
        <rect x="236" y=${338 - d1} width="168" height="176" rx="22" class="pill big" />
        <text x="320" y=${372 - d1} class="t2 s14" text-anchor="middle">Uscita acqua calda</text>
        <text x="320" y=${434 - d1} class="t1 b" font-size="50" text-anchor="middle">${fmt2(outlet, 1)}<tspan font-size="24" dy="-16"> °C</tspan></text>
        <line x1="262" y1=${456 - d1} x2="378" y2=${456 - d1} class="sep" />
        <text x="320" y=${490 - d1} class="t1 b" font-size="22" text-anchor="middle">${showers === null ? "(\u2013)" : `(\u2248 ${showers} ${showers === 1 ? "doccia" : "docce"})`}</text>

        <!-- sonde -->
        <circle cx="222" cy="168" r="8" class="probe" />
        <line x1="214" y1="168" x2="150" y2="168" class="lead" />
        <rect x="14" y="132" width="136" height="72" rx="14" class="card hi" />
        <text x="82" y="156" class="t2 s14" text-anchor="middle">Alto (S3)</text>
        <text x="82" y="190" class="b" font-size="27" text-anchor="middle" fill="#ef4444">${fmt2(top, 1)} °C</text>

        <circle cx="222" cy=${676 - d12} r="8" class="probe" />
        <line x1="214" y1=${676 - d12} x2="150" y2=${676 - d12} class="lead" />
        <rect x="14" y=${s2y} width="136" height="72" rx="14" class="card lo" />
        <text x="82" y=${s2y + 24} class="t2 s14" text-anchor="middle">Basso (S2)</text>
        <text x="82" y=${s2y + 58} class="b" font-size="27" text-anchor="middle" fill="#3b82f6">${fmt2(bottom, 1)} °C</text>

        <!-- stima e pulsante -->
        <rect x="14" y="224" width="136" height="104" rx="14" class="card eta" />
        <text x="82" y="248" class="t2 s14" text-anchor="middle">Acqua pronta in</text>
        <text x="82" y="292" class="t1 b" font-size="34" text-anchor="middle">${etaText(eta)}</text>
        <text x="82" y="314" class="t2 s13" text-anchor="middle">${eta === 0 ? "gi\xE0 a temperatura" : eta === null ? "" : "stima media"}</text>
        <g class=${btn.action === "none" ? "btn off" : "btn"} role="button" tabindex=${btn.action === "none" ? "-1" : "0"}
          aria-label=${btn.label} @click=${() => this._press()} @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._press()}>
          <rect x="14" y="340" width="136" height="${btn.sub ? 78 : 64}" rx="14" class="btnbg" />
          <text x="82" y=${btn.sub ? 372 : 380} class="b" font-size="18" text-anchor="middle">${btn.label}</text>
          ${btn.sub ? w`<text x="82" y="396" class="s13" text-anchor="middle" opacity="0.85">${btn.sub}</text>` : A}
        </g>
        ${this._config.summary === false ? A : w`<g class="btn info" role="button" tabindex="0" aria-label="Stato dell'impianto" @click=${() => this._openInfo()}
              @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openInfo()}>
              <rect x="14" y=${(btn.sub ? 340 + 78 : 340 + 64) + 12} width="136" height="44" rx="14" class="infobg" />
              <circle cx="40" cy=${(btn.sub ? 340 + 78 : 340 + 64) + 34} r="10" class="infoc" />
              <text x="40" y=${(btn.sub ? 340 + 78 : 340 + 64) + 39} class="b" font-size="14" text-anchor="middle">i</text>
              <text x="92" y=${(btn.sub ? 340 + 78 : 340 + 64) + 40} class="b" font-size="17" text-anchor="middle">Stato</text>
            </g>`}
        ${this._config.charts === false ? A : w`<g class="btn info" role="button" tabindex="0" aria-label="Grafici" @click=${() => this._openCharts()}
              @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openCharts()}>
              <rect x="14" y=${(btn.sub ? 340 + 78 : 340 + 64) + 66} width="136" height="44" rx="14" class="infobg" />
              <polyline points="28,${(btn.sub ? 340 + 78 : 340 + 64) + 98} 35,${(btn.sub ? 340 + 78 : 340 + 64) + 88} 41,${(btn.sub ? 340 + 78 : 340 + 64) + 94} 51,${(btn.sub ? 340 + 78 : 340 + 64) + 80}" class="infoc" />
              <text x="102" y=${(btn.sub ? 340 + 78 : 340 + 64) + 94} class="b" font-size="17" text-anchor="middle">Grafici</text>
            </g>`}

        <!-- solare -->
        <rect x="14" y=${kwy} width="136" height="72" rx="14" class="card sun" />
        <text x="82" y=${kwy + 24} class="t2 s14" text-anchor="middle">Solare</text>
        <text x="82" y=${kwy + 58} class="b" font-size="24" text-anchor="middle" fill="#22c55e">${fmt2(solarKw, 1)} kW</text>

        <text x="532" y="80" class="b s14" fill="#ef4444">Acqua calda</text>
        <text x="532" y="98" class="t2 s13">verso utenze</text>
        <text x="532" y=${796 - d12} class="b s14" fill="#3b82f6">Acqua fredda</text>
        <text x="532" y=${814 - d12} class="t2 s13">dalla rete</text>

        <g class="pufgroup">${this._pufferShape(puffer, pufferEstimated)}</g>

        <!-- pannello solare e circuito del collettore -->
        <g class="pufgroup pannello">
          <path d=${panIn} class="pipe hot thin" />
          <path d=${panOut} class="pipe cold thin" />
          ${collectorOn ? w`<path d=${panIn} class="coilflow" /><path d=${panOut} class="coilflow" />` : A}
          <text x="448" y=${short ? 504 : 548} class="tv">${solarIn !== null ? `${fmt2(solarIn, 1)} \xB0C` : ""}</text>
          <text x="448" y=${short ? 528 : 644} class="tv">${solarOut !== null ? `${fmt2(solarOut, 1)} \xB0C` : ""}</text>
          <g transform=${short ? "translate(0 -60)" : "translate(0 0)"}>${this._panelShape(panel, panelFill)}</g>
        </g>
      </svg>
      ${this._narrow ? w`<svg class="boiler mini" viewBox="0 0 640 330" role="img" aria-label="Puffer e pannello solare">
            <g transform="translate(-480 -140)">${this._pufferShape(puffer, pufferEstimated)}</g>
            <text x="150" y="236" class="tv">${integIn !== null ? `\u2192 ${fmt2(integIn, 1)} \xB0C` : ""}</text>
            <text x="150" y="266" class="tv">${integOut !== null ? `\u2190 ${fmt2(integOut, 1)} \xB0C` : ""}</text>
            <g transform="translate(-160 -420)">${this._panelShape(panel, panelFill)}</g>
            <text x="470" y="318" class="tv" text-anchor="middle">${solarIn !== null ? `\u2192 ${fmt2(solarIn, 1)} \xB0C` : ""}   ${solarOut !== null ? `\u2190 ${fmt2(solarOut, 1)} \xB0C` : ""}</text>
          </svg>` : A}
    `;
  }
  /** Il puffer da 50 litri, con le coordinate del disegno largo (al centro x = 630). */
  _pufferShape(puffer, estimated = false) {
    return w`
      <text x="630" y="158" class="t1 b s15" text-anchor="middle">Puffer 50 L</text>
      <rect x="575" y="170" width="110" height="170" rx="26" fill="url(#puffer)" class="outline" />
      <rect x="587" y="224" width="86" height="64" rx="14" class="pill big" />
      <text x="630" y="${estimated ? 258 : 264}" class="t1 b val" text-anchor="middle">${fmt2(puffer, 0)} °C</text>
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
      <text x="630" y="618" class="t1 b val" text-anchor="middle">${panel.value === null ? "\u2013" : `${fmt2(panel.value, 0)} \xB0C`}</text>
      <text x="630" y="640" class="t2 s15" text-anchor="middle">${panel.caption}</text>
      ${panel.maxPredicted !== null ? w`<text x="630" y="668" class="b s15" text-anchor="middle" fill="#f59e0b">max prevista ${fmt2(panel.maxPredicted, 0)} °C</text>` : A}
      ${panel.maxToday !== null ? w`<text x="630" y="690" class="t2 s15" text-anchor="middle">raggiunta oggi ${fmt2(panel.maxToday, 0)} °C</text>` : A}`;
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
    const on2 = this._s(e5.guard) === "on";
    const flagged = this._s(e5.guard_flag) === "on";
    return b2`
      <button class="guard ${on2 ? "on" : "off"}" @click=${() => this._toggleGuard()} aria-pressed=${on2}>
        <span class="gtxt">
          <b>Evita partenze inutili</b>
          <small>${on2 ? flagged ? "ha annullato una partenza, resta in guardia" : "attiva: annulla le partenze se il boiler ha gi\xE0 abbastanza docce e il termostato non chiede calore" : "disattivata: i programmi partono sempre"}</small>
        </span>
        <span class="gsw"><i></i></span>
      </button>
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
    const work = this._n(e5.work_hours_today);
    const pellet = pelletStatus(this._yes(e5.pellet_reserve), this._yes(e5.pellet_empty), this._yes(e5.pellet_open));
    const inline = this._config.layout === "split" && this._pelletEnabled();
    return b2`
      <section class="stove">
        <div class="shead">
          <h3>Caldaia a pellet (Polygon)</h3>
          ${this._config.schedule === false ? A : b2`<button class="progbtn" @click=${() => this._openSchedule()} aria-label="Programmazione settimanale della caldaia">
                <ha-icon icon="mdi:calendar-clock"></ha-icon><span>Programma</span>
              </button>`}
        </div>
        <div class=${inline ? "top figure" : "top"}>
          ${inline ? this._renderPolygonFigure(look, pellet, { state: stateRaw ?? "\u2013", water: this._n(e5.stove_water), since }) : b2`${this._renderStoveImage(look, pellet)}
                <div class="statecard">
                  <span class="scp"><span class="tl">Stato caldaia</span><span class="statepill ${look}">${stateRaw ?? "\u2013"}</span></span>
                  <span class="scp"><span class="tl">Acqua caldaia</span><span class="water">${fmt2(this._n(e5.stove_water), 1)}<small> °C</small></span></span>
                  <span class="scp"><span class="tl">Ultimo cambio stato</span><span class="since">${since ? `alle ${since}` : "\u2013"}</span></span>
                  <span class="scp"><span class="tl">Pellet</span><span class="pelletpill ${pellet.key}">${pellet.label}</span></span>
                </div>`}
        </div>
        ${noAlarm ? A : b2`<div class="alarmbar" role="alert"><b>Allarme</b><span>${alarmRaw}</span></div>`}
        <div class="tiles">
          ${this._tile("Puffer 50 L", `${fmt2(this._n(this.hass.states[e5.puffer_effective] ? e5.puffer_effective : e5.puffer), 1)} \xB0C${this.hass.states[e5.puffer_effective]?.attributes?.fonte === "sonda ingresso" ? " (stima)" : ""}`, "#f59e0b")}
          ${this._tile("Set boiler", `${fmt2(this._n(e5.set_boiler), 0)} \xB0C`)}
          ${this._tile("Set acqua", `${fmt2(this._n(e5.set_water), 0)} \xB0C`)}
          ${this._tile("Potenza reale", `${fmt2(this._n(e5.power), 0)} %`)}
        </div>
        <div class="counters">
          <span class="tl">Oggi</span>
          <div>
            <b>${fmt2(this._n(e5.starts_today), 0)} accensioni</b>
            <b>${fmt2(work, 1)} h in lavoro</b>
            <b>${fmt2(this._n(e5.standby_today), 0)} stand-by</b>
          </div>
          <button class="more" @click=${() => this._openDetails()} aria-label="Altri dati della caldaia">Altri dati ▸</button>
        </div>
        <div class="chips">
          ${this._chip("Richiesta ACS", this._yes(e5.request_acs))} ${this._chip("Riscaldamento", this._yes(e5.request_heating))}
          ${this._chip("Consenso suggerito", this._yes(e5.consent))}
        </div>
        ${this._renderGuard()}
        <p class="look">${LOOK_LABEL[look]}</p>
      </section>
    `;
  }
  /** Tutti i valori che non stanno nella colonna principale della caldaia. */
  _detailGroups() {
    const e5 = this._e;
    const pump = this._s(e5.pump);
    const pumpOn = pump !== void 0 && pump !== "OFF" && pump !== "unknown" && pump !== "unavailable";
    const alarmRaw = (this._s(e5.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown";
    const groups = [
      {
        title: "Combustione",
        tiles: [
          { label: "Fumi", value: `${fmt2(this._n(e5.smoke), 0)} \xB0C` },
          { label: "Fiamma", value: `${fmt2(this._n(e5.flame), 0)} \xB0C` },
          { label: "Estrattore fumi", value: `${fmt2(this._n(e5.extractor), 0)} giri` },
          { label: "Pressione braciere", value: fmt2(this._n(e5.brazier_pressure), 1) }
        ]
      },
      {
        title: "Acqua e circolatore",
        tiles: [
          { label: "Pressione acqua", value: `${fmt2(this._n(e5.water_pressure), 1)} bar` },
          { label: "Circolatore", value: pump === void 0 ? "\u2013" : pumpOn ? "ON" : "OFF", color: pumpOn ? "#22c55e" : void 0 },
          { label: "Accensioni ieri", value: fmt2(this._n(e5.starts_yesterday), 0) },
          { label: "Allarme", value: noAlarm ? "nessuno" : alarmRaw, color: noAlarm ? "#22c55e" : "#ef4444" }
        ]
      }
    ];
    if ([e5.pellet_today, e5.pellet_week, e5.pellet_month].some((id) => this.hass.states[id])) {
      groups.push({
        title: "Pellet (stima dal modello di consumo)",
        tiles: [
          { label: "Oggi", value: `${fmt2(this._n(e5.pellet_today), 1)} kg` },
          { label: "Settimana", value: `${fmt2(this._n(e5.pellet_week), 1)} kg` },
          { label: "Mese", value: `${fmt2(this._n(e5.pellet_month), 0)} kg` }
        ]
      });
    }
    return groups;
  }
  /** Apre la finestra "Altri dati" (si aggiunge alla pagina, come le altre). */
  _openDetails() {
    if (this._details) return;
    const d3 = document.createElement("impianto-details-dialog");
    d3.groups = this._detailGroups();
    d3.addEventListener("closed", () => {
      this._details = void 0;
    });
    document.body.appendChild(d3);
    this._details = d3;
  }
  /** Il termostato ambiente (integrazione termostato_riscaldamento): sotto la caldaia, solo se è installato. */
  _renderThermostat() {
    const opt = this._config.thermostat;
    if (opt === false || !customElements.get("termostato-card")) return A;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const key = JSON.stringify(cfg);
    if (!this._thermo || this._thermoKey !== key) {
      const el = document.createElement("termostato-card");
      el.setConfig({ type: "custom:termostato-card", embedded: true, ...cfg.entry_id ? { entry_id: cfg.entry_id } : {}, ...cfg.title ? { title: cfg.title } : {} });
      this._thermo = el;
      this._thermoKey = key;
    }
    this._thermo.hass = this.hass;
    return b2`<div class="thermo">${this._thermo}</div>`;
  }
  /** Le righe della finestra "Stato": poche frasi sul momento dell'impianto. */
  _summaryLines() {
    const e5 = this._e;
    const alarmRaw = (this._s(e5.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown" || alarmRaw.toLowerCase() === "unavailable";
    const pufferId = this.hass.states[e5.puffer_effective] ? e5.puffer_effective : e5.puffer;
    const awaySince = this.hass.states[e5.away]?.last_changed;
    const pill = integrationPumpPill(
      this._yes(e5.integration_pump),
      this._yes(e5.integration_call),
      this._yes(e5.integration_block_enabled),
      this._yes(e5.integration_block_wanted),
      this._n(e5.integration_power)
    );
    const eta = this.hass.states[e5.eta] ? this._n(e5.eta) : null;
    return summarize({
      stoveState: this._s(e5.stove_state),
      alarm: noAlarm ? null : alarmRaw,
      power: this._n(e5.power),
      setWater: this._n(e5.set_water),
      setBoiler: this._n(e5.set_boiler),
      puffer: this._n(pufferId),
      pufferEstimated: this.hass.states[pufferId]?.attributes?.fonte === "sonda ingresso",
      boilerTop: this._n(e5.boiler_top),
      collector: this._n(e5.collector_temp),
      integrationPump: pill.key,
      collectorPumpOn: this._yes(e5.collector_pump),
      etaMinutes: eta,
      cronoOn: this._yes(e5.crono_master),
      programActive: this._yes(e5.program_active),
      guardFlag: this._yes(e5.guard_flag),
      boostActive: this._s(e5.boost_state) === "attiva",
      nobodyHome: this._yes(e5.away),
      nobodyHomeMinutes: awaySince ? Math.max(0, (Date.now() - new Date(awaySince).getTime()) / 6e4) : null,
      awayEnabled: this._yes(e5.away_enabled),
      awayFlag: this._yes(e5.away_flag),
      guests: this._yes(e5.away_guests),
      awayMinutes: this._n(e5.away_minutes),
      pelletEmpty: this._yes(e5.pellet_empty),
      pelletReserve: this._yes(e5.pellet_reserve),
      allskyOk: this.hass.states[e5.allsky_analysis]?.attributes?.ok === true ? true : this.hass.states[e5.allsky_analysis] ? false : null,
      sunFree: this._yes(e5.allsky_sun_free),
      allskyCloud: this._n(e5.allsky_cloud),
      sunAboveHorizon: this._yes(e5.sun_above_horizon),
      horizonElev: this._n(e5.horizon_elevation),
      sunElevation: toNumber(String(this.hass.states[e5.sun]?.attributes?.elevation ?? ""))
    });
  }
  /** Apre la finestra "Grafici" (storico dei valori principali). */
  _openCharts() {
    if (this._charts) return;
    const d3 = document.createElement("impianto-charts-dialog");
    d3.hass = this.hass;
    d3.entities = this._e;
    d3.addEventListener("closed", () => {
      this._charts = void 0;
    });
    document.body.appendChild(d3);
    this._charts = d3;
  }
  /** Apre la finestra "Stato" (si aggiunge alla pagina, come quella delle preferenze). */
  _openInfo() {
    if (this._info) return;
    const d3 = document.createElement("impianto-info-dialog");
    d3.lines = this._summaryLines();
    d3.addEventListener("closed", () => {
      this._info = void 0;
    });
    document.body.appendChild(d3);
    this._info = d3;
  }
  // ---- pellet nel serbatoio: chili del riferimento meno il consumo stimato da allora --------------------------------
  /** Il conteggio del serbatoio c'e' solo con i due valori di riferimento e il totale stimato. */
  _pelletEnabled() {
    const e5 = this._e;
    return !!(this.hass.states[e5.pellet_ref_kg] && this.hass.states[e5.pellet_ref_total] && this.hass.states[e5.pellet_total]);
  }
  _pelletKg() {
    const e5 = this._e;
    if (!this._pelletEnabled()) return null;
    return remainingKg(this._n(e5.pellet_ref_kg), this._n(e5.pellet_total), this._n(e5.pellet_ref_total));
  }
  /** Consumo medio al giorno: la stima della settimana divisa per 7, non meno di 2 kg (i primi giorni la settimana e' incompleta). */
  _pelletPerDay() {
    const w2 = this._n(this._e.pellet_week);
    return w2 !== null && w2 / 7 >= 2 ? w2 / 7 : 6;
  }
  _pelletInfo() {
    return { kg: this._pelletKg(), perDay: this._pelletPerDay(), bagKg: this._n(this._e.pellet_bag) ?? HOPPER.bagKg };
  }
  /** Scrive il nuovo riferimento: i chili che ci sono adesso e il totale stimato di adesso. */
  async _pelletSetReference(kg) {
    const e5 = this._e;
    const total = this._n(e5.pellet_total);
    if (total === null) return;
    const refMax = Number(this.hass.states[e5.pellet_ref_kg]?.attributes?.max ?? 130);
    await Promise.all([
      this.hass.callService("input_number", "set_value", { entity_id: e5.pellet_ref_kg, value: Math.round(Math.min(refMax, kg) * 10) / 10 }),
      this.hass.callService("input_number", "set_value", { entity_id: e5.pellet_ref_total, value: Math.round(total * 100) / 100 })
    ]);
  }
  _openPellet() {
    if (this._pelletDlg || !this._pelletEnabled()) return;
    const d3 = document.createElement("impianto-pellet-dialog");
    d3.info = this._pelletInfo();
    d3.addEventListener("bags", (ev) => {
      const kg = this._pelletKg();
      const bag = this._pelletInfo().bagKg;
      if (kg !== null) void this._pelletSetReference(afterBags(kg, ev.detail, bag));
    });
    d3.addEventListener("level", (ev) => void this._pelletSetReference(kgAtDepth(ev.detail)));
    d3.addEventListener("closed", () => {
      this._pelletDlg = void 0;
    });
    document.body.appendChild(d3);
    this._pelletDlg = d3;
  }
  /**
   * Layout split: la caldaia Polygon come nella foto (armadio del serbatoio a sinistra, corpo della caldaia a destra).
   * Nell'armadio il serbatoio del pellet riempito fino ai chili rimasti (si tocca per aggiornare il conteggio); nel corpo la
   * finestra con la fiamma, in alto l'ultimo cambio di stato, in basso lo stato e la temperatura dell'acqua.
   */
  _renderPolygonFigure(look, pellet, d3) {
    const kg = this._pelletKg();
    const days = daysLeft(kg, this._pelletPerDay());
    const glow = look === "work" ? 0.55 : look === "start" ? 0.3 : 0;
    const flame = look === "work" ? this._flame(272, 156, 0.82) : look === "start" ? this._flame(272, 156, 0.32) : look === "stopping" ? this._flame(272, 156, 0.18, 0.55) : A;
    const pelletFill = HOPPER_FILL[pellet.key];
    const stateFont = d3.state.length > 5 ? 10.5 : 14;
    return b2`
      <svg class="polyfig ${look}" viewBox="0 0 360 262" role="img" aria-label="Caldaia a pellet Polygon">
        <defs>
          <linearGradient id="pf-corpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2b31" /><stop offset="0.6" stop-color="#1c1c21" /><stop offset="1" stop-color="#141418" /></linearGradient>
          <linearGradient id="pf-armadio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#26262b" /><stop offset="1" stop-color="#1a1a1f" /></linearGradient>
          <linearGradient id="pf-vetro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05080f" /><stop offset="1" stop-color="#1e293b" /></linearGradient>
          <radialGradient id="pf-bagliore" cx="0.5" cy="0.9" r="0.7"><stop offset="0" stop-color="#f97316" stop-opacity=${glow} /><stop offset="1" stop-color="#f97316" stop-opacity="0" /></radialGradient>
          <linearGradient id="fiamma" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f59e0b" /><stop offset="0.55" stop-color="#f97316" /><stop offset="1" stop-color="#dc2626" /></linearGradient>
        </defs>
        <!-- corpo della caldaia (a destra, piu' alto) -->
        <rect x="196" y="6" width="152" height="224" rx="5" fill="url(#pf-corpo)" stroke="#3b3b44" stroke-width="1.5" />
        <rect x="206" y="14" width="132" height="22" rx="11" fill="#334155" />
        <text x="272" y="29.5" font-size="11.5" font-weight="700" text-anchor="middle" fill="#e2e8f0">${d3.since ? `ultimo cambio ${d3.since}` : "ultimo cambio \u2013"}</text>
        <rect x="212" y="48" width="120" height="126" rx="10" fill="url(#pf-vetro)" stroke="#94a3b8" stroke-width="2.5" />
        <rect x="212" y="48" width="120" height="126" rx="10" fill="url(#pf-bagliore)" />
        <g class="flicker">${flame}</g>
        <rect class="sp ${look}" x="206" y="188" width="62" height="28" rx="14" />
        <text class="spt ${look}" x="237" y="207" font-size=${stateFont} font-weight="700" text-anchor="middle">${d3.state}</text>
        <text x="342" y="208" font-size="19" font-weight="700" text-anchor="end" fill="#f1f5f9">${fmt2(d3.water, 1)}<tspan font-size="11" font-weight="500" fill="#94a3b8"> °C</tspan></text>
        <!-- armadio del serbatoio (a sinistra) -->
        <g class="cabinet" role="button" tabindex="0" aria-label="Pellet nel serbatoio: aggiorna il conteggio" @click=${() => this._openPellet()} @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openPellet()}>
          <rect x="10" y="56" width="178" height="174" rx="4" fill="url(#pf-armadio)" stroke="#3b3b44" stroke-width="1.5" />
          <rect x="10" y="56" width="178" height="9" rx="3" fill="#0f0f13" />
          <polygon points="22,72 96,72 60,120" fill="rgba(148,163,184,0.07)" /><polygon points="96,72 176,72 140,128 60,120" fill="rgba(148,163,184,0.04)" />
          <polygon points="22,72 60,120 28,176" fill="rgba(148,163,184,0.05)" /><polygon points="60,120 140,128 100,190 28,176" fill="rgba(148,163,184,0.08)" />
          <polygon points="140,128 176,72 176,180 100,190" fill="rgba(148,163,184,0.05)" /><polygon points="28,176 100,190 70,222 24,222" fill="rgba(148,163,184,0.06)" />
          <g transform="translate(26 74) scale(1.46)">${hopperShape(kg, "pf-clip")}</g>
          <text x="124" y="124" font-size="28" font-weight="700" fill="#f1f5f9">${kg === null ? "\u2013" : fmt2(kg, 0)}<tspan font-size="13" font-weight="500" fill="#94a3b8"> kg</tspan></text>
          <text x="124" y="146" font-size="13" fill="#94a3b8">${days === null ? "" : `${days < 10 ? fmt2(days, 1) : fmt2(days, 0)} giorni`}</text>
          <text x="124" y="166" font-size="10.5" fill="#94a3b8">pellet</text>
          <rect x="124" y="171" width="58" height="20" rx="10" fill=${pelletFill} />
          <text x="153" y="185.5" font-size="11" font-weight="700" text-anchor="middle" fill="#ffffff">${pellet.label}</text>
        </g>
        <rect x="14" y="230" width="22" height="8" rx="2" fill="#0f0f13" /><rect x="320" y="230" width="22" height="8" rx="2" fill="#0f0f13" />
      </svg>
    `;
  }
  /** Legge dall'integrazione stufa_pellet gli id delle entità; se non c'è la sintesi non compare. */
  async _loadStufa() {
    this._stufaLoading = true;
    try {
      const opt = this._config.stufa;
      const cfg = typeof opt === "object" && opt !== null ? opt : {};
      const msg = { type: "stufa_pellet/info", ...cfg.entry_id ? { entry_id: cfg.entry_id } : {} };
      const info = await this.hass.callWS(msg);
      this._stufa = info && info.entities && info.sources ? info : null;
    } catch {
      this._stufa = null;
    } finally {
      this._stufaLoadedAt = Date.now();
      this._stufaLoading = false;
    }
  }
  /** Accensione o spegnimento della stufa: chiede conferma in una finestra e poi comanda l'interruttore. */
  _stufaPress() {
    const sw = this._stufa?.sources.switch;
    if (!sw) return;
    const on2 = this.hass.states[sw]?.state === "on" ? true : this.hass.states[sw]?.state === "off" ? false : null;
    const btn = stufaButton(on2, false);
    if (btn.action === "none") return;
    const run = () => void this.hass.callService("homeassistant", btn.action === "on" ? "turn_on" : "turn_off", { entity_id: sw });
    if (btn.action === "on") this._ask("Accendere la stufa?", ["Chiude l'interruttore: la stufa a pellet si accende e parte la sua sequenza di accensione."], "Accendi", false, run);
    else this._ask("Spegnere la stufa?", ["Apre l'interruttore: la stufa a pellet inizia lo spegnimento."], "Spegni", true, run);
  }
  /** Popup con la programmazione settimanale della caldaia (caldaia-schedule-card), senza passare da altri pop-up della dashboard. */
  _openSchedule() {
    if (this._scheduleDlg) return;
    const opt = this._config.schedule;
    const d3 = document.createElement("impianto-card-dialog");
    d3.hass = this.hass;
    d3.tag = "caldaia-schedule-card";
    d3.label = "Programmazione caldaia";
    d3.wide = true;
    d3.config = typeof opt === "object" && opt !== null ? opt : {};
    d3.addEventListener("closed", () => {
      this._scheduleDlg = void 0;
    });
    document.body.appendChild(d3);
    this._scheduleDlg = d3;
  }
  /** Popup con la scheda completa della stufa (stufa-pellet-card, dell'integrazione stufa_pellet). */
  _openStufa() {
    if (this._stufaDlg || !customElements.get("stufa-pellet-card")) return;
    const opt = this._config.stufa;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const d3 = document.createElement("impianto-card-dialog");
    d3.hass = this.hass;
    d3.tag = "stufa-pellet-card";
    d3.label = "Stufa a pellet";
    d3.config = { ...cfg.entry_id ? { entry_id: cfg.entry_id } : {}, ...cfg.title ? { title: cfg.title } : {} };
    d3.addEventListener("closed", () => {
      this._stufaDlg = void 0;
    });
    document.body.appendChild(d3);
    this._stufaDlg = d3;
  }
  /** Sintesi della stufa a pellet: stato, modo, potenza, accensione manuale e pulsante della scheda completa. */
  /** Layout split: la scheda completa della stufa (stufa-pellet-card) incorporata, senza pulsante e popup. */
  _stufaEmbedded() {
    if (!customElements.get("stufa-pellet-card")) return A;
    const opt = this._config.stufa;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const key = JSON.stringify(cfg);
    if (!this._stufaCard || this._stufaCardKey !== key) {
      const el = document.createElement("stufa-pellet-card");
      el.setConfig({ type: "custom:stufa-pellet-card", ...cfg.entry_id ? { entry_id: cfg.entry_id } : {}, ...cfg.title ? { title: cfg.title } : {} });
      this._stufaCard = el;
      this._stufaCardKey = key;
    }
    this._stufaCard.hass = this.hass;
    return b2`<div class="stufafull">${this._stufaCard}</div>`;
  }
  _renderStufa() {
    if (this._config.stufa && this._config.layout === "split") return this._stufaEmbedded();
    const info = this._stufa;
    if (!this._config.stufa || !info) return A;
    const st = info.entities.stato ? this.hass.states[info.entities.stato] : void 0;
    const key = stufaKey(st?.state);
    const attrs = st?.attributes ?? {};
    const power = toNumber(String(attrs.potenza ?? "")) ?? toNumber(this.hass.states[info.sources.power_sensor]?.state);
    const sinceRaw = attrs.da;
    const since = sinceRaw && key !== "non_disponibile" ? sinceText(Date.now() - Date.parse(sinceRaw)) : "";
    const modeRaw = info.entities.modo ? this.hass.states[info.entities.modo]?.state : void 0;
    const sw = info.sources.switch;
    const swRaw = sw ? this.hass.states[sw]?.state : void 0;
    const btn = stufaButton(swRaw === "on" ? true : swRaw === "off" ? false : null, false);
    const cls = btn.action === "none" ? "sbtn off" : swRaw === "on" ? "sbtn stop" : "sbtn";
    return b2`
      <section class="stufa">
        <h3>${typeof this._config.stufa === "object" && this._config.stufa.title || info.title || "Stufa a pellet"}</h3>
        <div class="mid">
          <div class="sumstate">
            <span class="statepill st-${key}">${STUFA_LABEL[key]}</span>
            <span class="since">${since}</span>
          </div>
          ${modeRaw && STUFA_MODE_LABEL[modeRaw] ? b2`<div class="sumrow"><span class="tl">Modo</span><b>${STUFA_MODE_LABEL[modeRaw]}</b></div>` : A}
          <div class="sumrow"><span class="tl">Potenza</span><b>${power === null ? "\u2013" : `${fmt2(power, power % 1 ? 1 : 0)} W`}</b></div>
        </div>
        ${sw ? b2`<button class=${cls} ?disabled=${btn.action === "none"} @click=${() => this._stufaPress()}>
              <span>${btn.label}</span>${btn.sub ? b2`<small>${btn.sub}</small>` : A}
            </button>` : A}
        ${customElements.get("stufa-pellet-card") ? b2`<button class="more full" @click=${() => this._openStufa()} aria-label="Apri la scheda completa della stufa">Scheda completa ▸</button>` : A}
      </section>
    `;
  }
  render() {
    if (!this._config || !this.hass) return A;
    const thermo = this._renderThermostat();
    const stufa = this._renderStufa();
    const split = this._config.layout === "split";
    const head = b2`
      ${this._config.settings === false ? A : b2`<button class="gear" title="Preferenze impianto" aria-label="Preferenze impianto" @click=${() => this._openSettings()}>
            <ha-icon icon="mdi:cog-outline"></ha-icon>
          </button>`}
      ${this._config.title ? b2`<div class="ctitle">${this._config.title}</div>` : A}
    `;
    if (split) {
      return b2`
        <ha-card>
          ${head}
          <div class="layout split">
            <div class="splitleft">
              ${this._renderBoiler()}
              ${thermo === A ? A : b2`<div class="splitthermo">${thermo}</div>`}
            </div>
            <div class=${this._config.stufa && customElements.get("stufa-pellet-card") ? "splitcols duo" : "splitcols"}>${this._renderStove()}${stufa}</div>
          </div>
        </ha-card>
      `;
    }
    return b2`
      <ha-card>
        ${head}
        <div class="layout">${this._renderBoiler()}<div class="rightcol">${stufa === A ? this._renderStove() : b2`<div class="stoverow">${this._renderStove()}${stufa}</div>`}${thermo}</div></div>
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
    .btn.info .infobg {
      fill: var(--secondary-background-color);
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .btn.info:hover .infobg {
      stroke: var(--primary-color);
    }
    .btn.info text {
      fill: var(--primary-text-color);
    }
    .btn.info .infoc {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 2;
    }
    .btn.info text:nth-of-type(1) {
      fill: var(--primary-color);
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
      /* le regole di larghezza (tessere su due colonne) guardano la scheda della caldaia, non l'intera scheda */
      container-type: inline-size;
    }
    .stove h3 {
      margin: 0;
      font-size: 17px;
    }
    .shead {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0 0 12px;
    }
    .shead:has(.progbtn) {
      justify-content: space-between;
    }
    /* pulsante alto 36 px senza alzare la riga del titolo */
    .progbtn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex: none;
      min-height: 36px;
      margin: -10px 0;
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .progbtn ha-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-color, #03a9f4);
    }
    .progbtn:hover {
      border-color: var(--primary-color, #03a9f4);
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
    .rightcol {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }
    /* prova: layout "split" (boiler piu' corto con il termostato sotto, caldaia e stufa una sopra l'altra) */
    .layout.split {
      grid-template-columns: 1fr;
    }
    .splitleft {
      display: contents;
    }
    .layout.split > .splitleft > svg {
      order: 1;
    }
    .splitcols {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
      order: 2;
    }
    .splitthermo {
      min-width: 0;
      order: 3;
    }
    .stufafull {
      min-width: 0;
    }
    @container (min-width: 1150px) {
      .layout.split {
        grid-template-columns: minmax(440px, 5fr) minmax(0, 8fr);
        align-items: start;
      }
      .splitleft {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
      }
      .layout.split > .splitleft > svg {
        order: 0;
      }
      /* con la scheda completa della stufa: caldaia e stufa affiancate, della stessa larghezza */
      .splitcols.duo {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: start;
      }
      .splitthermo {
        order: 1;
      }
      .splitcols {
        order: 0;
      }
      /* la stufa, una sotto la caldaia: bassa e larga, con stato e dati a sinistra e i due pulsanti a destra */
      .layout.split .stufa {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        grid-template-areas:
          "titolo titolo"
          "dati accendi"
          "dati scheda";
        gap: 8px 14px;
        align-items: center;
      }
      .layout.split .stufa h3 {
        grid-area: titolo;
      }
      .layout.split .stufa .mid {
        grid-area: dati;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 10px;
        align-items: center;
      }
      .layout.split .stufa .mid .sumstate {
        grid-row: span 2;
      }
      .layout.split .stufa .sbtn {
        grid-area: accendi;
      }
      .layout.split .stufa .more.full {
        grid-area: scheda;
      }
      .layout.split svg.boiler {
        margin: 0 auto;
      }
    }
    /* le coppie etichetta/valore dello stato: nel layout normale restano figli diretti della griglia */
    .scp {
      display: contents;
    }
    /* figura Polygon del layout split */
    .top.figure {
      display: block;
    }
    .polyfig {
      display: block;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      height: auto;
    }
    .polyfig .cabinet {
      cursor: pointer;
      outline: none;
    }
    .polyfig .cabinet:hover rect:first-child,
    .polyfig .cabinet:focus-visible rect:first-child {
      stroke: var(--primary-color, #03a9f4);
    }
    .polyfig .flicker {
      transform-origin: 272px 156px;
    }
    .polyfig.work .flicker,
    .polyfig.start .flicker {
      animation: flicker 1.6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .polyfig .flicker {
        animation: none !important;
      }
    }
    .sp {
      fill: rgba(148, 163, 184, 0.28);
    }
    .sp.work {
      fill: rgba(34, 197, 94, 0.28);
    }
    .sp.start,
    .sp.wait {
      fill: rgba(245, 158, 11, 0.3);
    }
    .sp.stopping {
      fill: rgba(96, 165, 250, 0.3);
    }
    .spt {
      fill: #cbd5e1;
    }
    .spt.work {
      fill: #4ade80;
    }
    .spt.start,
    .spt.wait {
      fill: #fbbf24;
    }
    .spt.stopping {
      fill: #93c5fd;
    }
    /* prova: sintesi della stufa a pellet a destra della scheda della caldaia (sotto 1150 px una sopra l'altra) */
    .stoverow {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }
    @container (min-width: 1150px) {
      .stoverow {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 164px;
        align-items: stretch;
      }
    }
    .stufa {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      padding: 14px;
    }
    .stufa h3 {
      margin: 0;
      text-align: center;
      font-size: 17px;
    }
    .sumstate {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .statepill.st-spenta {
      background: rgba(107, 114, 128, 0.25);
    }
    .statepill.st-accensione {
      background: rgba(245, 158, 11, 0.25);
      color: #f59e0b;
    }
    .statepill.st-accesa {
      background: rgba(239, 68, 68, 0.22);
      color: #ef4444;
    }
    .statepill.st-spegnimento {
      background: rgba(96, 165, 250, 0.25);
      color: #60a5fa;
    }
    .statepill.st-non_disponibile {
      background: rgba(220, 38, 38, 0.2);
      color: #dc2626;
    }
    .sumrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .stufa .statepill {
      white-space: nowrap;
      font-size: 15px;
      padding: 3px 12px;
    }
    .stufa .mid {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
    }
    @container (min-width: 1150px) {
      .stufa .sumrow {
        flex-direction: column;
        gap: 0;
        text-align: center;
      }
      .stufa .sumrow b {
        font-size: 15px;
      }
    }
    .sbtn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-height: 52px;
      padding: 8px 12px;
      border: none;
      border-radius: 14px;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      font: inherit;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
    }
    .sbtn small {
      font-size: 12.5px;
      font-weight: 400;
      opacity: 0.9;
    }
    .sbtn.stop {
      background: #ef4444;
    }
    .sbtn.armed {
      background: #f59e0b;
    }
    .sbtn.off,
    .sbtn:disabled {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
      cursor: default;
    }
    .more.full {
      width: 100%;
      min-height: 44px;
    }
    .more {
      white-space: nowrap;
    }
    .alarmbar {
      display: flex;
      gap: 10px;
      align-items: baseline;
      margin-top: 8px;
      padding: 6px 12px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.16);
      color: #ef4444;
      font-size: 14px;
    }
    .more {
      margin-left: auto;
      min-height: 36px;
      padding: 4px 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
    }
    .counters {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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
], ImpiantoOverviewCard.prototype, "_wide", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_stufa", 2);
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
  const on2 = p3.on;
  const off2 = p3.off;
  if (p3.days[d3]) {
    if (off2 === 0 || off2 > on2) out.push({ start: on2, end: off2 === 0 ? 1440 : off2 });
    else out.push({ start: on2, end: 1440 });
  }
  const prev = (d3 + 6) % 7;
  if (p3.days[prev] && off2 > 0 && off2 < on2) out.push({ start: 0, end: off2 });
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
var SAVED_PRESETS_KEY = "impianto_riscaldamento_presets";
function formatDays(days) {
  const on2 = days.map((d3, i5) => d3 ? i5 : -1).filter((i5) => i5 >= 0);
  if (on2.length === 0) return "nessun giorno";
  if (on2.length === 7) return "tutti i giorni";
  const runs = [];
  for (const i5 of on2) {
    const last = runs[runs.length - 1];
    if (last && last[1] === i5 - 1) last[1] = i5;
    else runs.push([i5, i5]);
  }
  return runs.map(([a3, b3]) => a3 === b3 ? DAY_SHORT[a3] : b3 === a3 + 1 ? `${DAY_SHORT[a3]}, ${DAY_SHORT[b3]}` : `${DAY_SHORT[a3]}\u2013${DAY_SHORT[b3]}`).join(", ");
}
function describeProgram(p3) {
  const when = `${formatHM(p3.on)}\u2013${formatHM(p3.off)}`;
  const temps = [
    p3.setBoiler !== null ? `Set boiler ${p3.setBoiler} \xB0C` : null,
    p3.setWater !== null ? `Set acqua ${p3.setWater} \xB0C` : null
  ].filter(Boolean).join(", ");
  return `P${p3.n} ${when} \xB7 ${formatDays(p3.days)}${temps ? ` \xB7 ${temps}` : ""}`;
}
function snapshotPreset(name, programs, cronoOn, base, now = /* @__PURE__ */ new Date()) {
  const out = {};
  for (const n5 of PROGRAMS) {
    const p3 = programs.find((x2) => x2.n === n5);
    if (!p3) continue;
    const pp = { days: p3.days.map((on2, i5) => on2 ? DAY_SHORT[i5].toLowerCase() : "").filter(Boolean) };
    if (p3.on !== null) pp.on = formatHM(p3.on);
    if (p3.off !== null) pp.off = formatHM(p3.off);
    if (p3.setBoiler !== null) pp.set_boiler = p3.setBoiler;
    if (p3.setWater !== null) pp.set_water = p3.setWater;
    out[String(n5)] = pp;
  }
  const d3 = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const preset = {
    name: name.trim(),
    icon: base?.icon ?? "mdi:bookmark-outline",
    description: `Salvato il ${d3}`,
    programs: out
  };
  if (cronoOn !== null) preset.crono = cronoOn;
  return preset;
}
function mergePresets(base, saved) {
  const out = base.map((b3) => saved.find((s4) => s4.name === b3.name) ?? b3);
  for (const s4 of saved) if (!base.some((b3) => b3.name === s4.name)) out.push(s4);
  return out;
}
function upsertSaved(saved, preset) {
  const i5 = saved.findIndex((s4) => s4.name === preset.name);
  return i5 >= 0 ? saved.map((s4, k2) => k2 === i5 ? preset : s4) : [...saved, preset];
}
function removeSaved(saved, name) {
  return saved.filter((s4) => s4.name !== name);
}
function sanitizeSaved(raw) {
  const list = raw?.presets;
  if (!Array.isArray(list)) return [];
  return list.filter((p3) => !!p3 && typeof p3 === "object" && typeof p3.name === "string" && p3.name.trim() !== "");
}

// src/schedule-card.ts
var CARD_TAG2 = "caldaia-schedule-card";
var COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
var CaldaiaScheduleCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._pending = {};
    this._confirm = null;
    this._saved = [];
    this._saving = null;
    this._savedRequested = false;
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
    const on2 = this._cronoOn();
    void this._run({
      domain: "switch",
      service: on2 ? "turn_off" : "turn_on",
      entity_id: this._master,
      data: {},
      label: `Cronotermostato ${on2 ? "disattivato" : "attivo"}`
    });
  }
  get _presets() {
    const base = this._config.presets && this._config.presets.length ? this._config.presets : DEFAULT_PRESETS;
    return mergePresets(base, this._saved);
  }
  get _basePresets() {
    return this._config.presets && this._config.presets.length ? this._config.presets : DEFAULT_PRESETS;
  }
  updated(changed) {
    if (changed.has("hass") && this.hass && !this._savedRequested) {
      this._savedRequested = true;
      void this._loadSaved();
    }
  }
  _ws(msg) {
    const cw = this.hass.callWS;
    return cw ? cw.call(this.hass, msg) : Promise.reject(new Error("callWS non disponibile"));
  }
  async _loadSaved() {
    try {
      const r6 = await this._ws({ type: "frontend/get_user_data", key: SAVED_PRESETS_KEY });
      this._saved = sanitizeSaved(r6?.value);
    } catch {
      this._saved = [];
    }
  }
  async _persistSaved(next) {
    await this._ws({ type: "frontend/set_user_data", key: SAVED_PRESETS_KEY, value: { version: 1, presets: next } });
    this._saved = next;
  }
  _openSave() {
    this._confirm = null;
    this._message = null;
    this._saving = { target: "__new__", newName: "" };
  }
  async _doSave() {
    const sv = this._saving;
    if (!sv) return;
    const isNew = sv.target === "__new__";
    const name = isNew ? sv.newName.trim() : sv.target;
    if (!name) return;
    const base = this._presets.find((p3) => p3.name === name);
    const preset = snapshotPreset(name, this._programs(), this._cronoOn(), base);
    try {
      await this._persistSaved(upsertSaved(this._saved, preset));
      this._saving = null;
      this._message = { kind: "ok", text: `Preset "${name}" salvato con la programmazione attuale (orari, giorni, temperature e cronotermostato).` };
    } catch (err) {
      this._message = { kind: "err", text: `Non sono riuscito a salvare: ${err.message ?? err}` };
    }
  }
  async _deleteSaved(name) {
    const isDefault = this._basePresets.some((p3) => p3.name === name);
    try {
      await this._persistSaved(removeSaved(this._saved, name));
      this._message = { kind: "ok", text: isDefault ? `Preset "${name}" ripristinato com'era in origine.` : `Preset "${name}" eliminato.` };
      if (this._saving?.target === name) this._saving = { target: "__new__", newName: "" };
    } catch (err) {
      this._message = { kind: "err", text: `Non sono riuscito a eliminare: ${err.message ?? err}` };
    }
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
  _renderSave() {
    const sv = this._saving;
    if (!sv) return A;
    const programs = this._programs();
    const crono = this._cronoOn();
    const isNew = sv.target === "__new__";
    const canSave = isNew ? sv.newName.trim() !== "" : true;
    const targetName = isNew ? sv.newName.trim() : sv.target;
    const exists = this._presets.some((p3) => p3.name === targetName);
    return b2`<div class="confirm save">
      <div><b>Salva la programmazione attuale</b></div>
      <ul>
        ${programs.map((p3) => b2`<li>${describeProgram(p3)}</li>`)}
        <li>Cronotermostato ${crono === null ? "non disponibile" : crono ? "attivo" : "spento"}</li>
      </ul>
      <div class="small">In quale preset la salvo?</div>
      <div class="targets">
        ${this._presets.map((p3) => {
      const saved = this._saved.some((x2) => x2.name === p3.name);
      const isDefault = this._basePresets.some((b3) => b3.name === p3.name);
      return b2`<div class="target">
            <label>
              <input type="radio" name="target" .checked=${sv.target === p3.name} @change=${() => this._saving = { ...sv, target: p3.name }} />
              <span>${p3.name}${saved ? b2` <small>(personalizzato)</small>` : b2` <small>(predefinito)</small>`}</span>
            </label>
            ${saved ? b2`<button class="mini" @click=${() => this._deleteSaved(p3.name)}>${isDefault ? "Ripristina" : "Elimina"}</button>` : A}
          </div>`;
    })}
        <div class="target">
          <label>
            <input type="radio" name="target" .checked=${isNew} @change=${() => this._saving = { ...sv, target: "__new__" }} />
            <span>Nuovo preset</span>
          </label>
          <input
            class="name"
            type="text"
            placeholder="Nome (per esempio Inverno)"
            maxlength="30"
            .value=${sv.newName}
            @focus=${() => this._saving = { ...sv, target: "__new__" }}
            @input=${(e5) => this._saving = { target: "__new__", newName: e5.target.value }}
          />
        </div>
      </div>
      ${canSave && targetName ? b2`<div class="small">${exists ? b2`Sostituisce il contenuto di <b>${targetName}</b>.` : b2`Crea il preset <b>${targetName}</b>.`}</div>` : A}
      <div class="row">
        <button class="primary" ?disabled=${!canSave} @click=${() => this._doSave()}>Salva</button>
        <button @click=${() => this._saving = null}>Annulla</button>
      </div>
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
      (p3) => b2`<button class="preset" ?disabled=${!!this._busy} @click=${() => {
        this._saving = null;
        this._confirm = p3;
      }} title=${p3.description ?? ""}>
            ${p3.icon ? b2`<ha-icon .icon=${p3.icon}></ha-icon>` : A}<span>${p3.name}</span>
          </button>`
    )}
        <button class="preset save" ?disabled=${!!this._busy} @click=${() => this._openSave()} title="Salva la programmazione attuale come preset">
          <ha-icon icon="mdi:content-save-outline"></ha-icon><span>Salva…</span>
        </button>
      </div>
      ${this._renderSave()}
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
    .confirm.save .targets {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 6px 0;
    }
    .target {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 4px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .target label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--primary-text-color);
      text-transform: none;
      letter-spacing: 0;
    }
    .target label small {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .target input[type="radio"] {
      width: auto;
      margin: 0;
    }
    .target input.name {
      flex: 1;
      min-width: 0;
      max-width: 240px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }
    .mini {
      font-size: 12px;
      padding: 4px 10px;
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
], CaldaiaScheduleCard.prototype, "_saved", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_saving", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_busy", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_message", 2);
customElements.define(CARD_TAG2, CaldaiaScheduleCard);

// src/impianto-riscaldamento-dashboard.ts
var VERSION = "0.4.11";
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
