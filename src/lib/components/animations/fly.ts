// src/lib/transitions.ts
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

// On définit l'interface pour les paramètres acceptés par notre transition
export interface SlideFadeParams {
	delay?: number;
	duration?: number;
	x?: number;
	scale?: number;
}

export function slideFade(
	node: HTMLElement,
	options: SlideFadeParams = {}
): TransitionConfig {
	// Valeurs par défaut destructurées proprement
	const { delay = 0, duration = 400, x = 100, scale = 0.95 } = options;

	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	const opacity = parseFloat(style.opacity);

	return {
		delay,
		duration,
		css: (t: number) => {
			// t va de 0 à 1
			const eased = cubicOut(t);

			const currentX = x * (1 - eased);
			const currentScale = scale + (1 - scale) * eased;

			return `
				transform: ${transform} translate3d(${currentX}px, 0, 0) scale(${currentScale});
				opacity: ${opacity * eased};
			`;
		}
	};
}
