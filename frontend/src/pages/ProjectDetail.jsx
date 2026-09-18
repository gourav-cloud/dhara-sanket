import { ArrowLeft, ArrowUpRight, CalendarDays, CircleAlert, MapPin, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/projects';

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find(item => item.id === id);
  if (!project) return <div className="empty-state"><h2>Project not found</h2><Link className="text-link" to="/projects">Back to projects <ArrowUpRight size={14} /></Link></div>;
  return <><Link className="back-link" to="/projects"><ArrowLeft size={16} /> All projects</Link><section className="detail-hero"><div><span className={`risk-badge ${project.riskLevel.toLowerCase()}`}>{project.riskLevel} risk</span><h2>{project.name}</h2><p>{project.description}</p></div><div className={`detail-score ${project.riskLevel.toLowerCase()}`}><strong>{Math.round(project.riskScore * 100)}%</strong><span>risk score</span></div></section><div className="detail-grid"><div className="panel detail-panel"><span className="panel-kicker">PROJECT PROFILE</span><h3>Delivery context</h3><div className="detail-facts"><Fact icon={<MapPin size={16} />} label="Location" value={project.location} /><Fact icon={<UserRound size={16} />} label="Owner" value={project.owner || 'Program delivery office'} /><Fact icon={<CircleAlert size={16} />} label="Primary delay" value={project.mainDelayReason} /><Fact icon={<CalendarDays size={16} />} label="Last update" value={project.updated || 'Today'} /></div></div><div className="panel detail-panel"><span className="panel-kicker">CURRENT STATUS</span><h3>Risk assessment</h3><div className="assessment"><div className="assessment-header"><span className={`status-text ${project.status === 'Delayed' ? 'delayed' : ''}`}><i /> {project.status}</span><strong>{project.riskLevel}</strong></div><div className="risk-track"><i style={{ width: `${project.riskScore * 100}%` }} /></div><p>AI assessment is based on reported delay reason, milestone movement, and current delivery signals.</p></div></div></div></>;
}

function Fact({ icon, label, value }) { return <div className="fact"><span className="fact-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>; }
