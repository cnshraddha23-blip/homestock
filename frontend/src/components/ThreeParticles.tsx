import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeParticlesProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

export const ThreeParticles: React.FC<ThreeParticlesProps> = ({
  className = "absolute inset-0 pointer-events-none z-0",
  particleCount = 220,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Point Particle Cloud (Grain & Culinary Spices)
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const originalPositions = new Float32Array(particleCount * 3);

    // Colors: Orange (#E9853B), Dark Orange (#CA6429), Charcoal (#252522), Warm Gold (#D89758), Sand (#C4B8A5)
    const palette = [
      new THREE.Color('#E9853B'),
      new THREE.Color('#CA6429'),
      new THREE.Color('#252522'),
      new THREE.Color('#D89758'),
      new THREE.Color('#A89F91'),
    ];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 36;
      const y = (Math.random() - 0.5) * 24;
      const z = (Math.random() - 0.5) * 20;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      scales[i] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular soft glow particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.7, 'rgba(233, 133, 59, 0.2)');
      grad.addColorStop(1, 'rgba(233, 133, 59, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.38,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Floating 3D Geometric Pantry Nodes (Low-poly crystals & nodes)
    const floatingGroup = new THREE.Group();
    const meshCount = 12;
    const meshes: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number; z: number }; initialPos: THREE.Vector3; floatSpeed: number }[] = [];

    const geomTypes = [
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.6, 0),
      new THREE.DodecahedronGeometry(0.45, 0),
    ];

    for (let j = 0; j < meshCount; j++) {
      const g = geomTypes[j % geomTypes.length];
      const isOrange = j % 2 === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: isOrange ? 0xE9853B : 0x353530,
        wireframe: true,
        transparent: true,
        opacity: isOrange ? 0.28 : 0.18,
      });

      const m = new THREE.Mesh(g, mat);
      const initX = (Math.random() - 0.5) * 30;
      const initY = (Math.random() - 0.5) * 18;
      const initZ = (Math.random() - 0.5) * 12;

      m.position.set(initX, initY, initZ);
      floatingGroup.add(m);

      meshes.push({
        mesh: m,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.01,
        },
        initialPos: new THREE.Vector3(initX, initY, initZ),
        floatSpeed: Math.random() * 0.5 + 0.3,
      });
    }

    scene.add(floatingGroup);

    // Mouse Tracking with smooth interpolation
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX = (x / container.clientWidth) * 2 - 1;
      mouseY = -(y / container.clientHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // 4. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation towards mouse
      targetX += (mouseX * 2.2 - targetX) * 0.04;
      targetY += (mouseY * 1.8 - targetY) * 0.04;

      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Particle floating drift
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        posAttr.setXYZ(
          i,
          ox + Math.sin(elapsedTime * 0.35 + i * 0.5) * 0.45,
          oy + Math.cos(elapsedTime * 0.3 + i * 0.7) * 0.5,
          oz + Math.sin(elapsedTime * 0.25 + i * 0.3) * 0.35
        );
      }
      posAttr.needsUpdate = true;
      particles.rotation.y = elapsedTime * 0.018;

      // Animate floating 3D low-poly geometries
      for (let k = 0; k < meshes.length; k++) {
        const item = meshes[k];
        item.mesh.rotation.x += item.rotSpeed.x;
        item.mesh.rotation.y += item.rotSpeed.y;
        item.mesh.rotation.z += item.rotSpeed.z;

        item.mesh.position.y = item.initialPos.y + Math.sin(elapsedTime * item.floatSpeed + k) * 0.6;
        item.mesh.position.x = item.initialPos.x + Math.cos(elapsedTime * item.floatSpeed * 0.7 + k) * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      geomTypes.forEach(g => g.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount, interactive]);

  return <div ref={mountRef} className={className} />;
};
