import { useEffect, useState } from "react";
import { getAllParks, getApprovedParks } from "../services/parkService";

export default function useParks(approvedOnly = true) {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const data = approvedOnly ? await getApprovedParks() : await getAllParks();
        setParks(data);
      } catch (error) {
        console.error("Error fetching parks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParks();
  }, [approvedOnly]);

  return { parks, loading };
}
