// ===== SCENE SETUP =====
const scene = new THREE.Scene();

let aspect = window.innerWidth / window.innerHeight;

const camera = new THREE.OrthographicCamera(
  -aspect,
  aspect,
  1,
  -1,
  0.1,
  10
);

camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

renderer.domElement.style.position = "fixed";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.left = "0px";
renderer.domElement.style.top = "0px";

document.body.appendChild(renderer.domElement);

// ===== 16:9 TARGET RATIO =====
const TARGET_ASPECT = 16 / 9;

// ===== UNIFORMS =====
const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(1, 1) }
};

// ===== SHADER MATERIAL =====
const material = new THREE.ShaderMaterial({
  uniforms,
  fragmentShader: `
    uniform float u_time;
    uniform vec2 u_resolution;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec2 random2(vec2 st){
      return vec2(
        random(st),
        random(st + 100.0)
      );
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      uv -= 0.5;
      uv.x *= u_resolution.x / u_resolution.y;
      uv += 0.5;

      uv *= 10.0;
      vec2 i_st = floor(uv);
      vec2 f_st = fract(uv);

      float minDist = 20.0;

      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {

          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = random2(i_st + neighbor);

          point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

          vec2 diff = neighbor + point - f_st;
          float dist = length(diff);

          minDist = min(minDist, dist);
        }
      }

      float lines = smoothstep(0.4, 0.9, minDist);

      vec3 waterColor = vec3(0.34, 0.75, 0.84);
      vec3 highlight = vec3(0.36, 0.83, 0.88);

      vec3 color = mix(waterColor, highlight, lines);

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

// ===== FULLSCREEN PLANE =====
const plane = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(plane, material);
scene.add(mesh);

// ===== LOTUS LEAF =====
const textureLoader = new THREE.TextureLoader();

const lotusTexture = textureLoader.load("images/lotus-leaf.png");

const lotusMaterial = new THREE.MeshBasicMaterial({
  map: lotusTexture,
  transparent: true
});

const lotusGeometry = new THREE.PlaneGeometry(0.8, 0.8);
const lotus = new THREE.Mesh(lotusGeometry, lotusMaterial);

lotus.position.set(0.5, 0.2, 0.1);
scene.add(lotus);

function resizeRenderer() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  const aspect = width / height;

  camera.left = -aspect;
  camera.right = aspect;
  camera.top = 1;
  camera.bottom = -1;

  camera.updateProjectionMatrix();

  uniforms.u_resolution.value.set(width, height);
}

resizeRenderer();
window.addEventListener("resize", resizeRenderer);

// ===== ANIMATION LOOP =====
function animate(time) {
  uniforms.u_time.value = time * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);