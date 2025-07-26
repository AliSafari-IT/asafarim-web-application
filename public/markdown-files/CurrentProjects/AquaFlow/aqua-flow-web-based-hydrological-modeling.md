# AquaFlow - Professional Hydrological Modeling Platform

**AquaFlow** is a comprehensive web-based hydrological modeling platform designed for watershed analysis, rainfall-runoff simulation, and hydrograph visualization. Built with modern technologies, AquaFlow provides both educational and professional-grade tools for hydrological engineers, researchers, and students.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌊 Overview

AquaFlow offers a complete suite of hydrological modeling tools with an intuitive, professional interface. The platform supports multiple modeling approaches, real-world data integration, and advanced visualization capabilities for comprehensive watershed analysis.

![AquaFlow Interactive Welcome](frontend/aquaflow-frontend/public/img/AquaFlow-interactive-welcome.png)

### Key Capabilities
- **Multiple Modeling Approaches** - From simple educational models to advanced research-grade algorithms
- **Real Data Integration** - CSV data loading and model validation
- **Professional Visualization** - Interactive charts with model-observation comparison
- **Modern Architecture** - Route-based navigation with clean, maintainable code
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Physics-Based Models** - Implementation of established hydrological theories

---

## 🚀 Features

### 🏠 **Landing Page**
- Professional welcome interface with feature overview
- Guided navigation to different modeling approaches
- Clean, modern design with dark mode support
- Interactive feature showcase

### 🌧️ **Simple Rainfall-Runoff Model** (`/simple`)
- Basic linear reservoir model for quick watershed analysis
- Adjustable precipitation intensity and duration
- Catchment area and runoff coefficient parameters
- Real-time hydrograph generation and visualization
- Ideal for educational purposes and quick estimates

![Generated Hydrograph Charts](frontend/aquaflow-frontend/public/img/Generated-Hydrograph-charts.png)

### ⚙️ **Advanced Hydrological Models** (`/advanced`)
- Five sophisticated modeling algorithms:
  - **Advanced Linear Reservoir** - Enhanced linear reservoir with evapotranspiration
  - **SCS Curve Number Method** - Industry-standard runoff estimation
  - **Linear Reservoir Chain** - Multi-reservoir routing for realistic hydrograph shapes
  - **Combined SCS-UH Model** - Advanced model combining SCS method with unit hydrograph theory
  - **Green-Ampt Infiltration Model** - Physics-based infiltration modeling
- Comprehensive watershed parameters:
  - Watershed slope and length
  - Antecedent moisture conditions
  - Evapotranspiration rates
  - Base flow components
  - Soil hydraulic properties (for Green-Ampt)
- Multi-reservoir routing capabilities
- Real-time parameter validation and guidance


### 📊 **Model Performance Statistics and Comparison**

AquaFlow provides detailed performance statistics and comparison metrics for hydrological models. This feature allows users to evaluate model accuracy and reliability by comparing observed and simulated data.

![Model Performance Statistics and Comparison](frontend/aquaflow-frontend/public/img/model-performance-statistics-and-comparison.png)

**Key Features:**
- Statistical metrics such as Nash-Sutcliffe Efficiency (NSE), Root Mean Square Error (RMSE), and Mean Absolute Error (MAE).
- Visual overlays of observed and simulated hydrographs.
- Interactive charts for detailed analysis.
- Exportable performance reports for documentation and sharing.

---

### 📊 **CSV Data Analysis** (`/csv`)
- Load real-world hydrograph data from CSV files
- Automatic data parsing and validation
- Statistical summary (peak flow, duration, data points)
- Standalone visualization and analysis
- Data quality assessment and diagnostics

![Load Hydrograph from CSV](frontend/aquaflow-frontend/public/img/Load-Hydrograph-from-CSV.png)

### 🔄 **Model-Observation Comparison**
- Overlay CSV observation data on modeled results
- Visual distinction between modeled (blue solid) and observed (red dashed) data
- Direct model validation and performance assessment
- Persistent data sharing across all modeling approaches
- Statistical comparison metrics

![Model vs Observations Comparison](frontend/aquaflow-frontend/public/img/Model-vs-Observations-Comparison.png)

### 📚 **Help & Documentation** (`/help`)
- Comprehensive user guide with semantic sections
- Model documentation and parameter explanations
- FAQ section for common questions
- Hash-based navigation for quick reference
- Detailed model theory and applications

### ℹ️ **About Page** (`/about`)
- Project overview and mission statement
- Technology stack information
- Feature highlights and capabilities
- Development team information

---
- Load real-world hydrograph data from CSV files
- Automatic data parsing and validation
- Statistical summary (peak flow, duration, data points)
- Standalone visualization and analysis

### 🔄 **Model-Observation Comparison**
- Overlay CSV observation data on modeled results
- Visual distinction between modeled (blue solid) and observed (red dashed) data
- Direct model validation and performance assessment
- Persistent data sharing across all modeling approaches

### 📚 **Help & Documentation** (`/help`)
- Comprehensive user guide with semantic sections
- Model documentation and parameter explanations
- FAQ section for common questions
- Hash-based navigation for quick reference

### ℹ️ **About Page** (`/about`)
- Project overview and mission statement
- Technology stack information
- Feature highlights and capabilities

---

## 🌐 Live Demo

Explore AquaFlow directly through our live demo:

[🌊 AquaFlow Live Demo](https://alisafari-it.github.io/AquaFlow/)

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **React Router** for professional route-based navigation
- **Chart.js** with React integration for interactive visualizations
- **Material-UI** components for consistent design
- **CSS Variables** for comprehensive theming and dark mode
- **Responsive Design** with mobile-first approach

### **Backend**
- **ASP.NET Core 8** Web API for high-performance server
- **RESTful JSON API** for clean client-server communication
- **Advanced Hydrological Algorithms** with multiple model implementations
- **Robust Error Handling** and validation

### **Architecture**
- **Single Page Application (SPA)** with client-side routing
- **Component-Based Architecture** for maintainable code
- **Shared State Management** for cross-page data persistence
- **Professional UI/UX** following modern web standards

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **.NET 8 SDK**
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/AliSafari-IT/AquaFlow.git
cd AquaFlow
```

### 2. Start the Backend API

```bash
cd backend/AquaFlow.Backend
dotnet restore
dotnet watch run
```

The API will be available at `http://localhost:5185/`

### 3. Start the Frontend

```bash
cd frontend/aquaflow-frontend
npm install
npm start
```

The application will open at `http://localhost:3000/`

---

## 📦 Project Structure

```
AquaFlow/
│
├── backend/                    # ASP.NET Core Web API
│   └── AquaFlow.Backend/
│       ├── Controllers/        # API endpoints
│       ├── Models/            # Data models
│       ├── Services/          # Business logic
│       └── Program.cs         # Application entry point
│
├── frontend/                   # React TypeScript Application
│   └── aquaflow-frontend/
│       ├── public/            # Static assets
│       ├── src/
│       │   ├── components/    # React components
│       │   │   ├── TopNavBar.tsx
│       │   │   ├── HydrographChart.tsx
│       │   │   ├── PrecipitationForm.tsx
│       │   │   ├── AdvancedHydrologyForm.tsx
│       │   │   ├── CsvHydrographLoader.tsx
│       │   │   ├── HelpPage.tsx
│       │   │   └── AboutPage.tsx
│       │   ├── styles/        # CSS and styling
│       │   │   ├── variables.css
│       │   │   └── base-styles.css
│       │   ├── App.tsx        # Main application component
│       │   └── index.tsx      # Application entry point
│       ├── package.json       # Dependencies and scripts
│       └── tsconfig.json      # TypeScript configuration
│
└── README.md                  # This file
```

---

## 🔬 Hydrological Models

AquaFlow implements a comprehensive suite of hydrological models ranging from simple educational tools to sophisticated research-grade algorithms. Each model is designed for specific applications and provides unique insights into watershed behavior.

### **Simple Model** (`/simple`)

**Algorithm:** Basic Linear Reservoir  
**Use Case:** Educational purposes, quick estimates, concept demonstration  
**Theory:** Simple rainfall-runoff relationship with linear storage routing

**Key Parameters:**
- Precipitation intensity (mm/hr)
- Storm duration (hours)
- Catchment area (km²)
- Runoff coefficient (0-1)
- Linear reservoir constant K (hours)
- Initial storage (m³)

**Applications:**
- Educational demonstrations
- Quick runoff estimates
- Conceptual watershed modeling
- Parameter sensitivity analysis

---

### **Advanced Models** (`/advanced`)

#### **1. Advanced Linear Reservoir**

**Theory:** Enhanced linear reservoir model with evapotranspiration and baseflow components  
**Algorithm:** S(t+1) = S(t) + (Inflow - Outflow) × Δt  
**Use Case:** Improved simple modeling with realistic losses

**Key Features:**
- Runoff coefficient based on SCS Curve Number
- Evapotranspiration losses
- Baseflow component
- Variable antecedent moisture conditions

**Parameters:**
- All basic parameters plus:
- Curve Number (30-100)
- Antecedent Moisture Condition (Dry/Normal/Wet)
- Evapotranspiration rate (mm/hr)
- Base flow (m³/s)

#### **2. SCS Curve Number Method**

**Theory:** USDA Soil Conservation Service (SCS) method for runoff estimation  
**Algorithm:** Q = (P - Ia)² / (P - Ia + S), where S = (25400/CN) - 254  
**Use Case:** Standard practice for hydrological design and analysis

**Key Features:**
- Physics-based runoff calculation
- Accounts for soil type and land use
- Antecedent moisture condition adjustments
- Slope-dependent time response
- Initial abstraction consideration

**Parameters:**
- Curve Number (30-100) for different soil-vegetation combinations
- Antecedent Moisture Conditions (AMC I, II, III)
- Watershed slope (affects time of concentration)
- All basic watershed parameters

**Typical Curve Numbers:**
- Urban areas: 30-70 (low to high density)
- Agricultural: 40-80 (good to poor management)
- Forest: 30-70 (good to poor condition)
- Pasture: 35-78 (good to poor condition)

#### **3. Linear Reservoir Chain**

**Theory:** Series of linear reservoirs for realistic hydrograph attenuation  
**Algorithm:** Multiple reservoir routing in series: Q₍ᵢ₊₁₎ = S₍ᵢ₎/K₍ᵢ₎  
**Use Case:** More realistic hydrograph shapes and peak attenuation

**Key Features:**
- Multiple reservoirs in series (1-10)
- Distributed storage constants
- SCS runoff calculation for inflow
- Progressive hydrograph smoothing
- Realistic recession curves

**Parameters:**
- Number of reservoirs (1-10)
- Total reservoir constant K (distributed among reservoirs)
- SCS Curve Number parameters
- Antecedent moisture conditions

**Applications:**
- Natural watershed simulation
- Flood routing studies
- Peak flow attenuation analysis

#### **4. Combined SCS-UH Model**

**Theory:** Advanced model combining SCS method with Unit Hydrograph theory  
**Algorithm:** Enhanced SCS with time of concentration and unit hydrograph concepts  
**Use Case:** Professional hydrological design and complex watershed analysis

**Key Features:**
- Time of concentration calculation (Kirpich formula)
- Enhanced SCS method with initial abstraction
- Multiple reservoir routing (3 reservoirs)
- Evapotranspiration losses
- Extended simulation time
- Comprehensive model diagnostics

**Parameters:**
- All SCS parameters
- Watershed length (for time of concentration)
- Watershed slope (affects response time)
- Evapotranspiration rate
- Base flow component

**Advanced Calculations:**
- tc = 0.0195 × L⁰·⁷⁷ × S⁻⁰·³⁸⁵ (Kirpich formula)
- Initial abstraction Ia = 0.2 × S
- Variable reservoir constants based on tc

#### **5. Green-Ampt Infiltration Model** 🆕

**Theory:** Physics-based infiltration model with sharp wetting front assumption  
**Algorithm:** f(t) = Ks × [1 + (ψ × Δθ) / F(t)]  
**Use Case:** Detailed infiltration analysis and soil-water interaction studies

**Key Features:**
- Physics-based infiltration calculations
- Soil-specific hydraulic parameters
- Ponding time calculation
- Moisture deficit consideration
- 11 predefined soil types with realistic parameters

**Fundamental Equations:**
- Infiltration rate: f(t) = Ks × [1 + (ψ × Δθ) / F(t)]
- Time to ponding: tp = (ψ × Δθ) / (i × (i - Ks))
- Moisture deficit: Δθ = θs - θi
- Cumulative infiltration: F(t) - ψ × Δθ × ln(1 + F(t)/(ψ × Δθ)) = Ks × t

**Soil Parameters (11 soil types):**
- **Sand:** Ks=117.8 mm/h, ψ=49.5 mm, θs=0.437
- **Loamy Sand:** Ks=29.9 mm/h, ψ=61.3 mm, θs=0.437
- **Sandy Loam:** Ks=10.9 mm/h, ψ=110.1 mm, θs=0.453
- **Loam:** Ks=3.4 mm/h, ψ=88.9 mm, θs=0.463
- **Silt Loam:** Ks=6.5 mm/h, ψ=166.8 mm, θs=0.501
- **Sandy Clay Loam:** Ks=1.5 mm/h, ψ=218.5 mm, θs=0.398
- **Clay Loam:** Ks=1.0 mm/h, ψ=208.8 mm, θs=0.464
- **Silty Clay Loam:** Ks=1.0 mm/h, ψ=273.0 mm, θs=0.471
- **Sandy Clay:** Ks=0.6 mm/h, ψ=239.0 mm, θs=0.430
- **Silty Clay:** Ks=0.5 mm/h, ψ=292.2 mm, θs=0.479
- **Clay:** Ks=0.3 mm/h, ψ=316.3 mm, θs=0.475

**Key Parameters:**
- Soil type selection (auto-populates hydraulic parameters)
- Saturated hydraulic conductivity Ks (mm/h)
- Suction head ψ (mm)
- Saturated moisture content θs (0.3-0.6)
- Initial moisture content θi (0.01-0.2)

**Model Outputs:**
- Infiltration rate time series
- Runoff hydrograph
- Ponding time (if applicable)
- Infiltration coefficient
- Total infiltration volume
- Moisture deficit calculations

**Applications:**
- Detailed soil infiltration studies
- Agricultural hydrology
- Urban stormwater management
- Soil parameter sensitivity analysis
- Green infrastructure design

---

## 📊 Data Integration

### **CSV Data Format**
AquaFlow accepts CSV files with the following structure:

```csv
year,month,day,hour,timeHours,flowCubicMetersPerSecond
2023,1,1,0,0,5.2
2023,1,1,1,1,7.8
2023,1,1,2,2,12.4
...
```

### **Supported Features**
- Automatic data validation and parsing
- Statistical analysis (peak flow, duration, data points)
- Model-observation comparison and overlay
- Data persistence across modeling sessions

---

## 🎨 User Interface

### **Design Principles**
- **Professional Appearance** - Clean, modern interface suitable for technical users
- **Intuitive Navigation** - Clear routing with bookmarkable URLs
- **Responsive Design** - Optimized for desktop and mobile devices
- **Accessibility** - Semantic HTML and proper contrast ratios

### **Theme Support**
- **Light Mode** - Professional light theme for daytime use
- **Dark Mode** - Eye-friendly dark theme for extended sessions
- **CSS Variables** - Consistent theming throughout the application
- **Smooth Transitions** - Polished animations and hover effects

---

## 🚦 API Endpoints

### **Simple Hydrology**
```
POST /api/hydrology
Content-Type: application/json

{
  "intensity": 25.0,
  "duration": 6.0,
  "catchmentAreaKm2": 10.0,
  "runoffCoefficient": 0.3,
  "linearReservoirConstantK": 2.0,
  "timeStepHours": 0.5,
  "initialStorageCubicMeters": 0.0
}
```

### **Advanced Hydrology**
```
POST /api/hydrology/advanced
Content-Type: application/json

{
  "intensityMmPerHour": 25.0,
  "durationHours": 6.0,
  "catchmentAreaKm2": 10.0,
  "watershedSlopePercent": 2.5,
  "watershedLengthKm": 5.0,
  "curveNumber": 75,
  "antecedentMoisture": 2,
  "selectedModel": 0,
  "evapotranspirationMmPerHour": 0.2,
  "baseFlowCubicMetersPerSecond": 1.0
}
```

---

## 🧪 Usage Examples

### **Basic Workflow**
1. **Navigate to Landing Page** - Overview of available features
2. **Choose Modeling Approach** - Simple or Advanced methods
3. **Input Parameters** - Watershed and precipitation characteristics
4. **Generate Results** - Real-time hydrograph calculation
5. **Analyze Output** - Interactive charts and statistical summaries

### **Model Validation Workflow**
1. **Load Observation Data** - Upload CSV file with real measurements
2. **Run Hydrological Model** - Generate predicted hydrograph
3. **Compare Results** - Overlay observed vs. modeled data
4. **Assess Performance** - Visual and statistical model evaluation

---

## 🔧 Development

### **Available Scripts**

#### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run lint       # Check code quality
```

#### Backend
```bash
dotnet run         # Start development server
dotnet build       # Build application
dotnet test        # Run tests
dotnet watch run   # Start with hot reload
```

### **Code Quality**
- **TypeScript** for type safety and better developer experience
- **ESLint** and **Prettier** for consistent code formatting
- **Component-based architecture** for maintainable React code
- **RESTful API design** following industry best practices

---

## 🤝 Contributing

We welcome contributions from the hydrological modeling and web development communities!

### **How to Contribute**
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Areas for Contribution**
- Additional hydrological models and algorithms
- Enhanced data visualization features
- Mobile application development
- Performance optimizations
- Documentation improvements
- Bug fixes and testing

---

## 📈 Roadmap

### **Planned Features**
- [ ] **GIS Integration** - Spatial data support and watershed delineation
- [ ] **Database Integration** - Persistent data storage and user accounts
- [ ] **Advanced Analytics** - Statistical analysis and model calibration
- [ ] **Export Capabilities** - PDF reports and data export
- [ ] **Real-time Data** - Integration with weather and stream gauge APIs
- [ ] **Mobile App** - Native mobile application development

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hydrological Community** - For established modeling methods and best practices
- **Open Source Libraries** - React, Chart.js, Material-UI, and ASP.NET Core
- **Educational Institutions** - For supporting water resources education and research

---

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues** - [Create an issue](https://github.com/AliSafari-IT/AquaFlow/issues)
- **Documentation** - Visit `/help` page in the application
- **Email** - contact@asafarim.com

---

**AquaFlow** - *Professional Hydrological Modeling Made Accessible*