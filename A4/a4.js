import { Mat4 } from './math.js';
import { Parser } from './parser.js';
import { Scene } from './scene.js';
import { Renderer } from './renderer.js';
import { TriangleMesh } from './trianglemesh.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement createCube, createSphere, computeTransformation, and shaders
////////////////////////////////////////////////////////////////////////////////


TriangleMesh.prototype.createCube = function() {
  this.positions = [
    // Three vertices one triangle, two triangles one face, six faces one cube. In total 12 triangles and 36 vertices one cube.
    // Triangles always goes from bottom right vertices (from different view perspective) and move colck-wise

    // Front face
    1, -1, 1,    -1, -1, 1,    -1, 1, 1,
    1, -1, 1,    -1, 1, 1,     1, 1, 1,
    // Right face
    1, -1, -1,   1, -1, 1,     1, 1, 1,  
    1, -1, -1,   1, 1, 1,      1, 1, -1,  
    // Top face
    1, 1, 1,     -1, 1, 1,     -1, 1, -1,
    1, 1, 1,     -1, 1, -1,    1, 1, -1,    
    // Bottom face
    1, -1, -1,   -1, -1, -1,   -1, -1, 1, 
    1, -1, -1,   -1, -1, 1,    1, -1, 1, 
    // Left face
    -1, -1, 1,   -1, -1, -1,   -1, 1, -1, 
    -1, -1, 1,   -1, 1, -1,    -1, 1, 1,
    // Back face
    -1, -1, -1,   1, -1, -1,   1, 1, -1,  
    -1, -1, -1,   1, 1, -1,    -1, 1, -1, 
  ];
  
  this.normals = [
    // Front face
    0,0,1,  0,0,1,  0,0,1,  0,0,1,  0,0,1,  0,0,1,
    // Right face
    1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,
    // Top face
    0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,
    // Bottom face
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
    // Left face
    -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
    // Back face
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
  ];

  this.uvCoords = [
    // Front face
    1/2, 2/3,   0, 2/3,     0, 1, 
    1/2, 2/3,   0, 1,       1/2, 1,
    // Right face
    1/2, 1/3,   0, 1/3,     0, 2/3, 
    1/2, 1/3,   0, 2/3,     1/2, 2/3,
    // Top face
    1/2, 0,     0, 0,       0, 1/3,
    1/2, 0,     0, 1/3,     1/2, 1/3,
    // Bottom face
    1, 2/3,     1/2, 2/3,   1/2, 1, 
    1, 2/3,     1/2, 1,     1, 1,
    // Left face
    1, 1/3,     1/2, 1/3,   1/2, 2/3,
    1, 1/3,     1/2, 2/3,   1, 2/3, 
    // Back face
    1/2, 0,     1/2, 1/3,   1, 1/3, 
    1/2, 0,     1, 1/3,     1, 0, 
  ];

  // Triangle soup encoding does not need indices
}

TriangleMesh.prototype.createSphere = function(numStacks, numSectors) {
  let x, y, z, xy;
  let nx, ny, nz;
  let radius = 1;
  let lengthInv = 1.0 / radius;
  let s, t;
  
  let sectorStep = 2 *  Math.PI / numSectors;
  let stackStep =  Math.PI / numStacks;
  let sectorAngle, stackAngle;

  for (let i = 0; i <= numStacks; ++i) {
    stackAngle = Math.PI / 2 - i * stackStep;
    xy = radius * Math.cos(stackAngle);
    z = radius * Math.sin(stackAngle);

    for (let j = 0; j <= numSectors; ++j) {
        sectorAngle = j * sectorStep;

        x = xy * Math.cos(sectorAngle);
        y = xy * Math.sin(sectorAngle);
        this.positions.push(x);
        this.positions.push(y);
        this.positions.push(z);

        nx = x * lengthInv;
        ny = y * lengthInv;
        nz = z * lengthInv;
        this.normals.push(nx);
        this.normals.push(ny);
        this.normals.push(nz);

        s = parseFloat(j) / numSectors;
        t = parseFloat(i) / numStacks;

        this.uvCoords.push(1 - s); // North America
        this.uvCoords.push(t);
    }
  }

  let k1, k2;
  for (let i = 0; i < numStacks; ++i) {
    k1 = i * (numSectors + 1);
    k2 = k1 + numSectors + 1;

    for (let j = 0; j < numSectors; ++j, ++k1, ++k2) {
      if (i != 0) {
          this.indices.push(k1);
          this.indices.push(k2);
          this.indices.push(k1 + 1);
      }
      if (i != (numStacks - 1)) {
          this.indices.push(k1 + 1);
          this.indices.push(k2);
          this.indices.push(k2 + 1);
      }
      // No line indices in class TriangleMesh
    }
  }
}

Scene.prototype.computeTransformation = function(transformSequence) {
  // Initialize an identity matrix
  let overallTransform = Mat4.create();

  // Iterate through the transformation sequence from index i-1 to index 0
  // For example S,T,Rx in sequence, compute T*Rx first then S*(T*Rx)
  for (let i = transformSequence.length - 1; i >= 0; --i) {
    let transform = transformSequence[i];
    let transformResult = Mat4.create(); 
    let theta = (Math.PI / 180) * -transform[1];

    // Determine the transformation type using a switch statement
    switch (transform[0]) {
      case "S": // Scaling
        Mat4.set(
          transformResult,
          transform[1], 0, 0, 0,
          0, transform[2], 0, 0,
          0, 0, transform[3], 0,
          0, 0, 0, 1
        );
        break;

      case "T": // Translation
        Mat4.set(
          transformResult,
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          transform[1], transform[2], transform[3], 1
        );
        break;
        
      case "Rx": // Rotation around x-axis
        Mat4.set(
          transformResult,
          1, 0, 0, 0,
          0, Math.cos(theta), -Math.sin(theta), 0,
          0, Math.sin(theta), Math.cos(theta), 0,
          0, 0, 0, 1
        );
        break;

      case "Ry": // Rotation around y-axis
        Mat4.set(
          transformResult,
          Math.cos(theta), 0, Math.sin(theta), 0,
          0, 1, 0, 0,
          -Math.sin(theta), 0, Math.cos(theta), 0,
          0, 0, 0, 1
        );
        break;

      case "Rz": // Rotation around z-axis
        Mat4.set(
          transformResult,
          Math.cos(theta), -Math.sin(theta), 0, 0,
          Math.sin(theta), Math.cos(theta), 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        );
        break;
    }
    // Multiply function use matrix b*a, set b as transformResult to fit the recursive processing order 
    Mat4.multiply(overallTransform, overallTransform, transformResult);
  }

  return overallTransform;
};


Renderer.prototype.VERTEX_SHADER = `
precision mediump float;
attribute vec3 position, normal;
attribute vec2 uvCoord;
uniform vec3 lightPosition;
uniform mat4 projectionMatrix, viewMatrix, modelMatrix;
uniform mat3 normalMatrix;
varying vec2 vTexCoord;

// Passing transformed variables to the fragment shader
varying vec3 lightDirection; 
varying vec3 transformedNormal;
varying vec3 viewPosition;

void main() {
  // Pass the UV coordinates
  vTexCoord = uvCoord;

  // Transform normal from object sapce to view space and normalize
  transformedNormal = normalize(normalMatrix * normal);

  // Transform position from object space to view space
  vec4 viewSpacePos = viewMatrix * modelMatrix * vec4(position, 1.0);
  viewPosition = viewSpacePos.xyz; // Convert to vec3

  // Compute the light direction from world space to view space
  vec4 lightPosViewSpace = viewMatrix * vec4(lightPosition, 1.0);
  lightDirection = lightPosViewSpace.xyz - viewPosition; // Convert to vec3

  // Compute final position in clip space
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;


Renderer.prototype.FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 ka, kd, ks, lightIntensity;
uniform float shininess;
uniform sampler2D uTexture;
uniform bool hasTexture;
varying vec2 vTexCoord;

// Variables from the vertex shader
varying vec3 lightDirection;
varying vec3 transformedNormal;
varying vec3 viewPosition;

void main() {
  // Compute the distance to the light
  float distance = length(lightDirection);

  // Point light irradiance E falls quadratically with distance from light proportional to 1/(d^2)
  float attenuation = 1.0 / (distance * distance);

  // Normalize vectors for lighting calculations
  vec3 L = normalize(lightDirection); // Light vector
  vec3 N = normalize(transformedNormal); // Normal vector
  vec3 V = normalize(-viewPosition); // View vector (negative of position)

  // Ambient
  vec3 ca = ka * lightIntensity;

  // Diffuse
  float NdotL = max(dot(N, L), 0.0);
  vec3 cd = kd * NdotL * lightIntensity * attenuation;

  // Specular
  vec3 H = normalize(L + V);
  float NdotH = max(dot(N, H), 0.0);
  vec3 cs = ks * pow(NdotH, shininess) * lightIntensity * attenuation;

  // Combine lighting components to get final color
  vec3 color = ca + cd + cs;

  // Apply texture if available
  if (hasTexture) {
    vec4 textureColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = vec4(color, 1.0) * textureColor;
  } else {
    gl_FragColor = vec4(color, 1.0);
  }
}
`;



////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;",
  "o,gd,unitCube,grnDiceMat;",
  "o,bd,unitCube,bluDiceMat;",
  "o,gl,unitSphere,globeMat;",
  "X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
  "X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
  "X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
  "X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",
  // "c,myCamera,perspective,20,20,20,0,0,0,0,1,0;",
  // "l,myLight,point,0,20,20,3,3,3;",
  // "p,unitSphere,sphere,10,10;",
  // "p,unitCube,cube;",

  // "m,redMat,1,0,0,1,0,0,1,1,1,50,;",
  // "m,greenMat,0,1,0,0,1,0,1,1,1,50,;",
  // "m,blueMat,0,0,1,0,0,1,1,1,1,50,;",
  // "m,yellowMat,1,1,0,1,1,0,1,1,1,50,;",
  // "m,cyanMat,0,1,1,0,1,1,1,1,1,50,;",
  // "m,magentaMat,1,0,1,1,0,1,1,1,1,50,;",
  // "m,whiteMat,1,1,1,1,1,1,1,1,1,50,;",

  // "o,sphere1,unitSphere,redMat; X,sphere1,S,0.5,0.5,0.5; X,sphere1,T,-1,1,1;",
  // "o,sphere2,unitSphere,greenMat; X,sphere2,S,0.5,0.5,0.5; X,sphere2,T,0,1,1;",
  // "o,sphere3,unitSphere,blueMat; X,sphere3,S,0.5,0.5,0.5; X,sphere3,T,1,1,1;",
  // "o,sphere4,unitSphere,yellowMat; X,sphere4,S,0.5,0.5,0.5; X,sphere4,T,-1,0,1;",
  // "o,sphere5,unitSphere,cyanMat; X,sphere5,S,0.5,0.5,0.5; X,sphere5,T,0,0,1;",
  // "o,sphere6,unitSphere,magentaMat; X,sphere6,S,0.5,0.5,0.5; X,sphere6,T,1,0,1;",
  // "o,sphere7,unitSphere,whiteMat; X,sphere7,S,0.5,0.5,0.5; X,sphere7,T,-1,-1,1;",
  // "o,sphere8,unitSphere,redMat; X,sphere8,S,0.5,0.5,0.5; X,sphere8,T,0,-1,1;",
  // "o,sphere9,unitSphere,greenMat; X,sphere9,S,0.5,0.5,0.5; X,sphere9,T,1,-1,1;",

  // "o,sphere10,unitSphere,blueMat; X,sphere10,S,0.5,0.5,0.5; X,sphere10,T,-1,1,0;",
  // "o,sphere11,unitSphere,yellowMat; X,sphere11,S,0.5,0.5,0.5; X,sphere11,T,0,1,0;",
  // "o,sphere12,unitSphere,cyanMat; X,sphere12,S,0.5,0.5,0.5; X,sphere12,T,1,1,0;",
  // "o,sphere13,unitSphere,magentaMat; X,sphere13,S,0.5,0.5,0.5; X,sphere13,T,-1,0,0;",
  // "o,sphere14,unitSphere,whiteMat; X,sphere14,S,0.5,0.5,0.5; X,sphere14,T,0,0,0;",
  // "o,sphere15,unitSphere,redMat; X,sphere15,S,0.5,0.5,0.5; X,sphere15,T,1,0,0;",
  // "o,sphere16,unitSphere,greenMat; X,sphere16,S,0.5,0.5,0.5; X,sphere16,T,-1,-1,0;",
  // "o,sphere17,unitSphere,blueMat; X,sphere17,S,0.5,0.5,0.5; X,sphere17,T,0,-1,0;",
  // "o,sphere18,unitSphere,yellowMat; X,sphere18,S,0.5,0.5,0.5; X,sphere18,T,1,-1,0;",

  // "o,sphere19,unitSphere,cyanMat; X,sphere19,S,0.5,0.5,0.5; X,sphere19,T,-1,1,-1;",
  // "o,sphere20,unitSphere,magentaMat; X,sphere20,S,0.5,0.5,0.5; X,sphere20,T,0,1,-1;",
  // "o,sphere21,unitSphere,whiteMat; X,sphere21,S,0.5,0.5,0.5; X,sphere21,T,1,1,-1;",
  // "o,sphere22,unitSphere,redMat; X,sphere22,S,0.5,0.5,0.5; X,sphere22,T,-1,0,-1;",
  // "o,sphere23,unitSphere,greenMat; X,sphere23,S,0.5,0.5,0.5; X,sphere23,T,0,0,-1;",
  // "o,sphere24,unitSphere,blueMat; X,sphere24,S,0.5,0.5,0.5; X,sphere24,T,1,0,-1;",
  // "o,sphere25,unitSphere,yellowMat; X,sphere25,S,0.5,0.5,0.5; X,sphere25,T,-1,-1,-1;",
  // "o,sphere26,unitSphere,cyanMat; X,sphere26,S,0.5,0.5,0.5; X,sphere26,T,0,-1,-1;",
  // "o,sphere27,unitSphere,magentaMat; X,sphere27,S,0.5,0.5,0.5; X,sphere27,T,1,-1,-1;",

  // "o,cube1,unitCube,redMat; X,cube1,S,1,1,1; X,cube1,T,-6,3,0;",
  // "o,cube2,unitCube,greenMat; X,cube2,S,1,1,1; X,cube2,T,6,3,0;",
  // "o,cube3,unitCube,blueMat; X,cube3,S,1,1,1; X,cube3,T,0,3,6;",
  // "o,cube4,unitCube,yellowMat; X,cube4,S,1,1,1; X,cube4,T,0,3,-6;",
  // "o,cube5,unitCube,cyanMat; X,cube5,S,1,1,1; X,cube5,T,6,-3,0;",
  // "o,cube7,unitCube,whiteMat; X,cube7,S,1,1,1; X,cube7,T,0,-3,6;",
  // "o,cube9,unitCube,redMat; X,cube9,S,1,1,1; X,cube9,T,6,0,6;",
  // "o,cube10,unitCube,greenMat; X,cube10,S,1,1,1; X,cube10,T,-6,0,6;",
  // "o,cube11,unitCube,blueMat; X,cube11,S,1,1,1; X,cube11,T,6,0,-6;",
  // " o,cube12,unitCube,yellowMat; X,cube12,S,1,1,1; X,cube12,T,-6,0,-6;",

].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };
