export default function VaccineTable({ vaccines }) {
  if (!vaccines || vaccines.length === 0) {
    return <p className="empty-text">No vaccines scheduled yet.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="vaccine-table">
        <thead>
          <tr>
            <th>Vaccine</th>
            <th>Scheduled Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {vaccines.map((v) => (
            <tr key={v.id}>
              <td>{v.vaccine_name}</td>
              <td>
                {v.scheduled_date
                  ? new Date(v.scheduled_date).toLocaleDateString()
                  : "Not Scheduled"}
              </td>
              <td className={`status ${v.status?.toLowerCase()}`}>
                {v.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}