function SummaryCard({ title, amount, icon, color, description }) {
  return (
    <div className="summary-card">

      <div className="summary-top">
        <span>{title}</span>

        <div className={`summary-icon ${color}`}>
          {icon}
        </div>
      </div>

      <h2>₹{Number(amount).toLocaleString("en-IN")}</h2>

      <p>{description}</p>

    </div>
  );
}

export default SummaryCard;