import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw line
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
  
  // Initialize difference of (x1, x2) & (y1, y2)
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Horizontal line case (dy = 0)
  if (dy === 0) {
    const dr = (r2 - r1) / Math.abs(dx);
    const dg = (g2 - g1) / Math.abs(dx);
    const db = (b2 - b1) / Math.abs(dx);

    let r = r1, g = g1, b = b1;
    let x = x1;
    
    // Use dx as length will iterates through each pixels
    for (let i = 0; i <= Math.abs(dx); i++) {
      this.setPixel(x, y1, [r, g, b]);
      // Handle cases x1 > x2
      if (dx > 0) x++;
      else x--;
      r += dr;
      g += dg;
      b += db;
    }
    return;
  }

  // Vertical line case (dx = 0)
  if (dx === 0) {
    const dr = (r2 - r1) / Math.abs(dy);
    const dg = (g2 - g1) / Math.abs(dy);
    const db = (b2 - b1) / Math.abs(dy);

    let r = r1, g = g1, b = b1;
    let y = y1;

    // Use dy as length will iterates through each pixels
    for (let i = 0; i <= Math.abs(dy); i++) {
      this.setPixel(x1, y, [r, g, b]);
      // Handle cases y1 > y2
      if (dy > 0) y++; // Move y down
      else y--;        // Move y up
      r += dr;
      g += dg;
      b += db;
    }
    return;
  }

  // If the slope is less than or equal to 1, dx > dy cases, proceed normally
  if (Math.abs(dy) <= Math.abs(dx)) {
    const m = dy / dx;
    const dr = (r2 - r1) / Math.abs(dx);
    const dg = (g2 - g1) / Math.abs(dx);
    const db = (b2 - b1) / Math.abs(dx);

    let r = r1, g = g1, b = b1;
    let x = x1;
    let y = y1;

    // Loop through x-coordinates and increment y by m, from 0 to length of dx, is the same of x1 to x2
    for (let ix = 0; ix <= Math.abs(dx); ix++) {
      this.setPixel(Math.round(x), Math.round(y), [r, g, b]);
      // Handle cases x1 > x2
      if (dx > 0) x++;  // Move x right if dx > 0
      else x--;         // Move x left if dx < 0
      y += m;   
      r += dr;
      g += dg;
      b += db;
    }
  } else { // If the slope is greater than 1, dy > dx cases, swap x and y and iterate through y
    const m = dx / dy;
    const dr = (r2 - r1) / Math.abs(dy);
    const dg = (g2 - g1) / Math.abs(dy);
    const db = (b2 - b1) / Math.abs(dy);

    let r = r1, g = g1, b = b1;
    let x = x1;
    let y = y1;

    // Loop through y-coordinates and increment x by m, from 0 to length of dy, is the same of y1 to y2
    for (let iy = 0; iy <= Math.abs(dy); iy++) {
      this.setPixel(Math.round(x), Math.round(y), [r, g, b]);
      // Handle cases y1 > y2
      if (dy > 0) y++;  // Move y down if dy > 0
      else y--;         // Move y up if dy < 0
      x += m;       
      r += dr;
      g += dg;
      b += db;
    }
  }
}




// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v1, v2, v3) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x3, y3, [r3, g3, b3]] = v3;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw triangle
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
  this.setPixel(Math.floor(x3), Math.floor(y3), [r3, g3, b3]);
  
  // Initialize bounding box region 
  const minX = Math.floor(Math.min(x1, x2, x3));
  const maxX = Math.floor(Math.max(x1, x2, x3));
  const minY = Math.floor(Math.min(y1, y2, y3));
  const maxY = Math.floor(Math.max(y1, y2, y3));

  // Iterate over the bounding box and use the inside-outside test
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const p = [x, y];
      if (pointIsInsideTriangle(v1, v2, v3, p)) {
        // Calculate barycentric coordinates (u, v, w)
        const [u, v, w] = barycentricCoordinates(v1, v2, v3, p);

        // Interpolate the color based on barycentric coordinates
        const r = u * r1 + v * r2 + w * r3;
        const g = u * g1 + v * g2 + w * g3;
        const b = u * b1 + v * b2 + w * b3;
        // Paint with generated rgb values
        this.setPixel(x, y, [r, g, b]);
      }
    }
  }
}

function pointIsInsideTriangle(v1, v2, v3, p) {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  const [x3, y3] = v3;
  const [px, py] = p;

  // Coefficients for the edges of the triangle using half-plane algorithm
  const a0 = y2 - y3;
  const b0 = x3 - x2;
  const c0 = x2 * y3 - x3 * y2;

  const a1 = y3 - y1;
  const b1 = x1 - x3;
  const c1 = x3 * y1 - x1 * y3;

  const a2 = y1 - y2;
  const b2 = x2 - x1;
  const c2 = x1 * y2 - x2 * y1;

  // Evaluate the point's position with respect to each edge of the triangle
  const d0 = a0 * px + b0 * py + c0; 
  const d1 = a1 * px + b1 * py + c1; 
  const d2 = a2 * px + b2 * py + c2; 

  // Apply the top-left rule:
  const isOnEdge0 = (d0 === 0) && ((y1 === y2 && x1 < x2 && px >= Math.min(x1, x2) && px <= Math.max(x1, x2)) || (py < Math.max(y1, y2) && py >= Math.min(y1, y2)));
  const isOnEdge1 = (d1 === 0) && ((y2 === y3 && x2 < x3 && px >= Math.min(x2, x3) && px <= Math.max(x2, x3)) || (py < Math.max(y2, y3) && py >= Math.min(y2, y3)));
  const isOnEdge2 = (d2 === 0) && ((y3 === y1 && x3 < x1 && px >= Math.min(x3, x1) && px <= Math.max(x3, x1)) || (py < Math.max(y3, y1) && py >= Math.min(y3, y1)));

  // For the inside triangle case, check if all d0, d1, and d2 have the same sign
  const allPositive = (d0 > 0) && (d1 > 0) && (d2 > 0);
  const allNegative = (d0 < 0) && (d1 < 0) && (d2 < 0);

  // Return true if the point is either entirely inside or on an edge
  return allPositive || allNegative || isOnEdge0 || isOnEdge1 || isOnEdge2;
}





function barycentricCoordinates(v1, v2, v3, p) {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  const [x3, y3] = v3;
  const [px, py] = p;

  // Compute the area of the triangle using the determinant method
  const area = (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2;

  // Compute barycentric coordinates (u, v, w)
  const u = (px * (y2 - y3) + x2 * (y3 - py) + x3 * (py - y2)) / (2 * area);
  const v = (x1 * (py - y3) + px * (y3 - y1) + x3 * (y1 - py)) / (2 * area);
  const w = (x1 * (y2 - py) + x2 * (py - y1) + px * (y1 - y2)) / (2 * area);

  return [u, v, w];
}




////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
//Soctland flag
const DEF_INPUT = [
"v,0,11,0.0,0.37,0.72;",
"v,0,51,0.0,0.37,0.72;",
"v,63,51,0.0,0.37,0.72;",
"v,63,11,0.0,0.37,0.72;",
"t,0,1,2;",
"t,0,3,2;",

"v,5,11,1,1,1;",
"v,63,46,1,1,1;",
"v,4,11,1,1,1;",
"v,63,47,1,1,1;",
"v,3,11,1,1,1;",
"v,63,48,1,1,1;",
"v,2,11,1,1,1;",
"v,63,49,1,1,1;",
"v,1,11,1,1,1;",
"v,63,50,1,1,1;",
"v,0,11,1,1,1;",
"v,63,51,1,1,1;",
"v,0,12,1,1,1;",
"v,62,51,1,1,1;",
"v,0,13,1,1,1;",
"v,61,51,1,1,1;",
"v,0,14,1,1,1;",
"v,60,51,1,1,1;",
"v,0,15,1,1,1;",
"v,59,51,1,1,1;",
"v,0,16,1,1,1;",
"v,58,51,1,1,1;",

"l,4,5;",
"l,6,7;",
"l,8,9;",
"l,10,11;",
"l,12,13;",
"l,14,15;",
"l,16,17;",
"l,18,19;",
"l,20,21;",
"l,22,23;",
"l,24,25;",

"v,0,46,1,1,1;",
"v,58,11,1,1,1;",
"v,0,47,1,1,1;",
"v,59,11,1,1,1;",
"v,0,48,1,1,1;",
"v,60,11,1,1,1;",
"v,0,49,1,1,1;",
"v,61,11,1,1,1;",
"v,0,50,1,1,1;",
"v,62,11,1,1,1;",
"v,0,51,1,1,1;",
"v,63,11,1,1,1;",
"v,1,51,1,1,1;",
"v,63,12,1,1,1;",
"v,2,51,1,1,1;",
"v,63,13,1,1,1;",
"v,3,51,1,1,1;",
"v,63,14,1,1,1;",
"v,4,51,1,1,1;",
"v,63,15,1,1,1;",
"v,5,51,1,1,1;",
"v,63,16,1,1,1;",

"l,26,27;",
"l,28,29;",
"l,30,31;",
"l,32,33;",
"l,34,35;",
"l,36,37;",
"l,38,39;",
"l,40,41;",
"l,42,43;",
"l,44,45;",
"l,46,47;",

"v,6,51,0.0,0.37,0.72;",
"v,57,51,0.0,0.37,0.72;",
"l,48,49;",
].join("\n");




// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };
