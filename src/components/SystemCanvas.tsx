import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// One persistent particle field behind the whole page. Scroll morphs it
// through five states: wave field → data grid → pipeline streams →
// knowledge constellation → convergence point.
const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uState;
  uniform vec2 uMouse;
  uniform vec2 uVel;
  varying float vElev;
  varying float vDist;
  varying float vDepth;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  float wave(vec2 p, float t) {
    float e = sin(p.x * 0.28 + t * 0.7) * 0.55;
    e += sin(p.y * 0.22 - t * 0.45) * 0.45;
    e += sin((p.x + p.y) * 0.16 + t * 0.3) * 0.7;
    e += sin(length(p) * 0.35 - t * 0.8) * 0.35;
    return e;
  }

  vec3 shape(float s, vec3 p, float t, float id) {
    if (s < 0.5) {
      // 0 — open wave field
      return vec3(p.xy, wave(p.xy, t));
    } else if (s < 1.5) {
      // 1 — ordered data grid
      vec2 g = floor(p.xy / 2.0) * 2.0;
      float z = sin(g.x * 0.5 + t) * 0.18 + sin(g.y * 0.7 - t * 0.8) * 0.18;
      return vec3(g, z + 0.2);
    } else if (s < 2.5) {
      // 2 — pipeline streams
      float col = floor(p.x / 4.0) * 4.0;
      float z = sin(p.y * 0.45 - t * 1.6 + col * 0.5) * 1.1;
      return vec3(col + sin(p.y * 0.12 + col) * 1.1, p.y, z);
    } else if (s < 3.5) {
      // 3 — knowledge constellation
      float ni = floor(hash(id) * 12.0);
      vec2 node = (vec2(hash(ni * 3.1), hash(ni * 7.3)) - 0.5) * 30.0;
      vec2 xy = node + (p.xy - node) * 0.14;
      xy += vec2(sin(t * 0.6 + id), cos(t * 0.5 + id * 1.3)) * 0.45;
      return vec3(xy, sin(t + id) * 0.5 + 0.4);
    }
    // 4 — convergence
    float r = length(p.xy);
    float a = atan(p.y, p.x) + t * 0.25 + r * 0.12;
    float nr = (r * 0.1 + 1.4) * (0.4 + hash(id) * 1.3) + sin(t * 2.0) * 0.12;
    return vec3(cos(a) * nr, sin(a) * nr, sin(t * 2.0 + r) * 0.5 + 0.3);
  }

  void main() {
    vec3 base = position;
    float id = base.x * 13.37 + base.y * 7.77;
    float t = uTime;

    float sA = floor(uState);
    float f = fract(uState);
    f = f * f * (3.0 - 2.0 * f);
    vec3 pos = mix(shape(sA, base, t, id), shape(sA + 1.0, base, t, id), f);

    float md = distance(base.xy * 0.04, uMouse);
    float influence = smoothstep(0.5, 0.0, md);
    pos.z += influence * 1.4;
    pos.xy += uVel * influence * 6.0;

    vElev = pos.z;
    vDist = length(pos.xy);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    vDepth = -mv.z;
    gl_PointSize = clamp((1.6 + pos.z * 0.9) * (uSize / -mv.z), 1.0, 7.0);
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAcid;
  uniform float uDim;
  uniform float uVelMag;
  varying float vElev;
  varying float vDist;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;

    float mixv = smoothstep(0.15, 1.8, vElev + uVelMag * 0.6);
    vec3 col = mix(uBase, uAcid, mixv);
    float edgeFade = 1.0 - smoothstep(14.0, 26.0, vDist);
    float nearFade = smoothstep(3.0, 9.0, vDepth);
    float alpha = (0.4 + mixv * 0.6) * edgeFade * nearFade * uDim;
    gl_FragColor = vec4(col, alpha);
  }
`

// section → field state; the field holds its shape between triggers
const STATE_SECTIONS = ['.manifesto', '#work', '#stack', '#contact']

export default function SystemCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.set(0, -10, 7)
    camera.lookAt(0, 2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const isMobile = window.innerWidth < 760
    const COUNT = isMobile ? 90 : 150
    const SPREAD = 46
    const positions = new Float32Array(COUNT * COUNT * 3)
    let i = 0
    for (let x = 0; x < COUNT; x++) {
      for (let y = 0; y < COUNT; y++) {
        positions[i++] = (x / (COUNT - 1) - 0.5) * SPREAD
        positions[i++] = (y / (COUNT - 1) - 0.5) * SPREAD
        positions[i++] = 0
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 28 },
        uState: { value: 0 },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uVel: { value: new THREE.Vector2(0, 0) },
        uVelMag: { value: 0 },
        uDim: { value: 1 },
        uBase: { value: new THREE.Color('#4a4e55') },
        uAcid: { value: new THREE.Color('#d9ff3f') },
      },
    })

    const points = new THREE.Points(geo, mat)
    points.rotation.x = -0.35
    scene.add(points)

    // ripple sentinel starts far off-field; parallax starts centered
    const mouse = new THREE.Vector2(99, 99)
    const targetMouse = new THREE.Vector2(99, 99)
    const vel = new THREE.Vector2(0, 0)
    const parallax = new THREE.Vector2(0, 0)
    const targetParallax = new THREE.Vector2(0, 0)
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = -(e.clientY / window.innerHeight - 0.5) * 2
      targetMouse.set(nx, ny)
      targetParallax.set(nx, ny)
    }
    window.addEventListener('mousemove', onMove)

    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      // tall/narrow viewports see the field edge-on; lift and pull back the camera
      const narrow = camera.aspect < 0.9
      camera.position.set(0, narrow ? -8 : -10, narrow ? 5.5 : 7)
      camera.fov = narrow ? 75 : 55
      camera.lookAt(0, 2, 0)
      mat.uniforms.uSize.value = narrow ? 55 : 36
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    // scroll → field state
    let stateTarget = 0
    const triggers: ScrollTrigger[] = []
    if (!reduced) {
      STATE_SECTIONS.forEach((sel, idx) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: sel,
            start: 'top 90%',
            end: 'top 25%',
            onUpdate: (self) => {
              stateTarget = idx + self.progress
            },
            onLeave: () => {
              stateTarget = idx + 1
            },
            onLeaveBack: () => {
              stateTarget = Math.max(stateTarget - 1, idx)
            },
          }),
        )
      })
    }

    const t0 = performance.now()
    let raf = 0
    const render = () => {
      const t = reduced ? 1.5 : (performance.now() - t0) / 1000
      mat.uniforms.uTime.value = t

      const prevX = mouse.x
      const prevY = mouse.y
      mouse.lerp(targetMouse, 0.06)
      // cursor velocity drives the smear + acid flash
      vel.set(mouse.x - prevX, mouse.y - prevY).multiplyScalar(0.6)
      const uv = mat.uniforms.uVel.value as THREE.Vector2
      uv.lerp(vel, 0.25)
      mat.uniforms.uVelMag.value = Math.min(uv.length() * 24, 1)

      mat.uniforms.uMouse.value.copy(mouse)
      const s = mat.uniforms.uState.value as number
      mat.uniforms.uState.value = s + (stateTarget - s) * 0.06
      // field dims once you leave the hero so content stays readable
      mat.uniforms.uDim.value = 1 - Math.min(mat.uniforms.uState.value, 1) * 0.45

      parallax.lerp(targetParallax, 0.06)
      camera.position.x = parallax.x * 0.6
      camera.lookAt(0, 2, 0)
      renderer.render(scene, camera)
      if (!reduced) raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      triggers.forEach((tr) => tr.kill())
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="system-canvas" ref={mountRef} aria-hidden="true" />
}
