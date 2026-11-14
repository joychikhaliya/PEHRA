import { useState, useEffect, useCallback } from 'react';

export interface BatteryStatus {
  level: number; // 0 to 100
  isCharging: boolean;
  isLowBattery: boolean; // < 15%
  isCritical: boolean; // < 10%
  isSupported: boolean;
  chargingTime: number;
  dischargingTime: number;
  isSimulated: boolean;
  setSimulatedLevel: (level: number | null) => void;
  cycleSimulatedLevel: () => void;
}

const LOW_BATTERY_THRESHOLD = 15;
const CRITICAL_BATTERY_THRESHOLD = 10;
const STORAGE_KEY = 'pehra_battery_sim_level';

export function useBatteryStatus(): BatteryStatus {
  const [realLevel, setRealLevel] = useState<number>(82);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [chargingTime, setChargingTime] = useState<number>(0);
  const [dischargingTime, setDischargingTime] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // Allow manual simulation override for testing and environments without Battery API
  const [simulatedLevel, setSimulatedLevelState] = useState<number | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = Number(saved);
        return isNaN(parsed) ? null : parsed;
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return null;
  });

  const setSimulatedLevel = useCallback((level: number | null) => {
    setSimulatedLevelState(level);
    try {
      if (level === null) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, String(level));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const cycleSimulatedLevel = useCallback(() => {
    // Cycles through: 12% (Alert Low) -> 8% (Critical Alert) -> 78% (Normal) -> Live Device
    setSimulatedLevelState((prev) => {
      let next: number | null;
      if (prev === null) {
        next = 12; // Start low battery alert simulation
      } else if (prev === 12) {
        next = 8; // Critical low alert
      } else if (prev === 8) {
        next = 78; // Normal (warning pill hidden)
      } else {
        next = null; // Return to live device
      }

      try {
        if (next === null) {
          sessionStorage.removeItem(STORAGE_KEY);
        } else {
          sessionStorage.setItem(STORAGE_KEY, String(next));
        }
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let batteryRef: any = null;

    const handleLevelChange = () => {
      if (batteryRef && isMounted) {
        setRealLevel(Math.round(batteryRef.level * 100));
      }
    };

    const handleChargingChange = () => {
      if (batteryRef && isMounted) {
        setIsCharging(Boolean(batteryRef.charging));
      }
    };

    const handleChargingTimeChange = () => {
      if (batteryRef && isMounted) {
        setChargingTime(batteryRef.chargingTime || 0);
      }
    };

    const handleDischargingTimeChange = () => {
      if (batteryRef && isMounted) {
        setDischargingTime(batteryRef.dischargingTime || 0);
      }
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          if (!isMounted) return;
          batteryRef = battery;
          setIsSupported(true);
          setRealLevel(Math.round(battery.level * 100));
          setIsCharging(Boolean(battery.charging));
          setChargingTime(battery.chargingTime || 0);
          setDischargingTime(battery.dischargingTime || 0);

          battery.addEventListener('levelchange', handleLevelChange);
          battery.addEventListener('chargingchange', handleChargingChange);
          battery.addEventListener('chargingtimechange', handleChargingTimeChange);
          battery.addEventListener('dischargingtimechange', handleDischargingTimeChange);
        })
        .catch(() => {
          if (isMounted) setIsSupported(false);
        });
    } else {
      setIsSupported(false);
    }

    return () => {
      isMounted = false;
      if (batteryRef) {
        try {
          batteryRef.removeEventListener('levelchange', handleLevelChange);
          batteryRef.removeEventListener('chargingchange', handleChargingChange);
          batteryRef.removeEventListener('chargingtimechange', handleChargingTimeChange);
          batteryRef.removeEventListener('dischargingtimechange', handleDischargingTimeChange);
        } catch {
          // Ignore event removal errors
        }
      }
    };
  }, []);

  const effectiveLevel = simulatedLevel !== null ? simulatedLevel : realLevel;
  const isLowBattery = effectiveLevel < LOW_BATTERY_THRESHOLD;
  const isCritical = effectiveLevel < CRITICAL_BATTERY_THRESHOLD;

  return {
    level: effectiveLevel,
    isCharging,
    isLowBattery,
    isCritical,
    isSupported,
    chargingTime,
    dischargingTime,
    isSimulated: simulatedLevel !== null,
    setSimulatedLevel,
    cycleSimulatedLevel,
  };
}
