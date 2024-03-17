import { getRGBA } from "./helpers.js";

const strokeColor = 'black';
// const fillColor = getRGBA('green', 0.5);
const fillColor = 'green';

class DebugCircle {
	draw(particle, context) {
		context.save();
		context.beginPath();
		context.strokeWidth = 1;
		context.arc(particle.x, particle.y, particle.perceptionRadius, 0, Math.PI * 2);
		// console.log('perceptionRadius in debug: ' + particle.perceptionRadius);
		context.strokeStyle = 'red'; // Change this to any color you want for the debug circle
		context.stroke();
		context.restore();


	}
}
export default DebugCircle;