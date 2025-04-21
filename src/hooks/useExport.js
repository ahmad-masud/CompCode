import { useUser } from "../context/usercontext";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import { useAlerts } from "../context/alertscontext";

const useExport = () => {
  const { user } = useUser();
  const { addAlert } = useAlerts();

  const exportData = async () => {
    if (!user) return;

    try {
      const userRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        addAlert("No data available to export", "warning");
        return;
      }

      const data = docSnap.data();
      const { premiumInfo, ...safeData } = data;

      const blob = new Blob([JSON.stringify(safeData, null, 2)], {
        type: "application/json",
      });

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
