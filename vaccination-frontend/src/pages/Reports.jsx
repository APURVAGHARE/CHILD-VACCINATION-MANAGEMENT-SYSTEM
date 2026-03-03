import api from "../api";

export default function Reports() {
  const handleDownload = async () => {
    try {
      const res = await api.get("/api/reports/vaccination", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vaccination_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report");
    }
  };

  return (
    <div className="container">
      <h2>Download Reports</h2>

      <div className="card">
        <p>
          Generate and download a detailed vaccination report
          for your registered children.
        </p>

        <button className="primary-btn" onClick={handleDownload}>
          Download Vaccination Report (PDF)
        </button>
      </div>
    </div>
  );
}