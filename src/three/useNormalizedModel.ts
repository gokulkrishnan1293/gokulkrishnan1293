import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

/**
 * Loads a GLB and normalizes it into a predictable local space:
 * centered on origin (x/z), ground at y=0, scaled so its bounding-sphere
 * radius equals `targetRadius`.
 *
 * The camera choreography is authored against this normalized space, so it
 * survives any authoring quirks in the source assets (Sketchfab axis bakes,
 * arbitrary units, off-center pivots).
 */
export function useNormalizedModel(url: string, targetRadius: number, emissiveBoost = 1) {
  const gltf = useGLTF(url);

  return useMemo(() => {
    const scene = gltf.scene;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.z) / 2 || 1;
    const scale = targetRadius / radius;

    const group = new THREE.Group();
    group.add(scene);
    scene.position.set(-center.x, -box.min.y, -center.z);
    group.scale.setScalar(scale);

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (std.emissiveMap || (std.emissive && (std.emissive.r + std.emissive.g + std.emissive.b) > 0.01)) {
          std.emissiveIntensity = emissiveBoost;
        }
      }
    });

    const normSize = {
      x: size.x * scale,
      y: size.y * scale,
      z: size.z * scale,
    };
    return { group, size: normSize, animations: gltf.animations, inner: scene };
  }, [gltf, targetRadius, emissiveBoost]);
}

useGLTF.preload("/models/city.glb");
useGLTF.preload("/models/elevator.glb");
