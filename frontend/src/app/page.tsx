"use client";
import { useState } from "react";
import PredictionForm from "./components/PredictionForm";
import RecommendationSection from "./components/RecommendationSection";
import VisualizationSection from "./components/VisualizationSection";

interface Visualization {
  box_plot: string;
  heatmap_plot: string;
  bar_plot: string;
}

interface Recommendation {
  Squat: {
    "1st Attempt": number;
    "2nd Attempt": number;
    "3rd Attempt": number;
  };
  Bench: {
    "1st Attempt": number;
    "2nd Attempt": number;
    "3rd Attempt": number;
  };
  Deadlift: {
    "1st Attempt": number;
    "2nd Attempt": number;
    "3rd Attempt": number;
  };
}

interface ApiResponse {
  recommendations?: Recommendation;
  visualizations?: Visualization;
  error?: string;
}

export default function Home() {
  const [division, setDivision] = useState<string>("");
  const [bodyweight, setBodyweight] = useState<string>("");
  const [sex, setSex] = useState<"0" | "1" | "">("");
  const [visualizations, setVisualizations] = useState<Visualization | null>(
    null
  );
  const [recommendations, setRecommendations] = useState<Recommendation | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showVisuals, setShowVisuals] = useState<boolean>(false);

  const divisions = ["Open", "Junior", "Teen", "Youth", "Master"];
  const sexOptions: { label: string; value: "0" | "1" }[] = [
    { label: "Female (0)", value: "0" },
    { label: "Male (1)", value: "1" },
  ];
  const weightClasses: { [key in "0" | "1"]: string[] } = {
    "0": ["43", "47", "52", "57", "63", "69", "76", "84", "84+"],
    "1": ["53", "59", "66", "74", "83", "93", "105", "120", "120+"],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVisualizations(null);
    setRecommendations(null);
    setLoading(true);
    setShowVisuals(false);

    const bodyweightNum = parseFloat(
      bodyweight === "84+" || bodyweight === "120+"
        ? bodyweight.slice(0, -1)
        : bodyweight
    );
    const sexNum = sex === "" ? NaN : parseInt(sex);

    if (isNaN(bodyweightNum) || isNaN(sexNum)) {
      setError("Please select valid values for Bodyweight and Sex.");
      setLoading(false);
      return;
    }

    if (sexNum !== 0 && sexNum !== 1) {
      setError("Sex must be F (0) or M (1).");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division: division,
          bodyweight: bodyweightNum,
          sex: sexNum,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data: ApiResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setRecommendations(data.recommendations || null);
        setVisualizations(data.visualizations || null);
      }
    } catch (err) {
      console.error("Request failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-teal-600 text-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-teal-200">
        ML Powerlifting Attempt Predictor
      </h1>

      <PredictionForm
        division={division}
        bodyweight={bodyweight}
        sex={sex}
        divisions={divisions}
        sexOptions={sexOptions}
        weightClasses={weightClasses}
        onDivisionChange={setDivision}
        onSexChange={setSex}
        onBodyweightChange={setBodyweight}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />

      {recommendations && (
        <RecommendationSection recommendations={recommendations} />
      )}

      {visualizations && !showVisuals && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowVisuals(true)}
            className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            View Visual Data
          </button>
        </div>
      )}
      {showVisuals && visualizations && (
        <VisualizationSection visualizations={visualizations} />
      )}
    </div>
  );
}
