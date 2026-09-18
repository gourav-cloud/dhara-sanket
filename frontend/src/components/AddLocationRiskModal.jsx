import { X } from 'lucide-react';

export default function AddLocationRiskModal({
  open,
  onClose,
  compensationDelay,
  disputeCount,
  approvalDelay,
  onChange,
  predictedRisk = 0,
  delayReasons = [],
  recommendAction,
}) {
  if (!open) return null;

  return (
    <div className="risk-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="risk-modal" role="dialog" aria-modal="true" aria-labelledby="risk-modal-title">
        <button className="risk-modal-close" aria-label="Close" onClick={onClose}><X size={18} /></button>
        <h3 id="risk-modal-title">Add location risk data</h3>
        <div className="risk-modal-fields">
          <RiskSlider label="Compensation delay (days)" value={compensationDelay} max={40} onChange={value => onChange('compensation_delay_days', value)} />
          <RiskSlider label="Dispute count" value={disputeCount} max={10} onChange={value => onChange('dispute_count', value)} />
          <RiskSlider label="Approval delay (days)" value={approvalDelay} max={30} onChange={value => onChange('approval_delay_days', value)} />
        </div>
        <div className="modal-risk-score">Predicted risk <strong>{Math.round(predictedRisk * 100)}%</strong></div>
        <div className="modal-analysis">
          <h4>Delay reason analysis</h4>
          {delayReasons.length ? delayReasons.map(({ name, severity, sign }, index) => <div className="modal-reason" key={`${name}-${index}`}><div><span>{name}</span><strong className={sign > 0 ? 'impact-up' : 'impact-down'}>{sign > 0 ? 'Increases risk' : 'Decreases risk'}</strong></div><div className="delay-progress"><i className={sign > 0 ? 'impact-up-bg' : 'impact-down-bg'} style={{ width: `${Math.min(severity * 100, 100)}%` }} /></div></div>) : <p className="modal-muted">No delay reason data available.</p>}
        </div>
        <div className="modal-recommendation"><strong>Recommendation</strong><p>{recommendAction || 'Run a prediction to receive a recommendation.'}</p></div>
      </section>
    </div>
  );
}

function RiskSlider({ label, value, max, onChange }) {
  return <label className="modal-slider"><span>{label}<strong>{value}</strong></span><input type="range" min="0" max={max} step="1" value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}
