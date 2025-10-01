# Thermal Network Efficiency Demo

A live, interactive web demonstration of the Framingham Thermal Network's performance compared to individual heat pump systems.

## Features

### 🌡️ Network Visualization
- **Interactive Network Topology**: Circular layout showing all 36 buildings, 3 borefields, and main pump
- **Real-time Performance**: Visual coding by efficiency gain, load, and temperature
- **Flow Visualization**: Directional arrows showing thermal fluid circulation
- **Node Selection**: Click any building to see detailed performance metrics

### 📊 Efficiency Analysis
- **COP Comparison**: Thermal network vs individual heat pump efficiency
- **Energy Consumption**: Real-time consumption breakdown and savings
- **Time Series Charts**: 24-hour performance trends
- **Cost Analysis**: Operational savings and infrastructure ROI calculations

### 💰 Asset Valuation
- **Individual Asset Performance**: Capacity utilization and efficiency ratings
- **Network Value Analysis**: Revenue potential and payback periods
- **Asset Classification**: Heat sinks vs heat sources performance comparison
- **ROI Metrics**: Investment analysis and network effect multipliers

### ⏰ Time Controls
- **Hourly Navigation**: Slide through 24-hour performance data
- **Real-time Updates**: All metrics update dynamically with hour selection
- **Weather Integration**: Outdoor temperature context for performance analysis

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser

### Installation & Setup
```bash
# Navigate to the demo directory
cd thermal-network-demo

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

The demo will automatically open at `http://localhost:3000`

### Data Source
The demo uses real hourly comparison data from `hr_demo_compare.csv` which includes:
- 36 buildings with thermal network vs heat pump performance
- Hourly COP values, energy consumption, and load data
- Temperature and efficiency metrics for network optimization analysis

## Demo Navigation

### Network Overview Tab
- Interactive network topology showing all system components
- Key performance metrics summary cards
- Real-time efficiency and energy savings display
- Click any building node to view detailed performance data

### Efficiency Analysis Tab
- System-wide COP comparison charts
- Energy consumption breakdown and time series analysis
- Cost savings calculator with ROI projections
- Executive summary with key takeaways

### Asset Valuation Tab
- Individual building performance rankings
- Asset type filtering (heat sinks vs sources)
- Utilization and efficiency scatter plots
- Investment analysis with payback periods

## Key Metrics Explained

### COP (Coefficient of Performance)
- **Thermal Network COP**: System-wide efficiency including distribution losses
- **Heat Pump COP**: Individual building heat pump efficiency at outdoor conditions
- **Efficiency Gain**: Percentage improvement of thermal network over individual systems

### Energy Savings
- **Hourly Savings**: Immediate energy reduction (kW) from network efficiency
- **Annual Projections**: Estimated yearly energy and cost savings
- **Peak Demand Reduction**: Grid impact mitigation from load balancing

### Asset Value
- **Network Value**: Revenue potential including network effect multipliers
- **Capacity Utilization**: Percentage of building heating/cooling capacity being used
- **Payback Period**: Years to recover infrastructure investment per asset

## Technical Architecture

### Frontend Stack
- **React 18**: Modern component-based UI framework
- **D3.js**: Interactive network visualization and data processing
- **Recharts**: Professional charts for metrics and time series
- **Tailwind CSS**: Utility-first styling for professional utility industry aesthetics

### Data Processing
- **CSV Parser**: Efficient loading and processing of hourly building data
- **Real-time Calculations**: Dynamic COP, efficiency, and cost computations
- **Performance Optimization**: Efficient re-rendering and data structure management

## Demo Use Cases

### Sales & Marketing
- Live customer demonstrations of thermal network benefits
- ROI presentations with real performance data
- Competitive analysis vs traditional heat pump deployments

### Technical Analysis
- Network performance optimization insights
- Asset classification and value analysis
- System efficiency verification and validation

### Investment Analysis
- Infrastructure payback period calculations
- Revenue potential assessment per building
- Network effect value quantification

---

**Built with Claude Code** for real-time thermal network efficiency demonstration.
