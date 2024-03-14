
// Repel from mouse
function RepelMouse(effect, x, y, mouseRadius, mouseRepelForce) {
	if (effect.mouse.x > 0 && effect.mouse.x < effect.width &&
		effect.mouse.y > 0 && effect.mouse.y < effect.height) {
		const dx = x - effect.mouse.x;
		const dy = y - effect.mouse.y;
		const distance = Math.hypot(dx, dy);

		if (distance < mouseRadius) {
			const angle = Math.atan2(dy, dx);
			const repelX = mouseRepelForce * Math.cos(angle);
			const repelY = mouseRepelForce * Math.sin(angle);
			x += repelX;
			y += repelY;
			console.log('repel force: ' + repelX + ' ' + repelY);
		}
	}
	return { x, y };
}

export default RepelMouse;