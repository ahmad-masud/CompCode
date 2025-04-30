import axios from "axios";
import { useUser } from "../context/usercontext";
import { useAlerts } from "../context/alertscontext";

const useExport = () => {
  const { user } = useUser();
  const { addAlert } = useAlerts();

  const exportData = async () => {
    if (!user) return;

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/user/export`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "userData.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addAlert("Data exported successfully", "success");
    } catch (error) {
      console.error("Export error:", error);
      addAlert("Error exporting data", "error");
    }
  };

  return exportData;
};

export default useExport;
