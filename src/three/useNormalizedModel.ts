import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

/**
 * AI-generated GLBs arrive at arbitrary scales/origins. Normalize each to a
 * known size with its base at y=0, centered on x/z, so layout is plain numbers.
 */
export function useNormalizedModel(
  url: string,
  targetSize: number,
  opts: { rotateY?: number; axis?: "max" | "x" | "y" | "z"; align?: "base" | "center" } = {},
): THREE.Group {
  const { scene } = useGLTF(url, "/draco/");

  return useMemo(() => {
    const clone = scene.clone(true);
    clone.rotation.y = opts.rotateY ?? 0;
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const axis = opts.axis ?? "max";
    const dim =
      axis === "max" ? Math.max(size.x, size.y, size.z) : size[axis];
    const scale = targetSize / (dim || 1);

    const wrapper = new THREE.Group();
    wrapper.add(clone);
    clone.scale.setScalar(scale);
    clone.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = scaledBox.getCenter(new THREE.Vector3());
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= opts.align === "center" ? center.y : scaledBox.min.y;

    return wrapper;
  }, [scene, targetSize, opts.rotateY, opts.axis, opts.align]);
}

export function preloadModels(urls: string[]) {
  urls.forEach((u) => useGLTF.preload(u, "/draco/"));
}
