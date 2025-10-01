import React, { useState, useEffect } from 'react';
import { ThermalNetworkDataProcessor } from './utils/dataProcessor';
import NetworkVisualization from './components/NetworkVisualization';
import EfficiencyDashboard from './components/EfficiencyDashboard';
import AssetValuation from './components/AssetValuation';
import './App.css';

function App() {
  const [dataProcessor] = useState(new ThermalNetworkDataProcessor());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentHour, setCurrentHour] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentData, setCurrentData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const [assetData, setAssetData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await dataProcessor.loadData();
        updateDisplayData();
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataProcessor]);

  useEffect(() => {
    if (!isLoading && dataProcessor.processedData) {
      updateDisplayData();
    }
  }, [currentHour, isLoading, dataProcessor]);

  const updateDisplayData = () => {
    dataProcessor.setCurrentHour(currentHour);
    const hourData = dataProcessor.getCurrentHourData();
    const timeSeries = dataProcessor.getTimeSeriesData();
    const network = dataProcessor.getBuildingNetworkData();
    const assets = dataProcessor.getAssetValuation();

    setCurrentData(hourData);
    setTimeSeriesData(timeSeries);
    setNetworkData(network);
    setAssetData(assets);
  };

  const calculateBorefieldMetrics = (borefieldId) => {
    if (!currentData?.buildings) return null;

    // Define which buildings are served by each borefield
    const buildingsByBorefield = {
      'borefield_1': Array.from({length: 21}, (_, i) => `b_${i + 16}`), // R11-R31 (buildings 16-36)
      'borefield_2': ['b_1', 'b_2', 'b_3'], // Fire Dept, Gulf, Corner Cabinet
      'borefield_3': ['b_4', 'b_5'].concat(Array.from({length: 10}, (_, i) => `b_${i + 6}`)) // Public School, Housing Dept, R1-R10 (buildings 4,5,6-15)
    };

    const buildingsBeforeBorefield = buildingsByBorefield[borefieldId] || [];
    
    // Calculate current load (sum of building loads with proper sign convention: heating negative, cooling positive)
    const currentLoadW = buildingsBeforeBorefield.reduce((sum, buildingId) => {
      const building = currentData.buildings[buildingId];
      return sum + (building?.load || 0);
    }, 0);
    
    const currentLoadKW = currentLoadW / 1000;
    const capacityKW = 440; // Rated capacity of each borefield
    const capacityPercent = (Math.abs(currentLoadKW) / capacityKW) * 100;

    return {
      currentLoadKW: currentLoadKW,
      capacityPercent: capacityPercent,
      buildingsCount: buildingsBeforeBorefield.length
    };
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node.id);
    // Set selected asset but don't auto-switch tabs
    if (node.type === 'building') {
      setSelectedAsset(node.id);
    }
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset.id);
    setSelectedNode(asset.id);
  };

  const handleHourChange = (hour) => {
    setCurrentHour(parseInt(hour));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading thermal network data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error Loading Data</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const TabButton = ({ tabId, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(tabId)}
      className={`px-6 py-3 font-medium text-sm rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Thermal Network Management Platform
              </h1>
              <p className="text-gray-600 mt-1">
                Framingham Thermal Network - Live Performance Analysis
              </p>
            </div>
            
            {/* Hour Control */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">January Hour:</label>
                <input
                  type="range"
                  min="1"
                  max="744"
                  value={currentHour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className="w-32"
                />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {currentHour}
                </span>
              </div>
              
              {currentData && (
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
                  Outdoor: {currentData.outdoorTemp?.fahrenheit?.toFixed(1)}°F
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            <TabButton 
              tabId="overview" 
              label="Network Overview" 
              isActive={activeTab === 'overview'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              tabId="efficiency" 
              label="Optimization" 
              isActive={activeTab === 'efficiency'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              tabId="assets" 
              label="Asset Valuation" 
              isActive={activeTab === 'assets'} 
              onClick={setActiveTab} 
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Summary */}
            {currentData && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Heating Load</div>
                  <div className="text-2xl font-bold text-red-600 mt-2">
                    {((Math.abs(currentData.systemMetrics?.heatingLoad || 0)) / 1000).toFixed(0)} kW
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Buildings in Heating Mode</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Cooling Load</div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {((currentData.systemMetrics?.coolingLoad || 0) / 1000).toFixed(0)} kW
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Buildings in Cooling Mode</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 uppercase tracking-wide">System COP</div>
                  <div className="text-2xl font-bold text-green-600 mt-2">
                    {currentData.systemMetrics?.avgGeoCOP?.toFixed(2) || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Thermal Network</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 uppercase tracking-wide">vs Heat Pumps</div>
                  <div className="text-2xl font-bold text-red-600 mt-2">
                    {currentData.systemMetrics?.avgAirCOP?.toFixed(2) || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Individual COP</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Efficiency Gain</div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {currentData.systemMetrics?.systemEfficiencyGain?.toFixed(1) || 'N/A'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">TEN Advantage</div>
                </div>
              </div>
            )}

            {/* Network Visualization */}
            <div>
              <NetworkVisualization
                data={currentData?.buildings}
                onNodeSelect={handleNodeSelect}
                selectedNode={selectedNode}
                currentHour={currentHour}
              />
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">
                  Selected: {selectedNode.replace('_', ' ').toUpperCase()}
                </h3>
                
                {/* Building Details */}
                {currentData?.buildings?.[selectedNode] && (() => {
                  const building = currentData.buildings[selectedNode];
                  const buildingNum = selectedNode.split('_')[1];
                  const isHeating = building.load < 0;
                  const mode = isHeating ? 'Heating' : 'Cooling';
                  const geoEfficiency = building.geo.cop || 0;
                  const airEfficiency = building.air.cop || 0;
                  
                  // Determine building type and connected borefield
                  let buildingType = 'RESIDENTIAL';
                  let connectedBorefield = 'Borefield 3';
                  
                  if (selectedNode === 'b_1') { buildingType = 'FIRE DEPARTMENT'; connectedBorefield = 'Borefield 2'; }
                  else if (selectedNode === 'b_2') { buildingType = 'GULF STATION'; connectedBorefield = 'Borefield 2'; }
                  else if (selectedNode === 'b_3') { buildingType = 'CORNER CABINET'; connectedBorefield = 'Borefield 2'; }
                  else if (selectedNode === 'b_4') { buildingType = 'PUBLIC SCHOOL'; connectedBorefield = 'Borefield 3'; }
                  else if (selectedNode === 'b_5') { buildingType = 'HOUSING DEPARTMENT'; connectedBorefield = 'Borefield 3'; }
                  else if (parseInt(buildingNum) >= 16) { connectedBorefield = 'Borefield 1'; }
                  
                  const geoRating = geoEfficiency >= 4.5 ? '✓ (excellent)' : 
                                  geoEfficiency >= 3.5 ? '✓ (good)' : 
                                  geoEfficiency >= 2.5 ? '(fair)' : '(poor)';
                  
                  // Calculate flex potential based on current load vs max demand
                  const currentLoad = Math.abs(building.load || 0);
                  // Estimate max demand based on building type and typical loads
                  let maxDemand = 15000; // Default 15kW for residential
                  if (buildingType === 'FIRE DEPARTMENT') maxDemand = 50000;
                  else if (buildingType === 'GULF STATION') maxDemand = 30000;
                  else if (buildingType === 'CORNER CABINET') maxDemand = 20000;
                  else if (buildingType === 'PUBLIC SCHOOL') maxDemand = 80000;
                  else if (buildingType === 'HOUSING DEPARTMENT') maxDemand = 40000;
                  
                  const loadRatio = currentLoad / maxDemand;
                  const flexPotential = loadRatio <= 0.33 ? 'Low' : 
                                       loadRatio <= 0.67 ? 'Medium' : 'High';
                  
                  // Determine DR enrollment status - R1 (b_6), R10 (b_15), R31 (b_36) are enrolled
                  const isEnrolledInDR = selectedNode === 'b_6' || selectedNode === 'b_15' || selectedNode === 'b_36';
                  
                  // Calculate DR value: current heating load * 0.1 * $5
                  const heatingLoad = isHeating ? Math.abs(building.load || 0) : 0;
                  const drValue = (heatingLoad / 1000) * 0.1 * 5; // Convert to kW, then apply formula

                  return (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900">
                          BUILDING {buildingNum.toUpperCase()} - {buildingType}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Observable (Customer Control) */}
                        <div>
                          <h5 className="text-lg font-semibold text-gray-800 mb-3">
                            Observable (Customer Control):
                          </h5>
                          <div className="space-y-2 ml-4">
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">├─</span>
                              <span className="text-gray-700">
                                <strong>Inlet Temp:</strong> {building.inletTemp.fahrenheit?.toFixed(1) || 'N/A'}°F
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">├─</span>
                              <span className="text-gray-700">
                                <strong>Indoor Setpoint:</strong> 68°F (customer choice)
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">└─</span>
                              <span className="text-gray-700">
                                <strong>Status:</strong> {mode} mode
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Network Optimization */}
                        <div>
                          <h5 className="text-lg font-semibold text-gray-800 mb-3">
                            Network Optimization:
                          </h5>
                          <div className="space-y-2 ml-4">
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">├─</span>
                              <span className="text-gray-700">
                                <strong>Geo COP:</strong> {geoEfficiency.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">├─</span>
                              <span className="text-gray-700">
                                <strong>ASHP COP:</strong> {airEfficiency.toFixed(2)} (typical)
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">├─</span>
                              <span className="text-gray-700">
                                <strong>Connected to:</strong> {connectedBorefield}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">├─</span>
                              <span className="text-gray-700">
                                <strong>Flex Potential:</strong> {flexPotential}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-gray-600 mr-2">└─</span>
                              <span className="text-gray-700">
                                <strong>DR Eligible:</strong> {isEnrolledInDR ? 'Enrolled' : 'Not enrolled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DR Value */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start">
                          <span className="text-blue-600 mr-2 text-lg">💡</span>
                          <span className="text-blue-800">
                            {isEnrolledInDR ? (
                              <span>
                                <strong>Current DR value:</strong> ${drValue.toFixed(2)}/month
                              </span>
                            ) : (
                              <span>
                                <strong>If enrolled in demand response:</strong> ${drValue.toFixed(2)}/month potential
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Borefield Details */}
                {selectedNode.startsWith('borefield_') && (() => {
                  const metrics = calculateBorefieldMetrics(selectedNode);
                  if (!metrics) return null;
                  
                  const stats = [
                    { 
                      label: 'Current Load (kW)', 
                      value: metrics.currentLoadKW.toFixed(1)
                    },
                    { 
                      label: 'Capacity %', 
                      value: metrics.capacityPercent.toFixed(1) + '%'
                    },
                    { 
                      label: 'Available Capacity (kW)', 
                      value: (440 - Math.abs(metrics.currentLoadKW)).toFixed(1)
                    },
                    { 
                      label: 'Buildings Served', 
                      value: metrics.buildingsCount.toString()
                    },
                    { 
                      label: 'Rated Capacity (kW)', 
                      value: '440.0'
                    },
                    { 
                      label: 'Ground Temp (°F)', 
                      value: '55.0'
                    }
                  ];
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-sm text-gray-600 font-medium">
                            {stat.label}
                          </div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'efficiency' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Optimization Opportunities</h2>
              <p className="text-gray-600">Identify and capture additional value from the thermal network</p>
            </div>

            {/* DR Optimization */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">💡</span>
                <h3 className="text-xl font-semibold text-gray-900">Demand Response and Load Shifting</h3>
              </div>
              
              {(() => {
                if (!currentData?.buildings) return null;
                
                // Calculate current DR value from enrolled customers (R1, R10, R31)
                const enrolledBuildings = ['b_6', 'b_15', 'b_36'];
                const currentDRValue = enrolledBuildings.reduce((sum, buildingId) => {
                  const building = currentData.buildings[buildingId];
                  if (building && building.load < 0) { // Only heating loads
                    const heatingLoad = Math.abs(building.load) / 1000; // Convert to kW
                    return sum + (heatingLoad * 0.1 * 5);
                  }
                  return sum;
                }, 0);

                // Calculate potential DR value if all buildings enrolled
                const allBuildings = Object.keys(currentData.buildings);
                const totalPotentialDRValue = allBuildings.reduce((sum, buildingId) => {
                  const building = currentData.buildings[buildingId];
                  if (building && building.load < 0) { // Only heating loads
                    const heatingLoad = Math.abs(building.load) / 1000; // Convert to kW
                    return sum + (heatingLoad * 0.1 * 5);
                  }
                  return sum;
                }, 0);

                const additionalValue = totalPotentialDRValue - currentDRValue;
                const enrolledCount = enrolledBuildings.length;
                const totalBuildings = allBuildings.length;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-green-600 font-medium uppercase tracking-wide">
                        Current DR Value
                      </div>
                      <div className="text-3xl font-bold text-green-900 mt-2">
                        ${currentDRValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {enrolledCount} customers enrolled
                      </div>
                    </div>
                    
                    <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium uppercase tracking-wide">
                        Full Potential
                      </div>
                      <div className="text-3xl font-bold text-blue-900 mt-2">
                        ${totalPotentialDRValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        If all {totalBuildings} customers enrolled
                      </div>
                    </div>

                    <div className="text-center bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-sm text-orange-600 font-medium uppercase tracking-wide">
                        Additional Opportunity
                      </div>
                      <div className="text-3xl font-bold text-orange-900 mt-2">
                        ${additionalValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        Monthly revenue potential
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Opportunity:</strong> Expand demand response enrollment to capture additional revenue from customer flexibility. 
                  Current enrollment rate: {currentData?.buildings ? Math.round((3 / Object.keys(currentData.buildings).length) * 100) : 0}% of network customers.
                </p>
              </div>
            </div>

            {/* Pumping Optimization */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">⚡</span>
                <h3 className="text-xl font-semibold text-gray-900">Pumping Optimization</h3>
              </div>
              
              {(() => {
                if (!currentData?.buildings) return null;
                
                // Check if we have both heating and cooling loads
                const buildings = Object.values(currentData.buildings);
                const heatingBuildings = buildings.filter(b => b.load < 0);
                const coolingBuildings = buildings.filter(b => b.load > 0);
                
                const hasOptimizationOpportunity = heatingBuildings.length > 0 && coolingBuildings.length > 0;
                
                const totalHeatingLoad = heatingBuildings.reduce((sum, b) => sum + Math.abs(b.load), 0) / 1000; // kW
                const totalCoolingLoad = coolingBuildings.reduce((sum, b) => sum + b.load, 0) / 1000; // kW
                
                // Estimate pumping energy savings (simplified calculation)
                const balancedLoad = Math.min(totalHeatingLoad, totalCoolingLoad);
                const pumpingEfficiency = 0.85; // Typical pump efficiency
                const estimatedSavings = balancedLoad * (1 - pumpingEfficiency) * 0.5; // Rough estimate

                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="text-sm text-red-600 font-medium">Heating Load</div>
                        <div className="text-2xl font-bold text-red-900">{totalHeatingLoad.toFixed(1)} kW</div>
                        <div className="text-xs text-red-600">{heatingBuildings.length} buildings</div>
                      </div>
                      
                      <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium">Cooling Load</div>
                        <div className="text-2xl font-bold text-blue-900">{totalCoolingLoad.toFixed(1)} kW</div>
                        <div className="text-xs text-blue-600">{coolingBuildings.length} buildings</div>
                      </div>
                      
                      <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-sm text-green-600 font-medium">Balanced Load</div>
                        <div className="text-2xl font-bold text-green-900">{balancedLoad.toFixed(1)} kW</div>
                        <div className="text-xs text-green-600">Internal exchange</div>
                      </div>
                      
                      <div className="text-center bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium">Pump Savings</div>
                        <div className="text-2xl font-bold text-purple-900">{estimatedSavings.toFixed(1)} kW</div>
                        <div className="text-xs text-purple-600">Estimated reduction</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {hasOptimizationOpportunity ? (
                        <p className="text-sm text-gray-700">
                          <strong>Opportunity Available:</strong> Network has both heating and cooling loads, enabling internal heat exchange. 
                          Reduced central pumping can save approximately {estimatedSavings.toFixed(1)} kW with no efficiency loss 
                          by optimizing flow control to maximize building-to-building heat transfer.
                        </p>
                      ) : (
                        <p className="text-sm text-gray-700">
                          <strong>Current Status:</strong> All buildings in {heatingBuildings.length > 0 ? 'heating' : 'cooling'} mode. 
                          Pumping optimization opportunities will emerge when buildings have mixed heating/cooling demands.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* New Asset Integration */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🏢</span>
                <h3 className="text-xl font-semibold text-gray-900">New Asset Integration</h3>
              </div>
              
              {(() => {
                if (!currentData?.buildings) return null;
                
                // Get Borefield 2 metrics for reference load
                const bf2Metrics = calculateBorefieldMetrics('borefield_2');
                if (!bf2Metrics) return null;
                
                const dataCenterLoad = 500; // 500 kW data center
                const currentEfficiencyGain = currentData?.systemMetrics?.systemEfficiencyGain || 0;
                const newEfficiencyGain = currentEfficiencyGain + 3; // 3% increase
                
                // Calculate delta value between old and new efficiency
                const bf2Load = Math.abs(bf2Metrics.currentLoadKW);
                const oldSavingsKWElec = bf2Load * (currentEfficiencyGain / 100);
                const newSavingsKWElec = bf2Load * (newEfficiencyGain / 100);
                const deltaSavingsKWElec = newSavingsKWElec - oldSavingsKWElec;
                const deltaEnergyCost = deltaSavingsKWElec * 15;
                const deltaCapacityCost = deltaSavingsKWElec * 250;
                const totalValue = deltaEnergyCost + deltaCapacityCost;

                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium">Data Center Load</div>
                        <div className="text-2xl font-bold text-blue-900">{dataCenterLoad} kW</div>
                        <div className="text-xs text-blue-600">Heat source</div>
                      </div>
                      
                      <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-sm text-green-600 font-medium">Efficiency Boost</div>
                        <div className="text-2xl font-bold text-green-900">+3.0%</div>
                        <div className="text-xs text-green-600">Network improvement</div>
                      </div>
                      
                      <div className="text-center bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium">New Total Efficiency</div>
                        <div className="text-2xl font-bold text-purple-900">{newEfficiencyGain.toFixed(1)}%</div>
                        <div className="text-xs text-purple-600">vs current {currentEfficiencyGain.toFixed(1)}%</div>
                      </div>
                      
                      <div className="text-center bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-sm text-orange-600 font-medium">Additional Asset Value</div>
                        <div className="text-2xl font-bold text-orange-900">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                        <div className="text-xs text-orange-600">From efficiency gain</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Integration Opportunity:</strong> Adding a 500 kW data center heat load would increase network 
                        efficiency by 3%, improving overall system performance. The waste heat from data center operations 
                        provides additional thermal energy to the network, reducing reliance on geothermal capacity and 
                        improving coefficient of performance across all connected buildings.
                      </p>
                      <div className="mt-2 text-xs text-gray-600">
                        Value calculation based on Borefield 2 loading pattern: {bf2Load.toFixed(1)} kW × {newEfficiencyGain.toFixed(1)}% efficiency
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Borefield Capacity Analysis</h2>
              <p className="text-gray-600">Current utilization and expansion potential for each borefield</p>
            </div>

            {/* Borefield Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {['borefield_1', 'borefield_2', 'borefield_3'].map((borefieldId, index) => {
                const borefieldNames = ['Borefield 1', 'Borefield 2', 'Borefield 3'];
                const borefieldName = borefieldNames[index];
                const metrics = calculateBorefieldMetrics(borefieldId);
                
                if (!metrics) return null;
                
                const maxCapacity = 440; // kW
                const currentLoad = Math.abs(metrics.currentLoadKW);
                const availableCapacity = maxCapacity - currentLoad;
                const utilizationPercent = (currentLoad / maxCapacity) * 100;
                
                // Calculate expansion potential capped at 80% of max capacity
                const maxOperatingCapacity = maxCapacity * 0.8; // 80% of max capacity
                const availableToMaxOperating = Math.max(0, maxOperatingCapacity - currentLoad);
                const additionalBuildings = Math.floor(availableToMaxOperating / 20);
                
                // Calculate efficiency savings and cost metrics
                const systemEfficiencyGain = currentData?.systemMetrics?.systemEfficiencyGain || 0;
                const savingsKWElec = currentLoad * (systemEfficiencyGain / 100);
                const energyCost = savingsKWElec * 15; // $15 per kW-elec
                const capacityCost = savingsKWElec * 250; // $250 per kW-elec
                const totalAssetValue = energyCost + capacityCost;
                
                // Calculate total potential asset value at 80% theoretical capacity
                const theoreticalLoad = maxOperatingCapacity;
                const potentialSavingsKWElec = theoreticalLoad * (systemEfficiencyGain / 100);
                const potentialEnergyCost = potentialSavingsKWElec * 15;
                const potentialCapacityCost = potentialSavingsKWElec * 250;
                const totalPotentialAssetValue = potentialEnergyCost + potentialCapacityCost;
                
                return (
                  <div key={borefieldId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                      <h3 className="text-xl font-bold">{borefieldName}</h3>
                      <p className="text-green-100 text-sm mt-1">Geothermal Heat Exchanger</p>
                    </div>
                    
                    {/* Capacity Metrics */}
                    <div className="p-6 space-y-6">
                      {/* Current vs Max Capacity */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Capacity Utilization</span>
                          <span className="text-sm text-gray-600">{utilizationPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, utilizationPercent)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0 kW</span>
                          <span>{maxCapacity} kW</span>
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="text-sm text-blue-600 font-medium">Current Load</div>
                          <div className="text-xl font-bold text-blue-900">{currentLoad.toFixed(1)}</div>
                          <div className="text-xs text-blue-600">kW</div>
                        </div>
                        
                        <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-sm text-gray-600 font-medium">Max Capacity</div>
                          <div className="text-xl font-bold text-gray-900">{maxCapacity}</div>
                          <div className="text-xs text-gray-600">kW</div>
                        </div>
                        
                        <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                          <div className="text-sm text-green-600 font-medium">Available</div>
                          <div className="text-xl font-bold text-green-900">{availableCapacity.toFixed(1)}</div>
                          <div className="text-xs text-green-600">kW</div>
                        </div>
                        
                        <div className="text-center bg-orange-50 rounded-lg p-3 border border-orange-200">
                          <div className="text-sm text-orange-600 font-medium">Buildings Served</div>
                          <div className="text-xl font-bold text-orange-900">{metrics.buildingsCount}</div>
                          <div className="text-xs text-orange-600">current</div>
                        </div>
                      </div>

                      {/* Expansion Potential */}
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-600 mr-2">🏗️</span>
                          <h4 className="font-semibold text-yellow-800">Expansion Potential</h4>
                        </div>
                        <p className="text-sm text-yellow-700">
                          Can support <strong>{additionalBuildings} additional buildings</strong> at 20 kW each
                        </p>
                        <div className="text-xs text-yellow-600 mt-1">
                          {availableToMaxOperating.toFixed(1)} kW to 80% operating limit ÷ 20 kW per building = {additionalBuildings} buildings
                        </div>
                      </div>

                      {/* Asset Value */}
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center mb-3">
                          <span className="text-purple-600 mr-2">💰</span>
                          <h4 className="font-semibold text-purple-800">Asset Value</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-center bg-white rounded p-2 border border-purple-200">
                            <div className="text-xs text-purple-600 font-medium">Efficiency Savings</div>
                            <div className="text-lg font-bold text-purple-900">{savingsKWElec.toFixed(1)}</div>
                            <div className="text-xs text-purple-600">kW-elec</div>
                          </div>
                          
                          <div className="text-center bg-white rounded p-2 border border-purple-200">
                            <div className="text-xs text-purple-600 font-medium">Efficiency Gain</div>
                            <div className="text-lg font-bold text-purple-900">{systemEfficiencyGain.toFixed(1)}</div>
                            <div className="text-xs text-purple-600">%</div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Energy Cost:</span>
                            <span className="font-medium">${energyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Capacity Cost:</span>
                            <span className="font-medium">${capacityCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex justify-between border-t border-purple-200 pt-2">
                            <span className="font-semibold text-purple-800">Total Asset Value:</span>
                            <span className="font-bold text-purple-900">${totalAssetValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex justify-between border-t border-purple-300 pt-2 mt-2">
                            <span className="font-semibold text-purple-800">Total Potential Asset Value:</span>
                            <span className="font-bold text-purple-900">${totalPotentialAssetValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-purple-600 mt-2">
                          Potential at 80% capacity ({maxOperatingCapacity.toFixed(0)} kW)
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div className="text-center">
                        {utilizationPercent < 50 ? (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Low Utilization - High Expansion Potential
                          </div>
                        ) : utilizationPercent < 80 ? (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                            Moderate Utilization - Some Expansion Potential
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                            High Utilization - Limited Expansion Potential
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            Real time management and optimization of a thermal distribution asset
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
