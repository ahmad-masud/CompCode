import axios from "axios";
import { useUser } from "../context/usercontext";
import { useAlerts } from "../context/alertscontext";

const useReport = () => {
  const { user } = useUser();
  const { addAlert } = useAlerts();

  const submitReport = async (problemNumber, companyName) => {
    if (!user) {
      addAlert("You must be logged in to submit.", "warning");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/report`,
        { problemNumber, companyName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      addAlert("Problem submitted successfully!", "success");
    } catch (error) {
      console.error("Error submitting report:", error);
      addAlert("Error submitting data.", "error");
    }
  };

  return submitReport;
};

export default useReport;
