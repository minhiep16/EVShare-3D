import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Html, Text, Float } from '@react-three/drei';
import CarModel3D from './CarModel3D';
import { getAllVehicles } from '../../services/api';

// A simple mock of a Car using primitive geometries (since we don't have a GLTF here)
const CarInstance = ({ position, vehicle }) => {
  const [hovered, setHovered] = useState(false);
  const label = vehicle.model || vehicle.licensePlate || "EVShare Car";
  const status = vehicle.status || "ACTIVE";
  
  return (
    <group position={position}>
      {/* Car Body */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        <group 
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          <CarModel3D vehicle={vehicle} isShowroom={false} />

          {/* 3D Label Floating Above Car */}
          <Text position={[0, 2.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
            {label}
          </Text>
          
          {/* Spatial HTML UI (Hologram Panel) - Only visible on hover */}
          {hovered && (
            <Html 
              position={[2.5, 1.5, 0]} 
              transform 
              occlude 
              distanceFactor={5}
            >
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white w-64 shadow-2xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">{label}</h3>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Biển số</span>
                    <span className="font-mono text-white">{vehicle.licensePlate}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2">
                    <span className="text-slate-400">Battery (SoC)</span>
                    <span className="font-mono text-green-400">{vehicle.batteryPercentage || 100}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-400 h-full shadow-[0_0_10px_#4ade80]" style={{ width: `${vehicle.batteryPercentage || 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between text-xs pt-2">
                    <span className="text-slate-400">ODO</span>
                    <span className="font-mono">{vehicle.odometer || 0} km</span>
                  </div>
                </div>
              </div>
            </Html>
          )}
        </group>
      </Float>
    </group>
  );
};

const VirtualGarage = () => {
  const garageRef = useRef();
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error("Failed to fetch vehicles for garage", err);
      }
    };
    fetchVehicles();
  }, []);

  useFrame((state) => {
    // Optional: Add subtle ambient animations to the garage environment
  });

  return (
    <group ref={garageRef}>
      {/* 3D Cars Array */}
      {vehicles.map((v, i) => {
        const xPos = (i - (vehicles.length - 1) / 2) * 5;
        return <CarInstance key={v.id} position={[xPos, 0, 0]} vehicle={v} />;
      })}
      
      {/* The Floor (Ground) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid Helper for Cyberpunk aesthetics */}
      <gridHelper args={[100, 100, '#1e293b', '#0f172a']} position={[0, 0.01, 0]} />
    </group>
  );
};

export default VirtualGarage;
