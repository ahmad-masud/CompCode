import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
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
      const submissionRef = doc(
        firestore,
        "submissions",
        `${user.uid}-${problemNumber}`
      );

      await setDoc(submissionRef, {
        problemNumber,
        companyName,
        email: user.email,
        submittedAt: new Date(),
      });

      addAlert("Problem submitted successfully!", "success");
    } catch (error) {
      console.error("Error submitting report:", error);
      addAlert("Error submitting data.", "error");
    }
  };

  return submitReport;
};

export default useReport;
