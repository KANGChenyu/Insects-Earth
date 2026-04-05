export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.16} color="#d9e9ff" />
      <hemisphereLight
        args={['#cde4ff', '#0b1422', 1.05]}
        position={[0, 4.2, 0]}
      />
      <directionalLight
        position={[4.2, 2.9, 5.8]}
        intensity={2.05}
        color="#fff4cf"
      />
      <directionalLight
        position={[-5.8, 0.2, -4.5]}
        intensity={0.42}
        color="#8ab9ff"
      />
      <pointLight
        position={[0.6, -0.9, 4.8]}
        intensity={6.2}
        distance={18}
        decay={2}
        color="#66a9ff"
      />
      <pointLight
        position={[-3.4, 2.2, -2.8]}
        intensity={2.8}
        distance={12}
        decay={2}
        color="#74ffd8"
      />
    </>
  )
}
