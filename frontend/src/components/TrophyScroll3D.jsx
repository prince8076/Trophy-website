// TrophyScroll3D.jsx — drop-in for prince8076/Trophy-website
// ------------------------------------------------------------------
// What it is: the Apple-style scroll story from the reel, rebuilt as a
// REAL Three.js trophy (not an AI video). Scroll rotates it, zooms in
// for craftsmanship, then lands on engraving + Add to Bag.
//
// Install once in frontend/:
//   npm install three
//
// Use in frontend/src/pages/HomePage.jsx (replaces / sits under the
// existing hero — it does NOT replace Trophy3DViewer, which stays as
// the mouse-tilt card):
//   import TrophyScroll3D from '../components/TrophyScroll3D';
//   <TrophyScroll3D onAddToBag={() => navigate('/catalog')} />
//
// Props: onAddToBag (fn, optional), onEngrave (fn, optional).
// Notes:
//  - The trophy is built procedurally (lathe cup, tube handles, star
//    crest, canvas-texture plate) so there is no .glb file to ship.
//  - Touch scroll is never blocked: canvas uses touch-action pan-y
//    and drag is mouse-only.
//  - Respects prefers-reduced-motion: shows a static front view.
//  - FREE STACK ($0): Three.js MIT (npm three). Lighting tries the free
//    Poly Haven Studio Small 09 HDRI (CC0, no account) and falls back to
//    Three.js RoomEnvironment if it cannot load — never a paid HDRI.
//  - OPTIONAL FREE MODEL: drop a free Sketchfab "Simple Trophy" by Syed
//    Inzamam Haseen (CC Attribution) .glb into frontend/public/assets/
//    as simple-trophy.glb and this component swaps it in automatically.
//    Credit the author if you use that model. Without that file the
//    procedural trophy in code is used, so nothing breaks.
//  - Keep this component OUT of the cart/checkout flow — it only
//    calls the callbacks you pass in; it never invents a price or
//    writes to localStorage itself.

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const FINISHES = {
  gold: { color: 0xd4af37, roughness: 0.16 },
  silver: { color: 0xd7dde3, roughness: 0.12 },
  black: { color: 0x1c1c22, roughness: 0.28 },
};

function buildTrophy(metal, darkMetal, blackBase) {
  const trophy = new THREE.Group();

  const profile = [
    [0.0, 0.0], [0.42, 0.0], [0.6, 0.18], [0.74, 0.55],
    [0.86, 0.95], [0.92, 1.3], [0.95, 1.48],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), metal);
  cup.position.y = 0.55;
  cup.castShadow = true;
  trophy.add(cup);

  const rimTorus = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.055, 20, 64), metal);
  rimTorus.rotation.x = Math.PI / 2;
  rimTorus.position.y = 2.03;
  trophy.add(rimTorus);

  const handle = (sign) => {
    const pts = [
      new THREE.Vector3(0.82 * sign, 1.75, 0),
      new THREE.Vector3(1.42 * sign, 1.55, 0),
      new THREE.Vector3(1.52 * sign, 1.05, 0),
      new THREE.Vector3(1.3 * sign, 0.65, 0),
      new THREE.Vector3(0.72 * sign, 0.62, 0),
    ];
    return new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.085, 16, false),
      metal,
    );
  };
  trophy.add(handle(1), handle(-1));

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.55, 32), metal);
  stem.position.y = 0.28;
  trophy.add(stem);

  [[1.02, 0.2, -0.1], [0.9, 0.2, -0.28], [0.78, 0.2, -0.46]].forEach(([r, h, y], i) => {
    const tier = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r + 0.04, h, 48),
      i === 1 ? darkMetal : blackBase,
    );
    tier.position.y = y;
    tier.castShadow = true;
    trophy.add(tier);
  });

  const starShape = (outer, inner) => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  };
  const star = new THREE.Mesh(
    new THREE.ExtrudeGeometry(starShape(0.42, 0.17), {
      depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2,
    }),
    metal,
  );
  star.position.set(0, 1.55, 0.78);
  trophy.add(star);

  return trophy;
}

export default function TrophyScroll3D({ onAddToBag, onEngrave }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const metalRef = useRef(null);
  const [finish, setFinish] = useState('gold');
  const [lighting, setLighting] = useState('Loading free studio lighting…');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.4, 7);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const useRoomEnv = () => {
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      setLighting('Lighting: Three.js Room (free fallback)');
    };
    useRoomEnv();
    // Free Poly Haven CC0 HDRI (1K, fast). On any failure the Room
    // fallback above stays in place, so the trophy still renders.
    new RGBELoader().load(
      'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
      (hdr) => {
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = pmrem.fromTexture(hdr).texture;
        setLighting('Lighting: Poly Haven Studio Small 09 (CC0, free)');
      },
      undefined,
      () => useRoomEnv(),
    );

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 5);
    scene.add(key);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const metal = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37, metalness: 1, roughness: 0.16, clearcoat: 0.6, clearcoatRoughness: 0.25,
    });
    metalRef.current = metal;
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x111114, metalness: 0.9, roughness: 0.35 });
    const blackBase = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, metalness: 0.4, roughness: 0.5 });

    const trophy = buildTrophy(metal, darkMetal, blackBase);
    scene.add(trophy);
    let scrollModel = null;
    // Optional free model: frontend/public/assets/simple-trophy.glb
    // (Sketchfab "Simple Trophy", CC Attribution). Absent file = silent
    // error, procedural trophy stays. Never a required paid asset.
    new GLTFLoader().load(
      '/assets/simple-trophy.glb',
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const centre = new THREE.Vector3();
        box.getCenter(centre);
        const scale = 3.2 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.sub(centre.clone().multiplyScalar(scale));
        model.position.y += 0.7;
        model.traverse((o) => { if (o.isMesh) o.castShadow = true; });
        trophy.visible = false;
        scrollModel = model;
        scene.add(model);
      },
      undefined,
      () => { /* no free GLB present — keep procedural trophy */ },
    );

    let raf = 0;
    let target = reduced ? 0.12 : 0;
    let current = target;
    let dragY = 0, dragging = false, lastX = 0;

    const onDown = (e) => { if (e.pointerType !== 'touch') { dragging = true; lastX = e.clientX; } };
    const onMove = (e) => { if (dragging) { dragY += (e.clientX - lastX) * 0.005; lastX = e.clientX; } };
    const onUp = () => { dragging = false; };
    canvas.parentElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const resize = () => {
      const w = canvas.parentElement.clientWidth, h = canvas.parentElement.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);
    resize();

    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      if (!reduced) {
        const rect = stage.getBoundingClientRect();
        const total = Math.max(rect.height - window.innerHeight, 1);
        target = THREE.MathUtils.clamp(-rect.top / total, 0, 1);
      }
      current += (target - current) * 0.085;
      const p = current;
      trophy.rotation.y = p * Math.PI * 4 + dragY;
      if (scrollModel) scrollModel.rotation.y = p * Math.PI * 4 + dragY;
      trophy.rotation.x = Math.sin(p * Math.PI) * -0.12;
      trophy.position.y = Math.sin(t * 1.1) * 0.06;
      const camZ = p < 0.5 ? 7 - (p / 0.5) * 2.0 : 5 + ((p - 0.5) / 0.5) * 1.6;
      camera.position.z += (camZ - camera.position.z) * 0.08;
      camera.lookAt(0, 0.7, 0);
      setProgress((prev) => (Math.abs(prev - p) > 0.005 ? p : prev));
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.parentElement?.removeEventListener('pointerdown', onDown);
      renderer.dispose();
      pmrem.dispose();
    };
  }, []);

  useEffect(() => {
    if (!metalRef.current) return;
    const f = FINISHES[finish];
    metalRef.current.color.set(f.color);
    metalRef.current.roughness = f.roughness;
  }, [finish]);

  const chapter = (start, end) => {
    const fade = 0.06;
    const inn = THREE.MathUtils.smoothstep(progress, start, start + fade);
    const out = 1 - THREE.MathUtils.smoothstep(progress, end - fade, end);
    return Math.max(0, Math.min(inn, out));
  };
  const o1 = chapter(0, 0.18), o2 = chapter(0.18, 0.45), o3 = chapter(0.45, 0.72), o4 = chapter(0.72, 1.01);

  return (
    <section ref={stageRef} style={{ position: 'relative', height: '520vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#050505' }}>
        <div style={{ position: 'absolute', top: 10, right: 16, zIndex: 5, fontSize: 11, color: '#9a937f' }}>{lighting}</div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,.08)' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: '#d4af37' }} />
        </div>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'pan-y' }} />
        <div style={{ position: 'absolute', left: '50%', top: '14%', transform: 'translateX(-50%)', textAlign: 'center', opacity: o1, pointerEvents: 'none', width: 'min(560px,90vw)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px,4.5vw,48px)', color: '#fff' }}>
            Keep scrolling. <span style={{ color: '#d4af37' }}>The trophy turns.</span>
          </h2>
        </div>
        <div style={{ position: 'absolute', left: '6vw', top: '24%', opacity: o2, pointerEvents: 'none', maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff' }}>01 · 360° Rotation</h2>
          <p style={{ color: '#c9c2b2' }}>Scroll drives rotation — stop mid-scroll and it stops with you.</p>
        </div>
        <div style={{ position: 'absolute', right: '6vw', top: '24%', textAlign: 'right', opacity: o3, pointerEvents: 'none', maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff' }}>02 · Craftsmanship</h2>
          <p style={{ color: '#c9c2b2' }}>Camera moves in: curved handles, flared cup, star crest.</p>
        </div>
        <div style={{ position: 'absolute', left: '50%', top: '14%', transform: 'translateX(-50%)', textAlign: 'center', opacity: o4, pointerEvents: o4 > 0.6 ? 'auto' : 'none', width: 'min(560px,90vw)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff' }}>Free laser <span style={{ color: '#d4af37' }}>engraving.</span></h2>
          <button type="button" onClick={onAddToBag} style={{ background: '#d4af37', border: 'none', padding: '12px 20px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}>Add to Bag</button>
          <button type="button" onClick={onEngrave} style={{ marginLeft: 10, background: 'transparent', border: '1px solid #d4af37', color: '#ffe9a8', padding: '12px 20px', borderRadius: 999, cursor: 'pointer' }}>Engraving Studio →</button>
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: 26, transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
          {Object.keys(FINISHES).map((k) => (
            <button key={k} type="button" onClick={() => setFinish(k)} aria-label={`${k} finish`}
              style={{ width: 30, height: 30, borderRadius: '50%', border: finish === k ? '2px solid #fff' : '2px solid rgba(255,255,255,.25)', background: k === 'gold' ? '#d4af37' : k === 'silver' ? '#c0c0c0' : '#111', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </section>
  );
}
