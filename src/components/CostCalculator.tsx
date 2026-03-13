import React, { useState, useEffect } from 'react';
import { X, Car, Bus, Calculator, MapPin, Fuel, Zap, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ADDIS_LOCATIONS, SUB_CITY_COORDS, COMMON_CARS, cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

// cost of living.

interface CostCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  propertyPrice: number;
  propertyLocation: string; // This is the sub-city
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function CostCalculator({ isOpen, onClose, propertyPrice, propertyLocation }: CostCalculatorProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [transportType, setTransportType] = useState<'taxi' | 'car' | null>(null);
  const [destination, setDestination] = useState(ADDIS_LOCATIONS[0]);
  const [loading, setLoading] = useState(false);
  
  // Car specific
  const [selectedCar, setSelectedCar] = useState(COMMON_CARS[0]);
  const [fuelCost, setFuelCost] = useState('112'); // Current ETB/L approx
  const [engineType, setEngineType] = useState<'petrol' | 'hybrid'>('petrol');
  const [fuelConsumption, setFuelConsumption] = useState('0.065'); // Liters per km
  const [trafficLevel, setTrafficLevel] = useState<'normal' | 'heavy'>('normal');
  
  const [result, setResult] = useState<{ 
    distance: number; 
    dailyTransport: number; 
    monthlyTransport: number;
    total: number;
  } | null>(null);

  const calculateTaxiTariff = (distance: number) => {
    // Updated based on user experience: Ayat to Megenagna (7.6km) = 25 ETB
    if (distance <= 3) return 10;
    if (distance <= 6) return 15;
    if (distance <= 9) return 25; 
    if (distance <= 12) return 30;
    if (distance <= 15) return 35;
    return 45; // Long distance cross-city
  };

  const calculate = async () => {
    setLoading(true);
    try {
      const startCoords = SUB_CITY_COORDS[propertyLocation] || [38.7525, 9.0333]; // Fallback to Piassa
      const endCoords = destination.coords;

      let distanceKm = 0;

      if (MAPBOX_TOKEN) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?access_token=${MAPBOX_TOKEN}&overview=false`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          distanceKm = data.routes[0].distance / 1000; // Convert meters to km
        } else {
          throw new Error("No route found");
        }
      } else {
        // Fallback to OSRM (Open Source Routing Machine) - No API key required for low volume
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=false`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            distanceKm = data.routes[0].distance / 1000;
          } else {
            throw new Error("OSRM route not found");
          }
        } catch (osrmError) {
          console.warn("OSRM failed, using straight-line fallback", osrmError);
          // Final fallback to straight line distance
          const dx = (startCoords[0] - endCoords[0]) * 111;
          const dy = (startCoords[1] - endCoords[1]) * 111;
          distanceKm = Math.sqrt(dx * dx + dy * dy) * 1.3; // 1.3 factor for road distance
        }
      }

      const dailyKm = distanceKm * 2; // Round trip
      const monthlyDays = 22; // Average working days

      let dailyTransport = 0;

      if (transportType === 'taxi') {
        // Two trips per day
        dailyTransport = calculateTaxiTariff(distanceKm) * 2;
      } else {
        let consumption = parseFloat(fuelConsumption) || 0.08;
        
        // Traffic factor: Heavy traffic in Addis can increase consumption by 20-30%
        if (trafficLevel === 'heavy') {
          consumption *= 1.25;
        }

        const fuelPrice = parseFloat(fuelCost) || 112;
        dailyTransport = dailyKm * consumption * fuelPrice;
        
        // Add a small buffer for maintenance/parking
        dailyTransport += 50; 
      }

      const monthlyTransport = dailyTransport * monthlyDays;

      setResult({
        distance: parseFloat(distanceKm.toFixed(1)),
        dailyTransport: Math.round(dailyTransport),
        monthlyTransport: Math.round(monthlyTransport),
        total: Math.round(propertyPrice + monthlyTransport)
      });
      setStep(3);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Failed to calculate distance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setTransportType(null);
    setResult(null);
  };

  const handleCarChange = (carName: string) => {
    const car = COMMON_CARS.find(c => c.name === carName);
    if (car) {
      setSelectedCar(car);
      setFuelConsumption(car.consumption.toString());
      setEngineType(car.type as 'petrol' | 'hybrid');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-lg">{t('calculator.title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8">
                  {t('calculator.transportType')}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setTransportType('taxi'); setStep(2); }}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all group"
                  >
                    <Bus className="w-12 h-12 mb-4 text-zinc-400 group-hover:text-emerald-600" />
                    <span className="font-bold">{t('calculator.publicTransport')}</span>
                  </button>
                  <button 
                    onClick={() => { setTransportType('car'); setStep(2); }}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all group"
                  >
                    <Car className="w-12 h-12 mb-4 text-zinc-400 group-hover:text-emerald-600" />
                    <span className="font-bold">{t('calculator.ownCar')}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center text-zinc-700 dark:text-zinc-300">
                    <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                    {t('calculator.jobLocation')}
                  </label>
                  <select 
                    value={destination.name}
                    onChange={(e) => {
                      const loc = ADDIS_LOCATIONS.find(l => l.name === e.target.value);
                      if (loc) setDestination(loc);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-900 dark:text-white"
                  >
                    {ADDIS_LOCATIONS.map(loc => (
                      <option key={loc.name} value={loc.name} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {transportType === 'car' && (
                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center text-zinc-700 dark:text-zinc-300">
                        <Car className="w-4 h-4 mr-1 text-emerald-600" />
                        Select Car Model
                      </label>
                      <select 
                        value={selectedCar.name}
                        onChange={(e) => handleCarChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-900 dark:text-white"
                      >
                        {COMMON_CARS.map(car => (
                          <option key={car.name} value={car.name}>{car.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center text-zinc-700 dark:text-zinc-300">
                          <Fuel className="w-4 h-4 mr-1 text-emerald-600" />
                          Fuel Price (ETB/L)
                        </label>
                        <input 
                          type="number"
                          value={fuelCost}
                          onChange={(e) => setFuelCost(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center text-zinc-700 dark:text-zinc-300">
                          <Zap className="w-4 h-4 mr-1 text-emerald-600" />
                          Car Type
                        </label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                          <button 
                            onClick={() => setEngineType('petrol')}
                            className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", engineType === 'petrol' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500")}
                          >
                            Petrol
                          </button>
                          <button 
                            onClick={() => setEngineType('hybrid')}
                            className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", engineType === 'hybrid' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500")}
                          >
                            Hybrid
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                          Consumption (L/km)
                        </label>
                        <input 
                          type="number"
                          step="0.001"
                          value={fuelConsumption}
                          onChange={(e) => setFuelConsumption(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                          Traffic Level
                        </label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                          <button 
                            onClick={() => setTrafficLevel('normal')}
                            className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", trafficLevel === 'normal' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500")}
                          >
                            Normal
                          </button>
                          <button 
                            onClick={() => setTrafficLevel('heavy')}
                            className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", trafficLevel === 'heavy' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500")}
                          >
                            Heavy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    {t('common.back')}
                  </button>
                  <button 
                    onClick={calculate}
                    disabled={loading}
                    className="flex-[2] bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {t('detail.calculateBtn')}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && result && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-4">
                    <Navigation className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('calculator.results')}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400">From {propertyLocation} to {destination.name}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs">Distance to work</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{result.distance} km</span>
                    </div>
                    {transportType === 'car' && (
                      <div className="text-right">
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">Vehicle</span>
                        <div className="font-bold text-zinc-900 dark:text-white text-sm">{selectedCar.name}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">{t('calculator.transport')} (Daily)</span>
                    <span className="font-bold text-amber-600">{result.dailyTransport.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">{t('calculator.transport')} (Monthly)</span>
                    <span className="font-bold text-amber-600">{result.monthlyTransport.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between items-center p-6 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                    <span className="font-medium">{t('calculator.total')}</span>
                    <span className="text-2xl font-bold">{result.total.toLocaleString()} ETB</span>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  <strong>{t('common.note')}:</strong> {transportType === 'taxi' ? 'Taxi costs are estimated based on Addis Ababa Transport Bureau tariffs.' : `Car costs are based on ${selectedCar.name} consumption with ${trafficLevel} traffic adjustments.`}
                </div>

                <button 
                  onClick={reset}
                  className="w-full py-4 rounded-xl font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Start Over
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// cost of living.

// cost of living.

// cost of living.

// cost of living.

// cost of living.
