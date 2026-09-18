import { BrainCircuit, CheckCircle2, LoaderCircle, Play, RotateCcw, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { projects } from '../data/projects';

const API_URL = 'http://127.0.0.1:8000/predict';
const featureLabels = {
  compensation_delay_days: 'Compensation delay (days)',
  dispute_count: 'Dispute count',
  approval_delay_days: 'Approval delay (days)',
  rainfall_mm: 'Rainfall (mm)',
  slope_degree: 'Slope (degrees)',
  land_use_type: 'Land use type',
};
const initialValues = Object.fromEntries(Object.keys(featureLabels).map(key => [key, 0]));

export default function Simulation() {
  const [formData, setFormData] = useState(initialValues);
  const [selectedProject, setSelectedProject] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProjectChange = event => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    setResult(null);
    setError('');
    if (!projectId) {
      setFormData(initialValues);
      return;
    }
    const project = projects.find(item => item.id === projectId);
    setFormData(Object.fromEntries(Object.keys(featureLabels).map(key => [key, project[key]])));
  };

  const handleInputChange = event => {
    setFormData(current => ({ ...current, [event.target.name]: Number(event.target.value) }));
    setResult(null);
  };

  const predictRisk = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) throw new Error('Prediction service returned an error.');
      setResult(await response.json());
    } catch (requestError) {
      setError(`Could not reach the AI service. Start the backend with "npm run backend". ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedProject('');
    setFormData(initialValues);
    setResult(null);
    setError('');
  };

  const explanations = result ? Object.entries(result.explanations).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a)) : [];
  return <>
    <section className="welcome-row"><div><p className="section-kicker">DECISION SUPPORT</p><h2>What-if simulation</h2><p className="section-subtitle">Adjust project signals and see how the predicted delay risk changes.</p></div><button className="filter-button" onClick={reset}><RotateCcw size={15} /> Reset</button></section>
    <div className="simulation-grid">
      <form className="panel simulation-form" onSubmit={predictRisk}><div className="panel-heading"><div><span className="panel-kicker">INPUT SCENARIO</span><h3>Project conditions</h3></div><BrainCircuit size={22} className="simulation-icon" /></div><label className="field-label">Initialize from project<select value={selectedProject} onChange={handleProjectChange}><option value="">Start with blank values</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><div className="feature-grid">{Object.entries(featureLabels).map(([key, label]) => <label className="field-label" key={key}>{label}<input type="number" min="0" step="any" name={key} value={formData[key]} onChange={handleInputChange} /></label>)}</div><button className="primary-button predict-button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} /> : <Play size={16} />}{loading ? 'Predicting...' : 'Predict risk'}</button></form>
      <div className="panel result-panel"><div className="panel-heading"><div><span className="panel-kicker">MODEL OUTPUT</span><h3>Risk assessment</h3></div>{result && <span className="result-ready"><CheckCircle2 size={14} /> Ready</span>}</div>{result ? <><div className="result-score"><strong>{(result.risk_score * 100).toFixed(1)}%</strong><span>predicted delay risk</span></div><div className="explanation-list"><p className="explanation-title">Feature impact</p>{explanations.map(([name, value]) => <div className="explanation-row" key={name}><div><span>{featureLabels[name] || name}</span><small className={value >= 0 ? 'impact-up' : 'impact-down'}>{value >= 0 ? '+' : ''}{value.toFixed(3)}</small></div><div className="explanation-track"><i className={value >= 0 ? 'impact-up-bg' : 'impact-down-bg'} style={{ width: `${Math.min(Math.abs(value) * 100, 100)}%` }} /></div></div>)}</div></> : <div className="result-empty"><BrainCircuit size={35} /><strong>Run a scenario to see the model output</strong><p>Use a saved project or enter your own conditions to generate a risk estimate and feature explanation.</p></div>}{error && <div className="simulation-error"><TriangleAlert size={16} /><span>{error}</span></div>}</div>
    </div>
  </>;
}
