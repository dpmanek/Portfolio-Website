import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uMouse;
  varying float vElev;
  varying float vDist;
  varying float vDepth;

  float wave(vec2 p, float t) {
    float e = sin(p.x * 0.28 + t * 0.7) * 0.55;
    e += sin(p.y * 0.22 - t * 0.45) * 0.45;
    e += sin((p.x + p.y) * 0.16 + t * 0.3) * 0.7;
    e += sin(length(p) * 0.35 - t * 0.8) * 0.35;
    return e;
  }

  void main() {
    vec3 pos = position;
    float t = uTime;
    float e = wave(pos.xy, t);

    // mouse ripple: lift the field near the cursor
    float md = distance(pos.xy * 0.04, uMouse);
    e += smoothstep(0.5, 0.0, md) * 1.4;

    pos.z += e;
    vElev = e;
    vDist = length(position.xy);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    vDepth = -mv.z;
    gl_PointSize = min((1.6 + e * 0.9) * (uSize / -mv.z), 7.0);
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAcid;
  varying float vElev;
  varying float vDist;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;

    float mixv = smoothstep(0.2, 1.9, vElev);
    vec3 col = mix(uBase, uAcid, mixv);
    float edgeFade = 1.0 - smoothstep(14.0, 26.0, vDist);
    float nearFade = smoothstep(3.0, 9.0, vDepth);
    float alpha = (0.4 + mixv * 0.6) * edgeFade * nearFade;
    gl_FragColor = vec4(col, alpha);
  }
`

export default function HeroCanvas() {
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
        uMouse: { value: new THREE.Vector2(99, 99) },
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
    const parallax = new THREE.Vector2(0, 0)
    const targetParallax = new THREE.Vector2(0, 0)
    const onMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
      const ny = -((e.clientY - r.top) / r.height - 0.5) * 2
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

    const t0 = performance.now()
    let raf = 0
    const render = () => {
      const t = reduced ? 1.5 : (performance.now() - t0) / 1000
      mat.uniforms.uTime.value = t
      mouse.lerp(targetMouse, 0.06)
      mat.uniforms.uMouse.value.copy(mouse)
      parallax.lerp(targetParallax, 0.06)
      camera.position.x = parallax.x * 0.6
      camera.lookAt(0, 2, 0)
      renderer.render(scene, camera)
      if (!reduced) raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="hero-canvas" ref={mountRef} aria-hidden="true" />
}
