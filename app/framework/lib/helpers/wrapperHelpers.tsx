/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsb(r: number, g: number, b: number) {
	r /= 255;
	g /= 255;
	b /= 255;

	var max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	var h,
		s,
		v = max;

	var d = max - min;
	s = max == 0 ? 0 : d / max;

	if (max == min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h = h! / 6;
		h = Math.round(h * 360);
	}
	return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsbToRgb(h: number, s: number, v: number) {
	var r, g, b;
	h = h / 360;
	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
	}

	return [Math.floor(r! * 255), Math.floor(g! * 255), Math.floor(b! * 255)];
}

const hexToRgb = (hex: string) => {
	hex = hex.replace("#", "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((x) => x + x)
			.join("");
	}

	const [r, g, b] = hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? [
		0, 0, 0,
	];
	return { r, g, b };
};
const rgbToHex = (r: number, g: number, b: number) => {
	return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};
export const hsbToHex = (h: number, s: number, b: number) => {
	const [r, g, bl] = hsbToRgb(h, s, b);
	return rgbToHex(r, g, bl);
};
export const hexToHsb = (hex: string) => {
	const { r, g, b } = hexToRgb(hex);
	const hsbArr = rgbToHsb(r, g, b);
	const hsb = {
		hue: hsbArr[0],
		saturation: hsbArr[1],
		brightness: hsbArr[2],
	};
	return hsb;
};
