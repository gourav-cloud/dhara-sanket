import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CircleAlert,
  Clock3,
  Info,
  LoaderCircle,
  MapPinned,
  MoreHorizontal,
  Plus,
  TrendingUp,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import AddLocationRiskModal from '../components/AddLocationRiskModal';
import BottomSection from '../components/BottomSection';

const API_URL = 'http://127.0.0.1:8000/predict';
const riskColor = score => score > 0.7 ? '#dc6b45' : score > 0.4 ? '#d59b35' : '#55a77b';
const riskClass = level => level.toLowerCase();
const initialValues = {
  compensation_delay_days: 0,
  dispute_count: 0,
  approval_delay_days: 0,
  rainfall_mm: 0,
  slope_degree: 0,
  land_use_type: 0,
};
const featureLabels = {
  compensation_delay_days: 'Compensation delay (days)',
  dispute_count: 'Dispute count',
  approval_delay_days: 'Approval delay (days)',
  rainfall_mm: 'Rainfall (mm)',
  slope_degree: 'Slope (degrees)',
  land_use_type: 'Land use type',
};

function explainDelayReasons(explanations) {
  if (!explanations) return [];
  return Object.entries(explanations)
    .map(([key, value]) => ({ key, value, absoluteValue: Math.abs(value) }))
    .sort((a, b) => b.absoluteValue - a.absoluteValue)
    .map(({ key, value }) => {
      const name = key.replace(/_/g, ' ').toLowerCase();
      let description = 'Other contributing factors';
      if (name.includes('compensation')) description = 'Delays due to compensation processing';
      else if (name.includes('dispute')) description = 'Issues caused by land disputes';
      else if (name.includes('approval')) description = 'Delays in administrative approvals';
      else if (name.includes('rainfall')) description = 'Adverse impact from rainfall patterns';
      else if (name.includes('slope')) description = 'Geographical slope affecting acquisition';
      return { name: description, severity: Math.min(1, Math.abs(value) / 0.5), sign: Math.sign(value) };
    });
}

function DelayReasonAnalysis({ explanations }) {
  const reasons = explainDelayReasons(explanations);
  if (!reasons.length) return null;
  const priority = reasons[0].sign > 0;
  return <div className="delay-analysis">
    <div className="popup-section-title">Delay reason analysis</div>
    <div className="delay-reasons">
      {reasons.map(({ name, severity, sign }, index) => <div className="delay-reason" key={`${name}-${index}`}><div className="delay-reason-label"><span>{name}</span><strong className={sign > 0 ? 'impact-up' : 'impact-down'}>{sign > 0 ? 'Increases risk' : 'Decreases risk'}</strong></div><div className="delay-progress"><i className={sign > 0 ? 'impact-up-bg' : 'impact-down-bg'} style={{ width: `${Math.round(severity * 100)}%` }} /></div></div>)}
    </div>
    <div className={`recommendation-chip ${priority ? 'recommendation-chip--risk' : 'recommendation-chip--good'}`}>{priority ? `Recommended action: prioritize ${reasons[0].name.toLowerCase()}` : 'Risk currently low - minimal interventions needed'}</div>
  </div>;
}

function AddLocationMarker({ onAddLocation, clearAddMode }) {
  const [position, setPosition] = useState(null);
  const [formValues, setFormValues] = useState({ compensation_delay_days: 0, dispute_count: 0, approval_delay_days: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [riskData, setRiskData] = useState(null);
  const markerRef = useRef(null);

  useMapEvents({
    click(event) {
      setPosition(event.latlng);
      setError('');
    },
  });

  useEffect(() => {
    if (position && markerRef.current) markerRef.current.openPopup();
  }, [position]);

  if (!position) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...initialValues, ...formValues }),
      });
      if (!response.ok) throw new Error('Prediction service returned an error.');
      const prediction = await response.json();
      setRiskData(prediction);
    } catch (requestError) {
      setError(`Prediction failed. Start the backend with "npm run backend". ${requestError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CircleMarker
      ref={markerRef}
      center={position}
      radius={12}
      pathOptions={{ color: '#318d86', fillColor: '#318d86', fillOpacity: 0.8, weight: 3 }}
    >
      <Popup closeButton={false}>
        <div className="add-location-form">
          <div className="add-location-header">
            <strong>Add location risk data</strong>
            <button onClick={() => { setPosition(null); clearAddMode(); }} aria-label="Cancel"><X size={15} /></button>
          </div>
          <div className="location-fields">
            {Object.entries(formValues).map(([key, value]) => (
              <label key={key}>
                {featureLabels[key]}
                <input
                  type="range"
                  min="0"
                  max={key === 'dispute_count' ? 10 : key === 'approval_delay_days' ? 30 : 40}
                  step="1"
                  value={value}
                  onChange={event => setFormValues(current => ({ ...current, [key]: Number(event.target.value) }))}
                />
                <span className="location-value">{value}</span>
              </label>
            ))}
          </div>
          {riskData && <><div className="manual-prediction">Predicted risk: <strong>{(riskData.risk_score * 100).toFixed(2)}%</strong></div><DelayReasonAnalysis explanations={riskData.explanations} /></>}
          {error && <p className="location-error">{error}</p>}
          <div className="location-actions">
            <button className="location-cancel" disabled={isSubmitting} onClick={() => { setPosition(null); clearAddMode(); }}>Cancel</button>
            <button className="location-submit" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? <LoaderCircle className="spin" size={13} /> : <Plus size={13} />}
              {isSubmitting ? 'Predicting' : 'Predict risk'}
            </button>
          </div>
          {riskData && <button className="location-save" onClick={() => { onAddLocation({ position, riskData, formValues }); setPosition(null); clearAddMode(); }}>Save location</button>}
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function Dashboard() {
  const [addLocationMode, setAddLocationMode] = useState(false);
  const [userLocations, setUserLocations] = useState([]);
  const [simCompDelay, setSimCompDelay] = useState(10);
  const [simDisputes, setSimDisputes] = useState(2);
  const [simApprovalDelay, setSimApprovalDelay] = useState(5);
  const [simRisk, setSimRisk] = useState(null);
  const [simExplanations, setSimExplanations] = useState(null);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [delayReasonFilter, setDelayReasonFilter] = useState('all');

  const filteredProjects = projects.filter(project => {
    const matchesRisk = riskFilter === 'all' ||
      (riskFilter === 'high' && project.riskScore > 0.7) ||
      (riskFilter === 'medium' && project.riskScore > 0.4 && project.riskScore <= 0.7) ||
      (riskFilter === 'low' && project.riskScore <= 0.4);
    const matchesReason = delayReasonFilter === 'all' || project.mainDelayReason.toLowerCase() === delayReasonFilter;
    return matchesRisk && matchesReason;
  });

  const totalProjects = projects.length + userLocations.length;
  const highRiskCount = projects.filter(project => project.riskLevel === 'High').length;
  const highRiskLocations = userLocations.filter(location => location.riskData.risk_score > 0.7).length;
  const averageRisk = (
    projects.reduce((sum, project) => sum + project.riskScore, 0) +
    userLocations.reduce((sum, location) => sum + location.riskData.risk_score, 0)
  ) / totalProjects;

  const computeSimRisk = async () => {
    setSimLoading(true);
    setSimError('');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compensation_delay_days: simCompDelay,
          dispute_count: simDisputes,
          approval_delay_days: simApprovalDelay,
          rainfall_mm: 0,
          slope_degree: 0,
          land_use_type: 0,
        }),
      });
      if (!response.ok) throw new Error('Prediction service returned an error.');
      const prediction = await response.json();
      setSimRisk(prediction.risk_score);
      setSimExplanations(prediction.explanations);
    } catch (requestError) {
      setSimError(`Could not calculate risk. ${requestError.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <>
      <section className="welcome-row">
        <div><p className="section-kicker">THURSDAY, SEPTEMBER 18, 2026</p><h2>Portfolio pulse</h2><p className="section-subtitle">A quick read on delivery health across your active infrastructure portfolio.</p></div>
        <Link className="primary-button" to="/projects"><CalendarClock size={16} /> View timeline</Link>
      </section>
      <section className="metric-grid">
        <MetricCard label="Total projects" value={totalProjects} detail={userLocations.length ? `${userLocations.length} added locations` : 'Across 3 regions'} icon={<MapPinned size={18} />} tone="teal" />
        <MetricCard label="High risk projects" value={highRiskCount + highRiskLocations} detail="Needs attention" icon={<CircleAlert size={18} />} tone="coral" trend="12%" trendUp />
        <MetricCard label="Active alerts" value={highRiskCount} detail="Since last review" icon={<Clock3 size={18} />} tone="amber" />
        <MetricCard label="Average risk score" value={averageRisk.toFixed(2)} detail="Portfolio weighted" icon={<TrendingUp size={18} />} tone="lilac" trend="8%" />
      </section>
      <section className="dashboard-filters">
        <label>Risk level<select value={riskFilter} onChange={event => setRiskFilter(event.target.value)}><option value="all">All levels</option><option value="high">High (&gt; 0.7)</option><option value="medium">Medium (0.4 - 0.7)</option><option value="low">Low (&lt;= 0.4)</option></select></label>
        <label>Delay reason<select value={delayReasonFilter} onChange={event => setDelayReasonFilter(event.target.value)}><option value="all">All reasons</option><option value="compensation">Compensation</option><option value="dispute">Dispute</option><option value="approval">Approval</option><option value="rehabilitation">Rehabilitation</option><option value="r&r">R&amp;R</option></select></label>
        <span className="filter-count">Showing {filteredProjects.length} of {projects.length} projects</span>
      </section>

      <section className="dashboard-grid">
        <div className="panel map-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">GEOGRAPHIC VIEW</span><h3>Projects risk map</h3></div>
            <button className={`add-location-button ${addLocationMode ? 'active' : ''}`} onClick={() => setAddLocationMode(mode => !mode)}>{addLocationMode ? <X size={14} /> : <Plus size={14} />}{addLocationMode ? 'Cancel' : 'Add location'}</button>
            <button className="more-button" aria-label="Map options"><MoreHorizontal size={19} /></button>
          </div>
          {addLocationMode && <div className="map-instruction">Click anywhere on the map to add a location and run a risk prediction.</div>}
          <div className="map-wrap">
            <MapContainer center={[22.5, 78]} zoom={6} scrollWheelZoom zoomControl={false}>
              <ZoomControl position="topright" />
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredProjects.map(project => (
                <CircleMarker key={project.id} center={project.coordinates} radius={11} pathOptions={{ color: riskColor(project.riskScore), fillColor: riskColor(project.riskScore), fillOpacity: 0.85, weight: 3 }}>
                  <Popup><strong>{project.name}</strong><br />{project.riskLevel} risk · {project.location}</Popup>
                </CircleMarker>
              ))}
              {userLocations.map((location, index) => (
                <CircleMarker key={`user-${index}`} center={location.position} radius={12} pathOptions={{ color: riskColor(location.riskData.risk_score), fillColor: riskColor(location.riskData.risk_score), fillOpacity: 0.9, weight: 3 }}>
                  <Popup>
                    <strong>Added location</strong><br />
                    Predicted risk: {(location.riskData.risk_score * 100).toFixed(2)}%
                    <div className="popup-section-title">Input risk factors</div>
                    {Object.entries(location.formValues).map(([key, value]) => <span className="popup-detail" key={key}>{featureLabels[key] || key}: <b>{value}</b></span>)}
                    <div className="popup-section-title">Risk factor contributions</div>
                    {Object.entries(location.riskData.explanations).map(([key, value]) => <span className="popup-detail" key={key}>{featureLabels[key] || key}: <b>{value >= 0 ? '+' : ''}{value.toFixed(3)}</b></span>)}
                    <DelayReasonAnalysis explanations={location.riskData.explanations} />
                  </Popup>
                </CircleMarker>
              ))}
              {addLocationMode && <AddLocationMarker onAddLocation={location => setUserLocations(current => [...current, location])} clearAddMode={() => setAddLocationMode(false)} />}
            </MapContainer>
            <div className="map-legend"><strong>Risk level</strong><span><i className="legend-dot low" />Low &lt; 0.4</span><span><i className="legend-dot medium" />Medium 0.4 - 0.7</span><span><i className="legend-dot high" />High &gt; 0.7</span><span><i className="legend-dot added" />Added</span></div>
          </div>
        </div>
        <div className="panel insights-panel"><div className="panel-heading"><div><span className="panel-kicker">AI SIGNALS</span><h3>What needs focus</h3></div><span className="live-pill"><i /> Live</span></div><div className="insight-item insight-item--urgent"><div className="insight-icon"><CircleAlert size={17} /></div><div><strong>Compensation dispute is rising</strong><p>Solar Park Development has moved into the high-risk band.</p><Link to="/projects/p1">Review project <ArrowUpRight size={14} /></Link></div></div><div className="insight-item"><div className="insight-icon insight-icon--amber"><Clock3 size={17} /></div><div><strong>Rehabilitation window needs attention</strong><p>Expressway Upgrade is delayed and currently sits in the medium-risk band.</p><Link to="/projects/p2">Open timeline <ArrowUpRight size={14} /></Link></div></div><div className="insight-summary"><span>Portfolio stability</span><strong>Good</strong><div className="progress"><i style={{ width: '72%' }} /></div><small>72% of projects are on track</small></div></div>
      </section>

      <section className="panel what-if-panel"><div className="panel-heading"><div><span className="panel-kicker">DECISION SUPPORT</span><h3>What-if simulation</h3></div><span className="simulation-help" title="Adjust the three delay signals and request a live prediction from the AI service."><Info size={15} /></span></div><p className="what-if-copy">Adjust project conditions to simulate their impact on predicted land acquisition risk.</p><div className="slider-grid"><RiskSlider label="Compensation delay" value={simCompDelay} min={0} max={40} onChange={setSimCompDelay} unit="days" /><RiskSlider label="Dispute count" value={simDisputes} min={0} max={10} onChange={setSimDisputes} unit="disputes" /><RiskSlider label="Approval delay" value={simApprovalDelay} min={0} max={30} onChange={setSimApprovalDelay} unit="days" /></div><div className="what-if-actions"><button className="primary-button" onClick={computeSimRisk} disabled={simLoading}>{simLoading ? <LoaderCircle className="spin" size={15} /> : <TrendingUp size={15} />}{simLoading ? 'Calculating...' : 'Calculate risk'}</button>{simRisk !== null && <><strong className={`sim-result ${simRisk > 0.7 ? 'high' : simRisk > 0.4 ? 'medium' : 'low'}`}>{(simRisk * 100).toFixed(1)}% predicted risk</strong><button className="filter-button" onClick={() => setRiskModalOpen(true)}>View analysis</button></>}</div>{simError && <p className="simulation-error"><CircleAlert size={14} />{simError}</p>}</section>

      <AddLocationRiskModal open={riskModalOpen} onClose={() => setRiskModalOpen(false)} compensationDelay={simCompDelay} disputeCount={simDisputes} approvalDelay={simApprovalDelay} onChange={(field, value) => { if (field === 'compensation_delay_days') setSimCompDelay(value); if (field === 'dispute_count') setSimDisputes(value); if (field === 'approval_delay_days') setSimApprovalDelay(value); setSimRisk(null); }} predictedRisk={simRisk || 0} delayReasons={explainDelayReasons(simExplanations)} recommendAction={simExplanations ? (explainDelayReasons(simExplanations)[0]?.sign > 0 ? `Prioritize ${explainDelayReasons(simExplanations)[0].name.toLowerCase()}` : 'Risk currently low - minimal interventions needed') : ''} />

      <section className="panel projects-panel"><div className="panel-heading"><div><span className="panel-kicker">PORTFOLIO</span><h3>Recent projects</h3></div><Link className="text-link" to="/projects">View all <ArrowUpRight size={14} /></Link></div><div className="project-list">{projects.map(project => <Link to={`/projects/${project.id}`} className="project-row" key={project.id}><div className={`project-symbol ${riskClass(project.riskLevel)}`}>{project.name.slice(0, 1)}</div><div className="project-name"><strong>{project.name}</strong><span>{project.location}</span></div><span className={`risk-badge ${riskClass(project.riskLevel)}`}>{project.riskLevel}</span><span className={`status-text ${project.status === 'Delayed' ? 'delayed' : ''}`}><i />{project.status}</span><span className="row-score">{Math.round(project.riskScore * 100)}%</span><ArrowUpRight className="row-arrow" size={16} /></Link>)}{userLocations.map((location, index) => <div className="project-row added-project" key={`added-project-${index}`}><div className="project-symbol added">+</div><div className="project-name"><strong>Added map location</strong><span>AI prediction result</span></div><span className={`risk-badge ${location.riskData.risk_score > 0.7 ? 'high' : location.riskData.risk_score > 0.4 ? 'medium' : 'low'}`}>{location.riskData.risk_score > 0.7 ? 'High' : location.riskData.risk_score > 0.4 ? 'Medium' : 'Low'}</span><span className="row-score">{Math.round(location.riskData.risk_score * 100)}%</span></div>)}</div></section>
      <BottomSection />
    </>
  );
}

function MetricCard({ label, value, detail, icon, tone, trend, trendUp }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-label">{label}</div><div className="metric-value">{value}{trend && <span className={trendUp ? 'trend down' : 'trend'}>{trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{trend}</span>}</div><div className="metric-detail">{detail}</div></div>;
}

function RiskSlider({ label, value, min, max, onChange, unit }) {
  return <label className="dashboard-slider"><span>{label}<strong>{value} {unit}</strong></span><input type="range" min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}
