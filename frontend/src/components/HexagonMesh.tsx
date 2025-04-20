import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import '../styles/hexagonMesh.css';

interface HexagonMeshProps {
  color?: string;
  density?: number;
  animate?: boolean;
}

export const HexagonMesh = ({
  color = '#9747FF',
  density = 25,
  animate = true,
}: HexagonMeshProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const hexagonsRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Create hexagon group
    const hexagons = new THREE.Group();
    hexagonsRef.current = hexagons;
    scene.add(hexagons);

    // Create hexagon mesh
    const hexRadius = 2;
    const hexHeight = hexRadius * Math.sqrt(3);
    const gridSize = density;

    const hexGeometry = new THREE.BufferGeometry();
    
    // Create hexagon shape points
    const vertices = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      vertices.push(
        hexRadius * Math.cos(angle),
        hexRadius * Math.sin(angle),
        0
      );
    }
    
    const indices = [
      0, 1, 2,
      0, 2, 3,
      0, 3, 4,
      0, 4, 5
    ];
    
    hexGeometry.setIndex(indices);
    hexGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const hexMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.3,
      linewidth: 1,
    });

    // Create grid of hexagons
    for (let row = -gridSize; row < gridSize; row++) {
      for (let col = -gridSize; col < gridSize; col++) {
        const hexMesh = new THREE.LineSegments(hexGeometry, hexMaterial);
        hexMesh.position.x = col * hexRadius * 3;
        hexMesh.position.y = row * hexHeight;
        
        // Offset every other row
        if (row % 2 !== 0) {
          hexMesh.position.x += hexRadius * 1.5;
        }
        
        // Add some randomness to z position for depth effect
        hexMesh.position.z = Math.random() * 10 - 20;
        
        // Random opacity variation
        (hexMesh.material as THREE.LineBasicMaterial).opacity = 
          0.1 + Math.random() * 0.3;
          
        hexagons.add(hexMesh);
      }
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (hexagonsRef.current && animate) {
        hexagonsRef.current.rotation.z += 0.0003;
        hexagonsRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (hexagonsRef.current) {
        hexagonsRef.current.children.forEach(child => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            (child.material as THREE.Material).dispose();
          }
        });
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [color, density, animate]);

  return (
    <div className="hexagon-mesh-container">
      <canvas ref={canvasRef} className="hexagon-mesh" />
      <div className="hexagon-overlay" />
    </div>
  );
};

export default HexagonMesh; 