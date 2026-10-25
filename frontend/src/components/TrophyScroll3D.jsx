// TrophyScroll3D.jsx — SMOOTH version (v5, box closing + gold accents) for prince8076/Trophy-website
// ------------------------------------------------------------------
// Why this is smoother and not laggy — the reel's trick, done free:
// The reel scrubs a VIDEO (a sequence of images) on scroll. A video
// scrub is cheap because scroll only swaps pictures, it does not
// re-render 3D shaders while the user is scrolling.
//
// This component does the same thing, with IMAGES, not live WebGL:
//  1. If pre-rendered frames exist at /scroll-trophy/frame-000.webp …
//     frame-047.webp (see generate note at the bottom), it loads those.
//  2. Otherwise it PRE-RENDERS its own frames once, in the visitor's
//     browser, with Three.js: 48 pictures of the same procedural
//     trophy at 48 scroll positions (rotation + camera zoom baked in),
//     stored as small WebP blobs (~30 KB each, ~1.5 MB total).
//     After that one-time step, scrolling only does drawImage() —
//     no WebGL, no shader cost, no React re-render per frame.
//  3. If pre-rendering fails (no WebGL, old browser), it falls back
//     to the previous live-WebGL loop, optimised (DPR capped, no dust).
//
// Lag fixes vs v2, all in this file:
//  - NO setState per scroll frame. Scroll updates DOM styles directly
//    through refs (canvas, progress bar, chapters). React only
//    re-renders for: pre-render progress, finish change, mode change.
//  - Passive scroll listener + a single rAF loop that draws ONLY
//    when the frame index actually changed.
//  - DPR capped at 1.5, pre-render resolution 800 px, 48 frames on
//    desktop / 36 on small screens. Storing blobs, not raw canvases,
//    so memory stays low (browser decodes only the current frame).
//  - IntersectionObserver pauses the loop when the section is off
//    screen. prefers-reduced-motion shows one static frame.
//  - Finish switcher re-renders the frame set (once, ~1 s) instead
//    of trying to recolour pictures that are already baked.
//
// Props: onAddToBag (fn, optional), onEngrave (fn, optional).
// Free stack ($0): Three.js MIT (npm three), studio lighting built
// in code (no external HDRI — the Poly Haven HDRI failed with CORS
// in the user's browser and fell back to a dark Room, see v4 note),
// Google Fonts OFL.
// Optional free model: frontend/public/assets/simple-trophy.glb
// (Sketchfab "Simple Trophy" by Syed Inzamam Haseen, CC Attribution
// — credit the author if you use it). Without it, the procedural
// trophy in code is used, so nothing breaks.

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

// Same procedural trophy as v2 — lathe cup, tube handles, star crest.
function buildTrophy(cupMetal, goldMetal, darkMetal, blackBase) {
  // cupMetal = finish colour (gold/silver/black). goldMetal is ALWAYS gold,
  // so handles, rim, star and trim stay gold even on a black cup —
  // that is what stops a black finish looking like a plain black mug.
  cupMetal.side = THREE.DoubleSide;
  const trophy = new THREE.Group();
  const profile = [
    [0.0, 0.0], [0.42, 0.0], [0.6, 0.18], [0.74, 0.55],
    [0.86, 0.95], [0.92, 1.3], [0.95, 1.48],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), cupMetal);
  cup.position.y = 0.55;
  cup.castShadow = true;
  trophy.add(cup);
  const rimTorus = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.055, 20, 64), goldMetal);
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
      goldMetal,
    );
  };
  trophy.add(handle(1), handle(-1));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.55, 32), goldMetal);
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
    const trim = new THREE.Mesh(new THREE.TorusGeometry(r + 0.02, 0.025, 12, 64), goldMetal);
    trim.rotation.x = Math.PI / 2;
    trim.position.y = y + h / 2;
    trophy.add(trim);
  });
  // Engraved plate on the front of the base — the detail that makes
  // it read as a trophy, not a cup.
  const plateCanvas = document.createElement('canvas');
  plateCanvas.width = 512; plateCanvas.height = 160;
  const pg = plateCanvas.getContext('2d');
  pg.fillStyle = '#c9a227'; pg.fillRect(0, 0, 512, 160);
  pg.strokeStyle = '#7a5f10'; pg.lineWidth = 6; pg.strokeRect(10, 10, 492, 140);
  pg.fillStyle = '#231a00'; pg.textAlign = 'center';
  pg.font = '700 44px Georgia, serif'; pg.fillText('CHAMPION', 256, 68);
  pg.font = '400 28px Georgia, serif'; pg.fillText('2026  •  AURA TROPHY', 256, 116);
  const plateTex = new THREE.CanvasTexture(plateCanvas);
  plateTex.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.36, 0.06),
    new THREE.MeshStandardMaterial({ map: plateTex, metalness: 0.7, roughness: 0.3 }),
  );
  plate.position.set(0, -0.28, 0.92);
  trophy.add(plate);
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
    goldMetal,
  );
  star.position.set(0, 1.55, 0.78);
  trophy.add(star);
  return trophy;
}


// Presentation box that CLOSES around the trophy on scroll — the
// reel's packaging beat. Sides start flat on the ground (open flaps),
// fold up to vertical walls, then the lid swings down from behind.
// All of this is baked into the pre-rendered frames, so scrolling
// shows the box closing, frame by frame, exactly like a video scrub.
function buildBox(goldMetal) {
  const W = 3.6, D = 3.6, H = 3.2, TH = 0.08, BASE_Y = -0.62;
  const black = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.2, roughness: 0.65 });
  const group = new THREE.Group();
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(W, TH, D), black);
  bottom.position.y = BASE_Y + TH / 2;
  group.add(bottom);
  const makeFlap = (w, d, x, z, openAngle, axis) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, BASE_Y, z);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), black);
    mesh.position.y = H / 2;
    pivot.add(mesh);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(w === TH ? TH : w, 0.06, d === TH ? TH : d), goldMetal);
    trim.position.y = H;
    pivot.add(trim);
    group.add(pivot);
    return { pivot, openAngle, axis };
  };
  const flaps = [
    makeFlap(W, TH, 0, D / 2, Math.PI / 2, 'x'),   // front, folds forward-out
    makeFlap(W, TH, 0, -D / 2, -Math.PI / 2, 'x'), // back
    makeFlap(TH, D, -W / 2, 0, Math.PI / 2, 'z'),  // left
    makeFlap(TH, D, W / 2, 0, -Math.PI / 2, 'z'),  // right
  ];
  // Lid, hinged at the back top edge.
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, BASE_Y + H, -D / 2);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(W + 0.16, TH, D + 0.16), black);
  lid.position.set(0, TH / 2, D / 2);
  lidPivot.add(lid);
  const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, D + 0.16), goldMetal);
  ribbon1.position.set(0, TH + 0.02, D / 2);
  lidPivot.add(ribbon1);
  const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(W + 0.16, 0.03, 0.42), goldMetal);
  ribbon2.position.set(0, TH + 0.02, D / 2);
  lidPivot.add(ribbon2);
  const bowL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), goldMetal);
  bowL.scale.set(1, 0.45, 0.7); bowL.position.set(-0.22, TH + 0.12, D / 2);
  const bowR = bowL.clone(); bowR.position.x = 0.22;
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), goldMetal);
  knot.position.set(0, TH + 0.12, D / 2);
  lidPivot.add(bowL, bowR, knot);
  group.add(lidPivot);
  group.visible = false;
  return { group, flaps, lidPivot, BASE_Y, H };
}

function updateBox(box, p) {
  // Flaps close first (p 0.55 -> 0.85), lid closes last (p 0.78 -> 0.97).
  const flapP = THREE.MathUtils.smoothstep(p, 0.55, 0.85);
  const lidP = THREE.MathUtils.smoothstep(p, 0.78, 0.97);
  box.group.visible = p > 0.54;
  box.flaps.forEach((f) => {
    const angle = f.openAngle * (1 - flapP);
    if (f.axis === 'x') f.pivot.rotation.x = angle; else f.pivot.rotation.z = angle;
  });
  box.lidPivot.rotation.x = (-Math.PI / 2) * (1 - lidP);
}

// Scroll progress -> trophy pose, identical in live mode and in frames,
// so the image version looks exactly like the live version did.
function poseFor(p, trophy, camera, box) {
  if (box) updateBox(box, p);
  trophy.rotation.y = p * Math.PI * 4;
  trophy.rotation.x = Math.sin(p * Math.PI) * -0.12;
  trophy.position.y = 0;
  const camZ = p < 0.5 ? 8.5 - (p / 0.5) * 2.0 : 6.5 + ((p - 0.5) / 0.5) * 1.5;
  camera.position.set(0, 0.4 + Math.sin(p * Math.PI) * 0.25, camZ);
  camera.lookAt(0, 0.7, 0);
}


// Bright studio environment, built in code — no external HDRI file,
// no CORS failure, always the same look. The FRONT softbox is the
// fix for the screenshot: without it, the cup's front face reflected
// only the black background behind the camera and looked brown,
// while the curved handles reflected the side windows and looked gold.
function makeStudioEnv(pmrem) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x000000);
  const panel = (w, h, color, x, y, z, rx, ry) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    env.add(m);
  };
  panel(12, 7, 0xfff2cc, 0, 1, 10, 0, Math.PI); // front, warm — gold reflections, not silver
  panel(12, 7, 0xffffff, 0, 10, 0, Math.PI / 2, 0); // top
  panel(7, 7, 0xffe9a8, -10, 1, 0, 0, Math.PI / 2); // left, warm gold
  panel(7, 7, 0xffffff, 10, 1, 0, 0, -Math.PI / 2); // right
  panel(12, 7, 0x555555, 0, 1, -10, 0, 0); // back, dim
  return pmrem.fromScene(env, 0.04).texture;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function TrophyScroll3D({ onAddToBag, onEngrave }) {
  const stageRef = useRef(null);
  const scrubRef = useRef(null); // 2D canvas — the only thing scroll draws to
  const liveRef = useRef(null); // WebGL canvas — only shown on pre-render failure
  const progressRef = useRef(null);
  const lightRef = useRef(null);
  const chapterRefs = useRef([]);
  const [finish, setFinish] = useState('gold');
  const [prep, setPrep] = useState(0); // 0..100, pre-render / preload progress
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState('frames'); // 'frames' | 'live'
  const [lighting, setLighting] = useState('Preparing 3D frames…');

  useEffect(() => {
    const stage = stageRef.current;
    const scrub = scrubRef.current;
    const live = liveRef.current;
    if (!stage || !scrub || !live) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 768;
    const FRAME_COUNT = isSmall ? 36 : 48;
    const SIZE = 800;
    let cancelled = false;
    let raf = 0;
    let visible = true;
    let images = [];
    let currentIdx = -1;
    let targetP = reduced ? 0.12 : 0;
    let currentP = targetP;

    const ctx = scrub.getContext('2d');
    const drawFrame = (idx) => {
      if (!images[idx] || idx === currentIdx) return;
      currentIdx = idx;
      const img = images[idx];
      // Contain-fit: whole trophy always visible, never cropped.
      // (Cover-fit was the bug in the screenshot — it cut off the
      //  rim at the top and the base at the bottom on wide screens.)
      const cw = scrub.width, ch = scrub.height;
      const scale = Math.min(cw / img.width, ch / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const chapterOpacity = (p, start, end) => {
      const fade = 0.12;
      const inn = THREE.MathUtils.smoothstep(p, start, start + fade);
      const out = 1 - THREE.MathUtils.smoothstep(p, end - fade, end);
      return Math.max(0, Math.min(inn, out));
    };
    const CHAPTERS = [[0, 0.18], [0.18, 0.42], [0.42, 0.60], [0.60, 0.88], [0.88, 1.01]];
    const updateChrome = (p) => {
      if (progressRef.current) progressRef.current.style.width = `${(p * 100).toFixed(1)}%`;
      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = chapterOpacity(p, CHAPTERS[i][0], CHAPTERS[i][1]);
        el.style.opacity = o;
        const isCentre = i === 0 || i === 4;
        el.style.transform = isCentre
          ? `translate(-50%, ${(1 - o) * 24}px)`
          : `translateY(${(1 - o) * 24}px)`;
        el.style.pointerEvents = o > 0.6 && i === 4 ? 'auto' : 'none';
      });
    };

    const resizeScrub = () => {
      const parent = scrub.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      scrub.width = Math.round(parent.clientWidth * dpr);
      scrub.height = Math.round(parent.clientHeight * dpr);
      currentIdx = -1; // force redraw at new size
    };
    resizeScrub();
    window.addEventListener('resize', resizeScrub);

    const rawProgress = () => {
      const rect = stage.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      return THREE.MathUtils.clamp(-rect.top / total, 0, 1);
    };

    // ---- Scroll loop: cheap. No WebGL, no setState, draw only on change.
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (!reduced) targetP = rawProgress();
      currentP += (targetP - currentP) * 0.16; // faster ease than v2 (0.085) = less trailing lag
      const count = images.length || FRAME_COUNT;
      const idx = Math.round(currentP * (count - 1));
      if (images.length) drawFrame(idx);
      updateChrome(currentP);
    };

    const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    observer.observe(stage);

    // ---- Build the frame set ----
    const buildFrames = async () => {
      // Mode A: server frames, if the user generated them (see bottom note).
      try {
        const first = await loadImage('/scroll-trophy/frame-000.webp');
        const list = [first];
        for (let i = 1; i < FRAME_COUNT; i++) {
          const name = `/scroll-trophy/frame-${String(i).padStart(3, '0')}.webp`;
          list.push(await loadImage(name));
          if (cancelled) return null;
          setPrep(Math.round(((i + 1) / FRAME_COUNT) * 100));
        }
        setLighting('Frames: pre-rendered images (fastest)');
        return list;
      } catch (e) { /* no server frames — fall through to runtime pre-render */ }

      // Mode B: runtime pre-render in this browser.
      let renderer;
      try {
        const glCanvas = document.createElement('canvas');
        glCanvas.width = SIZE; glCanvas.height = SIZE;
        renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true });
        renderer.setPixelRatio(1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = makeStudioEnv(pmrem);
        const key = new THREE.DirectionalLight(0xffffff, 2.2);
        key.position.set(4, 6, 5);
        scene.add(key);
        const front = new THREE.DirectionalLight(0xffffff, 3.0);
        front.position.set(0, 2, 8);
        scene.add(front);
        const fill = new THREE.DirectionalLight(0xffe9a8, 1.2);
        fill.position.set(-4, 1, 6);
        scene.add(fill);
        scene.add(new THREE.AmbientLight(0xffffff, 0.35));
        const f = FINISHES[finish];
        const cupMetal = new THREE.MeshPhysicalMaterial({
          color: f.color, metalness: 1, roughness: f.roughness, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.8,
        });
        const goldMetal = new THREE.MeshPhysicalMaterial({
          color: 0xd4af37, metalness: 1, roughness: 0.16, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.8,
        });
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x111114, metalness: 0.9, roughness: 0.35 });
        const blackBase = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, metalness: 0.4, roughness: 0.5 });
        const trophy = buildTrophy(cupMetal, goldMetal, darkMetal, blackBase);
        scene.add(trophy);
        const box = buildBox(goldMetal);
        scene.add(box.group);
        let active = trophy;
        // Optional free GLB — same slot as v2, applied before framing.
        try {
          const gltf = await new GLTFLoader().loadAsync('/assets/simple-trophy.glb');
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3(); box.getSize(size);
          const centre = new THREE.Vector3(); box.getCenter(centre);
          const scale = 3.2 / Math.max(size.x, size.y, size.z);
          model.scale.setScalar(scale);
          model.position.sub(centre.clone().multiplyScalar(scale));
          model.position.y += 0.7;
          trophy.visible = false;
          active = model;
          scene.add(model);
        } catch (e) { /* no GLB — procedural trophy stays */ }

        const list = [];
        for (let i = 0; i < FRAME_COUNT; i++) {
          if (cancelled) return null;
          poseFor(i / (FRAME_COUNT - 1), active, camera, box);
          renderer.render(scene, camera);
          // Compress to a small WebP blob — this is the "multiple images" step.
          const blob = await new Promise((res) => glCanvas.toBlob(res, 'image/webp', 0.82));
          if (!blob) throw new Error('toBlob failed');
          const url = URL.createObjectURL(blob);
          list.push(await loadImage(url));
          setPrep(Math.round(((i + 1) / FRAME_COUNT) * 100));
          // Yield so the prep progress bar actually paints.
          await new Promise((r) => setTimeout(r, 0));
        }
        return list;
      } catch (e) {
        return null; // -> live fallback below
      } finally {
        if (renderer) renderer.dispose();
      }
    };

    buildFrames().then((list) => {
      if (cancelled) return;
      if (list && list.length) {
        images = list;
        setReady(true);
        drawFrame(reduced ? Math.round(0.12 * (list.length - 1)) : 0);
        updateChrome(currentP);
        loop();
      } else {
        // Mode C: live WebGL fallback, optimised. Visible only on failure.
        setMode('live');
        setLighting('Live 3D fallback (pre-render unavailable)');
        setReady(true);
        scrub.style.display = 'none';
        live.style.display = 'block';
        try {
          const renderer = new THREE.WebGLRenderer({ canvas: live, antialias: true, alpha: true });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
          const pmrem = new THREE.PMREMGenerator(renderer);
          scene.environment = makeStudioEnv(pmrem);
          scene.add(new THREE.DirectionalLight(0xffffff, 2.0));
          scene.add(new THREE.AmbientLight(0xffffff, 0.3));
          const f = FINISHES[finish];
          const cupMetal = new THREE.MeshPhysicalMaterial({ color: f.color, metalness: 1, roughness: f.roughness, envMapIntensity: 1.8 });
          const goldMetal = new THREE.MeshPhysicalMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.16, envMapIntensity: 1.8 });
          const trophy = buildTrophy(
            cupMetal, goldMetal,
            new THREE.MeshStandardMaterial({ color: 0x111114, metalness: 0.9, roughness: 0.35 }),
            new THREE.MeshStandardMaterial({ color: 0x0c0c0e, metalness: 0.4, roughness: 0.5 }),
          );
          scene.add(trophy);
          const box = buildBox(goldMetal);
          scene.add(box.group);
          const resizeLive = () => {
            const parent = live.parentElement;
            renderer.setSize(parent.clientWidth, parent.clientHeight, false);
            camera.aspect = parent.clientWidth / parent.clientHeight;
            camera.updateProjectionMatrix();
          };
          resizeLive();
          window.addEventListener('resize', resizeLive);
          const liveLoop = () => {
            raf = requestAnimationFrame(liveLoop);
            if (!visible) return;
            if (!reduced) targetP = rawProgress();
            currentP += (targetP - currentP) * 0.16;
            poseFor(currentP, trophy, camera, box);
            renderer.render(scene, camera);
            updateChrome(currentP);
          };
          liveLoop();
        } catch (e) { /* WebGL unavailable — chapters + text still show */ }
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resizeScrub);
    };
  }, [finish]);

  useEffect(() => { if (lightRef.current) lightRef.current.textContent = lighting; }, [lighting]);

  const chapter = (i) => (el) => { chapterRefs.current[i] = el; };

  return (
    <section ref={stageRef} style={{ position: 'relative', height: '520vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#050505' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,.08)', zIndex: 5 }}>
          <div ref={progressRef} style={{ height: '100%', width: '0%', background: '#d4af37' }} />
        </div>
        {!ready && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', zIndex: 4, width: 'min(320px,80vw)' }}>
            <div style={{ color: '#e8c766', fontWeight: 800, marginBottom: 10 }}>Preparing 3D frames… {prep}%</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${prep}%`, background: '#d4af37' }} />
            </div>
            <div style={{ color: '#9a937f', fontSize: 12, marginTop: 10 }}>One-time only — after this, scrolling just swaps pictures, so it stays smooth.</div>
          </div>
        )}
        <canvas ref={scrubRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'pan-y', display: mode === 'live' ? 'none' : 'block' }} />
        <canvas ref={liveRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'pan-y', display: 'none' }} />
        <div ref={chapter(0)} style={{ position: 'absolute', left: '50%', top: '14%', transform: 'translateX(-50%)', textAlign: 'center', opacity: 0, zIndex: 6, textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none', width: 'min(560px,90vw)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px,4.5vw,48px)', color: '#fff' }}>
            Keep scrolling. <span style={{ color: '#d4af37' }}>The trophy turns.</span>
          </h2>
        </div>
        <div ref={chapter(1)} style={{ position: 'absolute', left: '6vw', top: '24%', opacity: 0, zIndex: 6, textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none', maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff' }}>01 · 360° Rotation</h2>
          <p style={{ color: '#c9c2b2' }}>Scroll drives the pictures — stop mid-scroll and it stops with you.</p>
        </div>
        <div ref={chapter(2)} style={{ position: 'absolute', right: '6vw', top: '24%', textAlign: 'right', opacity: 0, zIndex: 6, textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none', maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff' }}>02 · Craftsmanship</h2>
          <p style={{ color: '#c9c2b2' }}>Camera moves in: curved handles, flared cup, star crest.</p>
        </div>
        <div ref={chapter(3)} style={{ position: 'absolute', left: '6vw', top: '24%', opacity: 0, zIndex: 6, textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none', maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff' }}>03 · Closing in a box</h2>
          <p style={{ color: '#c9c2b2' }}>Keep scrolling — the sides fold up, the gold ribbon lid swings down, and your trophy is boxed, just like the reel's packaging.</p>
        </div>
        <div ref={chapter(4)} style={{ position: 'absolute', left: '50%', top: '14%', transform: 'translateX(-50%)', textAlign: 'center', opacity: 0, zIndex: 6, textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none', width: 'min(560px,90vw)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff' }}>Boxed &amp; ready <span style={{ color: '#d4af37' }}>to gift.</span></h2>
          <p style={{ color: '#c9c2b2', marginBottom: 12 }}>Free laser engraving included.</p>
          <button type="button" onClick={onAddToBag} style={{ background: '#d4af37', border: 'none', padding: '12px 20px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}>Add to Bag</button>
          <button type="button" onClick={onEngrave} style={{ marginLeft: 10, background: 'transparent', border: '1px solid #d4af37', color: '#ffe9a8', padding: '12px 20px', borderRadius: 999, cursor: 'pointer' }}>Engraving Studio →</button>
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: 26, transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
          {Object.keys(FINISHES).map((k) => (
            <button key={k} type="button" onClick={() => { setReady(false); setPrep(0); setFinish(k); }} aria-label={`${k} finish`}
              style={{ width: 30, height: 30, borderRadius: '50%', border: finish === k ? '2px solid #fff' : '2px solid rgba(255,255,255,.25)', background: k === 'gold' ? '#d4af37' : k === 'silver' ? '#c0c0c0' : '#111', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Optional server frames (fastest first load, no runtime pre-render):
// If you ever want zero wait on first visit, generate the frames once
// in a real browser and save them as:
//   frontend/public/scroll-trophy/frame-000.webp … frame-047.webp
// (48 desktop / 36 mobile frames are both accepted — the component
//  tries 000 first, then loads up to its frame count; if a later
//  frame is missing it falls back to runtime pre-render.)
// Why they are not in this push: the Muse GitHub connector only
// pushes text files — binary WebP/PNG files are rejected by
// push-files. Generate them on your own machine with a normal
// `git add` / `git push`, or just leave runtime pre-render on —
// it is the default, and it is what makes scroll smooth anyway.
