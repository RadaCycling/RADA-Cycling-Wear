import { crossfade, type TransitionConfig } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

export const [send, receive] = crossfade({
  duration: (d) => Math.sqrt(d * 200),

  fallback(node, params) {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
      duration: 600,
      easing: quintOut,
      css: (t) => `
				transform: ${transform} scale(${t});
				opacity: ${t}
			`
    };
  }
});


export function typewriter(node: HTMLElement, { speed = 100 }: { speed?: number }): TransitionConfig & { duration: number } {
  const valid = (
    node.childNodes.length === 1 &&
    node.childNodes[0].nodeType === Node.TEXT_NODE
  );

  if (!valid) {
    throw new Error(`This transition only works on elements with a single text node child`);
  }

  const text = node.textContent as string;
  const duration = text.length / (speed * 0.01);

  return {
    duration,
    tick: (t: number) => {
      const i = Math.trunc(text.length * t);
      node.textContent = text.slice(0, i);
    }
  };
}