/**
 * GodsEyeView.jsx — 3D God's Eye Digital Twin Scene
 * Project Drishti | SIH 2026 PS-26060
 * Three.js via @react-three/fiber + @react-three/drei
 */
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import * as THREE from 'three'

// ─── Status colour mapping ────────────────────────────────────────────────────
const STATUS = {
  NORMAL:   { color: '#2a5a8c', emissive: '#1a3a5c' },
  WARNING:  { color: '#c47a00', emissive: '#7a4a00' },
  CRITICAL: { color: '#a00000', emissive: '#6b0000' },
}

// ─── Pulsing emissive (CRITICAL only) ────────────────────────────────────────
function PulsingMesh({ geometry, position, status = 'NORMAL', onHover, onClick, label }) {
  const matRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { color, emissive } = STATUS[status] || STATUS.NORMAL

  useFrame(({ clock }) => {
    if (!matRef.current) return
    if (status === 'CRITICAL') {
      matRef.current.emissiveIntensity = 0.2 + (Math.sin(clock.elapsedTime * 4) * 0.5 + 0.5) * 0.6
    } else {
      matRef.current.emissiveIntensity = hovered ? 0.4 : 0.1
    }
  })

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => { document.body.style.cursor = 'auto' }
  }, [hovered])

  return (
    <mesh
      position={position}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); onHover && onHover(label) }}
      onPointerOut={e => { e.stopPropagation(); setHovered(false); onHover && onHover(null) }}
      onClick={e => { e.stopPropagation(); onClick && onClick({ label, status }) }}
    >
      {geometry}
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={new THREE.Color(emissive)}
        emissiveIntensity={0.1}
        roughness={0.65}
        metalness={0.25}
      />
    </mesh>
  )
}

// ─── Maitri Station (Schirmacher Oasis, Lake Priyadarshini, Stilted Habitat) ───
function MaitriStation({ tel, onZoneClick, onZoneHover, isNight = true, viewMode = 'standard' }) {
  const es = tel?.electricity?.status || 'NORMAL'
  const fs = tel?.fuel?.status || 'NORMAL'
  const ws = tel?.water?.status || 'NORMAL'

  const habitatColor = viewMode === 'thermal' ? '#7201a8' : '#e5a93b' // Authentic expedition yellow
  const isXRay = viewMode === 'xray'

  return (
    <group position={[-45, 0, -10]}>
      {/* 1. Lake Priyadarshini (Freshwater source named after Indira Gandhi) */}
      <group position={[-16, 0.05, 16]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[16, 32]} />
          <meshStandardMaterial
            color="#3a8ba8"
            roughness={0.15}
            metalness={0.4}
            transparent
            opacity={0.88}
          />
        </mesh>
        <Text position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color="#e0f7fa">
          LAKE PRIYADARSHINI
        </Text>
        {/* Lake shoreline pump house */}
        <PulsingMesh
          geometry={<boxGeometry args={[4.5, 3, 3.5]} />}
          position={[10, 1.5, 2]}
          status={ws}
          label="Maitri — Lake Priyadarshini Freshwater Pump House"
          onHover={onZoneHover}
          onClick={onZoneClick}
        />
      </group>

      {/* 2. Insulated Heated Water Pipeline (Lake -> Habitat) */}
      <mesh position={[-3, 1.6, 10]} rotation={[0, -0.6, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 18, 8]} />
        <meshStandardMaterial color="#e67e22" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 3. Main Habitation Module on Steel Stilts */}
      <group position={[0, 0, 0]}>
        {/* Structural stilts */}
        {[-7, 0, 7].map((x, i) => (
          <React.Fragment key={i}>
            <mesh position={[x, 1.2, 4]}>
              <cylinderGeometry args={[0.2, 0.2, 2.4, 8]} />
              <meshStandardMaterial color="#444444" metalness={0.8} />
            </mesh>
            <mesh position={[x, 1.2, -4]}>
              <cylinderGeometry args={[0.2, 0.2, 2.4, 8]} />
              <meshStandardMaterial color="#444444" metalness={0.8} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Main Habitat Block */}
        <PulsingMesh
          geometry={<boxGeometry args={[18, 3.4, 9]} />}
          position={[0, 3.8, 0]}
          status={es}
          label="Maitri — Main Habitation & Operational Complex"
          onHover={onZoneHover}
          onClick={onZoneClick}
        />

        {/* Red roof edge trim */}
        <mesh position={[0, 5.6, 0]}>
          <boxGeometry args={[18.4, 0.35, 9.4]} />
          <meshStandardMaterial color="#b71c1c" />
        </mesh>

        {/* Windows */}
        {[-6, -2, 2, 6].map((x, i) => (
          <mesh key={i} position={[x, 4.0, 4.55]}>
            <boxGeometry args={[1.6, 1.1, 0.1]} />
            <meshStandardMaterial
              color={isNight ? '#ffcc44' : '#b3e5fc'}
              emissive={isNight ? '#ffaa00' : '#4488aa'}
              emissiveIntensity={isNight ? 1.5 : 0.3}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Power Plant & Generators */}
      <group position={[14, 0, 0]}>
        <PulsingMesh
          geometry={<boxGeometry args={[7, 4.4, 6]} />}
          position={[0, 2.2, 0]}
          status={es}
          label="Maitri — Diesel Power Generation Plant"
          onHover={onZoneHover}
          onClick={onZoneClick}
        />
        {/* Generator exhaust stacks */}
        <mesh position={[1.5, 5.2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 2.0, 8]} />
          <meshStandardMaterial color="#222222" metalness={0.8} />
        </mesh>
      </group>

      {/* 5. Fuel Farm (Cylindrical Tanks in Concrete Berm) */}
      <group position={[24, 0, 0]}>
        {/* Concrete spill containment berm */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[9, 0.6, 14]} />
          <meshStandardMaterial color="#616161" roughness={0.9} />
        </mesh>
        {/* 3 cylindrical diesel tanks */}
        {[-4, 0, 4].map((z, i) => (
          <PulsingMesh
            key={i}
            geometry={<cylinderGeometry args={[2.2, 2.2, 7.5, 24]} />}
            position={[0, 2.8, z]}
            status={fs}
            label={`Maitri — Heavy Fuel Storage Tank ${i + 1} (50,000 L)`}
            onHover={onZoneHover}
            onClick={onZoneClick}
          />
        ))}
      </group>

      {/* Heated fuel pipeline gantry */}
      <mesh position={[19, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
        <meshStandardMaterial color="#e67e22" metalness={0.7} />
      </mesh>

      {/* 6. ISRO Satellite Earth Station Radome */}
      <group position={[-14, 0, -8]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[3, 3.2, 3, 16]} />
          <meshStandardMaterial color="#546e7a" metalness={0.7} />
        </mesh>
        <mesh position={[0, 4.5, 0]}>
          <sphereGeometry args={[3.2, 24, 24]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
        </mesh>
        <Text position={[0, 8.5, 0]} fontSize={1.1} color="#e0f7fa">ISRO Radome</Text>
      </group>

      {/* 7. Meteorological Mast */}
      <group position={[8, 0, -14]}>
        <mesh position={[0, 7.5, 0]}>
          <cylinderGeometry args={[0.18, 0.35, 15, 6]} />
          <meshStandardMaterial color="#e53935" metalness={0.7} />
        </mesh>
        <mesh position={[0, 14, 0]}>
          <boxGeometry args={[3.2, 0.1, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Text position={[0, 16, 0]} fontSize={1.1} color="#ffffff">Met Mast</Text>
      </group>

      {/* 8. Indian National Flag (Tiranga) */}
      <group position={[0, 0, 7]}>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 10, 8]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
        </mesh>
        <mesh position={[1.2, 9.2, 0]}>
          <planeGeometry args={[2.4, 1.4]} />
          <meshStandardMaterial color="#ff9933" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Station Title */}
      <Text position={[0, 11, 0]} fontSize={2.4} color="#ffb74d" anchorX="center" anchorY="middle">
        MAITRI (70°46'S, 11°44'E)
      </Text>
    </group>
  )
}

// ─── Bharati Station (Authentic bof architekten 134-Container Hull on V-Stilts) ────────
function VStiltPair({ position = [0, 0, 0], height = 3.6, spread = 2.2 }) {
  const angle = 0.28
  return (
    <group position={position}>
      <mesh position={[-spread / 2, height / 2, 0]} rotation={[0, 0, angle]}>
        <cylinderGeometry args={[0.22, 0.22, height + 0.3, 8]} />
        <meshStandardMaterial color="#4a5968" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[spread / 2, height / 2, 0]} rotation={[0, 0, -angle]}>
        <cylinderGeometry args={[0.22, 0.22, height + 0.3, 8]} />
        <meshStandardMaterial color="#4a5968" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[spread + 1.2, 0.25, 1.2]} />
        <meshStandardMaterial color="#686868" roughness={0.9} />
      </mesh>
    </group>
  )
}

function PistenBullyTrackedVehicle({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation} scale={0.75}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[4.4, 1.5, 2.5]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.4} />
      </mesh>
      <mesh position={[0.7, 1.4, 0]}>
        <boxGeometry args={[1.8, 0.9, 2.3]} />
        <meshBasicMaterial color="#ffee88" />
      </mesh>
      <mesh position={[0, 0.35, 1.35]}>
        <boxGeometry args={[4.6, 0.7, 0.5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[0, 0.35, -1.35]}>
        <boxGeometry args={[4.6, 0.7, 0.5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[2.5, 0.45, 0]}>
        <boxGeometry args={[0.25, 0.75, 3.2]} />
        <meshStandardMaterial color="#e6b800" metalness={0.7} />
      </mesh>
    </group>
  )
}

function BharatiStation({ tel, onZoneClick, onZoneHover, isNight = true, viewMode = 'standard' }) {
  const es = tel?.electricity?.status || 'NORMAL'
  const fs = tel?.fuel?.status || 'NORMAL'
  const ws = tel?.water?.status || 'NORMAL'

  const hullColor = viewMode === 'thermal' ? '#7201a8' : '#9bb0c6'
  const windowGlow = viewMode === 'thermal' ? '#f89540' : (isNight ? '#ffcc44' : '#88ddff')
  const isXRay = viewMode === 'xray'

  return (
    <group position={[35, 0, 10]}>
      {/* 1. Structural V-Stilts under hull (4 pairs along front & rear) */}
      {[-8, -3, 2, 7].map((x, i) => (
        <React.Fragment key={i}>
          <VStiltPair position={[x, 0, 5.5]} />
          <VStiltPair position={[x, 0, -5.5]} />
        </React.Fragment>
      ))}

      {/* 2. Aerodynamic Faceted Modular Hull (134 Shipping Container Envelope) */}
      <group position={[0, 5.5, 0]}>
        {/* Core living & research volume */}
        <PulsingMesh
          geometry={<boxGeometry args={[22, 4.2, 13]} />}
          position={[0, 0, 0]}
          status={es}
          label="Bharati — Main Aerodynamic Habitat & Labs (134 Containers)"
          onHover={onZoneHover}
          onClick={onZoneClick}
        />

        {/* Aerodynamic chamfered nose (front cantilever overlooking ocean) */}
        <mesh position={[12.1, 0, 0]} rotation={[0, 0, -0.42]}>
          <boxGeometry args={[4.2, 4.0, 12.8]} />
          <meshStandardMaterial color={hullColor} metalness={0.65} roughness={0.25} wireframe={isXRay} />
        </mesh>

        {/* Aerodynamic chamfered rear tail */}
        <mesh position={[-12.1, 0, 0]} rotation={[0, 0, 0.42]}>
          <boxGeometry args={[4.2, 4.0, 12.8]} />
          <meshStandardMaterial color={hullColor} metalness={0.65} roughness={0.25} wireframe={isXRay} />
        </mesh>

        {/* 3. Panoramic Ribbon Windows (Warm yellow glow in polar night) */}
        <mesh position={[0, 0.6, 6.55]}>
          <boxGeometry args={[19.5, 1.2, 0.1]} />
          <meshStandardMaterial color={windowGlow} emissive={windowGlow} emissiveIntensity={isNight ? 1.6 : 0.4} />
        </mesh>
        <mesh position={[0, 0.6, -6.55]}>
          <boxGeometry args={[19.5, 1.2, 0.1]} />
          <meshStandardMaterial color={windowGlow} emissive={windowGlow} emissiveIntensity={isNight ? 1.6 : 0.4} />
        </mesh>
        <mesh position={[13.5, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[9.8, 1.2, 0.1]} />
          <meshStandardMaterial color={windowGlow} emissive={windowGlow} emissiveIntensity={isNight ? 1.6 : 0.4} />
        </mesh>

        {/* 4. Rooftop Observation Deck & Photovoltaic Solar Arrays */}
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[10, 1.4, 7]} />
          <meshStandardMaterial color="#63768a" metalness={0.7} roughness={0.3} />
        </mesh>
        {[-7, 7].map((x, idx) => (
          <mesh key={idx} position={[x, 2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.6, 11]} />
            <meshStandardMaterial color="#193552" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* 5. Primary White ISRO Earth Station Radome Sphere (As seen in Photo 3) */}
      <group
        position={[18, 0, -14]}
        onClick={() => onZoneClick && onZoneClick({ label: 'Bharati — Primary ISRO Earth Station Radome Antenna (10m)', status: 'NORMAL' })}
      >
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[5, 5.4, 3, 24]} />
          <meshStandardMaterial color="#556677" metalness={0.8} />
        </mesh>
        <mesh position={[0, 6.2, 0]}>
          <sphereGeometry args={[4.8, 32, 32]} />
          <meshStandardMaterial color="#f2f5f8" roughness={0.3} metalness={0.1} />
        </mesh>
        <Text position={[0, 12, 0]} fontSize={1.3} color="#e0f7fa" anchorX="center">
          Primary ISRO Radome
        </Text>
      </group>

      {/* 5b. Secondary Communications Radome on Rocky Ridge */}
      <group
        position={[28, 2, -22]}
        onClick={() => onZoneClick && onZoneClick({ label: 'Bharati — Secondary Satellite Link Radome (5m)', status: 'NORMAL' })}
      >
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[3, 3.4, 2, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0, 4.0, 0]}>
          <sphereGeometry args={[3.0, 24, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <Text position={[0, 8, 0]} fontSize={1.1} color="#e0f7fa" anchorX="center">
          Comms Dome
        </Text>
      </group>

      {/* 6. Utility Pipe Gantry & Heated Conduits */}
      <mesh position={[0, 1.6, 12]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 16, 8]} />
        <meshStandardMaterial color="#e67e22" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-8, 1.6, 12]}>
        <cylinderGeometry args={[0.08, 0.08, 3.2, 6]} />
        <meshStandardMaterial color="#666666" metalness={0.7} />
      </mesh>
      <mesh position={[8, 1.6, 12]}>
        <cylinderGeometry args={[0.08, 0.08, 3.2, 6]} />
        <meshStandardMaterial color="#666666" metalness={0.7} />
      </mesh>

      {/* 7. Parked PistenBully Snow Groomers (Photos 1 & 4) */}
      <PistenBullyTrackedVehicle position={[8, 0, 9.5]} rotation={[0, -0.5, 0]} />
      <PistenBullyTrackedVehicle position={[-6, 0, 9]} rotation={[0, 0.35, 0]} />

      {/* 8. Supply Yard ISO Containers (Photo 4) */}
      <group position={[-18, 0, -8]}>
        {[
          { pos: [0, 1.3, 0], col: '#b71c1c' },
          { pos: [0, 1.3, 3], col: '#0d47a1' },
          { pos: [6.5, 1.3, 0], col: '#0d47a1' },
          { pos: [6.5, 1.3, 3], col: '#b71c1c' },
        ].map((c, i) => (
          <mesh key={i} position={c.pos}>
            <boxGeometry args={[6, 2.6, 2.5]} />
            <meshStandardMaterial color={c.col} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 9. Helipad */}
      <group position={[0, 0.1, -24]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[9, 32]} />
          <meshStandardMaterial color="#223344" emissive="#001122" emissiveIntensity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[8.2, 8.6, 32]} />
          <meshBasicMaterial color="#ffee55" />
        </mesh>
        <Text position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={5} color="#ffee55">
          H
        </Text>
      </group>

      {/* Station Title */}
      <Text position={[0, 13.5, 0]} fontSize={2.4} color="#93c5fd" anchorX="center" anchorY="middle">
        BHARATI (69°24'S, 76°11'E)
      </Text>
    </group>
  )
}

// ─── Photo-Authentic Terrain: Schirmacher Oasis + Larsemann Promontory + Prydz Bay ─
function ExpeditionShip({ position = [75, 0.8, -75] }) {
  return (
    <group position={position} rotation={[0, -0.4, 0]}>
      {/* Red hull */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[26, 2.5, 6]} />
        <meshStandardMaterial color="#b32d2e" roughness={0.5} />
      </mesh>
      {/* White superstructure */}
      <mesh position={[-3, 4, 0]}>
        <boxGeometry args={[10, 3.5, 5]} />
        <meshStandardMaterial color="#e6e6e6" roughness={0.3} />
      </mesh>
      {/* Bridge windows */}
      <mesh position={[1.5, 4.6, 0]}>
        <boxGeometry args={[1, 1, 4.6]} />
        <meshBasicMaterial color="#ffdd88" />
      </mesh>
      {/* Funnel */}
      <mesh position={[-6, 6.2, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 2.2, 12]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Ship water wake */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 12]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
      </mesh>
      <Text position={[0, 8, 0]} fontSize={1.2} color="#e0e6ed" anchorX="center">
        MV Vasiliy Golovnin (Expedition Resupply Vessel)
      </Text>
    </group>
  )
}

function Icebergs() {
  const bergs = [
    { pos: [60, 2.5, -50], size: [18, 5, 14], rot: 0.2 },
    { pos: [100, 3.5, -60], size: [28, 7, 20], rot: -0.4 },
    { pos: [85, 2.0, -95], size: [22, 4, 16], rot: 0.8 },
  ]
  return (
    <group>
      {bergs.map((b, i) => (
        <mesh key={i} position={b.pos} rotation={[0, b.rot, 0]}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color="#d2eef7" roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

function AntarcticLandscape({ isNight }) {
  return (
    <group>
      {/* 1. Main Ice Shelf ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[360, 360]} />
        <meshStandardMaterial
          color={isNight ? '#162238' : '#cce1ed'}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* 2. Schirmacher Oasis rocky permafrost ground (under Maitri) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-45, 0.02, -10]} receiveShadow>
        <circleGeometry args={[42, 32]} />
        <meshStandardMaterial color="#6d5543" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* 3. Larsemann Hills rocky promontory (under Bharati) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35, 0.02, 10]} receiveShadow>
        <circleGeometry args={[40, 32]} />
        <meshStandardMaterial color="#705845" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* 4. Prydz Bay Deep Ocean (Southern Ocean) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.05, -70]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial
          color={isNight ? '#051329' : '#0e3a59'}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      <Icebergs />
      <ExpeditionShip />
    </group>
  )
}

// ─── Blizzard Snow Particle System ──────────────────────────────────────────
function BlizzardSnow({ windSpeed = 15, isBlizzard = false }) {
  const count = isBlizzard ? 3000 : 1000
  const pointsRef = useRef()

  const [positions, speeds] = React.useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 250
      pos[i * 3 + 1] = Math.random() * 60
      pos[i * 3 + 2] = (Math.random() - 0.5) * 250

      spd[i * 3]     = isBlizzard ? -2.5 - Math.random() * 2.0 : -0.5 - Math.random() * 0.8
      spd[i * 3 + 1] = isBlizzard ? -0.8 - Math.random() * 0.8 : -0.4 - Math.random() * 0.4
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }
    return [pos, spd]
  }, [count, isBlizzard])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array
    const windMultiplier = Math.max(1, windSpeed / 12)

    for (let i = 0; i < count; i++) {
      arr[i * 3]     += speeds[i * 3] * windMultiplier * delta * 25
      arr[i * 3 + 1] += speeds[i * 3 + 1] * delta * 25
      arr[i * 3 + 2] += speeds[i * 3 + 2] * delta * 25

      if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 55 + Math.random() * 5
      if (arr[i * 3] < -125)   arr[i * 3] = 125
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#e8f4f8"
        size={isBlizzard ? 0.35 : 0.2}
        transparent
        opacity={isBlizzard ? 0.85 : 0.55}
        depthWrite={false}
      />
    </points>
  )
}

// ─── Aurora Australis (Southern Lights) ──────────────────────────────────────
function AuroraAustralis() {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime * 0.4
    meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.1
  })

  return (
    <group position={[0, 65, -80]}>
      <mesh ref={meshRef} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[160, 160, 30, 48, 1, true, 0, Math.PI]} />
        <meshBasicMaterial color="#00ffaa" side={THREE.DoubleSide} transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 10, -10]} rotation={[0.25, 0.2, 0]}>
        <cylinderGeometry args={[150, 150, 25, 32, 1, true, 0, Math.PI]} />
        <meshBasicMaterial color="#9933ff" side={THREE.DoubleSide} transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

// ─── Scene (inside Canvas) ───────────────────────────────────────────────────
function Scene({
  maitriTel,
  bharatiTel,
  onZoneClick,
  onZoneHover,
  focusStation,
  viewMode = 'standard',
  isNight = true,
  droneTour = false,
}) {
  const controlsRef = useRef()
  const { camera } = useThree()

  // Drone flythrough orbit
  useFrame(({ clock }) => {
    if (!droneTour || !controlsRef.current) return
    const t = clock.elapsedTime * 0.12
    const radius = 70
    camera.position.x = Math.sin(t) * radius
    camera.position.z = Math.cos(t) * radius
    camera.position.y = 35 + Math.sin(t * 2) * 10
    controlsRef.current.target.set(0, 0, 0)
    controlsRef.current.update()
  })

  // Camera snap on focus
  useEffect(() => {
    if (droneTour || !controlsRef.current) return
    const targets = {
      maitri:  { pos: [-45, 28, 25], look: [-45, 4, -10] },
      bharati: { pos: [35, 28, 45],  look: [35, 5, 10]   },
      both:    { pos: [0, 65, 85],   look: [0, 0, 0]     },
    }
    const t = targets[focusStation] || targets.both
    camera.position.set(...t.pos)
    controlsRef.current.target.set(...t.look)
    controlsRef.current.update()
  }, [focusStation, droneTour, camera])

  const env = maitriTel?.environment || {}

  return (
    <>
      <fogExp2 attach="fog" color={isNight ? '#0a0f1e' : '#88a8c4'} density={env.blizzard ? 0.012 : 0.0035} />
      <ambientLight intensity={isNight ? 0.3 : 0.7} />
      <directionalLight
        position={isNight ? [20, 40, -30] : [60, 50, 40]}
        intensity={isNight ? 0.4 : 1.1}
        color={isNight ? '#90caf9' : '#fff7e6'}
        castShadow
      />
      {isNight && (
        <>
          <Stars radius={250} depth={50} count={6000} factor={4} saturation={0} fade speed={0.4} />
          <AuroraAustralis />
        </>
      )}
      <BlizzardSnow windSpeed={env.wind_ms || 15} isBlizzard={env.blizzard || false} />
      <AntarcticLandscape isNight={isNight} />
      <MaitriStation
        tel={maitriTel}
        onZoneClick={onZoneClick}
        onZoneHover={onZoneHover}
        isNight={isNight}
        viewMode={viewMode}
      />
      <BharatiStation
        tel={bharatiTel}
        onZoneClick={onZoneClick}
        onZoneHover={onZoneHover}
        isNight={isNight}
        viewMode={viewMode}
      />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.07}
        minPolarAngle={0.05}
        maxPolarAngle={1.45}
        maxDistance={180}
        minDistance={10}
      />
    </>
  )
}

function mapZoneToSubsystemId(label) {
  if (!label) return 'radome'
  const l = label.toLowerCase()
  if (l.includes('radome')) return 'radome'
  if (l.includes('generator') || l.includes('genset') || l.includes('diesel')) return 'generators'
  if (l.includes('solar') || l.includes('pv')) return 'solar_array'
  if (l.includes('stilt') || l.includes('habitat') || l.includes('cantilever')) return 'stilts'
  if (l.includes('pump') || l.includes('priyadarshini') || l.includes('lake') || l.includes('water')) return 'lake_pumphouse'
  if (l.includes('fuel') || l.includes('tank')) return 'fuel_farm'
  if (l.includes('helipad')) return 'helipad'
  return 'radome'
}

// ─── HUD Overlay ─────────────────────────────────────────────────────────────
function HUD({
  connected,
  activeStation,
  setActiveStation,
  setFocus,
  alerts,
  hoveredZone,
  selectedZone,
  viewMode,
  setViewMode,
  isNight,
  setIsNight,
  droneTour,
  setDroneTour,
  onOpenGallery,
  onOpenDrill,
  onInspectSubsystem,
}) {
  const [utc, setUtc] = useState('')
  useEffect(() => {
    const tick = () => setUtc(new Date().toUTCString().replace('GMT', 'UTC').slice(17, 25))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  const critAlert = alerts?.[0]

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {/* Top bar controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          {/* Station selector */}
          <div className="flex bg-slate-900/90 backdrop-blur rounded p-1 border border-slate-700/70 shadow-sm">
            {['both', 'maitri', 'bharati'].map(s => (
              <button key={s}
                onClick={() => { setActiveStation(s === 'both' ? 'maitri' : s); setFocus(s) }}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  (s === 'both' ? activeStation === 'both' : activeStation === s)
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s === 'both' ? 'All Stations' : s}
              </button>
            ))}
          </div>

          {/* View Modes */}
          <div className="flex bg-slate-900/90 backdrop-blur rounded p-1 border border-slate-700/70 shadow-sm">
            {[
              { id: 'standard', label: '3D Reality' },
              { id: 'thermal', label: 'FLIR Thermal' },
              { id: 'xray', label: 'X-Ray Systems' },
            ].map(m => (
              <button key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  viewMode === m.id ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Polar Day / Night */}
          <button
            onClick={() => setIsNight(!isNight)}
            className="px-3 py-1 bg-slate-900/90 backdrop-blur rounded border border-slate-700/70 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isNight ? '🌙 Polar Night' : '☀️ Polar Day'}
          </button>

          {/* Drone Tour */}
          <button
            onClick={() => setDroneTour(!droneTour)}
            className={`px-3 py-1 backdrop-blur rounded border text-xs font-medium transition-colors ${
              droneTour
                ? 'bg-blue-700 border-blue-500 text-white font-bold'
                : 'bg-slate-900/90 border-slate-700/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {droneTour ? '⏹ Exit Tour' : '🎥 Orbit Tour'}
          </button>

          {/* Photos Gallery */}
          <button
            onClick={onOpenGallery}
            className="px-3 py-1 bg-slate-900/90 hover:bg-slate-800 backdrop-blur rounded border border-slate-700/70 text-xs font-medium text-slate-200 transition-colors"
          >
            📷 Reference Photos
          </button>

          {/* Emergency Drill */}
          <button
            onClick={onOpenDrill}
            className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900/90 backdrop-blur rounded border border-rose-800/60 text-xs font-medium text-rose-200 transition-colors"
          >
            ⚠ Crisis Drill
          </button>

          {/* Google Maps Satellite GIS */}
          <a
            href="https://www.google.com/maps/place/Bharati+research+centre/@-69.4068116,76.1972352,729m/data=!3m1!1e3!4m6!3m5!1s0xb18d33f53965b37b:0x9fdacfcf4cc9914e!8m2!3d-69.4068328!4d76.1953343!16s%2Fm%2F0gmcs_2"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-slate-900/90 hover:bg-slate-800 backdrop-blur rounded border border-slate-700/70 text-xs font-medium text-blue-300 flex items-center gap-1 transition-colors"
          >
            🛰️ Satellite GIS
          </a>
        </div>

        {/* Clock */}
        <div className="text-right bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded border border-slate-700/80 shadow-sm">
          <div className="text-xs font-mono font-bold text-slate-100">{utc} UTC</div>
          <div className="text-[10px] text-slate-400">MoES India · SIH 2026 PS-26060</div>
        </div>
      </div>

      {/* Bottom-left: COMMS status */}
      <div className="absolute bottom-6 left-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded border border-slate-700/80 shadow-sm">
        <div className={connected ? 'dot-ok' : 'dot-crit'} />
        <span className="text-xs font-mono text-slate-300">
          {connected ? 'ISRO SATELLITE LINK ACTIVE (128 kbps)' : 'LINK DOWN'}
        </span>
      </div>

      {/* Bottom-center: Critical alert banner */}
      {critAlert && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-rose-950/95 border border-rose-600 rounded px-4 py-2 text-xs text-rose-100 font-bold tracking-wider animate-pulse shadow-xl">
          ⚠ CRITICAL FAULT — {critAlert.station?.toUpperCase()} — {critAlert.subsystems?.join(', ').toUpperCase()}
        </div>
      )}

      {/* Hovered / selected zone tooltip */}
      {(hoveredZone || selectedZone) && (
        <div className="absolute top-20 left-4 bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 text-xs text-slate-200 max-w-sm pointer-events-auto shadow-2xl backdrop-blur-md">
          <div className="text-slate-100 font-bold text-sm leading-snug">{hoveredZone || selectedZone?.label}</div>
          {selectedZone && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className={`font-bold px-2 py-0.5 rounded font-mono text-[10px] border ${
                selectedZone.status === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                selectedZone.status === 'WARNING'  ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}>{selectedZone.status}</span>
              {onInspectSubsystem && (
                <button
                  onClick={() => onInspectSubsystem(mapZoneToSubsystemId(selectedZone.label))}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-[11px] font-bold shadow transition-all hover:scale-105 flex items-center gap-1"
                >
                  🔍 Inspect Subsystem
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function GodsEyeView({
  telemetry,
  alerts,
  activeStation,
  setActiveStation,
  connected,
  onZoneSelect,
  onOpenGallery,
  onOpenDrill,
  onInspectSubsystem,
}) {
  const [focusStation, setFocusStation] = useState('both')
  const [selectedZone, setSelectedZone] = useState(null)
  const [hoveredZone, setHoveredZone] = useState(null)
  const [viewMode, setViewMode] = useState('standard')
  const [isNight, setIsNight] = useState(true)
  const [droneTour, setDroneTour] = useState(false)

  const handleZoneClick = (z) => {
    setSelectedZone(z)
    if (onZoneSelect) onZoneSelect(z)
    if (onInspectSubsystem && z?.label) {
      onInspectSubsystem(mapZoneToSubsystemId(z.label))
    }
  }

  return (
    <div className="relative w-full h-full bg-[#0a0f1e]">
      <Canvas
        camera={{ position: [0, 65, 85], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <Scene
          maitriTel={telemetry?.maitri}
          bharatiTel={telemetry?.bharati}
          onZoneClick={handleZoneClick}
          onZoneHover={setHoveredZone}
          focusStation={focusStation}
          viewMode={viewMode}
          isNight={isNight}
          droneTour={droneTour}
        />
      </Canvas>
      <HUD
        connected={connected}
        activeStation={activeStation}
        setActiveStation={setActiveStation}
        setFocus={setFocusStation}
        alerts={alerts}
        hoveredZone={hoveredZone}
        selectedZone={selectedZone}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isNight={isNight}
        setIsNight={setIsNight}
        droneTour={droneTour}
        setDroneTour={setDroneTour}
        onOpenGallery={onOpenGallery}
        onOpenDrill={onOpenDrill}
        onInspectSubsystem={onInspectSubsystem}
      />
    </div>
  )
}

