import { useEffect } from 'react';
import type { Language } from '../context/LanguageContext.js';
import catalog from './uiCatalog.json';

type Translation = { en: string; de: string };
const phrases = catalog as Record<string, Translation>;
const attributeNames = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description'];
const textOrigins = new WeakMap<Text, { source: string; applied: string }>();
const attributeOrigins = new WeakMap<Element, Map<string, { source: string; applied: string }>>();

function translated(value: string, language: Language): string {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return value;
  const [, before, content, after] = match;
  return `${before}${phrases[content]?.[language] || content}${after}`;
}

function translatedDialog(value: string, language: Language): string {
  const quoted = value.match(/^(.*?)"([^"]+)"(.*)$/);
  if (!quoted) return translated(value, language);
  return `${translated(quoted[1], language)}"${quoted[2]}"${translated(quoted[3], language)}`;
}

function localizeText(node: Text, language: Language) {
  if (node.parentElement?.closest('script, style, textarea, [contenteditable="true"], [data-no-translate]')) return;
  const current = node.nodeValue || '';
  const saved = textOrigins.get(node);
  const source = saved && current === saved.applied ? saved.source : current;
  const result = translated(source, language);
  textOrigins.set(node, { source, applied: result });
  if (current !== result) node.nodeValue = result;
}

function localizeAttributes(element: Element, language: Language) {
  if (element.closest('[data-no-translate]')) return;
  let saved = attributeOrigins.get(element);
  if (!saved) {
    saved = new Map();
    attributeOrigins.set(element, saved);
  }
  for (const name of attributeNames) {
    const current = element.getAttribute(name);
    if (current === null) continue;
    const previous = saved.get(name);
    const source = previous && current === previous.applied ? previous.source : current;
    const result = translated(source, language);
    saved.set(name, { source, applied: result });
    if (current !== result) element.setAttribute(name, result);
  }
}

function localizeTree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    localizeText(root as Text, language);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  localizeAttributes(root as Element, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.nodeType === Node.TEXT_NODE) localizeText(walker.currentNode as Text, language);
    else localizeAttributes(walker.currentNode as Element, language);
  }
}

export function UiTextLocalizer({ language }: { language: Language }) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'de'
      ? 'DeutschWelt Coaching — Dein Weg zu fließendem Deutsch'
      : 'DeutschWelt Coaching — Your Journey to German Fluency';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'de'
      ? 'Deutsch lernen mit persönlicher Betreuung von A1 bis B2. Grammatik, Wortschatz, Sprechen, Lesen und Prüfungsvorbereitung.'
      : 'Learn German with personal coaching from A1 to B2. Practice grammar, vocabulary, speaking, reading, and exam preparation.');
    const nativeAlert = window.alert;
    const nativeConfirm = window.confirm;
    window.alert = (message) => nativeAlert.call(window, translatedDialog(String(message), language));
    window.confirm = (message) => nativeConfirm.call(window, translatedDialog(String(message), language));
    localizeTree(document.body, language);
    const pending = new Set<Node>();
    let frame = 0;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') mutation.addedNodes.forEach((node) => pending.add(node));
        else pending.add(mutation.target);
      }
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        for (const node of pending) localizeTree(node, language);
        pending.clear();
      });
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributeNames,
      subtree: true
    });
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.alert = nativeAlert;
      window.confirm = nativeConfirm;
    };
  }, [language]);
  return null;
}
